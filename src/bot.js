const glob = require('glob')
const path = require('path')
const mongoose = require('mongoose')
const winston = require('winston')
const {
  REST,
  Routes,
  Client,
  GatewayIntentBits,
  Collection,
  SlashCommandBuilder,
  PermissionFlagsBits,
  Partials,
  ChannelType,
  EmbedBuilder,
  ActivityType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder
} = require('discord.js')
const Event = require('./handlers/event')
const Command = require('./handlers/command')
const { Node } = require('lavaclient')
require('@lavaclient/queue/register')

class Bot extends Client {
  constructor(options = {}) {
    super(options)

    this.commands = new Collection()
    this.aliases = new Collection()
    this.players = new Map()
    this.experienceCooldown = new Set()

    this.database = null
    this.lavalink = null

    this.logger = winston.createLogger({
      format: winston.format.simple(),
      handleExceptions: true,
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'development' ? 'silly' : 'info',
          format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
        new winston.transports.File({
          filename: './logs/error.log',
          level: 'error',
          handleExceptions: true,
        }),
        new winston.transports.File({ filename: './logs/combined.log' }),
      ],
      exceptionHandlers: [new winston.transports.File({ filename: './logs/exceptions.log' })],
    })
  }

  async connectDatabase () {
    this.database = await mongoose.connect(process.env.MONGODB_URL)
      .then(() => { this.emit('databaseReady') })
      .catch((error) => { this.emit('databaseError', error) })
  }

  async buildCommands () {
    try {
      const items = []
      items.push(...glob.sync(`${path.join(__dirname, './commands')}/**/*.js`))
      items.forEach((item) => {
        if (require.cache[require.resolve(item)])
          delete require.cache[require.resolve(item)]

        let command = require(item)

        /* eslint-disable new-cap */
        if (typeof command === 'function') command = new command(this)
        /* eslint-enable new-cap */

        if (process.env.INSTANCE_TYPE === 'music'
          && command.info.category !== 'music') return

        this.logger.info(
          `[COMMAND] Load ${command.info.name} - ${command.info.aliases.join(', ')}`
        )

        this.commands.set(command.info.name, command)

        if (command.info.aliases) {
          command.info.aliases.forEach((alias) => {
            this.aliases.set(alias, command.info.name)
          })
        }
      })

      await this.registerSlashCommands()

    } catch (error) {
      this.logger.error(error)
    }
  }

  async registerSlashCommands () {
    const slashCommands = []

    this.commands.forEach((command) => {
      const slashCommand = new SlashCommandBuilder()
        .setName(command.info.name)
        .setDescription(command.info.description || 'null')
        .setDefaultMemberPermissions(command.info.memberPermissions || 0)

      const args = command.info.args || null

      if (args) {
        args.forEach((arg) => {
          const required = arg.required || false

          switch (arg.type) {
            case 'string':
              slashCommand.addStringOption((option) =>
                option
                  .setName(arg.name.toLowerCase())
                  .setDescription(arg.description || 'null')
                  .setRequired(required)
              )
              break
            case 'integer':
              slashCommand.addIntegerOption((option) =>
                option
                  .setName(arg.name.toLowerCase())
                  .setDescription(arg.description || 'null')
                  .setRequired(required)
              )
              break
            case 'user':
              slashCommand.addUserOption((option) =>
                option
                  .setName(arg.name.toLowerCase())
                  .setDescription(arg.description || 'null')
                  .setRequired(required)
              )
              break
            case 'role':
              slashCommand.addRoleOption((option) =>
                option
                  .setName(arg.name.toLowerCase())
                  .setDescription(arg.description || 'null')
                  .setRequired(required)
              )
              break
            case 'channel':
              slashCommand.addChannelOption((option) =>
                option
                  .setName(arg.name.toLowerCase())
                  .setDescription(arg.description || 'null')
                  .setRequired(required)
              )
              break
            default:
              throw new Error(`Unhandled argument type: ${arg.name}`)
          }
        })
      }

      slashCommands.push(slashCommand)
    })

    slashCommands.map((command) => command.toJSON())

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)

    rest
      .put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: slashCommands,
      })
      .then((data) =>
        this.logger.info(
          `[COMMAND] Successfully registered ${data.length} application commands`
        )
      )
      .catch((err) => {
        this.logger.error(err.message)
      })
  }

  async buildEvents () {
    try {
      const items = []
      items.push(...glob.sync(`${path.join(__dirname, './events')}/**/*.js`))
      items.forEach((item) => {
        if (require.cache[require.resolve(item)])
          delete require.cache[require.resolve(item)]

        let event = require(item)

        /* eslint-disable new-cap */
        if (typeof event === 'function') event = new event(this)
        /* eslint-enable new-cap */

        this.logger.info(`[EVENT] Load ${event.info.name}`)

        this.on(event.info.name, async (...args) => {
          await event.execute(...args)
        })
      })
    } catch (error) {
      this.logger.error(error)
    }
  }

  async buildLavalink () {
    this.lavalink = new Node({
      connection: { host: process.env.LAVALINK_HOST, port: process.env.LAVALINK_PORT, password: process.env.LAVALINK_PASSWORD },
      sendGatewayPayload: (id, payload) => {
        const guild = this.guilds.cache.get(id)
        if (guild) guild.shard.send(payload)
      },
    }).on('connect', () => {
      this.emit('lavalinkReady')
    }).on('error', (error) => {
      this.emit('lavalinkError', error)
    })

    this.ws.on('VOICE_SERVER_UPDATE', (data) => this.lavalink.handleVoiceUpdate(data))
    this.ws.on('VOICE_STATE_UPDATE', (data) => this.lavalink.handleVoiceUpdate(data))

    await this.connectLavalink()
  }

  async connectLavalink () {
    await this.lavalink.connect(process.env.CLIENT_ID)
  }

  async login (token) {

    await this.buildCommands()
    await this.buildEvents()
    await this.buildLavalink()

    await this.connectDatabase()

    await super.login(token)
  }
}

module.exports = {
  Bot,
  Event,
  Command,
  PermissionFlagsBits,
  GatewayIntentBits,
  Partials,
  ChannelType,
  EmbedBuilder,
  ActivityType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
}
