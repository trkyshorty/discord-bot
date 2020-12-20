const { Command } = require('../../system');

class SetBanTimeout extends Command {
  constructor(client) {
    super(client, {
      name: 'set-ban-timeout',
      aliases: ['set-ban-timeout'],

      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['ADMINISTRATOR'],
      moderatorOnly: false,
      ownerOnly: true,

      args: [
        {
          name: 'timeout',
          type: 'integer',
        },
      ],
    });
  }

  run(message, [timeout]) {
    if (!timeout) return message.reply('Ban zaman aşımı süresini saniye olarak yazın');
    const { models } = this.client.database;
    models.Guild.findOne({ guild_id: message.guild.id })
      .then((guildDoc) => {
        Object.assign(guildDoc.plugins.moderation, {
          ban_timeout: timeout,
        });
        guildDoc.save();
        return message.reply(`Ban zaman aşımı süresi ${timeout} saniye olarak tanımlandı`);
      })
      .catch((err) => console.info(err));
  }
}

module.exports = SetBanTimeout;
