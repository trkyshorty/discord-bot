const { Command } = require('../../system');

class SetBanTimeout extends Command {
  constructor(client) {
    super(client, {
      name: 'set-level',
      aliases: ['set-level'],

      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['ADMINISTRATOR'],
      moderatorOnly: false,
      ownerOnly: true,

      args: [
        {
          name: 'member',
          type: 'user',
        },
        {
          name: 'argLevel',
          type: 'integer',
        },
      ],
    });
  }

  run(message, [member, argLevel]) {
    if (!member) return message.reply('lütfen seviye verilecek birini etiketleyin');
    if (!argLevel) return message.reply('lütfen bir seviye girin');
    const { models } = this.client.database;

    models.GuildMember.findOneAndUpdate(
      { guild_id: member.guild.id, user_id: member.user.id },
      { $set: { exp: 0, level: argLevel } },
      { upsert: true, new: true }
    ).then(() => {
      return message.reply(`${member} seviyesi ${argLevel} olarak değiştirildi`);
    });
  }
}

module.exports = SetBanTimeout;
