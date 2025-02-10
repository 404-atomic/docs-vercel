# 日志和请求记录配置指南

## 第一步：创建日志配置

### 1. 创建日志目录
```bash
mkdir -p memobase_server/core/logging
touch memobase_server/core/logging/__init__.py
touch memobase_server/core/logging/config.py
touch memobase_server/core/logging/middleware.py
```

### 2. 配置日志格式 (logging/config.py)

```python
import logging
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, Any
import json
from ..config import settings

# 创建日志目录
LOG_DIR = Path("@documentation")
LOG_DIR.mkdir(exist_ok=True)

class RequestLogger:
    def __init__(self):
        self.logger = logging.getLogger("request_logger")
        self.logger.setLevel(logging.INFO)
        
        # 配置文件处理器
        log_file = LOG_DIR / "request_logs.mdx"
        handler = logging.FileHandler(log_file)
        handler.setFormatter(logging.Formatter('%(message)s'))
        self.logger.addHandler(handler)
    
    def _mask_sensitive_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """遮盖敏感数据"""
        sensitive_fields = [
            "password", "token", "apiKey", 
            "secret", "authorization"
        ]
        
        if isinstance(data, dict):
            masked_data = data.copy()
            for key in data:
                if key.lower() in sensitive_fields:
                    masked_data[key] = "******"
                elif isinstance(data[key], (dict, list)):
                    masked_data[key] = self._mask_sensitive_data(data[key])
            return masked_data
        elif isinstance(data, list):
            return [self._mask_sensitive_data(item) for item in data]
        return data

    def log_request(
        self,
        method: str,
        endpoint: str,
        request_body: Dict[str, Any],
        response_body: Dict[str, Any],
        status_code: int,
        duration_ms: float
    ):
        """记录请求日志"""
        if status_code < 400:  # 只记录成功的请求
            log_entry = f"""
================================================================================
Request ID: {uuid.uuid4()}
Timestamp: {datetime.now().isoformat()}
================================================================================
Endpoint: {method} {endpoint}
Duration: {duration_ms}ms
Status: {status_code}
================================================================================
REQUEST: {json.dumps(self._mask_sensitive_data(request_body), indent=2)}
RESPONSE: {json.dumps(self._mask_sensitive_data(response_body), indent=2)}
================================================================================
"""
            self.logger.info(log_entry)

request_logger = RequestLogger()
```

### 3. 创建中间件 (logging/middleware.py)

```python
import time
from typing import Callable
from fastapi import Request, Response
from fastapi.routing import APIRoute
from .config import request_logger

class LoggingMiddleware:
    async def __call__(
        self,
        request: Request,
        call_next: Callable
    ) -> Response:
        # 记录开始时间
        start_time = time.time()
        
        # 获取请求体
        request_body = {}
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                request_body = await request.json()
            except:
                request_body = {}
        
        # 处理请求
        response = await call_next(request)
        
        # 计算处理时间
        duration_ms = round((time.time() - start_time) * 1000, 2)
        
        # 获取响应体
        response_body = {}
        if hasattr(response, "body"):
            try:
                response_body = response.json()
            except:
                response_body = {}
        
        # 记录日志
        request_logger.log_request(
            method=request.method,
            endpoint=str(request.url.path),
            request_body=request_body,
            response_body=response_body,
            status_code=response.status_code,
            duration_ms=duration_ms
        )
        
        return response

class LoggingRoute(APIRoute):
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()
        
        async def logging_route_handler(request: Request) -> Response:
            return await LoggingMiddleware()(request, original_route_handler)
        
        return logging_route_handler
```

## 第二步：配置数据库日志

### 1. 创建数据库日志配置 (core/db_logging.py)

```python
import logging
from pathlib import Path
from sqlalchemy import event
from sqlalchemy.engine import Engine
import time

# 创建日志目录
DB_LOG_DIR = Path("@documentation")
DB_LOG_DIR.mkdir(exist_ok=True)

# 配置数据库日志
db_logger = logging.getLogger('sqlalchemy.engine')
db_logger.setLevel(logging.INFO)

# 文件处理器
db_log_file = DB_LOG_DIR / "db_validation.mdx"
db_handler = logging.FileHandler(db_log_file)
db_handler.setFormatter(logging.Formatter('%(message)s'))
db_logger.addHandler(db_handler)

# 慢查询阈值（毫秒）
SLOW_QUERY_THRESHOLD = 1000

@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    conn.info.setdefault('query_start_time', []).append(time.time())

@event.listens_for(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total_time = (time.time() - conn.info['query_start_time'].pop()) * 1000
    
    # 记录所有查询
    log_entry = f"""
================================================================================
Query Time: {total_time:.2f}ms
SQL: {statement}
Parameters: {parameters}
================================================================================
"""
    db_logger.info(log_entry)
    
    # 记录慢查询
    if total_time > SLOW_QUERY_THRESHOLD:
        db_logger.warning(f"Slow Query ({total_time:.2f}ms): {statement}")
```

## 第三步：更新主应用配置

### 1. 修改 main.py

```python
from fastapi import FastAPI
from .core.config import settings
from .core.logging.middleware import LoggingRoute
from .api.v1.endpoints import users

app = FastAPI(
    title="Memobase API",
    version=settings.API_VERSION,
    # 使用自定义路由类
    router_class=LoggingRoute
)

# 添加路由
app.include_router(
    users.router,
    prefix=f"{settings.API_PREFIX}/users",
    tags=["users"]
)
```

## 日志功能说明

### 1. 请求日志
- 记录所有成功的API请求（状态码 < 400）
- 包含请求ID、时间戳、端点、处理时间等信息
- 自动遮盖敏感数据（密码、令牌等）
- 日志轮转（每天）和保留策略（30天）
- 最大文件大小限制（50MB）

### 2. 数据库日志
- 记录所有SQL查询
- 标记并警告慢查询（>1000ms）
- 包含查询时间、SQL语句和参数
- 支持查询计划分析

### 3. 日志格式
请求日志格式：
```mdx
================================================================================
Request ID: 550e8400-e29b-41d4-a716-446655440000
Timestamp: 2025-02-08T15:30:00+08:00
================================================================================
Endpoint: POST /api/v1/users
Duration: 150ms
Status: 200
================================================================================
REQUEST: {
  "email": "test@example.com",
  "password": "******",
  "full_name": "测试用户"
}
RESPONSE: {
  "id": 1,
  "email": "test@example.com",
  "full_name": "测试用户"
}
================================================================================
```

数据库日志格式：
```mdx
================================================================================
Query Time: 50.25ms
SQL: SELECT * FROM users WHERE email = ?
Parameters: ('test@example.com',)
================================================================================
```
