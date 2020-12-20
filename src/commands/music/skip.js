const { Command } = require('../../system');

class SkipCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'skip',
      aliases: ['skip', 'geç'],

      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: [],
      moderatorOnly: false,
      ownerOnly: false,
    });
  }

  async run(message) {
    const player = this.client.manager.players.get(message.guild.id);
    if (!player) return;
    await player.stop();
  }
}

module.exports = SkipCommand;
