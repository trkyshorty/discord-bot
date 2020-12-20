const { Command } = require('../../system');

class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      aliases: ['leave'],

      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: [],
      moderatorOnly: false,
      ownerOnly: false,
    });
  }

  async run(message) {
    this.client.user.setActivity(`👀 |`, { type: 'WATCHING' });
    this.client.queue.delete(message.guild.id);
    await this.client.manager.leave(message.guild.id);
  }
}

module.exports = LeaveCommand;
