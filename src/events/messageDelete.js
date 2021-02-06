const { MessageEmbed } = require('discord.js');
const { Event } = require('../system');

class messageDeleteEvent extends Event {
  run(message) {
    if (!message.guild) return;
    if (message.partial) return;
    const { models } = this.client.database;

    models.Guild.findOne({ guild_id: message.channel.guild.id }).then(async (guildDoc) => {
      const moderationPlugin = guildDoc.plugins.moderation;

      if (moderationPlugin && moderationPlugin.enable) {
        const moderationLogChannel = this.client.channels.cache.get(moderationPlugin.log_channel);
        if (!moderationLogChannel) return;

        const fetchedLogs = await message.guild.fetchAuditLogs({
          limit: 1,
          type: 'MESSAGE_DELETE',
        });

        const deletionLog = fetchedLogs.entries.first();

        if (!deletionLog) return;

        const { executor, target } = deletionLog;

        const messageDeleteLog = new MessageEmbed()
          .setColor('#0099ff')
          .setAuthor(`${message.author.username}`, `${message.author.displayAvatarURL({ format: 'png', size: 2048 })}`)
          .setThumbnail(`${message.author.displayAvatarURL({ format: 'png', size: 2048 })}`)
          .setTimestamp();

        if (message.content) messageDeleteLog.addField('Mesaj', message.content);

        if (target.id === message.author.id) {
          messageDeleteLog.setDescription(
            `:pencil: ${message.author} tarafından gönderilen bir mesaj ${executor} tarafından silindi`
          );
        } else {
          messageDeleteLog.setDescription(
            `:pencil: ${message.author} tarafından gönderilen bir mesaj kendisi tarafından silindi`
          );
        }

        moderationLogChannel.send(messageDeleteLog).catch((err) => this.logger.warn(err));
      }
    });
  }
}

module.exports = messageDeleteEvent;
