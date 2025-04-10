# 从零开始创建服务器指南

## 第一步：创建项目基础结构

```bash
# 1. 创建项目目录
mkdir -p src/newServer
cd src/newServer

# 2. 创建虚拟环境
python -m venv venv
source venv/bin/activate

# 3. 创建基本目录结构
mkdir -p memobase_server/core
mkdir -p memobase_server/api/v1
mkdir -p memobase_server/models
mkdir -p memobase_server/schemas
mkdir -p memobase_server/services
mkdir -p migrations
mkdir -p tests
mkdir -p docs/zh
```

## 第二步：创建配置文件

### 1. requirements.txt
```bash
# 创建并编辑 requirements.txt
touch requirements.txt
```

添加以下内容：
```plaintext
fastapi==0.104.1
uvicorn==0.24.0
python-dotenv==1.0.0
sqlalchemy==2.0.23
alembic==1.12.1
redis==5.0.1
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose==3.3.0
passlib==1.7.4
bcrypt==4.0.1
psycopg2-binary==2.9.9
email-validator==2.2.0
```

### 2. 环境变量模板
```bash
# 创建 .env.example
touch .env.example
```

添加以下内容：
```plaintext
DATABASE_URL=postgresql://memouser:memopass@localhost:5432/memodb
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=memoredis
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=True
API_VERSION=v1
API_PREFIX=/api/v1
```

## 第三步：创建核心模块

### 1. 配置模块 (core/config.py)
```bash
# 创建配置文件
touch memobase_server/core/__init__.py
touch memobase_server/core/config.py
```

编写 config.py：
```python
from typing import Any, Dict, Optional
from pydantic import PostgresDsn, validator
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    API_VERSION: str = "v1"
    API_PREFIX: str = f"/api/{API_VERSION}"
    DEBUG: bool = False
    
    DATABASE_URL: PostgresDsn
    
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str
    
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
```

### 2. 数据库连接 (database.py)
```bash
# 创建数据库连接文件
touch memobase_server/database.py
```

编写 database.py：
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from .core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

### 3. Redis连接 (redis.py)
```bash
# 创建Redis连接文件
touch memobase_server/redis.py
```

编写 redis.py：
```python
from redis import Redis
from .core.config import settings

redis_client = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    password=settings.REDIS_PASSWORD,
    decode_responses=True
)

async def get_redis():
    return redis_client
```

## 第四步：创建数据模型

### 1. 用户模型 (models/user.py)
```bash
# 创建用户模型文件
touch memobase_server/models/__init__.py
touch memobase_server/models/user.py
```

编写 user.py：
```python
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from ..database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

## 第五步：创建数据验证模式

### 1. 用户模式 (schemas/user.py)
```bash
# 创建用户模式文件
touch memobase_server/schemas/__init__.py
touch memobase_server/schemas/user.py
```

编写 user.py：
```python
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
```

## 第六步：设置数据库迁移

### 1. 初始化 Alembic
```bash
# 初始化 Alembic
alembic init migrations
```

### 2. 配置 alembic.ini
编辑 alembic.ini：
```ini
[alembic]
script_location = migrations
sqlalchemy.url = postgresql://memouser:memopass@localhost:5432/memodb
```

### 3. 配置迁移环境
编辑 migrations/env.py：
```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
from memobase_server.models.user import User  # 导入模型
from memobase_server.database import Base
from memobase_server.core.config import settings

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline():
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = settings.DATABASE_URL
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### 4. 创建首次迁移
```bash
alembic revision -m "create users table"
```

编辑生成的迁移文件：
```python
def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True),
                 server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
```

## 第七步：创建 API 路由

### 1. 创建路由文件
```bash
# 创建路由文件
mkdir -p memobase_server/api/v1/endpoints
touch memobase_server/api/v1/__init__.py
touch memobase_server/api/v1/endpoints/__init__.py
touch memobase_server/api/v1/endpoints/users.py
```

编写 users.py：
```python
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ....database import get_db
from ....schemas.user import UserCreate, UserResponse
from ....models.user import User

router = APIRouter()

@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=user.password  # 注意：实际应用中需要加密
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.get("/{user_id}", response_model=UserResponse)
async def read_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=List[UserResponse])
async def read_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    users = await db.execute(select(User).offset(skip).limit(limit))
    return users.scalars().all()
```

## 第八步：创建主应用

### 1. 创建主应用文件
```bash
# 创建主应用文件
touch memobase_server/main.py
```

编写 main.py：
```python
from fastapi import FastAPI
from .core.config import settings
from .api.v1.endpoints import users
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时的操作
    yield
    # 关闭时的操作

app = FastAPI(
    title="Memobase API",
    version=settings.API_VERSION,
    lifespan=lifespan
)

# 添加路由
app.include_router(users.router, prefix=f"{settings.API_PREFIX}/users", tags=["users"])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

## 第九步：运行服务器

### 1. 应用数据库迁移
```bash
alembic upgrade head
```

### 2. 启动服务器
```bash
uvicorn memobase_server.main:app --reload --port 8080
```

## 完成！

现在你已经创建了一个完整的 FastAPI 服务器，包含：
1. 用户管理功能
2. 数据库集成
3. Redis 缓存支持
4. API 文档 (访问 http://localhost:8080/docs)

可以通过以下方式测试 API：
```bash
# 创建用户
curl -X POST "http://localhost:8080/api/v1/users/" \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "testpass123", "full_name": "测试用户"}'

# 获取用户信息
curl "http://localhost:8080/api/v1/users/1"
```
