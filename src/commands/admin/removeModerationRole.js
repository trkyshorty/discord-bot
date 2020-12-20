const { Command } = require('../../system');

class RemoveModerationRole extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-moderation-role',
      aliases: ['remove-moderation-role'],

      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['ADMINISTRATOR'],
      moderatorOnly: false,
      ownerOnly: true,

      args: [
        {
          name: 'role',
          type: 'role',
        },
      ],
    });
  }

  run(message, [role]) {
    if (!role) return message.reply('lütfen geçerli bir rol seçin');
    const { models } = this.client.database;
    models.Guild.findOne({ guild_id: message.guild.id })
      .then((guildDoc) => {
        if (!guildDoc.plugins.moderation.roles.includes(role.id))
          return message.reply(`${role} moderatör rolü olarak tanımlı değil`);

        guildDoc.plugins.moderation.roles.remove(role.id);
        guildDoc.save();
        return message.reply(`${role} moderatör rolü kaldırıldı`);
      })
      .catch((err) => console.info(err));
  }
}

module.exports = RemoveModerationRole;
