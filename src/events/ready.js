const { Event, ActivityType } = require('../bot')

class Ready extends Event {
  constructor(client) {
    super(client, {
      name: 'ready',
      description: 'Bot ready event',
    })
  }

  async run () {
    this.logger.info(`[BOT] Logged in as ${this.client.user.tag}!`)

    this.client.user.setPresence({
      activities: [{ name: `👀`, type: ActivityType.Watching }],
      status: 'online',
    })
  }
}

module.exports = Ready
