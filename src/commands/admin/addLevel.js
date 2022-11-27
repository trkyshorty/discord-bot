const { Command, PermissionFlagsBits } = require('../../bot')
const GuildMember = require('../../models/guildMember')

class AddLevel extends Command {
  constructor(client) {
    super(client, {
      name: 'add-level',
      description: "Add level to a user.",
      aliases: ['add-level'],

      clientPermissions: PermissionFlagsBits.Administrator,
      memberPermissions: PermissionFlagsBits.Administrator,

      args: [
        {
          name: 'user',
          description: 'Enter the user',
          type: 'user',
          required: true,
        },
        {
          name: 'level',
          description: 'Enter the level',
          type: 'integer',
          required: true,
        },
      ],
    })
  }

  async run (user, level) {
    const filter = { guild_id: this.interaction.guild.id, user_id: user.id }
    const update = { level: level, experience: 0 }

    await GuildMember.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true
    })

    this.client.emit('guildMemberLevelNotification', this.interaction.member, level)

    this.interaction.reply({
      embeds: [{
        title: `⛔ Level added!`
      }],
      ephemeral: true
    })
  }
}

module.exports = AddLevel
