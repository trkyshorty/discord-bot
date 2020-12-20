const { Command } = require('../../system');

class SetMuteTimeout extends Command {
  constructor(client) {
    super(client, {
      name: 'set-mute-timeout',
      aliases: ['set-mute-timeout'],

      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['ADMINISTRATOR'],
      moderatorOnly: false,
      ownerOnly: false,

      args: [
        {
          name: 'timeout',
          type: 'integer',
        },
      ],
    });
  }

  run(message, [timeout]) {
    if (!timeout) return message.reply('Mute zaman aşımı süresini saniye olarak yazın');
    const { models } = this.client.database;
    models.Guild.findOne({ guild_id: message.guild.id })
      .then((guildDoc) => {
        Object.assign(guildDoc.plugins.moderation, {
          mute_timeout: timeout,
        });
        guildDoc.save();
        return message.reply(`Mute zaman aşımı süresi ${timeout} saniye olarak tanımlandı`);
      })
      .catch((err) => console.info(err));
  }
}

module.exports = SetMuteTimeout;
