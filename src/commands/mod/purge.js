const { Command, PermissionFlagsBits } = require('../../bot')

class Purge extends Command {
  constructor(client) {
    super(client, {
      name: 'purge',
      description: "Delete messages as given amount",
      aliases: ['purge'],
      category: 'mod',

      clientPermissions: PermissionFlagsBits.Administrator,
      memberPermissions: PermissionFlagsBits.Administrator,

      args: [
        {
          name: 'amount',
          description: 'How many messages will be deleted?',
          type: 'integer',
          required: true,
        },
      ],
    })
  }

  async run (amount) {
    await this.interaction.channel.messages.fetch({ limit: amount })
      .then(messages => {
        this.interaction.channel.bulkDelete(messages, true)
      })
      .catch((err) => console.error(err))

    this.interaction.reply({
      embeds: [{
        description: `⛔ Deleted ${amount} messages`
      }],
      ephemeral: true
    })
  }
}

module.exports = Purge
