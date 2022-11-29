const { Command, PermissionFlagsBits } = require('../../bot')
const Guild = require('../../models/guild')

class RemoveLogChannel extends Command {
  constructor(client) {
    super(client, {
      name: 'remove-log-channel',
      description: "Remove the log channel for the server.",
      aliases: ['remove-log-channel'],
      category: 'admin',

      clientPermissions: PermissionFlagsBits.Administrator,
      memberPermissions: PermissionFlagsBits.Administrator,
    })
  }

  async run () {
    const filter = { guild_id: this.interaction.guild.id }
    const update = { log_channel: 0 }

    await Guild.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true
    }).catch((err) => this.logger.error(err))

    this.interaction.reply({
      embeds: [{
        title: `⛔ Log channel removed!`
      }],
      ephemeral: true
    }).catch((err) => this.logger.error(err))
  }
}

module.exports = RemoveLogChannel
