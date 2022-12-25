const {
  Event,
  ActivityType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('../bot')

class TrackStart extends Event {
  constructor(client) {
    super(client, {
      name: 'trackStart',
      description: 'Lavalink player track start event',
    })
  }

  async run(guild, track) {
    let player = this.client.players.get(guild.id)
    if (!player) return

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('resume')
          .setLabel('Play')
          .setStyle(ButtonStyle.Primary)
      )
      .addComponents(
        new ButtonBuilder()
          .setCustomId('pause')
          .setLabel('Pause')
          .setStyle(ButtonStyle.Primary)
      )
      .addComponents(
        new ButtonBuilder()
          .setCustomId('skip')
          .setLabel('Skip')
          .setStyle(ButtonStyle.Primary)
      )
      .addComponents(
        new ButtonBuilder()
          .setCustomId('leave')
          .setLabel('Leave')
          .setStyle(ButtonStyle.Primary)
      )

    if (player.queue.nowPlayingMessage) {
      await player.queue.nowPlayingMessage
        .delete()
        .catch((err) => this.logger.error(err))
    }

    player.queue.nowPlayingMessage = await player.queue.interactionChannel.send(
      {
        embeds: [
          {
            description: `🎵 Now Playing : [${track.title}](${track.uri})`,
          },
        ],
        components: [row],
        ephemeral: false,
      }
    )

    this.client.user.setPresence({
      activities: [
        {
          name: `${track.title}`,
          type: ActivityType.Listening,
          url: track.uri,
        },
      ],
      status: 'dnd',
    })
  }
}

module.exports = TrackStart
