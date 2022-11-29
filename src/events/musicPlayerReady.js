const { Event } = require('../bot')

class MusicPlayerReady extends Event {
  constructor(client) {
    super(client, {
      name: 'musicPlayerReady',
      description: 'Music player ready event',
    })
  }

  async run(player) {
    console.log('[MUSIC] Player is ready for guild: ' + player.guildId)
  }
}

module.exports = MusicPlayerReady
