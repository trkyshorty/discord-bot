const { Event } = require('../bot')
const GuildMember = require('../models/guildMember')

class GuildMemberAdd extends Event {
  constructor(client) {
    super(client, {
      name: 'guildMemberAdd',
      description: 'Guild member add event',
    })
  }

  async run (member) {

    const filter = { guild_id: member.guild.id, user_id: member.user.id }
    const update = { }

    await GuildMember.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true
    })

    member
      .send(
        `KOF topluluk sunucusuna hoş geldin ${member.user}, Sunucu içerisinde bazı kurallar var\n\n` +
        `1) Diğer üyelere karşı saygılı olmalısın\n` +
        `2) Saygı çerçevesini aşan yazı ve söylemlerden uzak durmalısın\n\n` +
        `Bu kurallara dikkat ettiğin sürece discord içerisinde özgürce duygularını ifade edebilir, sohbetlerini gerçekleştirebilirsin.\n` +
        `Aramıza hoş geldin!`
      )
      .catch((err) => console.error(err))
  }
}

module.exports = GuildMemberAdd
