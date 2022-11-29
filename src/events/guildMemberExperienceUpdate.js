const { Event } = require('../bot')
const GuildMember = require('../models/guildMember')

class GuildMemberExperienceUpdate extends Event {
  constructor(client) {
    super(client, {
      name: 'guildMemberExperienceUpdate',
      description: 'Guild member experience update event',
    })
  }

  async run (member) {

    const guildMember = await GuildMember.findOneAndUpdate(
      { guild_id: member.guild.id, user_id: member.user.id },
      {},
      {
        new: true,
        upsert: true
      })

    const random = Math.floor(Math.random() * (75 - 45)) + 45

    if (guildMember.experience + random >= guildMember.level * 121) {
      guildMember.experience = 0
      guildMember.level = guildMember.level + 1
      this.client.emit('guildMemberLevelNotification', member, guildMember.level)
    } else {
      guildMember.experience = guildMember.experience + random
    }

    guildMember.save()

    this.client.emit("guildMemberLevelReward", member)
  }
}

module.exports = GuildMemberExperienceUpdate
