const { Event } = require('../system');

class MessageLevelUpdateEvent extends Event {
  run(message) {
    if (message.author.bot) return;
    const { models } = this.client.database;
    models.Guild.findOne({ guild_id: message.guild.id }).then((guildDoc) => {
      const levelPlugin = guildDoc.plugins.level;

      if (!levelPlugin.enable) return;
      if (levelPlugin.no_xp_channels.includes(message.channel.id)) return;
      if (this.client.cooldown.has(message.author.id)) return;

      const member = message.guild.members.cache.get(message.author.id);

      if (!member) return;
      if (member.roles.cache.some((r) => levelPlugin.no_xp_roles.includes(r.id))) return;

      models.GuildMember.findOne({ user_id: message.author.id, guild_id: message.guild.id }).then((guildMemberDoc) => {
        const random = Math.floor(Math.random() * (75 - 45)) + 45;
        if (guildMemberDoc.exp + random >= guildMemberDoc.level * 121) {
          Object.assign(guildMemberDoc, {
            exp: 0,
            level: guildMemberDoc.level + 1,
          });
          member
            .send(
              `Tebrikler! Seviye **${guildMemberDoc.level}** oldun. Sohbete daha çok katkı sağlayarak seviyeni yükseltebilir ve özel ayrıcalıklara sahip olabilirsin.`
            )
            .catch((err) => this.logger.warn(err));
        } else {
          Object.assign(guildMemberDoc, {
            exp: guildMemberDoc.exp + random,
          });
        }

        guildMemberDoc.save();

        let rewardedRole;
        levelPlugin.rewards.forEach((role) => {
          if (guildMemberDoc.level >= role.level) rewardedRole = role.role_id;
        });

        if (rewardedRole && !member.roles.cache.has(rewardedRole)) {
          const removedRoles = levelPlugin.rewards.map((item) => {
            return item.role_id;
          });

          member.roles
            .remove(removedRoles)
            .then(() => {
              member.roles.add(rewardedRole).catch((err) => this.logger.warn(err));
            })
            .catch((err) => this.logger.warn(err));
        }

        this.client.cooldown.add(message.author.id);

        setTimeout(() => {
          this.client.cooldown.delete(message.author.id);
        }, 1000 * 60);
      });
    });
  }
}

module.exports = MessageLevelUpdateEvent;
