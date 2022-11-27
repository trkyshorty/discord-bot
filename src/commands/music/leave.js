const { Command, PermissionFlagsBits, ActivityType } = require('../../bot')

class Leave extends Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      description: "Leave the music player from the voice channel",
      aliases: ['leave'],

      clientPermissions: PermissionFlagsBits.Connect | PermissionFlagsBits.Speak,
      memberPermissions: PermissionFlagsBits.Connect | PermissionFlagsBits.Speak,
    })
  }

  async run () {
    if (!this.client.lavalink) {
      return this.interaction.editReply({
        embeds: [{
          description: `⛔ Lavalink is not ready`
        }],
        ephemeral: true
      })
    }

    let player = this.client.players.get(this.interaction.member.guild.id)

    if (!player) {
      return this.interaction.editReply({
        embeds: [{
          description: `⛔ There is no music player in this guild`
        }],
        ephemeral: true
      })
    }

    const voiceChannel = this.interaction.member.voice.channel

    if (player.queue.voiceChannel !== voiceChannel) {
      return this.interaction.editReply({
        embeds: [{
          description: `⛔ Music player is busy, you can listen on **${voiceChannel}** channel`
        }],
        ephemeral: true
      })
    }

    this.client.user.setPresence({
      activities: [{ name: `👀 |`, type: ActivityType.Watching }],
      status: 'dnd',
    })

    await player.disconnect()

    this.client.lavalink.destroyPlayer(player.guildId)

    await this.interaction.deferUpdate()

  }
}

module.exports = Leave
