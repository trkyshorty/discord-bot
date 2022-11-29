const { Command, PermissionFlagsBits } = require('../../bot')
const Guild = require('../../models/guild')

class RemoveReactionRole extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-reaction-role',
      description: "Remove the reaction role for the server.",
      aliases: ['remove-reaction-role'],
      category: 'admin',

      clientPermissions: PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageRoles,
      memberPermissions: PermissionFlagsBits.Administrator,

      args: [
        {
          name: 'message',
          description: 'Enter the message ID',
          type: 'string',
          required: true,
        },
        {
          name: 'emoji',
          description: 'Enter the Emoji',
          type: 'string',
          required: true,
        },
        {
          name: 'role',
          description: 'Enter the Role ID',
          type: 'role',
          required: true,
        },
      ],
    })
  }

  async run (messageId, emoji, role) {

    Guild.findOne({ guild_id: this.interaction.guild.id }).then(async (guild) => {
      const index = guild.reaction_role.findIndex((x) => {
        return x.message_id === messageId && x.emoji === emoji && x.role_id === role.id
      })

      if (index !== -1) {
        this.interaction.reply({
          embeds: [{
            title: `⛔ Reaction role doesnt not exist!`
          }],
          ephemeral: true
        })
      }

      guild.reaction_role.pull({
        message_id: messageId,
        emoji: emoji,
        role_id: role.id,
      })

      await guild.save()
    })

    this.interaction.reply({
      embeds: [{
        title: `⛔ Reaction role removed!`
      }],
      ephemeral: true
    })
  }
}

module.exports = RemoveReactionRole
