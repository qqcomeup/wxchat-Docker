# MoviePilot 微信转发代理 Docker

[![Build](https://github.com/DDS-Derek/wxchat-Docker/actions/workflows/build.yml/badge.svg)](https://github.com/DDS-Derek/wxchat-Docker/actions/workflows/build.yml) [![Docker readme update](https://github.com/DDS-Derek/wxchat-Docker/actions/workflows/readme_update.yml/badge.svg)](https://github.com/DDS-Derek/wxchat-Docker/actions/workflows/readme_update.yml)

增加微信上传图片临时端口代理

SECRET_PATH=自定义token
访问http://ip:端口/token

或许增加一丢丢安全性防止被扫

## 效果图
![MoviePilot 微信转发代理效果图](https://raw.githubusercontent.com/qqcomeup/wxchat-Docker/refs/heads/master/xg.jpg)
```bash
docker run -d \
  --name wxtets \
  -p 56668:38080 \
  -e SECRET_PATH="token" \
  --restart always \
  ck939410/wxchat:bata
```

```yaml
services:
    wxchat:
        container_name: wxtets
        restart: always
        environment:
         - SECRET_PATH=token
        ports:
            - 56668:38080
        image: ck939410/wxchat:bata
```
