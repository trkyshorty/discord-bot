const { Event, ActivityType } = require('../bot')

class MusicPlayerDestroy extends Event {
  constructor(client) {
    super(client, {
      name: 'musicPlayerDestroy',
      description: 'Music player destroy event',
    })
  }

  async run(player) {
    await player.disconnect()

    await player.queue.collector.stop()

    this.client.lavalink.destroyPlayer(player.guildId)
    this.client.players.delete(player.guildId)

    if (player.queue.nowPlayingMessage) {
      await player.queue.nowPlayingMessage
        .delete()
        .catch((err) => this.logger.error(err))

      player.queue.nowPlayingMessage = null
    }

    this.client.user.setPresence({
      activities: [
        {
          name: `${process.env.DEFAULT_PRESENCE_NAME}`,
          type: ActivityType.Watching,
        },
      ],
      status: 'online',
    })

    console.log('[MUSIC] Player is destroyed for guild: ' + player.guildId)
  }
}

module.exports = MusicPlayerDestroy
