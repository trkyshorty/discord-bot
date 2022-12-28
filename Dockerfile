FROM node:slim

RUN apt-get update
RUN apt-get install git -y

RUN mkdir -p /usr/src/app/discord-bot && chown -R root:root /usr/src/app/discord-bot

WORKDIR /usr/src/discord-bot

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

USER root

RUN npm install -g add pm2
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
