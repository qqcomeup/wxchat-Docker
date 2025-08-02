FROM alpine:3.21

ENV TZ=Asia/Shanghai

# 安装必要的工具
RUN apk add --no-cache tzdata nginx curl && \
    rm -rf /var/cache/apk/* /tmp/*

# 复制应用文件
COPY --chmod=755 ./rootfs /
COPY --chmod=755 ./start.sh /start.sh

EXPOSE 80

ENTRYPOINT ["/start.sh"]