const { Event } = require('../bot')

class GuildMessage extends Event {
  constructor(client) {
    super(client, {
      name: 'voiceChannelMessage',
      description: 'Voice channel message event',
    })
  }

  async run(message) {
    //if (message.author.bot) return

    if (!this.client.experienceCooldown.has(message.member.user.id)) {
      this.client.emit('guildMemberExperienceUpdate', message.member)

      this.client.experienceCooldown.add(message.author.id)

      setTimeout(() => {
        this.client.experienceCooldown.delete(message.author.id)
      }, 1000 * 60)
    }
  }
}

module.exports = GuildMessage
