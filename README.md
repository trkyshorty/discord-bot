# Zimbo

## Table of Contents

- [Application Features](#application-features)
- [Bot Features](#bot-features)
- [Requirements](#requirements)
- [Server Configuration](#server-configuration)

## Application Features

- **Lavalink**: latest [Lavalink](https://github.com/Frederikam/Lavalink) features
- **NoSQL database**: [MongoDB](https://www.mongodb.com) object data modeling using [Mongoose](https://mongoosejs.com)
- **Logging**: using [winston](https://github.com/winstonjs/winston)
- **Error handling**: centralized error handling mechanism
- **Process management**: advanced production process management using [PM2](https://pm2.keymetrics.io)
- **Environment variables**: using [dotenv](https://github.com/motdotla/dotenv) and [cross-env](https://github.com/kentcdodds/cross-env#readme)
- **Container**: [docker](https://docs.docker.com/get-started/overview/) support
- **Git hooks**: with [husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged)
- **Linting**: with [ESLint](https://eslint.org) and [Prettier](https://prettier.io)
- **Editor config**: consistent editor configuration using [EditorConfig](https://editorconfig.org)
- **Dependency management**: with [Yarn](https://yarnpkg.com)

## Bot Features

- **Music**: Full featured music bot (!play, !pause, !resume, !skip, !volume, !leave, !bassboost)
- **Ranking**: Experience points are earned based on chat and this determines the ranking (!highscore, !rank)
- **Moderation**: Moderation features (!ban, !mute, !purge, !unban, !unmute)
- **Information**: For now it has only one feature (!avatar)

## Requirements

- Docker
- Java

## Server Configuration

Start:

```bash
# run docker container in development mode
yarn docker:dev

# run docker container in production mode
yarn docker:prod
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
