const { MessageEmbed } = require('discord.js');
const { Command } = require('../../system');

class UnMuteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'unmute',
      aliases: ['unmute'],

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
    if (!member) return message.reply(`lütfen susturma cezası kaldırılacak kullanıcıyı etiketleyin`);
    let muteRole = this.client.guilds.cache.get(message.guild.id).roles.cache.find((val) => val.name === 'Susturuldu');
    if (!muteRole) {
      try {
        muteRole = await message.guild.roles.create({
          data: {
            name: 'Susturuldu',
            color: '#000000',
            permissions: [],
          },
        });

        message.guild.channels.cache.forEach(async (channel) => {
          await channel.createOverwrite(muteRole, {
            SEND_MESSAGES: false,
            MANAGE_MESSAGES: false,
            READ_MESSAGES: false,
            ADD_REACTIONS: false,
          });
        });
      } catch (e) {
        console.log(e.stack);
      }
    }

    const embed = new MessageEmbed()
      .setAuthor(this.client.user.username, this.client.user.displayAvatarURL({ format: 'png', size: 2048 }))
      .setTitle('İşlem Raporu')
      .setThumbnail(this.client.user.displayAvatarURL({ format: 'png', size: 2048 }))
      .setFooter(
        `${message.author.tag} tarafından oluşturuldu.`,
        message.author.displayAvatarURL({ format: 'png', size: 2048 })
      );

    if (!member.roles.cache.has(muteRole.id)) {
      embed.setDescription(`${member.user} daha önce susturulmadı, susturmak istersen ***/mute*** kullanabilirsin`);
      return message.channel.send({ embed });
    }

    member.roles
      .remove(muteRole)
      .then(async () => {
        const { models } = this.client.database;
        await models.GuildMember.findOneAndUpdate(
          { guild_id: member.guild.id, user_id: member.user.id },
          { $set: { muted_at: null } },
          { setDefaultsOnInsert: true, upsert: true, new: true }
        );
      })
      .catch((err) => console.error(err));

    embed.setDescription(`${member.user} susturma cezası kaldırıldı`).addField('İşlem Nedeni', argReason);
    return message.channel.send({ embed });
  }
}

module.exports = UnMuteCommand;
