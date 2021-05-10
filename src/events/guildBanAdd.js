const { MessageEmbed } = require('discord.js');
const { Event } = require('../system');

class GuildBanAddEvent extends Event {
  async run(guild, user) {
    const { models } = this.client.database;

    await models.GuildMember.findOneAndUpdate(
      { guild_id: guild.id, user_id: user.id },
      { $set: { banned_at: Date.now() } },
      { setDefaultsOnInsert: true, upsert: true, new: true }
    );
  }
}

module.exports = GuildBanAddEvent;
