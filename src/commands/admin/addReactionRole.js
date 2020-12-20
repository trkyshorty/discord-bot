const { Command } = require('../../system');

class AddReactionRole extends Command {
  constructor(client) {
    super(client, {
      name: 'add-reaction-role',
      aliases: ['add-reaction-role'],

      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: ['ADMINISTRATOR'],
      moderatorOnly: false,
      ownerOnly: true,

      args: [
        {
          name: 'argType',
          type: 'string',
        },
        {
          name: 'role',
          type: 'role',
        },
        {
          name: 'argEmoji',
          type: 'string',
        },
      ],
    });
  }

  run(message, [argType, role, argEmoji]) {
    if (!role) return message.reply('lütfen geçerli bir rol seçin');
    const { models } = this.client.database;
    models.Guild.findOne({ guild_id: message.guild.id })
      .then(async (guildDoc) => {
        if (argType === 'take') {
          const takeIndex = guildDoc.plugins.reaction_role.take.findIndex((x) => {
            return x.channel_id === message.channel.id && x.role_id === role.id && x.emoji === argEmoji;
          });

          if (takeIndex !== -1) return message.reply(`${role} zaten ekli`);

          guildDoc.plugins.reaction_role.take.push({
            message_id: message.id,
            channel_id: message.channel.id,
            role_id: role.id,
            emoji: argEmoji,
          });

          guildDoc.save();
        } else if (argType === 'give') {
          const giveIndex = guildDoc.plugins.reaction_role.give.findIndex((x) => {
            return x.channel_id === message.channel.id && x.role_id === role.id && x.emoji === argEmoji;
          });

          if (giveIndex !== -1) return message.reply(`${role} zaten ekli`);

          guildDoc.plugins.reaction_role.give.push({
            message_id: message.id,
            channel_id: message.channel.id,
            role_id: role.id,
            emoji: argEmoji,
          });

          guildDoc.save();
        }
      })
      .catch((err) => console.info(err));
  }
}

module.exports = AddReactionRole;
