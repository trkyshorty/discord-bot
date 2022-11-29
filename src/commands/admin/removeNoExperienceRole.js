const { Command, PermissionFlagsBits } = require('../../bot')
const Guild = require('../../models/guild')

class RemoveNoExperienceRole extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-no-experience-role',
      description: 'Remove no experience role.',
      aliases: ['remove-no-experience-role'],
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

    if (!guild.level.no_experience_roles.includes(role.id)) {
      return this.interaction
        .reply({
          embeds: [
            {
              title: `⛔ No experience role doesnt not exist!`,
            },
          ],
          ephemeral: true,
        })
        .catch((err) => this.logger.error(err))
    }

    guild.level.no_experience_roles.pull(role.id)

    await guild.save()

    this.interaction
      .reply({
        embeds: [
          {
            title: `⛔ No experience role removed!`,
          },
        ],
        ephemeral: true,
      })
      .catch((err) => this.logger.error(err))
  }
}

module.exports = RemoveNoExperienceRole
