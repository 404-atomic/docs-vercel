# API 接口文档

## API 概述

- 基础URL: `http://localhost:8080`
- API前缀: `/api/v1`
- 支持格式: JSON
- 认证方式: Bearer Token

## 用户管理 API

### 1. 创建用户

```
POST /api/v1/users/
```

请求体:
```json
{
    "email": "user@example.com",
    "password": "strongpassword",
    "full_name": "示例用户"
}
```

响应 (200 OK):
```json
{
    "id": 1,
    "email": "user@example.com",
    "full_name": "示例用户",
    "created_at": "2025-02-08T15:00:00+08:00",
    "updated_at": null
}
```

### 2. 获取用户信息

```
GET /api/v1/users/{user_id}
```

响应 (200 OK):
```json
{
    "id": 1,
    "email": "user@example.com",
    "full_name": "示例用户",
    "created_at": "2025-02-08T15:00:00+08:00",
    "updated_at": null
}
```

### 3. 获取用户列表

```
GET /api/v1/users/
```

响应 (200 OK):
```json
[
    {
        "id": 1,
        "email": "user1@example.com",
        "full_name": "用户1",
        "created_at": "2025-02-08T15:00:00+08:00",
        "updated_at": null
    },
    {
        "id": 2,
        "email": "user2@example.com",
        "full_name": "用户2",
        "created_at": "2025-02-08T15:00:00+08:00",
        "updated_at": null
    }
]
```

## 错误响应

### 1. 验证错误 (422 Unprocessable Entity)
```json
{
    "detail": [
        {
            "loc": ["body", "email"],
            "msg": "无效的邮箱格式",
            "type": "value_error.email"
        }
    ]
}
```

### 2. 不存在错误 (404 Not Found)
```json
{
    "detail": "用户不存在"
}
```

### 3. 重复错误 (400 Bad Request)
```json
{
    "detail": "邮箱已被注册"
}
```

## API 实现示例

```python
@router.post("/", response_model=UserResponse)
async def create_user(
    user: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    # 检查邮箱是否已存在
    db_user = await get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="邮箱已被注册"
        )
    
    # 创建新用户
    return await create_user(db, user)

@router.get("/{user_id}", response_model=UserResponse)
async def read_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    db_user = await get_user(db, user_id)
    if db_user is None:
        raise HTTPException(
            status_code=404,
            detail="用户不存在"
        )
    return db_user
```

## API 测试

使用 curl 测试 API:

```bash
# 创建用户
curl -X POST "http://localhost:8080/api/v1/users/" \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "testpass123", "full_name": "测试用户"}'

# 获取用户信息
curl "http://localhost:8080/api/v1/users/1"

# 获取用户列表
curl "http://localhost:8080/api/v1/users/"
```
