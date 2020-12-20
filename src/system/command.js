class Command {
  constructor(client, info) {
    Object.defineProperty(this, 'client', { value: client });
    this.logger = this.client.logger;
    this.info = info;
    this.message = null;
  }

  /**
   * Last run before commands are executed
   *
   * @param {Message} message
   * @param {Array} args
   */
  async execute(message, args) {
    try {
      this.client.logger.verbose(`Ran Command: ${this.info.name}`);

      if (!this.info.args || !this.info.args.length) return this.run(message);

      const parsedArguments = [];

      this.info.args.forEach((arg, index) => {
        const argument =
          this.info.args.length === 1 || this.info.args.length - 1 === index
            ? args.slice(index).join(' ')
            : args[index];

        if (!argument) return;

        switch (arg.type) {
          case 'string':
            parsedArguments.push(argument);
            break;
          case 'integer':
            parsedArguments.push(this.parseIntegerArgument(argument));
            break;
          case 'user':
            parsedArguments.push(this.parseUserArgument(message.guild, argument));
            break;
          case 'role':
            parsedArguments.push(this.parseRoleArgument(message.guild, argument));
            break;
          case 'channel':
            parsedArguments.push(this.parseChannelArgument(message.guild, argument));
            break;
          default:
            throw new Error(`Lütfen ${arg.name} için bir arguman type belirle.`);
        }
      });

      this.run(message, parsedArguments);
    } catch (err) {
      this.client.logger.verbose(err.message);
      message.reply(`${err.message}`);
    }
  }

  /** @param {String} arg */
  parseIntegerArgument(arg) {
    const int = Number.parseInt(arg, 10);
    if (Number.isNaN(int)) throw new Error('Girilen sayı değeri hatalı');
    return int;
  }

  /**
   * @param {Guild} guild
   * @param {String} arg
   */
  parseUserArgument(guild, arg) {
    const userMatches = arg.match(/^(?:<@!?)?([0-9]+)>?$/);
    if (!userMatches) throw new Error('Girilen kullanıcı bilgisi hatalı');
    const user = guild.members.cache.get(userMatches[1]);
    if (!user) throw new Error('Kullanıcı bulunamadı');
    return user;
  }

  /**
   * @param {Guild} guild
   * @param {String} arg
   */
  parseRoleArgument(guild, arg) {
    const roleMatches = arg.match(/^(?:<@&)?([0-9]+)>?$/);
    if (!roleMatches) throw new Error('Girilen rol bilgisi hatalı');
    const role = guild.roles.cache.get(roleMatches[1]);
    if (!role) throw new Error('Rol bulunamadı');
    return role;
  }

  /**
   * @param {Guild} guild
   * @param {String} arg
   */
  parseChannelArgument(guild, arg) {
    const channelMatches = arg.match(/^(?:<#)?([0-9]+)>?$/);
    if (!channelMatches) throw new Error('Girilen kanal bilgisi hatalı');
    const channel = guild.channels.cache.get(channelMatches[1]);
    if (!channel) throw new Error('Kanal bulunamadı');
    return channel;
  }
}

module.exports = Command;
