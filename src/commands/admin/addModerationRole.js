const { Command } = require('../../system');

class AddModerationRole extends Command {
  constructor(client) {
    super(client, {
      name: 'add-moderation-role',
      aliases: ['add-moderation-role'],

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
        if (guildDoc.plugins.moderation.roles.includes(role.id))
          return message.reply(`${role} moderatör rolü olarak daha önce eklendi`);

        guildDoc.plugins.moderation.roles.push(role.id);
        guildDoc.save();
        return message.reply(`${role} moderatör rolü olarak tanımlandı`);
      })
      .catch((err) => console.info(err));
  }
}

module.exports = AddModerationRole;
