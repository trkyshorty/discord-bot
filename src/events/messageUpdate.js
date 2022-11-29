const { Event, EmbedBuilder } = require('../bot')
const Guild = require('../models/guild')
class MessageUpdate extends Event {
  constructor(client) {
    super(client, {
      name: 'messageUpdate',
      description: 'Message update event',
    })
  }

  async run(oldMessage, newMessage) {
    //if (oldMessage.author.bot) return
    //if (oldMessage.partial) await oldMessage.fetch()

    const filter = { guild_id: oldMessage.channel.guild.id }
    const update = {}

    const guild = await Guild.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    }).catch((err) => this.logger.error(err))

    if (guild.log_channel != '0') {
      this.client.channels
        .fetch(guild.log_channel)
        .then(async (channel) => {
          const messageUpdateLog = new EmbedBuilder()
            .setColor('#0099ff')
            .setAuthor({
              name: `${oldMessage.author.username}`,
              iconURL: `${oldMessage.author.displayAvatarURL({
                format: 'png',
                size: 2048,
              })}`,
            })
            .setThumbnail(
              `${oldMessage.author.displayAvatarURL({
                format: 'png',
                size: 2048,
              })}`
            )
            .setDescription(
              `:pencil: ${oldMessage.author} owned **[message](https://discordapp.com/channels/${oldMessage.channel.guild.id}/${oldMessage.channel.id}/${oldMessage.id})** edited`
            )
            .addFields(
              { name: 'Old Message', value: `${oldMessage.content}` },
              { name: 'New Message', value: `${newMessage.content}` }
            )
            .setTimestamp()

          channel
            .send({ embeds: [messageUpdateLog] })
            .catch((err) => this.logger.error(err))
        })
        .catch((err) => this.logger.error(err))
    }
  }
}

module.exports = MessageUpdate
