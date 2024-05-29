# Discord Bot

## Table of Contents

- [Application Features](#application-features)
- [Bot Features](#bot-features)
- [Requirements](#requirements)
- [Server Configuration](#server-configuration)

## Application Features

- **Lavalink**: latest [Lavalink](https://github.com/Frederikam/Lavalink) features
- **NoSQL database**: [MongoDB](https://www.mongodb.com) object data modeling using [Mongoose](https://mongoosejs.com)
- **Process management**: advanced production process management using [PM2](https://pm2.keymetrics.io)
- **Environment variables**: using [dotenv](https://github.com/motdotla/dotenv) and [cross-env](https://github.com/kentcdodds/cross-env#readme)
- **Container**: [docker](https://docs.docker.com/get-started/overview/) support
- **Git hooks**: with [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged)
- **Linting**: with [ESLint](https://eslint.org) and [Prettier](https://prettier.io)
- **Editor config**: consistent editor configuration using [EditorConfig](https://editorconfig.org)
- **Dependency management**: with [Yarn](https://yarnpkg.com)

## Bot Features

- **Music**: Full featured music bot (!play, !pause, !resume, !skip, !leave)
- **Ranking**: Experience points are earned based on chat and this determines the ranking (!highscore, !rank)
- **Moderation**: Moderation features (!purge)
- **Information**: For now it has only one feature (!avatar)

## Discord

[If you need help](https://discord.gg/5pBp2s2NUr)

## Requirements

- Docker

## Server Configuration

Start:

```bash
# run docker container in development mode
yarn docker:dev

# run docker container in production mode
yarn docker:prod
```

Backup & Restore:

```bash
# run mongodump and create backup discord-bot collections
docker exec -i <container-name> /usr/bin/mongodump --uri=mongodb://mongodb:27017/discord-bot --out /dump

# Copy to backup output folder to host root directory
docker cp <container-name>:/dump /root/dump

# Copy to backup folder to new mongodb container
docker cp /root/dump <container-name>:/dump

# Restore backup
docker exec -i <container-name> /usr/bin/mongorestore --uri=mongodb://mongodb:27017/discord-bot /dump/discord-bot
```

Linting:

```bash
# run ESLint
yarn lint

# fix ESLint errors
yarn lint:fix

# run prettier
yarn prettier

# fix prettier errors
yarn prettier:fix
```
