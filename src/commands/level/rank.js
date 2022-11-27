const { Command, PermissionFlagsBits, AttachmentBuilder } = require('../../bot')
const GuildMember = require('../../models/guildMember')
const canvacord = require('canvacord')
const path = require('path')

class Rank extends Command {
  constructor(client) {
    super(client, {
      name: 'rank',
      description: "Get user level",
      aliases: ['rank', 'level'],

      clientPermissions: PermissionFlagsBits.Administrator,
      memberPermissions: PermissionFlagsBits.Administrator,

      args: [
        {
          name: 'user',
          description: 'Enter the user',
          type: 'user',
          required: true,
        },
      ],
    })
  }

  async run (user) {
    GuildMember.find({ guild_id: this.interaction.guild.id, user_id: user.id })
      .sort({ level: 'desc', exp: 'desc' })
      .then(async (guildMemberDocs) => {
        const userPosition = guildMemberDocs.findIndex((x) => {
          return x.user_id === user.id
        })

        if (userPosition === -1) return

        const guildMember = await this.interaction.guild.members
          .fetch({ user, force: true })
          .catch((err) => console.error(err))

        if (!guildMember) return

        const defaultColor = '#FFF'
        const progressBarColor = '#C13430'
        const overlayColor = '#000'
        const overlayOpacity = 0.75

        const rank = new canvacord.Rank()
          .setAvatar(user.displayAvatarURL({ format: 'jpg' }))
          .setCurrentXP(guildMemberDocs[userPosition].experience, defaultColor)
          .setRequiredXP(guildMemberDocs[userPosition].level * 121, defaultColor)
          .setStatus(guildMember.presence.status)
          .setProgressBar(progressBarColor, 'COLOR')
          .setRank(userPosition + 1, '#')
          .setRankColor(defaultColor, defaultColor)
          .setLevel(guildMemberDocs[userPosition].level, 'Level')
          .setLevelColor(defaultColor, defaultColor)
          .setUsername(user.username, defaultColor)
          .setBackground('IMAGE', path.join(__dirname, '../../../resources/images/rank_background.png'))
          .setOverlay(overlayColor, overlayOpacity)
          .setDiscriminator(user.discriminator, defaultColor)

        rank.build().then((data) => {
          const attachment = new AttachmentBuilder(data, '${user.id}.png')
          this.interaction.reply({ files: [attachment] })
        })
      })
  }
}

module.exports = Rank
