const { Command, PermissionFlagsBits } = require('../../bot')
const Guild = require('../../models/guild')

class AddLevelReward extends Command {
  constructor(client) {
    super(client, {
      name: 'add-level-reward',
      description: 'Add level reward.',
      aliases: ['add-level-reward'],
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
        {
          name: 'level',
          description: 'Enter the level',
          type: 'integer',
          required: true,
        },
      ],
    })
  }

  async run(role, level) {
    const filter = { guild_id: this.interaction.guild.id }
    const update = {}

    const guild = await Guild.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    }).catch((err) => this.logger.error(err))

    if (
      guild.level.rewards.find(
        (x) => x.role_id === role.id && x.level === level
      )
    ) {
      return this.interaction
        .reply({
          embeds: [
            {
              title: `⛔ Level reward already exists!`,
            },
          ],
          ephemeral: true,
        })
        .catch((err) => this.logger.error(err))
    }

    guild.level.rewards.push({
      role_id: role.id,
      level: level,
    })

    await guild.save()

    this.interaction
      .reply({
        embeds: [
          {
            title: `⛔ Level reward added!`,
          },
        ],
        ephemeral: true,
      })
      .catch((err) => this.logger.error(err))
  }
}

module.exports = AddLevelReward
