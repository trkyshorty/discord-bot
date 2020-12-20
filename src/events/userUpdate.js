const { MessageEmbed } = require('discord.js');
const { Event } = require('../system');

class UserUpdateEvent extends Event {
  run(oldUser, newUser) {
    this.client.guilds.cache.forEach((guild) => {
      const { models } = this.client.database;
      models.Guild.findOne({ guild_id: guild.id }).then((guildDoc) => {
        const moderationPlugin = guildDoc.plugins.moderation;

        if (moderationPlugin && moderationPlugin.enable) {
          const moderationLogChannel = this.client.channels.cache.get(moderationPlugin.log_channel);
          if (!moderationLogChannel) return;

          const userUpdateLog = new MessageEmbed()
            .setColor('#0099ff')
            .setAuthor(`${oldUser.username}`, `${oldUser.displayAvatarURL({ format: 'png', size: 2048 })}`)
            .setThumbnail(`${oldUser.displayAvatarURL({ format: 'png', size: 2048 })}`)
            .setDescription(`:pencil: ${oldUser} kullanıcısının bazı bilgileri değişti`)
            .setTimestamp();

          if (oldUser.username !== newUser.username) {
            userUpdateLog.addField('Eski Adı', oldUser.username, true);
            userUpdateLog.addField('Yeni Adı', newUser.username, true);
          }

          if (oldUser.discriminator !== newUser.discriminator) {
            userUpdateLog.addField('Eski Tag', oldUser.discriminator, true);
            userUpdateLog.addField('Yeni Tag', newUser.discriminator, true);
          }

          if (oldUser.avatar !== newUser.avatar) {
            userUpdateLog.addField(
              'Eski Resim',
              `[Resim](${oldUser.displayAvatarURL({ format: 'png', size: 2048 })})`,
              true
            );
            userUpdateLog.addField(
              'Yeni Resim',
              `[Resim](${newUser.displayAvatarURL({ format: 'png', size: 2048 })})`,
              true
            );
          }

          moderationLogChannel.send(userUpdateLog).catch((err) => this.logger.warn(err));
        }
      });
    });
  }
}

module.exports = UserUpdateEvent;
