const { Event } = require('../bot')

class TrackQueueEnd extends Event {
  constructor(client) {
    super(client, {
      name: 'trackQueueEnd',
      description: 'Lavalink player track queue end event',
    })
  }

  async run(interactionChannel) {}
}

module.exports = TrackQueueEnd
