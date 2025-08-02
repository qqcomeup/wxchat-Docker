#!/bin/sh

# 获取公网IP（尝试多个IP查询服务，确保可靠性）
PUBLIC_IP=$(curl -s ip.sb || curl -s ifconfig.me || curl -s icanhazip.com)

# 如果获取失败，使用错误信息作为IP
if [ -z "$PUBLIC_IP" ]; then
    echo "Warning: Failed to get public IP, using fallback text."
    PUBLIC_IP="未能获取IP"
fi

echo "Public IP found: $PUBLIC_IP"

# 将获取到的IP写入index.html文件
# 注意：使用不同的分隔符（#）来避免IP地址中的斜杠引起冲突
sed -i "s#%%HOST_PUBLIC_IP%%#$PUBLIC_IP#g" /app/web/index.html

echo "Starting Nginx..."
# 启动nginx
exec nginx -g 'daemon off;' 