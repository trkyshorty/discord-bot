FROM node:12-slim

RUN apt-get update
RUN apt-get install git -y

RUN mkdir -p /usr/src/discord-bot && chown -R root:root /usr/src/discord-bot

WORKDIR /usr/src/discord-bot

COPY package.json /usr/src/discord-bot

USER root

RUN npm install

COPY --chown=root:root . .

EXPOSE 3000
