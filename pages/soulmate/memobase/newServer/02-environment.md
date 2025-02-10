# 环境设置

## 开发环境配置

### 1. 安装 Python 虚拟环境

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Linux/Mac:
source venv/bin/activate
# Windows:
# .\venv\Scripts\activate
```

### 2. 安装依赖包

```bash
# 安装所有依赖
pip install -r requirements.txt
```

requirements.txt 内容：
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

### 3. 配置 PostgreSQL

```bash
# 创建新用户
sudo -u postgres psql -c "CREATE USER memouser WITH PASSWORD 'memopass' CREATEDB;"

# 创建数据库
sudo -u postgres psql -c "CREATE DATABASE memodb OWNER memouser;"
```

### 4. 配置 Redis

```bash
# 备份 Redis 配置
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.backup

# 设置 Redis 密码
echo "requirepass memoredis" | sudo tee -a /etc/redis/redis.conf

# 重启 Redis 服务
sudo systemctl restart redis-server
```

### 5. 环境变量配置

创建 `.env` 文件：

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

### 6. 数据库迁移

```bash
# 初始化迁移
alembic upgrade head
```

### 7. 启动服务器

```bash
# 开发模式启动
uvicorn memobase_server.main:app --reload --port 8080
```

## 验证安装

1. 访问 API 文档：
   - Swagger UI: http://localhost:8080/docs
   - ReDoc: http://localhost:8080/redoc

2. 测试健康检查：
   ```bash
   curl http://localhost:8080/health
   ```

3. 测试用户创建：
   ```bash
   curl -X POST "http://localhost:8080/api/v1/users/" \
        -H "Content-Type: application/json" \
        -d '{"email": "test@example.com", "password": "testpass123", "full_name": "Test User"}'
   ```
