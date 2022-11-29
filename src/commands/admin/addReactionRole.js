const { Command, PermissionFlagsBits } = require('../../bot')
const Guild = require('../../models/guild')

class AddReactionRole extends Command {
  constructor(client) {
    super(client, {
      name: 'add-reaction-role',
      description: "Add the reaction role for the server.",
      aliases: ['add-reaction-role'],
      category: 'admin',

      clientPermissions: PermissionFlagsBits.Administrator | PermissionFlagsBits.ManageRoles,
      memberPermissions: PermissionFlagsBits.Administrator,

      args: [
        {
          name: 'message_id',
          description: 'Enter the Message ID',
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
      }).catch((err) => this.logger.error(err))

      if (index !== -1) {
        this.interaction.reply({
          embeds: [{
            title: `⛔ Reaction role already exist!`
          }],
          ephemeral: true
        }).catch((err) => this.logger.error(err))
      }

      guild.reaction_role.push({
        message_id: messageId,
        emoji: emoji,
        role_id: role.id,
      })

      await guild.save()
    })

    this.interaction.reply({
      embeds: [{
        title: `⛔ Reaction role saved!`
      }],
      ephemeral: true
    }).catch((err) => this.logger.error(err))
  }
}

module.exports = AddReactionRole
