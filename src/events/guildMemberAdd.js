const { MessageEmbed } = require('discord.js');
const { Event } = require('../system');

class GuildMemberAddEvent extends Event {
  run(member) {
    member
      .send(
        `Elym2 topluluk sunucusuna hoş geldin ${member.user}, Sunucu içerisinde uyulması gereken bazı kurallar var\n\n` +
          `1) Diğer üyelere karşı saygılı olmalısın\n` +
          `2) Siyasi paylaşımlardan kaçınmalısın\n` +
          `3) Saygı çerçevesini aşan yazı ve söylemlerden uzak durmalısın\n\n` +
          `Bu kurallara dikkat ettiğin sürece discord içerisinde özgürce duygularını ifade edebilir, sohbetlerini gerçekleştirebilirsin.\n` +
          `Bazı kanallar yaş sınırlamasına ve bazı tercihlere göre kullanılabilmektedir bunun için sunucu içerisinde **#tercihler** kanalını ziyaret edin.\n\n` +
          `İyi Eğlenceler!`
      )
      .catch((err) => this.logger.warn(err));

    const { models } = this.client.database;
    models.Guild.findOne({ guild_id: member.guild.id }).then((guildDoc) => {
      const moderationPlugin = guildDoc.plugins.moderation;

      if (moderationPlugin && moderationPlugin.enable) {
        const memberAddLog = new MessageEmbed()
          .setColor('#008000')
          .setAuthor(`${member.user.username}`, `${member.user.displayAvatarURL({ format: 'png', size: 2048 })}`)
          .setThumbnail(`${member.user.displayAvatarURL({ format: 'png', size: 2048 })}`)
          .setDescription(`${member.user} az önce sunucuya giriş yaptı`)
          .setTimestamp();

        member.guild.systemChannel.send(memberAddLog).catch((err) => this.logger.warn(err));
      }
    });
  }
}

module.exports = GuildMemberAddEvent;
