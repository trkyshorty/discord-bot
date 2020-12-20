const { Command } = require('../../system');

class ResumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'resume',
      aliases: ['resume', 'devam'],

      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: [],
      moderatorOnly: false,
      ownerOnly: false,
    });
  }

  async run(message) {
    const player = this.client.manager.players.get(message.guild.id);
    if (!player) return;
    await player.resume();
  }
}

module.exports = ResumeCommand;
