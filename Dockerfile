FROM node:20-alpine
ENV TZ="Asia/Shanghai"
WORKDIR /yapi/vendors
COPY . /yapi/vendors/

RUN apk add --no-cache make g++ && cd /yapi/vendors && npm install --production --registry https://registry.npmmirror.com

EXPOSE 3000
ENTRYPOINT ["node"]
