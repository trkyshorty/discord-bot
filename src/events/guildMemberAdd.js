const { Event } = require('../bot')
const GuildMember = require('../models/guildMember')
const Guild = require('../models/guild')

class GuildMemberAdd extends Event {
  constructor(client) {
    super(client, {
      name: 'guildMemberAdd',
      description: 'Guild member add event',
    })
  }

  async run(member) {
    const guildMember = await GuildMember.findOneAndUpdate(
      { guild_id: member.guild.id, user_id: member.user.id },
      {},
      {
        new: true,
        upsert: true,
      }
    ).catch((err) => this.logger.error(err))

    const guild = await Guild.findOneAndUpdate(
      { guild_id: member.guild.id },
      {},
      {
        new: true,
        upsert: true,
      }
    ).catch((err) => this.logger.error(err))

    if (guild.welcome.message) {
      member.send(guild.welcome.message).catch((err) => this.logger.error(err))
    }

    if (guildMember.level == 1 && guildMember.experience == 0) {
      if (guild.welcome.roles.length > 0) {
        member.roles
          .add(guild.welcome.roles)
          .catch((err) => this.logger.error(err))
      }
    } else {
      this.client.emit('guildMemberLevelReward', member)
    }
  }
}

module.exports = GuildMemberAdd
