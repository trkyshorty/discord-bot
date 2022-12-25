const { Event, ActivityType } = require('../bot')

class TrackEnd extends Event {
  constructor(client) {
    super(client, {
      name: 'trackEnd',
      description: 'Lavalink player track end event',
    })
  }

  async run(guild) {
    let player = this.client.players.get(guild.id)
    if (!player) return

    if (player.queue.tracks.length == 0) {
      this.client.emit('trackQueueEnd', player.queue.interactionChannel)

      if (player.queue.nowPlayingMessage) {
        await player.queue.nowPlayingMessage
          .delete()
          .catch((err) => this.logger.error(err))
  
        player.queue.nowPlayingMessage = null
      }
    }

    this.client.user.setPresence({
      activities: [
        {
          name: `${process.env.DEFAULT_PRESENCE_NAME}`,
          type: ActivityType.Watching,
        },
      ],
      status: 'online',
    })
  }
}

module.exports = TrackEnd
