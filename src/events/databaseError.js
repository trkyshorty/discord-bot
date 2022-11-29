const { Event } = require('../bot')

class DatabaseError extends Event {
  constructor(client) {
    super(client, {
      name: 'databaseError',
      description: 'Database connection error event',
    })
  }

  async run(error) {
    this.logger.info(`[DATABASE] ${error.message}`)
    this.logger.info(`[DATABASE] Trying reconnect to database in 10 seconds`)
    setTimeout(async () => {
      await this.client.connectDatabase()
    }, 10000)
  }
}

module.exports = DatabaseError
