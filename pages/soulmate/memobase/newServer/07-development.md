# 开发指南

## 开发环境设置

### 1. 安装开发工具

推荐的开发工具：
- VS Code
- PyCharm
- Postman/Insomnia (API测试)
- pgAdmin (PostgreSQL管理)
- RedisInsight (Redis管理)

### 2. VS Code 配置

推荐的扩展：
- Python
- Pylance
- Python Type Hint
- autoDocstring
- GitLens

settings.json 配置：
```json
{
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "python.formatting.provider": "black",
    "editor.formatOnSave": true,
    "python.analysis.typeCheckingMode": "basic"
}
```

## 代码规范

### 1. Python 代码风格

遵循 PEP 8 规范：
```python
# 正确的命名方式
class UserModel:
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        pass

# 正确的导入顺序
from typing import Optional
from fastapi import FastAPI
from sqlalchemy.orm import Session

# 正确的类型注解
def create_user(
    db: Session,
    user: UserCreate
) -> User:
    pass
```

### 2. 项目结构规范

```
api/
├── v1/
│   ├── endpoints/
│   │   ├── __init__.py
│   │   ├── users.py
│   │   └── auth.py
│   └── __init__.py
```

### 3. 文档规范

```python
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    通过邮箱获取用户信息

    参数:
        db (Session): 数据库会话
        email (str): 用户邮箱

    返回:
        Optional[User]: 用户对象，如果不存在则返回 None
    
    示例:
        >>> user = get_user_by_email(db, "user@example.com")
        >>> if user:
        ...     print(user.email)
    """
    return db.query(User).filter(User.email == email).first()
```

## 开发流程

### 1. 功能开发流程

1. 创建新分支
   ```bash
   git checkout -b feature/user-management
   ```

2. 编写测试用例
   ```python
   def test_create_user():
       response = client.post(
           "/api/v1/users/",
           json={
               "email": "test@example.com",
               "password": "password123",
               "full_name": "Test User"
           }
       )
       assert response.status_code == 200
       assert response.json()["email"] == "test@example.com"
   ```

3. 实现功能代码
   ```python
   @router.post("/", response_model=UserResponse)
   async def create_user(
       user: UserCreate,
       db: Session = Depends(get_db)
   ):
       return await user_service.create_user(db, user)
   ```

4. 运行测试
   ```bash
   pytest tests/
   ```

### 2. 数据库迁移流程

1. 创建迁移
   ```bash
   alembic revision -m "create users table"
   ```

2. 编写迁移脚本
   ```python
   def upgrade():
       op.create_table(
           'users',
           sa.Column('id', sa.Integer(), nullable=False),
           sa.Column('email', sa.String(), nullable=False),
           # ... 其他字段
       )

   def downgrade():
       op.drop_table('users')
   ```

3. 应用迁移
   ```bash
   alembic upgrade head
   ```

## 调试技巧

### 1. 日志调试

```python
import logging

logger = logging.getLogger(__name__)

@router.get("/{user_id}")
async def read_user(user_id: int):
    logger.debug(f"Fetching user with id: {user_id}")
    try:
        user = await get_user(user_id)
        logger.info(f"User found: {user.email}")
        return user
    except Exception as e:
        logger.error(f"Error fetching user: {str(e)}")
        raise
```

### 2. API 调试

使用 FastAPI 的调试工具：
- `/docs` - Swagger UI
- `/redoc` - ReDoc
- 添加调试端点：
  ```python
  @router.get("/debug/users/count")
  async def get_user_count():
      return {"count": await get_total_users()}
  ```
