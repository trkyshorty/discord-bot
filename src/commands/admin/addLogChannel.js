const { Command, PermissionFlagsBits } = require('../../bot')
const Guild = require('../../models/guild')

class AddLogChannel extends Command {
  constructor(client) {
    super(client, {
      name: 'add-log-channel',
      description: "Add the log channel for the server.",
      aliases: ['add-log-channel'],

      clientPermissions: PermissionFlagsBits.Administrator,
      memberPermissions: PermissionFlagsBits.Administrator,

      args: [
        {
          name: 'channel',
          description: 'Enter the log channel',
          type: 'channel',
          required: true,
        },
      ],
    })
  }

  async run (channel) {
    const filter = { guild_id: this.interaction.guild.id }
    const update = { log_channel: channel.id }

    await Guild.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true
    })

    this.interaction.reply({
      embeds: [{
        title: `⛔ Log channel saved!`
      }],
      ephemeral: true
    })
  }
}

module.exports = AddLogChannel
