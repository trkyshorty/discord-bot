const { Event, EmbedBuilder } = require('../bot')
const Guild = require('../models/guild')

class GuildMemberRemove extends Event {
  constructor(client) {
    super(client, {
      name: 'guildMemberRemove',
      description: 'Guild member remove event',
    })
  }

  async run(member) {
    const filter = { guild_id: member.guild.id }
    const update = {}

    const guild = await Guild.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    })

    if (guild.log_channel != '0') {
      this.client.channels
        .fetch(guild.log_channel)
        .then(async (channel) => {
          const memberRemoveLog = new EmbedBuilder()
            .setColor('#FF0000')
            .setAuthor({
              name: `${member.user.username}`,
              iconURL: `${member.user.displayAvatarURL({
                format: 'png',
                size: 2048,
              })}`,
            })
            .setThumbnail(
              `${member.user.displayAvatarURL({ format: 'png', size: 2048 })}`
            )
            .setDescription(`${member.user} left the server`)
            .setTimestamp()

          await channel
            .send({ embeds: [memberRemoveLog] })
            .catch((err) => this.logger.error(err))
        })
        .catch((err) => this.logger.error(err))
    }
  }
}

module.exports = GuildMemberRemove
