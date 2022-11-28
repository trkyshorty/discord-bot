class Command {
  constructor(client, info) {
    Object.defineProperty(this, 'client', { value: client })
    this.info = info
    this.interaction = null
  }

  async execute(interaction) {
    try {
      console.info(`[COMMAND] Execute ${this.info.name}`)

      this.interaction = interaction

      if (
        !interaction.guild.members.me.permissions.has(
          this.info.clientPermissions
        )
      )
        return interaction.reply('Bot is not authorized for this command.')
      if (!interaction.member.permissions.has(this.info.memberPermissions))
        return interaction.reply('You are not authorized for this command.')

      if (!this.info.args || !this.info.args.length) return this.run()

      let args = []

      this.info.args.forEach((arg) => {
        switch (arg.type) {
          case 'string':
            args.push(interaction.options.getString(arg.name))
            break
          case 'integer':
            args.push(interaction.options.getInteger(arg.name))
            break
          case 'user':
            args.push(interaction.options.getUser(arg.name))
            break
          case 'role':
            args.push(interaction.options.getRole(arg.name))
            break
          case 'channel':
            args.push(interaction.options.getChannel(arg.name))
            break
        }
      })

      await this.run(...args)
    } catch (err) {
      console.error(err)
    }
  }
}

module.exports = Command
