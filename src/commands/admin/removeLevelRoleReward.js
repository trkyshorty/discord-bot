const { Command } = require('../../system');

class RemoveLevelRoleReward extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-level-role-reward',
      aliases: ['remove-level-role-reward'],

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
        const rewardIndex = guildDoc.plugins.level.rewards.findIndex((x) => {
          return x.role_id === role.id;
        });

        if (rewardIndex === -1) return message.reply(`${role} ekli değil`);

        guildDoc.plugins.level.rewards.splice(rewardIndex, 1);
        guildDoc.save();

        return message.reply(`${role} seviye ödülü kaldırıldı`);
      })
      .catch((err) => console.info(err));
  }
}

module.exports = RemoveLevelRoleReward;
