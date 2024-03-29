const { Command, PermissionFlagsBits } = require('../../bot')

class Ping extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      description: 'Retrieve pong!',
      aliases: ['latency'],
      category: 'dev',

      clientPermissions: PermissionFlagsBits.Administrator,
      memberPermissions: PermissionFlagsBits.Administrator,
    })
  }

  async run() {
    this.interaction
      .reply({
        embeds: [
          {
            title: `⛔ Pong!`,
          },
        ],
        ephemeral: true,
      })
      .catch((err) => this.logger.error(err))
  }
}

module.exports = Ping
