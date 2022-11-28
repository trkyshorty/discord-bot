const { Event } = require('../bot')

class LavalinkReady extends Event {
  constructor(client) {
    super(client, {
      name: 'lavalinkReady',
      description: 'Lavalink application connection ready event',
    })
  }

  async run() {
    console.info(`[LAVALINK] Connected`)
  }
}

module.exports = LavalinkReady
