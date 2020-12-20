const { Command } = require('../../system');

class AddLevelRoleReward extends Command {
  constructor(client) {
    super(client, {
      name: 'add-level-role-reward',
      aliases: ['add-level-role-reward'],

      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['ADMINISTRATOR'],
      moderatorOnly: false,
      ownerOnly: true,

      args: [
        {
          name: 'role',
          type: 'role',
        },
        {
          name: 'argRewardLevel',
          type: 'integer',
        },
      ],
    });
  }

  run(message, [role, argRewardLevel]) {
    if (!role) return message.reply('lütfen geçerli bir rol seçin');
    if (!argRewardLevel) return message.reply('lütfen geçerli bir seviye girin');
    const { models } = this.client.database;
    models.Guild.findOne({ guild_id: message.guild.id })
      .then((guildDoc) => {
        if (guildDoc.plugins.level.rewards.find((x) => x.role_id === role.id))
          return message.reply(`${role} daha önce eklendi`);
        guildDoc.plugins.level.rewards.push({ role_id: role.id, level: argRewardLevel });
        guildDoc.save();
        return message.reply(`${role} ${argRewardLevel}. seviye ödülü olarak eklendi`);
      })
      .catch((err) => console.info(err));
  }
}

module.exports = AddLevelRoleReward;
