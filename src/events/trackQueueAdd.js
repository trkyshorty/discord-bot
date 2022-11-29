const { Event } = require('../bot')

class TrackQueueAdd extends Event {
  constructor(client) {
    super(client, {
      name: 'trackQueueAdd',
      description: 'Lavalink player track queue add event',
    })
  }

  async run(interaction, track) {
    await interaction
      .reply({
        embeds: [
          {
            description: `🎵 Queued : [${track.title}](${track.uri})`,
          },
        ],
        ephemeral: false,
      })
      .catch((err) => this.logger.error(err))
  }
}

module.exports = TrackQueueAdd
