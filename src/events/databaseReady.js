const { Event } = require('../bot')

class DatabaseReady extends Event {
  constructor(client) {
    super(client, {
      name: 'databaseReady',
      description: 'Database connection ready event',
    })
  }

  async run() {
    this.logger.info(`[DATABASE] Connected`)
  }
}

module.exports = DatabaseReady
