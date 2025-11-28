#!/bin/sh

# 获取公网IP（尝试多个IP查询服务，确保可靠性）
PUBLIC_IP=$(curl -s --connect-timeout 10 --max-time 10 ip.sb || curl -s --connect-timeout 10 --max-time 10 ifconfig.me || curl -s --connect-timeout 10 --max-time 10 icanhazip.com)

# 如果获取失败，使用错误信息作为IP
if [ -z "$PUBLIC_IP" ]; then
    echo "Warning: Failed to get public IP, using fallback text."
    PUBLIC_IP="未能获取IP"
fi

echo "Public IP found: $PUBLIC_IP"

# 将获取到的IP写入index.html文件
# 注意：使用不同的分隔符（#）来避免IP地址中的斜杠引起冲突
sed -i "s#%%HOST_PUBLIC_IP%%#$PUBLIC_IP#g" /app/web/index.html

# 处理密钥前缀（默认 moviepilot，可通过环境变量 SECRET_PATH 覆盖）
SECRET_PATH=${SECRET_PATH:-moviepilot}
echo "Using SECRET_PATH: $SECRET_PATH"

# 用模板生成最终的 Nginx 站点配置
if [ -f /etc/nginx/http.d/default.conf.template ]; then
  echo "Found template file, generating configuration..."
  sed "s#__SECRET_PATH__#${SECRET_PATH}#g" /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf
  echo "Generated nginx configuration:"
  cat /etc/nginx/http.d/default.conf
  echo "Configuration generation complete."
else
  echo "ERROR: Template file not found!"
fi

echo "Starting Nginx..."

# Test DNS resolution before starting nginx
echo "Testing DNS resolution..."
nslookup ipv4.ddnspod.com || echo "DNS resolution failed for ipv4.ddnspod.com"
nslookup 4.ipw.cn || echo "DNS resolution failed for 4.ipw.cn"

# 启动nginx
exec nginx -g 'daemon off;'