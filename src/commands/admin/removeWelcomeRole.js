const { Command, PermissionFlagsBits } = require('../../bot')
const Guild = require('../../models/guild')

class RemoveWelcomeRole extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-welcome-role',
      description: "Remove welcome role to a user.",
      aliases: ['remove-welcome-level'],
      category: 'admin',

      clientPermissions: PermissionFlagsBits.Administrator,
      memberPermissions: PermissionFlagsBits.Administrator,

      args: [
        {
          name: 'role',
          description: 'Enter the role',
          type: 'role',
          required: true,
        },
      ],
    })
  }

  async run (role) {
    const filter = { guild_id: this.interaction.guild.id }
    const update = {}

    const guild = await Guild.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true
    }).catch((err) => this.logger.error(err))

    guild.welcome.roles.pull(role.id)

    await guild.save()

    this.interaction.reply({
      embeds: [{
        title: `⛔ Welcome role removed!`
      }],
      ephemeral: true
    }).catch((err) => this.logger.error(err))
  }
}

module.exports = RemoveWelcomeRole
