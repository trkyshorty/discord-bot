const { Guild, GuildMember, Message, DMChannel } = require('discord.js');

class Dispatcher {
  constructor(client) {
    Object.defineProperty(this, 'client', { value: client });
  }

  /**
   * The starting point for the event handler is that some operations, are checked here before events are executed.
   *
   * @param {Event} event
   * @param {...any} args
   */
  async handleEvent(event, ...args) {
    if (
      event.name === 'message' ||
      event.name === 'messageUpdate' ||
      event.name === 'guildCreate' ||
      event.name === 'guildDelete' ||
      event.name === 'guildMemberAdd' ||
      event.name === 'guildMemberRemove'
    ) {
      if (event.name === 'messageUpdate' && args[0].content === args[1].content) return;
      this.performDatabaseAction(event.name, args[0]).then(() => {
        if ((event.name === 'message' || event.name === 'messageUpdate') && this.shouldHandleMessage(...args))
          return this.handleMessage(...args);

        if ((event.name === 'message' || event.name === 'messageUpdate') && args[0].channel instanceof DMChannel) {
          if (event.name === 'messageUpdate') return this.client.emit('directMessageUpdate', ...args);
          this.client.emit('directMessage', ...args);
        } else {
          event.execute(...args);
        }
      });
    } else {
      event.execute(...args);
    }
  }

  /**
   * Some messages may contain commands, when the event handler checks the message activity, it is decided from here
   * whether to run a command or not.
   *
   * @param {Message} oldMessage
   * @param {Message} newMessage
   */
  async handleMessage(oldMessage, newMessage) {
    const message = newMessage || oldMessage;
    const cmd = message.content.split(/\s+/g)[0].slice(this.client.commandPrefix.length);
    const args = message.content.split(/\s+/g).slice(1);

    let command;
    if (this.client.commands.has(cmd)) {
      command = this.client.commands.get(cmd);
    } else if (this.client.aliases.has(cmd)) {
      command = this.client.commands.get(this.client.aliases.get(cmd));
    }

    if (!command) return;
    if (!message.member.guild.me.hasPermission(command.info.clientPermissions))
      return message.channel.send('Bu işlem için gerekli yetkilere sahip değilim');
    if (!message.member.hasPermission(command.info.userPermissions)) return;

    if (command.info.moderatorOnly) {
      const Models = this.client.database.models;
      const guildDoc = await Models.Guild.findOne({ guild_id: message.guild.id });

      const moderationPlugin = guildDoc.plugins.moderation;
      if (!moderationPlugin.enable) return;
      if (!message.member.roles.cache.some((r) => moderationPlugin.roles.includes(r.id))) {
        return;
      }
    }

    if (command.info.ownerOnly && message.author.id !== process.env.BOT_OWNER) return;

    command.execute(message, args);
  }

  /**
   * Can the message be evaluated as a command?
   *
   * @param {Message} oldMessage
   * @param {Message} newMessage
   */
  shouldHandleMessage(oldMessage, newMessage) {
    if (oldMessage.author.id === this.client.user.id) return false;
    if (newMessage && oldMessage.content === newMessage.content) return false;
    if (newMessage && oldMessage.partial) return false;
    if (newMessage && !newMessage.content.startsWith(this.client.commandPrefix)) return false;
    if (!newMessage && !oldMessage.content.startsWith(this.client.commandPrefix)) return false;
    return true;
  }

  /**
   * Checks for the existence of guild documents and updates them if not
   *
   * @param {Snowflake} guildId
   * @param {Date | null} leavedAt
   */
  async initGuildDocument(guildId, leavedAt = null) {
    const { models } = this.client.database;
    const guildDocument = await models.Guild.findOneAndUpdate(
      { guild_id: guildId },
      { $set: { leaved_at: leavedAt } },
      { setDefaultsOnInsert: true, upsert: true, new: true }
    );
    return guildDocument;
  }

  /**
   * Checks for the existence of guild member documents and updates them if not
   *
   * @param {Snowflake} guildId
   * @param {Snowflake} userId
   * @param {Date | null} leavedAt
   */
  async initGuildMemberDocument(guildId, userId, leavedAt = null) {
    const { models } = this.client.database;
    const guildMemberDocument = await models.GuildMember.findOneAndUpdate(
      { guild_id: guildId, user_id: userId },
      { $set: { leaved_at: leavedAt } },
      { setDefaultsOnInsert: true, upsert: true, new: true }
    );
    return guildMemberDocument;
  }

  /**
   * Checks for the existence of user documents and updates them if not
   *
   * @param {Snowflake} guildId
   * @param {Snowflake} userId
   * @param {Date | null} leavedAt
   */
  async initUserDocument(userId) {
    const { models } = this.client.database;
    const userDocument = await models.User.findOneAndUpdate(
      { user_id: userId },
      { $set: {} },
      { setDefaultsOnInsert: true, upsert: true, new: true }
    );
    return userDocument;
  }

  /**
   * Some database operations are performed before some events run, this is the starting point of these operations.
   *
   * @param {Message} oldMessage
   * @param {any} newMessage
   */
  async performDatabaseAction(action, param) {
    if (param instanceof Guild || param instanceof GuildMember || param instanceof Message) {
      this.client.logger.verbose(`Running perform database action`);
      const guild = param.guild || param;
      const user = param.author || param.user;

      if (!(param.channel instanceof DMChannel)) {
        const guildLeavedAt = action === 'guildDelete' ? Date.now() : null;
        await this.initGuildDocument(guild.id, guildLeavedAt);
        const memberLeavedAt = action === 'guildMemberRemove' ? Date.now() : null;
        await this.initGuildMemberDocument(guild.id, user.id, memberLeavedAt);
      }
      await this.initUserDocument(user.id);
    }
  }
}

module.exports = Dispatcher;
