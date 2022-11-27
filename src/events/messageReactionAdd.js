const { Event } = require('../bot')
const Guild = require('../models/guild')

class MessageReactionAdd extends Event {
  constructor(client) {
    super(client, {
      name: 'messageReactionAdd',
      description: 'Mesage reaction add event',
    })
  }

  async run(messageReaction, user) {
    if (messageReaction.message.partial) await messageReaction.message.fetch()

    Guild.findOne({ guild_id: messageReaction.message.channel.guild.id }).then(
      (guild) => {
        const reactionRole = guild.reaction_role.find((x) => {
          return (
            x.message_id === messageReaction.message.id &&
            x.emoji === messageReaction.emoji.name
          )
        })

        if (!reactionRole) return

        const member = messageReaction.message.channel.guild.members.cache.get(
          user.id
        )
        if (!member) return

        member.roles
          .add(reactionRole.role_id)
          .catch((err) => console.error(err))
      }
    )
  }
}

module.exports = MessageReactionAdd
