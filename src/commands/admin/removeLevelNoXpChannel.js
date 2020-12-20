const { Command } = require('../../system');

class RemoveLevelNoXpChannel extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-level-noxp-channel',
      aliases: ['remove-level-noxp-channel'],

      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['ADMINISTRATOR'],
      moderatorOnly: false,
      ownerOnly: true,

      args: [
        {
          name: 'channel',
          type: 'channel',
        },
      ],
    });
  }

  run(message, [channel]) {
    if (!channel) return message.reply('lütfen geçerli bir yazı kanalı seçin');
    const { models } = this.client.database;
    models.Guild.findOne({ guild_id: message.guild.id })
      .then((guildDoc) => {
        if (!guildDoc.plugins.level.no_xp_channels.includes(channel.id)) return message.reply(`${channel} ekli değil`);
        guildDoc.plugins.level.no_xp_channels.remove(channel.id);
        guildDoc.save();
        return message.reply(`${channel} xp kazanılamayacak yazı kanallarından kaldırıldı`);
      })
      .catch((err) => console.info(err));
  }
}

module.exports = RemoveLevelNoXpChannel;
