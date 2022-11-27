const { Event } = require('../bot')

class InteractionCreate extends Event {
  constructor(client) {
    super(client, {
      name: 'interactionCreate',
      description: 'Interaction create event',
    })
  }

  async run(interaction) {
    try {
      if (!interaction.isChatInputCommand()) return
      const command = this.client.commands.get(interaction.commandName)
      if (!command) return
      command.execute(interaction)
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = InteractionCreate
