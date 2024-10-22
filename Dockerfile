FROM node:alpine

RUN apk update && \
    apk add --no-cache git

WORKDIR /usr/src/discord-bot

COPY package*.json ./

USER root

RUN npm install -g pm2
RUN npm install

COPY . .

CMD ["npm", "start"]
