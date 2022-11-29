const { Event, ChannelType } = require('../bot')

class MessageCreate extends Event {
  constructor(client) {
    super(client, {
      name: 'messageCreate',
      description: 'Message create event',
    })
  }

  async run(message) {
    //if (message.partial) await message.fetch()
    if (message.author.bot) return

    if (message.channel.type == ChannelType.GuildText)
      this.client.emit('guildMessage', message)
    else if (message.channel.type == ChannelType.DM)
      this.client.emit('directMessage', message)
    else if (message.channel.type == ChannelType.GuildVoice)
      this.client.emit('voiceChannelMessage', message)
  }
}

module.exports = MessageCreate
