const { Event } = require('../bot')

class DatabaseReady extends Event {
  constructor(client) {
    super(client, {
      name: 'databaseReady',
      description: 'Database connection ready event',
    })
  }

  async run() {
    console.info(`Database is ready!`)
  }
}

module.exports = DatabaseReady
