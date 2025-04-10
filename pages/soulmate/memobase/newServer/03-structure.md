# 项目结构

## 目录结构

```
src/newServer/
├── alembic/                    # 数据库迁移相关文件
│   ├── versions/               # 迁移版本文件
│   └── env.py                  # 迁移环境配置
├── docs/                       # 项目文档
│   └── zh/                     # 中文文档
├── memobase_server/           # 主应用代码
│   ├── core/                  # 核心功能模块
│   │   ├── config.py         # 配置管理
│   │   └── security.py       # 安全相关功能
│   ├── models/               # 数据库模型
│   │   └── user.py          # 用户模型
│   ├── schemas/              # Pydantic 模型
│   │   └── user.py          # 用户数据验证
│   ├── api/                  # API 路由
│   │   └── v1/              # API 版本1
│   ├── database.py          # 数据库连接
│   ├── redis.py             # Redis 连接
│   └── main.py              # 应用入口
├── tests/                    # 测试文件
├── .env                      # 环境变量
├── .env.example             # 环境变量示例
├── alembic.ini              # Alembic 配置
└── requirements.txt         # 项目依赖

```

## 核心文件说明

### 1. 配置文件 (core/config.py)
```python
# 使用 pydantic_settings 管理配置
class Settings(BaseSettings):
    API_VERSION: str
    API_PREFIX: str
    DATABASE_URL: PostgresDsn
    REDIS_HOST: str
    REDIS_PASSWORD: str
    # ... 其他配置项
```

### 2. 数据库模型 (models/user.py)
```python
# SQLAlchemy 模型定义
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    full_name = Column(String)
    # ... 其他字段
```

### 3. 数据验证 (schemas/user.py)
```python
# Pydantic 模型用于请求/响应验证
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    # ... 其他字段
```

### 4. 数据库连接 (database.py)
```python
# SQLAlchemy 异步数据库连接
engine = create_async_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(engine, class_=AsyncSession)
```

### 5. Redis 连接 (redis.py)
```python
# Redis 连接配置
redis_client = Redis(
    host=settings.REDIS_HOST,
    password=settings.REDIS_PASSWORD,
    # ... 其他配置
)
```

### 6. 主应用 (main.py)
```python
# FastAPI 应用配置
app = FastAPI(
    title="Memobase API",
    version=settings.API_VERSION,
    # ... 其他配置
)
```

## 模块职责

1. **core/**
   - 核心配置和功能
   - 安全相关实现
   - 通用工具函数

2. **models/**
   - 数据库表结构定义
   - ORM 模型关系
   - 数据库操作方法

3. **schemas/**
   - 请求数据验证
   - 响应数据格式化
   - 数据转换规则

4. **api/**
   - API 路由定义
   - 业务逻辑实现
   - 错误处理
