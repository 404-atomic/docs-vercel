# 部署说明

## 系统要求

### 1. 硬件要求
- CPU: 2核心以上
- 内存: 4GB以上
- 磁盘: 20GB以上

### 2. 软件要求
- Python 3.11+
- PostgreSQL 13+
- Redis 6+
- Nginx (可选，用于反向代理)

## 部署步骤

### 1. 系统准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装依赖
sudo apt install -y python3-pip python3-venv postgresql redis-server nginx
```

### 2. 数据库设置

```bash
# PostgreSQL 配置
sudo -u postgres psql -c "CREATE USER memouser WITH PASSWORD 'memopass' CREATEDB;"
sudo -u postgres psql -c "CREATE DATABASE memodb OWNER memouser;"

# Redis 配置
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.backup
echo "requirepass memoredis" | sudo tee -a /etc/redis/redis.conf
sudo systemctl restart redis-server
```

### 3. 应用部署

```bash
# 创建应用目录
mkdir -p /opt/memobase
cd /opt/memobase

# 克隆代码
git clone <repository_url> .

# 设置虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件设置生产环境配置
```

### 4. 配置 Gunicorn

创建 `gunicorn_conf.py`:
```python
bind = "0.0.0.0:8000"
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
keepalive = 120
```

### 5. 配置 Systemd 服务

创建 `/etc/systemd/system/memobase.service`:
```ini
[Unit]
Description=Memobase FastAPI application
After=network.target

[Service]
User=memobase
Group=memobase
WorkingDirectory=/opt/memobase
Environment="PATH=/opt/memobase/venv/bin"
ExecStart=/opt/memobase/venv/bin/gunicorn -c gunicorn_conf.py memobase_server.main:app

[Install]
WantedBy=multi-user.target
```

### 6. 配置 Nginx

创建 `/etc/nginx/sites-available/memobase`:
```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 7. 启动服务

```bash
# 启动应用
sudo systemctl start memobase
sudo systemctl enable memobase

# 启动 Nginx
sudo ln -s /etc/nginx/sites-available/memobase /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

## 监控和维护

### 1. 日志管理

```bash
# 查看应用日志
sudo journalctl -u memobase

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. 备份策略

```bash
# 数据库备份
pg_dump -U memouser memodb > backup_$(date +%Y%m%d).sql

# 自动备份脚本
#!/bin/bash
BACKUP_DIR="/backup/postgres"
DATE=$(date +%Y%m%d)
pg_dump -U memouser memodb > "$BACKUP_DIR/backup_$DATE.sql"
find "$BACKUP_DIR" -type f -mtime +7 -delete
```

### 3. 性能监控

```bash
# 系统监控
htop
df -h
free -m

# PostgreSQL 监控
SELECT * FROM pg_stat_activity;

# Redis 监控
redis-cli -a memoredis info
```

## 安全配置

### 1. 防火墙设置

```bash
# 配置 UFW
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### 2. SSL 配置

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d example.com
```

### 3. 安全最佳实践

1. 定期更新系统和依赖
   ```bash
   sudo apt update && sudo apt upgrade -y
   pip install --upgrade -r requirements.txt
   ```

2. 设置强密码策略
3. 启用防火墙
4. 配置 SSL/TLS
5. 定期备份
6. 监控系统日志
