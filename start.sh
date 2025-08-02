#!/bin/sh

# 获取公网IP（尝试多个IP查询服务，确保可靠性）
export HOST_PUBLIC_IP=$(curl -s ip.sb || curl -s ifconfig.me || curl -s icanhazip.com)

# 如果获取失败，使用默认值
if [ -z "$HOST_PUBLIC_IP" ]; then
    echo "Warning: Failed to get public IP, using default value"
    export HOST_PUBLIC_IP="未能获取IP"
fi

# 启动nginx
exec nginx -g 'daemon off;' 