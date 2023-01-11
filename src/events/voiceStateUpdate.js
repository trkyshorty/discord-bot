const { Event, EmbedBuilder } = require('../bot')
const Guild = require('../models/guild')
class VoiceStateUpdate extends Event {
  constructor(client) {
    super(client, {
      name: 'voiceStateUpdate',
      description: 'Voice state update event',
    })
  }

  async run(oldState, newState) {
    const oldChannel = oldState.channel
    const newChannel = newState.channel
    const member = oldState.guild.members.cache.get(oldState.id)

    if (oldChannel === newChannel) return

    // Delete music player if bot leave the voice channel
    if (!newChannel && member.user.id == this.client.user.id) {
      let player = this.client.players.get(oldState.guild.id)

      if (player) {
        this.client.emit('musicPlayerDestroy', player)
      }
    }

    const filter = { guild_id: oldState.guild.id }
    const update = {}

    const guild = await Guild.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    }).catch((err) => this.logger.error(err))

    if (guild.log_channel != '0') {
      this.client.channels
        .fetch(guild.log_channel)
        .then(async (channel) => {
          if (member) {
            const voiceStateUpdateLog = new EmbedBuilder()
              .setColor('#0099ff')
              .setAuthor({
                name: `${member.user.username}`,
                iconURL: `${member.user.displayAvatarURL({
                  format: 'png',
                  size: 2048,
                })}`,
              })
              .setThumbnail(
                `${member.user.displayAvatarURL({ format: 'png', size: 2048 })}`
              )
              .setTimestamp()

            if (!oldChannel && newChannel) {
              voiceStateUpdateLog.setDescription(
                `:microphone2: ${member.user} joined to **${newChannel}**`
              )
              channel
                .send({ embeds: [voiceStateUpdateLog] })
                .catch((err) => this.logger.error(err))
            } else if (oldChannel && newChannel) {
              voiceStateUpdateLog.setDescription(
                `:microphone2: ${member.user} moved **${oldChannel}** to **${newChannel}**`
              )
              channel
                .send({ embeds: [voiceStateUpdateLog] })
                .catch((err) => this.logger.error(err))
            } else if (!newChannel) {
              voiceStateUpdateLog.setDescription(
                `:microphone2: ${member.user} leaved **${oldChannel}**`
              )
              channel
                .send({ embeds: [voiceStateUpdateLog] })
                .catch((err) => this.logger.error(err))
            }
          }
        })
        .catch((err) => this.logger.error(err))
    }
  }
}

module.exports = VoiceStateUpdate
