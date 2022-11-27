const { Event } = require('../bot')

class TrackQueueAdd extends Event {
  constructor(client) {
    super(client, {
      name: 'trackQueueAdd',
      description: 'Lavalink player track queue add event',
    })
  }

  async run(interaction, track) {
    await interaction.reply({
      embeds: [
        {
          description: `🎵 Added Queue : [${track.title}](${track.uri})`,
        },
      ],
      ephemeral: false,
    })
  }
}

module.exports = TrackQueueAdd
