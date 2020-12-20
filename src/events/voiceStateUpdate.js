const { MessageEmbed } = require('discord.js');
const { Event } = require('../system');

class VoiceStateUpdateEvent extends Event {
  run(oldState, newState) {
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    const { models } = this.client.database;
    models.Guild.findOne({ guild_id: oldState.guild.id }).then((guildDoc) => {
      const moderationPlugin = guildDoc.plugins.moderation;

      if (moderationPlugin && moderationPlugin.enable) {
        const moderationLogChannel = this.client.channels.cache.get(moderationPlugin.log_channel);
        if (!moderationLogChannel) return;

        const member = oldState.guild.members.cache.get(oldState.id);

        if (!member) return;

        const voiceStateUpdateLog = new MessageEmbed()
          .setColor('#0099ff')
          .setAuthor(`${member.user.username}`, `${member.user.displayAvatarURL({ format: 'png', size: 2048 })}`)
          .setThumbnail(`${member.user.displayAvatarURL({ format: 'png', size: 2048 })}`)
          .setTimestamp();

        if (!oldChannel && newChannel) {
          voiceStateUpdateLog.setDescription(`:microphone2: ${member.user} **${newChannel}** odasına giriş yaptı`);
          moderationLogChannel.send(voiceStateUpdateLog).catch((err) => this.logger.warn(err));
        } else if (!newChannel) {
          voiceStateUpdateLog.setDescription(`:microphone2: ${member.user} **${oldChannel}** odasından çıkış yaptı`);
          moderationLogChannel.send(voiceStateUpdateLog).catch((err) => this.logger.warn(err));
        }
      }
    });
  }
}

module.exports = VoiceStateUpdateEvent;
