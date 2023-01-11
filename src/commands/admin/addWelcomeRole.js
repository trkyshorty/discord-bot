const { Command, PermissionFlagsBits } = require('../../bot')
const Guild = require('../../models/guild')

class AddWelcomeRole extends Command {
  constructor(client) {
    super(client, {
      name: 'add-welcome-role',
      description: 'Add welcome role to a user.',
      aliases: ['add-welcome-level'],
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

  async run(role) {
    const filter = { guild_id: this.interaction.guild.id }
    const update = {}

    const guild = await Guild.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    }).catch((err) => this.logger.error(err))

    if (guild.welcome.roles.includes(role.id)) {
      return this.interaction
        .reply({
          embeds: [
            {
              title: `⛔ Welcome role already exist!`,
            },
          ],
          ephemeral: true,
        })
        .catch((err) => this.logger.error(err))
    }

    guild.welcome.roles.push(role.id)

    await guild.save()

    this.interaction
      .reply({
        embeds: [
          {
            title: `⛔ Welcome role added!`,
          },
        ],
        ephemeral: true,
      })
      .catch((err) => this.logger.error(err))
  }
}

module.exports = AddWelcomeRole
