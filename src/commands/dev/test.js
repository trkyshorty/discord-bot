const { MessageEmbed } = require('discord.js');
const { Command } = require('../../system');

module.exports = class TestCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'test',
      aliases: ['test'],

      clientPermissions: [],
      userPermissions: [],
      moderatorOnly: false,
      ownerOnly: true,
    });
  }

  run(message) {
    const memberRemoveLog = new MessageEmbed()
      .setColor('#FF0000')
      .setAuthor(`${message.author.username}`, `${message.author.displayAvatarURL({ format: 'png', size: 2048 })}`)
      .setThumbnail(`${message.author.displayAvatarURL({ format: 'png', size: 2048 })}`)
      .setDescription(`${message.author} az önce sunucudan çıkış yaptı1`)
      .setTimestamp();

    message.channel.guild.systemChannel.send(memberRemoveLog).catch((err) => this.logger.warn(err));
  }
};
