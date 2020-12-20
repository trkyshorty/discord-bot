const { Command } = require('../../system');

class AddLevelNoXpChannel extends Command {
  constructor(client) {
    super(client, {
      name: 'add-level-noxp-channel',
      aliases: ['add-level-noxp-channel'],

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
        if (guildDoc.plugins.level.no_xp_channels.includes(channel.id))
          return message.reply(`${channel} daha önce eklendi`);
        guildDoc.plugins.level.no_xp_channels.push(channel.id);
        guildDoc.save();
        return message.reply(`${channel} xp kazanılamayacak yazı kanalı olarak eklendi`);
      })
      .catch((err) => console.info(err));
  }
}

module.exports = AddLevelNoXpChannel;
