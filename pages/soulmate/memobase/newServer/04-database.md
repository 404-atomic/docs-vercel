# 数据库设计

## PostgreSQL 数据库

### 用户表 (users)

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INTEGER | 用户ID | 主键, 自增 |
| email | VARCHAR | 电子邮件 | 唯一, 非空 |
| full_name | VARCHAR | 用户全名 | 非空 |
| hashed_password | VARCHAR | 加密密码 | 非空 |
| created_at | TIMESTAMP | 创建时间 | 非空, 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 可空 |

### 数据库迁移

使用 Alembic 管理数据库迁移：

```python
# migrations/env.py
from memobase_server.models.user import User
target_metadata = Base.metadata
```

```python
# alembic/versions/xxx_create_users_table.py
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
```

## Redis 缓存

### 缓存设计

1. **用户缓存**
   - 键格式：`user:{id}`
   - 值类型：Hash
   - 过期时间：30分钟
   - 字段：
     ```
     {
       "id": "用户ID",
       "email": "电子邮件",
       "full_name": "用户全名",
       "created_at": "创建时间"
     }
     ```

2. **令牌缓存**
   - 键格式：`token:{user_id}`
   - 值类型：String
   - 过期时间：与访问令牌相同

### 缓存操作

```python
# 设置用户缓存
async def cache_user(user_id: int, user_data: dict):
    key = f"user:{user_id}"
    await redis_client.hmset(key, user_data)
    await redis_client.expire(key, 1800)  # 30分钟过期

# 获取用户缓存
async def get_cached_user(user_id: int):
    key = f"user:{user_id}"
    return await redis_client.hgetall(key)
```

## 数据库连接配置

### PostgreSQL 连接

```python
# database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True
)

async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)
```

### Redis 连接

```python
# redis.py
from redis import Redis

redis_client = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    password=settings.REDIS_PASSWORD,
    decode_responses=True
)
```

## 数据库操作示例

### 用户操作

```python
# 创建用户
async def create_user(db: AsyncSession, user: UserCreate):
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=get_password_hash(user.password)
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

# 查询用户
async def get_user(db: AsyncSession, user_id: int):
    return await db.get(User, user_id)
```
