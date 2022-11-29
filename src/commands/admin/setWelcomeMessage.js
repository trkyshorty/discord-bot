const { Command, PermissionFlagsBits } = require('../../bot')
const Guild = require('../../models/guild')

class SetWelcomeMessage extends Command {
  constructor(client) {
    super(client, {
      name: 'set-welcome-message',
      description: "Set the welcome messsage for the server.",
      aliases: ['set-welcome-message'],
      category: 'admin',

      clientPermissions: PermissionFlagsBits.Administrator,
      memberPermissions: PermissionFlagsBits.Administrator,

      args: [
        {
          name: 'message',
          description: 'Enter the welcome message',
          type: 'string',
          required: true,
        },
      ],
    })
  }

  async run (message) {
    const filter = { guild_id: this.interaction.guild.id }
    const update = {  }

    const guild = await Guild.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true
    })

    guild.welcome.message = message

    await guild.save()

    this.interaction.reply({
      embeds: [{
        title: `⛔ Welcome message saved!`
      }],
      ephemeral: true
    }).catch((err) => this.logger.error(err))
  }
}

module.exports = SetWelcomeMessage
