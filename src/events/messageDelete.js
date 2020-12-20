const { MessageEmbed } = require('discord.js');
const { Event } = require('../system');

class messageDeletedEvent extends Event {
  run(message) {
    if (message.partial) return;
    const { models } = this.client.database;

    models.Guild.findOne({ guild_id: message.channel.guild.id }).then((guildDoc) => {
      const moderationPlugin = guildDoc.plugins.moderation;

      if (moderationPlugin && moderationPlugin.enable) {
        const moderationLogChannel = this.client.channels.cache.get(moderationPlugin.log_channel);
        if (!moderationLogChannel) return;

        const messageDeleteLog = new MessageEmbed()
          .setColor('#0099ff')
          .setAuthor(`${message.author.username}`, `${message.author.displayAvatarURL({ format: 'png', size: 2048 })}`)
          .setThumbnail(`${message.author.displayAvatarURL({ format: 'png', size: 2048 })}`)
          .setDescription(`:pencil: ${message.author} tarafından gönderilen mesaj silindi`)
          .addField('Mesaj', message.content ? message.content : message.cleanContent)
          .setTimestamp();

        moderationLogChannel.send(messageDeleteLog).catch((err) => this.logger.warn(err));
      }
    });
  }
}

module.exports = messageDeletedEvent;
