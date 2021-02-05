const { MessageEmbed } = require('discord.js');
const { Event } = require('../system');

class VoiceStateUpdateEvent extends Event {
  async run(oldState, newState) {
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;
    const member = oldState.guild.members.cache.get(oldState.id);

    const { models } = this.client.database;
    models.Guild.findOne({ guild_id: oldState.guild.id }).then((guildDoc) => {
      const moderationPlugin = guildDoc.plugins.moderation;

      if (moderationPlugin && moderationPlugin.enable) {
        const moderationLogChannel = this.client.channels.cache.get(moderationPlugin.log_channel);
        if (!moderationLogChannel) return;

        if (member) {
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
      }
    });

    /** Clear queue list and leave manager when bot is kicked or leave */
    if (member && !newChannel) {
      if (member.user.id === this.client.user.id) {
        this.client.user.setActivity(`👀 |`, { type: 'WATCHING' });
        this.client.queue.delete(oldState.guild.id);
        await this.client.manager.leave(oldState.guild.id);
      }
    }

    /** Leave if there is no one but the music bot on the voice channel */
    if (oldChannel && oldState.guild.me.voice.channel && oldChannel.id === oldState.guild.me.voice.channel.id) {
      if (!oldChannel.members.size - 1) {
        setTimeout(async () => {
          if (!oldChannel.members.size - 1) {
            this.client.user.setActivity(`👀 |`, { type: 'WATCHING' });
            this.client.queue.delete(oldState.guild.id);
            await this.client.manager.leave(oldState.guild.id);
          }
        }, 60000);
      }
    }
  }
}

module.exports = VoiceStateUpdateEvent;
