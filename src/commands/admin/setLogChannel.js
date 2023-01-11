const { Command, PermissionFlagsBits } = require('../../bot')
const Guild = require('../../models/guild')

class SetLogChannel extends Command {
  constructor(client) {
    super(client, {
      name: 'set-log-channel',
      description: 'Set the log channel for the server.',
      aliases: ['set-log-channel'],
      category: 'admin',

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

  async run(channel) {
    const filter = { guild_id: this.interaction.guild.id }
    const update = { log_channel: channel.id }

    await Guild.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    }).catch((err) => this.logger.error(err))

    this.interaction
      .reply({
        embeds: [
          {
            title: `⛔ Log channel saved!`,
          },
        ],
        ephemeral: true,
      })
      .catch((err) => this.logger.error(err))
  }
}

module.exports = SetLogChannel
