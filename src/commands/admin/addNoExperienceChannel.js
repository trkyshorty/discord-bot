const { Command, PermissionFlagsBits } = require('../../bot')
const Guild = require('../../models/guild')

class AddNoExperienceChannel extends Command {
  constructor(client) {
    super(client, {
      name: 'add-no-experience-channel',
      description: "Add no experience channel.",
      aliases: ['add-no-experience-channel'],

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

    if (guild.level.no_experience_channels.includes(channel.id)) {
      return this.interaction.reply({
        embeds: [{
          title: `⛔ No experience channel already exist!`
        }],
        ephemeral: true
      })
    }

    guild.level.no_experience_channels.push(channel.id)

    await guild.save()

    this.interaction.reply({
      embeds: [{
        title: `⛔ No experience channel added!`
      }],
      ephemeral: true
    })
  }
}

module.exports = AddNoExperienceChannel
