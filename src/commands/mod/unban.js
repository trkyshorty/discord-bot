const { MessageEmbed } = require('discord.js');
const { Command } = require('../../system');

class UnBanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unban',
      aliases: ['unban'],

      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: [],
      moderatorOnly: true,
      ownerOnly: false,

      args: [
        {
          name: 'member',
          type: 'user',
        },
        {
          name: 'argReason',
          type: 'string',
        },
      ],
    });
  }

  async run(message, [member, argReason]) {
    if (!member) return message.reply(`lütfen ban kaldırılacak kullanıcıyı etiketleyin`);

    const embed = new MessageEmbed()
      .setAuthor(this.client.user.username, this.client.user.displayAvatarURL({ format: 'png', size: 2048 }))
      .setTitle('İşlem Raporu')
      .setThumbnail(this.client.user.displayAvatarURL({ format: 'png', size: 2048 }))
      .setFooter(
        `${message.author.tag} tarafından oluşturuldu.`,
        message.author.displayAvatarURL({ format: 'png', size: 2048 })
      );

    message.guild.fetchBans().then((banned) => {
      if (!banned.has(member.id)) {
        embed.setDescription(`${member.user} daha önce banlanmamış ceza vermek istersen ***/ban*** kullanabilirsin`);
        return message.channel.send({ embed });
      }

      message.guild.members
        .unban(member.id, {
          reason: argReason,
        })
        .then(async () => {
          embed.setDescription(`${member.user} cezası sonlandırıldı`).addField('İşlem Nedeni', argReason);
          return message.channel.send({ embed });
        });
    });
  }
}

module.exports = UnBanCommand;
