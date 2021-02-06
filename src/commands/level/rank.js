const canvacord = require('canvacord');
const path = require('path');
const { MessageAttachment } = require('discord.js');
const { Command } = require('../../system');

class RankCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'rank',
      aliases: ['rank', 'level'],

      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: [],
      moderatorOnly: false,
      ownerOnly: false,

      args: [
        {
          name: 'member',
          type: 'user',
        },
      ],
    });
  }

  run(message, [member]) {
    const user = (member && member.user) || message.author;

    const { models } = this.client.database;

    models.GuildMember.find({ guild_id: message.guild.id })
      .sort({ level: 'desc', exp: 'desc' })
      .then(async (guildMemberDocs) => {
        const userPosition = guildMemberDocs.findIndex((x) => {
          return x.user_id === user.id;
        });

        if (userPosition === -1) return message.channel.send(`${user.username} henüz bir sıralamaya sahip değil.`);

        const guildMember = message.guild.member(user);
        const defaultColor = '#FFF';
        const progressBarColor = '#C13430';
        const overlayColor = '#000';
        const overlayOpacity = 0.75;

        const rank = new canvacord.Rank()
          .setAvatar(guildMember.user.displayAvatarURL({ format: 'jpg' }))
          .setCurrentXP(guildMemberDocs[userPosition].exp, defaultColor)
          .setRequiredXP(guildMemberDocs[userPosition].level * 121, defaultColor)
          .setStatus(guildMember.user.presence.status)
          .setProgressBar(progressBarColor, 'COLOR')
          .setRank(userPosition + 1, '#')
          .setRankColor(defaultColor, defaultColor)
          .setLevel(guildMemberDocs[userPosition].level, 'Level')
          .setLevelColor(defaultColor, defaultColor)
          .setUsername(guildMember.displayName, defaultColor)
          .setBackground('IMAGE', path.join(__dirname, '../../../resources/images/background.jpg'))
          .setOverlay(overlayColor, overlayOpacity)
          .setDiscriminator(guildMember.user.discriminator, defaultColor);

        rank.build().then((data) => {
          const attachment = new MessageAttachment(data, 'rank.png');
          message.channel.send(attachment);
        });
      });
  }
}

module.exports = RankCommand;
