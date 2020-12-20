const { MessageEmbed } = require('discord.js');
const { Event } = require('../system');

class GuildMemberUpdateEvent extends Event {
  run(oldMember, newMember) {
    const { models } = this.client.database;
    models.Guild.findOne({ guild_id: oldMember.guild.id }).then((guildDoc) => {
      const moderationPlugin = guildDoc.plugins.moderation;

      if (moderationPlugin && moderationPlugin.enable) {
        const moderationLogChannel = this.client.channels.cache.get(moderationPlugin.log_channel);
        if (!moderationLogChannel) return;

        if (oldMember.nickname !== newMember.nickname) {
          const messageUpdateLog = new MessageEmbed()
            .setColor('#0099ff')
            .setAuthor(
              `${oldMember.user.username}`,
              `${oldMember.user.displayAvatarURL({ format: 'png', size: 2048 })}`
            )
            .setThumbnail(`${oldMember.user.displayAvatarURL({ format: 'png', size: 2048 })}`)
            .setDescription(`:pencil: ${oldMember.user} kullanıcısının bazı bilgileri değişti`)
            .addFields(
              { name: 'Eski Nick', value: oldMember.nickname || oldMember.user.username, inline: true },
              { name: 'Yeni Nick', value: newMember.nickname || newMember.user.username, inline: true }
            )
            .setTimestamp();

          moderationLogChannel.send(messageUpdateLog).catch((err) => this.logger.warn(err));
        }
      }
    });
  }
}

module.exports = GuildMemberUpdateEvent;
