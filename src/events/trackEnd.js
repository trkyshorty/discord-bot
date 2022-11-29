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

    await player.queue.nowPlayingMessage
      .delete()
      .catch((err) => this.logger.error(err))

    player.queue.nowPlayingMessage = null

    if (player.queue.tracks.length == 0) {
      this.client.emit('trackQueueEnd', player.queue.interactionChannel)
    }

    this.client.user.setPresence({
      activities: [{ name: `👀`, type: ActivityType.Watching }],
      status: 'online',
    })
  }
}

module.exports = TrackEnd
