const { Command, PermissionFlagsBits } = require('../../bot')
const Guild = require('../../models/guild')

class RemoveNoExperienceChannel extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-no-experience-channel',
      description: "Remove no experience channel.",
      aliases: ['remove-no-experience-channel'],

      clientPermissions: PermissionFlagsBits.Administrator,
      memberPermissions: PermissionFlagsBits.Administrator,

      args: [
        {
          name: 'channel',
          description: 'Enter the channel',
          type: 'channel',
          required: true,
        }
      ],
    })
  }

  async run (channel) {
    const filter = { guild_id: this.interaction.guild.id }
    const update = {}

    const guild = await Guild.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true
    })

    if (!guild.level.no_experience_channels.includes(channel.id)) {
      return this.interaction.reply({
        embeds: [{
          title: `⛔ No experience channel doesnt not exist!`
        }],
        ephemeral: true
      })
    }

    guild.level.no_experience_channels.pull(channel.id)

    await guild.save()

    this.interaction.reply({
      embeds: [{
        title: `⛔ No experience channel removed!`
      }],
      ephemeral: true
    })
  }
}

module.exports = RemoveNoExperienceChannel