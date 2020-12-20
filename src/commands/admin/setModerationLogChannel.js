const { Command } = require('../../system');

class SetModerationLogChannel extends Command {
  constructor(client) {
    super(client, {
      name: 'set-moderation-log-channel',
      aliases: ['set-moderation-log-channel'],

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
    if (!channel) return message.reply('Lütfen bir sunucu kanalı ekleyin');
    const { models } = this.client.database;
    models.Guild.findOne({ guild_id: message.guild.id })
      .then((guildDoc) => {
        Object.assign(guildDoc.plugins.moderation, {
          log_channel: channel.id,
        });
        guildDoc.save();
        return message.reply(`Moderasyon kayıt kanalı ${channel} olarak belirlendi`);
      })
      .catch((err) => console.info(err));
  }
}

module.exports = SetModerationLogChannel;
