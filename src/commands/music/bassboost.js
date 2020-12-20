const { Command } = require('../../system');

class BassBoostCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'bassboost',
      aliases: ['bassboost', 'bass'],

      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: [],
      moderatorOnly: false,
      ownerOnly: false,
    });
  }

  async run(message) {
    const player = this.client.manager.players.get(message.guild.id);
    if (!player) return;
    // [0, 0.30, 1, 0.20]
    await player.equalizer([
      { band: 0, gain: 0.3 },
      { band: 1, gain: 0.2 },
    ]);
    return message.reply(this.messageEmbeed(`Bass ritimleri yükseltildi`, '#00FF00'));
  }
}

module.exports = BassBoostCommand;
