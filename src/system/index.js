const { Client, Collection } = require('discord.js');
const { Manager } = require('@lavacord/discord.js');
const path = require('path');
const glob = require('glob');
const mongoose = require('mongoose');
const winston = require('winston');
const Dispatcher = require('./dispatcher');
const Command = require('./command');
const Event = require('./event');

class Bot extends Client {
  constructor(options = {}) {
    super(options);

    /** @type {Dispatcher} */
    this.dispatcher = new Dispatcher(this);

    /** @type {string} */
    this.commandPrefix = options.commandPrefix;

    /** @type {string} */
    this.botOwner = options.botOwner;

    /** @type {Collection} */
    this.events = new Collection();

    /** @type {Collection} */
    this.commands = new Collection();

    /** @type {Collection} */
    this.aliases = new Collection();

    /** @type {Set} */
    this.cooldown = new Set();

    /** @type {Map} */
    this.queue = new Map();

    /** @type {Mongoose} */
    this.database = {};

    /** @type {Winston} */
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
    });
  }

  /**
   * Application entry point
   *
   * @param {String} token
   */
  async bootstrap(token) {
    try {
      this.logger.info('Bootstrapping');
      this.database = await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });

      this.registerModels();
      this.registerEvents();
      this.registerCommands();

      await this.login(token);

      this.logger.info('Waiting lavalink instance for music bot');

      setTimeout(async () => {
        const nodes = [{ id: '1', host: 'lavalink', port: 2333, password: process.env.LAVALINK_PASSWORD }];

        this.manager = new Manager(this, nodes, {
          user: this.user.id,
          shards: (this.shard && this.shard.count) || 1,
        });

        await this.manager
          .connect()
          .then(() => {
            this.logger.info('Lavalink is ready');
          })
          .catch((err) => {
            this.logger.error(err.message);
          });
      }, 7000);

      setInterval(async () => {
        this.emit('banTimeout');
        this.emit('muteTimeout');
      }, 10 * 1000);
    } catch (err) {
      this.logger.error(err.message);
    }
  }

  registerModels() {
    this.logger.info('Loading models');
    const items = [];
    items.push(...glob.sync(`${path.join(__dirname, '../models')}/*.js`));
    items.forEach((item) => {
      if (require.cache[require.resolve(item)]) delete require.cache[require.resolve(item)];
      require(item);

      const modelName = path.parse(item).base.split('.')[0];

      this.logger.verbose(`Model: ${modelName}`);
    });
  }

  registerEvents() {
    this.logger.info('Loading events');
    const items = [];
    items.push(...glob.sync(`${path.join(__dirname, '../events')}/*.js`));
    items.forEach((item) => {
      if (require.cache[require.resolve(item)]) delete require.cache[require.resolve(item)];

      let event = require(item);

      const eventName = path.parse(item).base.split('.')[0];
      /* eslint-disable new-cap */
      if (typeof event === 'function') event = new event(this);
      /* eslint-enable new-cap */

      event.name = eventName;

      this.logger.verbose(`Event: ${event.name}`);

      this.on(eventName, async (...args) => {
        await this.dispatcher.handleEvent(event, ...args);
      });
    });
  }

  registerCommands() {
    this.logger.info('Loading commands');
    const items = [];
    items.push(...glob.sync(`${path.join(__dirname, '../commands')}/**/*.js`));
    items.forEach((item) => {
      if (require.cache[require.resolve(item)]) delete require.cache[require.resolve(item)];

      let command = require(item);

      /* eslint-disable new-cap */
      if (typeof command === 'function') command = new command(this);
      /* eslint-enable new-cap */

      this.logger.verbose(`Command: ${command.info.name} - Aliases: ${command.info.aliases.join(', ')}`);

      this.commands.set(command.info.name, command);
      if (command.info.aliases) {
        command.info.aliases.forEach((alias) => {
          this.aliases.set(alias, command.info.name);
        });
      }
    });
  }

  /**
   * Called after the application is fully loaded See the application entry point for this
   *
   * @param {String} token
   */
  async login(token) {
    this.logger.info('Connecting to Discord Api');
    await super.login(token);
  }
}

module.exports = {
  Bot,
  Event,
  Command,
};
