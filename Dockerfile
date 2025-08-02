FROM alpine:3.21

ENV TZ=Asia/Shanghai

# 安装必要的工具
RUN apk add --no-cache tzdata nginx nginx-mod-http-lua curl && \
    rm -rf /var/cache/apk/* /tmp/*

# 复制应用文件
COPY --chmod=755 ./rootfs /
COPY --chmod=755 ./start.sh /start.sh

# 加载 lua 模块
RUN echo "load_module /usr/lib/nginx/modules/ndk_http_module.so;" > /etc/nginx/modules/lua.conf && \
    echo "load_module /usr/lib/nginx/modules/ngx_http_lua_module.so;" >> /etc/nginx/modules/lua.conf

EXPOSE 80

ENTRYPOINT ["/start.sh"]