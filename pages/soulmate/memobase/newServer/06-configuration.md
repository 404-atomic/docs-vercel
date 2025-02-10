# 配置说明

## 环境变量配置

### 1. 基础配置

`.env` 文件中的配置项：

```plaintext
# API 配置
API_VERSION=v1
API_PREFIX=/api/v1
DEBUG=True

# 数据库配置
DATABASE_URL=postgresql://memouser:memopass@localhost:5432/memodb

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=memoredis

# 安全配置
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 2. 配置说明

| 配置项 | 说明 | 示例值 |
|--------|------|--------|
| API_VERSION | API版本号 | v1 |
| API_PREFIX | API路由前缀 | /api/v1 |
| DEBUG | 调试模式开关 | True |
| DATABASE_URL | PostgreSQL连接URL | postgresql://user:pass@localhost:5432/dbname |
| REDIS_HOST | Redis服务器地址 | localhost |
| REDIS_PORT | Redis服务器端口 | 6379 |
| REDIS_DB | Redis数据库索引 | 0 |
| REDIS_PASSWORD | Redis访问密码 | memoredis |
| SECRET_KEY | JWT加密密钥 | your-secret-key |
| ALGORITHM | JWT加密算法 | HS256 |
| ACCESS_TOKEN_EXPIRE_MINUTES | 访问令牌过期时间（分钟） | 30 |

## 配置管理

### 1. 配置类定义

```python
# core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    API_VERSION: str
    API_PREFIX: str
    DEBUG: bool = False
    
    DATABASE_URL: PostgresDsn
    
    REDIS_HOST: str
    REDIS_PORT: int
    REDIS_DB: int
    REDIS_PASSWORD: str
    
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
```

### 2. 配置使用示例

```python
# 在其他模块中使用配置
from memobase_server.core.config import settings

# 数据库URL
database_url = settings.DATABASE_URL

# Redis配置
redis_config = {
    "host": settings.REDIS_HOST,
    "port": settings.REDIS_PORT,
    "password": settings.REDIS_PASSWORD
}

# API路由前缀
api_prefix = settings.API_PREFIX
```

## 开发环境配置

### 1. 本地开发配置

创建 `.env.development` 文件：

```plaintext
DEBUG=True
API_VERSION=v1
API_PREFIX=/api/v1
DATABASE_URL=postgresql://memouser:memopass@localhost:5432/memodb_dev
```

### 2. 测试环境配置

创建 `.env.testing` 文件：

```plaintext
DEBUG=True
API_VERSION=v1
API_PREFIX=/api/v1
DATABASE_URL=postgresql://memouser:memopass@localhost:5432/memodb_test
```

## 生产环境配置

### 1. 生产环境注意事项

1. 安全配置
   - 使用强密码
   - 更改默认端口
   - 禁用调试模式

2. 性能配置
   - 调整连接池大小
   - 配置缓存策略
   - 设置适当的超时时间

### 2. 生产环境示例

```plaintext
DEBUG=False
API_VERSION=v1
API_PREFIX=/api/v1
DATABASE_URL=postgresql://prod_user:strong_password@db.example.com:5432/prod_db
REDIS_HOST=redis.example.com
REDIS_PASSWORD=strong_redis_password
SECRET_KEY=long_random_string_here
ACCESS_TOKEN_EXPIRE_MINUTES=15
```
