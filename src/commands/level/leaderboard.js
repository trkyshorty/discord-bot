const { Command, PermissionFlagsBits, AttachmentBuilder, EmbedBuilder } = require('../../bot')
const GuildMember = require('../../models/guildMember')
const canvacord = require('canvacord')
const path = require('path')

class LeaderBoard extends Command {
  constructor(client) {
    super(client, {
      name: 'leaderboard',
      description: 'Get user ranking leaderboard',
      aliases: ['leaderboard'],
      category: 'level',

      clientPermissions: PermissionFlagsBits.Administrator,
      memberPermissions: PermissionFlagsBits.SendMessages,

      args: [],
    })
  }

  async run() {
    GuildMember.find({ guild_id: this.interaction.guild.id })
      .limit(10)
      .sort({ level: 'desc', experience: 'desc' })
      .then(async (guildMemberDocs) => {

        let userNames = ''
        let levels = ''
        let xp = ''

        await guildMemberDocs.forEach(async (guildMemberDoc) => {
          const user = (await this.client.users.fetch(guildMemberDoc.user_id))
          userNames += `\`${user.username}\`\n`
          levels += `\`${guildMemberDoc.level}\`\n`
          xp += `\`${guildMemberDoc.experience.toLocaleString('en')}\`\n`
        })

        const embed = new EmbedBuilder()
          .setAuthor(
            { name: `Leaderboard (Top 10)`, iconURL: this.interaction.guild.iconURL({ dynamic: true }) })
          .addFields(
            { name: 'Member', value: userNames, inline: true },
            { name: 'Level', value: levels, inline: true },
            { name: 'Experience', value: xp, inline: true })

        this.interaction.reply({ embeds: [embed] })
      })
      .catch((err) => this.logger.error(err))
  }
}

module.exports = LeaderBoard
