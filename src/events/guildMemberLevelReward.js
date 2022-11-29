const { Event } = require('../bot')
const Guild = require('../models/guild')
const GuildMember = require('../models/guildMember')

class GuildMemberLevelReward extends Event {
  constructor(client) {
    super(client, {
      name: 'guildMemberLevelReward',
      description: 'Guild member level reward event',
    })
  }

  async run (member) {

    const guild = await Guild.findOneAndUpdate(
      { guild_id: member.guild.id },
      {},
      {
        new: true,
        upsert: true
      }).catch((err) => this.logger.error(err))

    const guildMember = await GuildMember.findOneAndUpdate(
      { guild_id: member.guild.id, user_id: member.user.id },
      {},
      {
        new: true,
        upsert: true
      }).catch((err) => this.logger.error(err))
      
    let rewardedRole
    guild.level.rewards.forEach((role) => {
      if (guildMember.level >= role.level) rewardedRole = role.role_id
    })

    if (rewardedRole && !member.roles.cache.has(rewardedRole)) {
      const removedRoles = guild.level.rewards.map((item) => {
        return item.role_id
      })

      member.roles
        .remove(removedRoles)
        .then(() => {
          member.roles.add(rewardedRole).catch((err) => this.logger.error(err))
        })
        .catch((err) => this.logger.error(err))
    }
  }
}

module.exports = GuildMemberLevelReward
