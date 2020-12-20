const { registerFont, createCanvas, loadImage } = require('canvas');
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

        registerFont(path.join(__dirname, '../../../resources/fonts/discord.ttf'), { family: 'Discord' });

        const canvas = createCanvas(900, 250);
        const ctx = canvas.getContext('2d');

        const background = await loadImage(path.join(__dirname, '../../../resources/images/background.jpg'));

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#74037b';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(25, 25, canvas.width - 50, canvas.height - 50);

        const guildMember = message.guild.member(user);

        ctx.font = '32pt Discord';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(guildMember.displayName, canvas.width / 4.0, canvas.height / 2.8);

        ctx.font = '28pt Discord';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Lv. ${guildMemberDocs[userPosition].level}`, canvas.width / 1.25, canvas.height / 2.8);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(225, 160, canvas.width - 300, 40);

        ctx.fillStyle = 'rgba(255,0,0,0.75)';
        const fWidth =
          (Math.floor((guildMemberDocs[userPosition].exp / (guildMemberDocs[userPosition].level * 121)) * 100) / 100) *
          (canvas.width - 300);

        if (fWidth > 0) {
          ctx.fillRect(225, 160, fWidth, 40);
        }

        ctx.font = '24pt Discord';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(
          `${guildMemberDocs[userPosition].exp}/${guildMemberDocs[userPosition].level * 121}`,
          canvas.width / 2.0,
          canvas.height / 1.32
        );

        const avatar = await loadImage(guildMember.user.displayAvatarURL({ format: 'jpg' }));
        ctx.drawImage(avatar, 50, 50, 150, 150);

        const attachment = new MessageAttachment(canvas.toBuffer(), 'rank.png');

        message.channel.send(attachment).catch((err) => this.logger.warn(err));
      });
  }
}

module.exports = RankCommand;
