const { Command, PermissionFlagsBits } = require('../../bot')
const Guild = require('../../models/guild')

class ClearWelcomeMessage extends Command {
  constructor(client) {
    super(client, {
      name: 'clear-welcome-message',
      description: "Clear the welcome messsage for the server.",
      aliases: ['clear-welcome-message'],
      category: 'admin',

      clientPermissions: PermissionFlagsBits.Administrator,
      memberPermissions: PermissionFlagsBits.Administrator,
    })
  }

  async run () {
    const filter = { guild_id: this.interaction.guild.id }
    const update = {  }

    const guild = await Guild.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true
    }).catch((err) => this.logger.error(err))

    guild.welcome.message = null

    await guild.save()

    this.interaction.reply({
      embeds: [{
        title: `⛔ Welcome message cleared!`
      }],
      ephemeral: true
    }).catch((err) => this.logger.error(err))
  }
}

module.exports = ClearWelcomeMessage
