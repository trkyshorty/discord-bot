const { Command } = require('../../system');

class RemoveLevelNoXpRole extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-level-noxp-role',
      aliases: ['remove-level-noxp-role'],

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
        if (!guildDoc.plugins.level.no_xp_roles.includes(role.id)) return message.reply(`${role} ekli değil`);
        guildDoc.plugins.level.no_xp_roles.remove(role.id);
        guildDoc.save();
        return message.reply(`${role} xp kazanılamayacak rollerden kaldırıldı`);
      })
      .catch((err) => console.info(err));
  }
}

module.exports = RemoveLevelNoXpRole;
