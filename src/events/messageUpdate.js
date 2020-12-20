const { MessageEmbed } = require('discord.js');
const { Event } = require('../system');

class MessageUpdateEvent extends Event {
  run(oldMessage, newMessage) {
    const { models } = this.client.database;
    models.Guild.findOne({ guild_id: oldMessage.channel.guild.id }).then((guildDoc) => {
      const moderationPlugin = guildDoc.plugins.moderation;

      if (moderationPlugin && moderationPlugin.enable) {
        const moderationLogChannel = this.client.channels.cache.get(moderationPlugin.log_channel);
        if (!moderationLogChannel) return;

        const messageUpdateLog = new MessageEmbed()
          .setColor('#0099ff')
          .setAuthor(
            `${oldMessage.author.username}`,
            `${oldMessage.author.displayAvatarURL({ format: 'png', size: 2048 })}`
          )
          .setThumbnail(`${oldMessage.author.displayAvatarURL({ format: 'png', size: 2048 })}`)
          .setDescription(
            `:pencil: ${oldMessage.author} tarafından gönderilen **[Mesaj](https://discordapp.com/channels/${oldMessage.channel.guild.id}/${oldMessage.channel.id}/${oldMessage.id})** değiştirildi`
          )
          .addField('Eski Mesaj', oldMessage.content)
          .addField('Yeni Mesaj', newMessage.content)
          .setTimestamp();

        moderationLogChannel.send(messageUpdateLog).catch((err) => this.logger.warn(err));
      }
    });
  }
}

module.exports = MessageUpdateEvent;
