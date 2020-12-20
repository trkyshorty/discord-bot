const { MessageEmbed } = require('discord.js');
const { Command } = require('../../system');

module.exports = class AvatarCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'avatar',
      aliases: ['avatar'],

      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: [],
      moderatorOnly: false,
      ownerOnly: false,

      args: [
        {
          name: 'member',
          type: 'user',
        },
      ],
    });
  }

  run(message, [member]) {
    const embed = new MessageEmbed();

    const user = (member && member.user) || message.author;

    embed
      .setAuthor(`${user.tag}`, user.displayAvatarURL({ format: 'png', size: 2048 }))
      .setImage(user.displayAvatarURL({ format: 'png', size: 2048 }));

    embed.setColor(0xffff00);
    embed.setFooter(
      `${message.author.tag} tarafından istendi`,
      message.author.displayAvatarURL({ format: 'png', size: 2048 })
    );

    message.channel.send({ embed }).catch((err) => this.logger.warn(err));
  }
};
