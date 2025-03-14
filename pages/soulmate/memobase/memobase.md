# Memobase 本地开发环境搭建指南

## 目录
- [环境要求](#环境要求)
- [基础环境安装](#基础环境安装)
- [项目配置](#项目配置)
- [数据库设置](#数据库设置)
- [启动服务](#启动服务)

## 环境要求

在开始之前，请确保您的系统满足以下要求：

- Linux 操作系统（本指南基于 Debian/Ubuntu）
- Python 3.11 或更高版本
- PostgreSQL 数据库
- Redis 服务器
- OpenAI API 密钥（用于 LLM 功能）

## 基础环境安装

### 1. 安装系统依赖

```bash
sudo apt-get update
sudo apt-get install -y python3-pip postgresql postgresql-contrib redis python3-venv
```

### 2. 创建并激活 Python 虚拟环境

```bash
# 在项目根目录下执行
python3 -m venv venv
source venv/bin/activate
```

### 3. 安装 Python 依赖包

```bash
# 安装基础依赖
pip install -r requirements.txt

# 安装服务器依赖
cd src/server/api
pip install -r requirements.txt

# 安装数据库迁移工具
pip install alembic
```

## 项目配置

### 1. 配置环境变量

```bash
# 在 src/server 目录下
cp .env.example .env

# 添加必要的环境变量到 .env 文件
echo 'DATABASE_URL="postgresql://memobase:helloworld@localhost:5432/memobase"' >> .env
echo 'REDIS_URL="redis://:helloworld@localhost:6379"' >> .env
```

### 2. 配置应用设置

```bash
# 在 src/server/api 目录下
cp config.yaml.example config.yaml
```

:::info
请确保在 `config.yaml` 中设置您的 OpenAI API 密钥：
```yaml
llm_api_key: YOUR-OPENAI-KEY
llm_base_url: https://api.openai.com/v1/
```
:::

## 数据库设置

### 1. 创建数据库和用户

```bash
sudo -u postgres psql -c "CREATE USER memobase WITH PASSWORD 'helloworld';"
sudo -u postgres psql -c "CREATE DATABASE memobase OWNER memobase;"
```

### 2. 配置数据库连接

编辑 `src/server/api/alembic.ini` 文件，确保数据库连接 URL 正确：

```ini
sqlalchemy.url = postgresql://memobase:helloworld@localhost:5432/memobase
```

### 3. 运行数据库迁移

```bash
cd src/server/api
alembic upgrade head
```

## 启动服务

### 1. 启动服务器

```bash
cd src/server/api
uvicorn api:app --reload
```

服务器将在以下地址运行：
- API 服务：http://localhost:8000
- API 文档：http://localhost:8000/docs

## 注意事项

1. **数据库连接**
   - 确保 PostgreSQL 服务正在运行
   - 默认端口为 5432
   - 检查数据库用户权限是否正确

2. **Redis 服务**
   - 确保 Redis 服务正在运行
   - 默认端口为 6379
   - 检查 Redis 密码配置是否正确

3. **开发模式**
   - 服务器运行在开发模式下，启用了自动重载功能
   - 代码修改后会自动重启服务

4. **API 密钥**
   - 使用 LLM 功能前必须配置有效的 OpenAI API 密钥
   - 可以在 `config.yaml` 中修改 API 配置

## 常见问题排查

1. **数据库连接错误**
   ```
   sqlalchemy.exc.OperationalError: connection refused
   ```
   解决方案：
   - 检查 PostgreSQL 服务是否运行
   - 验证数据库用户名和密码
   - 确认数据库端口是否正确

2. **Redis 连接错误**
   ```
   redis.exceptions.ConnectionError
   ```
   解决方案：
   - 检查 Redis 服务是否运行
   - 验证 Redis 密码配置
   - 确认 Redis 端口是否正确

3. **环境变量问题**
   ```
   sqlalchemy.exc.ArgumentError: Expected string or URL object, got None
   ```
   解决方案：
   - 检查 .env 文件是否存在
   - 确认环境变量是否正确设置
   - 验证环境变量是否被正确加载