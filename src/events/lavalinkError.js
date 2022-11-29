const { Event } = require('../bot')

class LavalinkError extends Event {
  constructor(client) {
    super(client, {
      name: 'lavalinkError',
      description: 'Lavalink connection error event',
    })
  }

  async run(error) {
    this.logger.info(`[LAVALINK] ${error.message}`)
    this.logger.info(`[LAVALINK] Trying reconnect to lavalink in 10 seconds`)
    setTimeout(async () => {
      await this.client.connectLavalink()
    }, 10000)
  }
}

module.exports = LavalinkError
