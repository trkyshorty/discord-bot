const { Event } = require('../bot')
const Guild = require('../models/guild')

class GuildMessage extends Event {
  constructor(client) {
    super(client, {
      name: 'guildMessage',
      description: 'Guild message event',
    })
  }

  async run (message) {
    //if (message.author.bot) return

    if (!this.client.experienceCooldown.has(message.member.user.id)) {

      const filter = { guild_id: message.guild.id }
      const update = {}

      const guild = await Guild.findOneAndUpdate(filter, update, {
        new: true,
        upsert: true
      }).catch((err) => this.logger.error(err))

      if (guild.level.no_experience_channels.includes(message.channel.id)) return
      if (message.member.roles.cache.some((role) => guild.level.no_experience_roles.includes(role.id))) return

      this.client.emit('guildMemberExperienceUpdate', message.member)

      this.client.experienceCooldown.add(message.author.id)

      setTimeout(() => {
        this.client.experienceCooldown.delete(message.author.id)
      }, 1000 * 60)
    }
  }
}

module.exports = GuildMessage
