const { Command, PermissionFlagsBits } = require('../../bot')
const Guild = require('../../models/guild')

class AddNoExperienceRole extends Command {
  constructor(client) {
    super(client, {
      name: 'add-no-experience-role',
      description: "Add no experience role.",
      aliases: ['add-no-experience-role'],

      clientPermissions: PermissionFlagsBits.Administrator,
      memberPermissions: PermissionFlagsBits.Administrator,

      args: [
        {
          name: 'role',
          description: 'Enter the role',
          type: 'role',
          required: true,
        }
      ],
    })
  }

  async run (role) {
    const filter = { guild_id: this.interaction.guild.id }
    const update = {}

    const guild = await Guild.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true
    })

    if (guild.level.no_experience_roles.includes(role.id)) {
      return this.interaction.reply({
        embeds: [{
          title: `⛔ No experience role already exist!`
        }],
        ephemeral: true
      })
    }

    guild.level.no_experience_roles.push(role.id)

    await guild.save()

    this.interaction.reply({
      embeds: [{
        title: `⛔ No experience role added!`
      }],
      ephemeral: true
    })
  }
}

module.exports = AddNoExperienceRole
