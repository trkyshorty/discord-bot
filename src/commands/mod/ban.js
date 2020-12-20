const { MessageEmbed } = require('discord.js');
const { Command } = require('../../system');

class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ban',
      aliases: ['ban'],

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
    if (!member) return message.reply(`lütfen banlanacak kullanıcıyı etiketleyin`);

    const embed = new MessageEmbed()
      .setAuthor(this.client.user.username, this.client.user.displayAvatarURL({ format: 'png', size: 2048 }))
      .setTitle('İşlem Raporu')
      .setThumbnail(this.client.user.displayAvatarURL({ format: 'png', size: 2048 }))
      .setFooter(
        `${message.author.tag} tarafından oluşturuldu.`,
        message.author.displayAvatarURL({ format: 'png', size: 2048 })
      );

    message.guild.fetchBans().then((banned) => {
      if (banned.has(member.id)) {
        embed.setDescription(
          `${member.user} daha önce banlanmış görünüyor cezasını sonlandırmak istersen ***/unban*** kullanabilirsin`
        );
        return message.channel.send({ embed });
      }

      message.guild.members
        .ban(member.id, {
          reason: argReason,
        })
        .then(async () => {
          const { models } = this.client.database;

          await models.GuildMember.findOneAndUpdate(
            { guild_id: member.guild.id, user_id: member.user.id },
            { $set: { banned_at: Date.now() } },
            { setDefaultsOnInsert: true, upsert: true, new: true }
          );

          embed.setDescription(`${member.user} sunucudan atıldı`).addField('İşlem Nedeni', argReason);
          return message.channel.send({ embed });
        });
    });
  }
}

module.exports = BanCommand;
