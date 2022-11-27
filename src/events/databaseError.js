const { Event } = require('../bot')

class DatabaseError extends Event {
  constructor(client) {
    super(client, {
      name: 'databaseError',
      description: 'Database connection error event',
    })
  }

  async run(error) {
    console.info(error.message)
    console.info(`Trying reconnect to database in 3 seconds`)
    setTimeout(async () => {
      await this.client.connectDatabase()
    }, 3000)
  }
}

module.exports = DatabaseError
