const { Event } = require('../bot')

class DirectMessage extends Event {
  constructor(client) {
    super(client, {
      name: 'directMessage',
      description: 'Direct message event',
    })
  }

  async run() {
    //if (message.author.bot) return
  }
}

module.exports = DirectMessage
