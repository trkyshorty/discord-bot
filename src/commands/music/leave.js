const { Command, PermissionFlagsBits } = require('../../bot')

class Leave extends Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      description: "Leave the music player from the voice channel",
      aliases: ['leave'],
      category: 'music',

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
      }).catch((err) => this.logger.error(err))
    }

    let player = this.client.players.get(this.interaction.member.guild.id)

    if (!player) {
      return this.interaction.editReply({
        embeds: [{
          description: `⛔ There is no music player in this guild`
        }],
        ephemeral: true
      }).catch((err) => this.logger.error(err))
    }

    const voiceChannel = this.interaction.member.voice.channel

    if (player.queue.voiceChannel !== voiceChannel) {
      return this.interaction.editReply({
        embeds: [{
          description: `⛔ Music player is busy, you can listen on **${voiceChannel}** channel`
        }],
        ephemeral: true
      }).catch((err) => this.logger.error(err))
    }

    this.client.emit("musicPlayerDestroy", player)

    if (this.interaction.isButton())
      await this.interaction.deferUpdate().catch((err) => this.logger.error(err))
    else {
      this.interaction.reply({
        embeds: [{
          description: `🎵 Music player leaved from **${voiceChannel}** channel`
        }],
        ephemeral: false
      }).catch((err) => this.logger.error(err))
    }
  }
}

module.exports = Leave
