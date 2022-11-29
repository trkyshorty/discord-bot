const { Command, PermissionFlagsBits } = require('../../bot')
const Guild = require('../../models/guild')

class RemoveLevelReward extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-level-reward',
      description: "Remove level reward.",
      aliases: ['remove-level-reward'],
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

  async run (role, level) {
    const filter = { guild_id: this.interaction.guild.id }
    const update = {}

    const guild = await Guild.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true
    })

    if (!guild.level.rewards.find((x) => x.role_id === role.id && x.level === level)) {
      return this.interaction.reply({
        embeds: [{
          title: `⛔ Level reward doesnt not exist!`
        }],
        ephemeral: true
      })
    }

    guild.level.rewards.pull({
      role_id: role.id,
      level: level
    })

    await guild.save()

    this.interaction.reply({
      embeds: [{
        title: `⛔ Level reward removed!`
      }],
      ephemeral: true
    })
  }
}

module.exports = RemoveLevelReward
