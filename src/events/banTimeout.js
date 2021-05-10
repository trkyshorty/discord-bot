const { Event } = require('../system');

class BanTimeoutEvent extends Event {
  run() {
    const date = new Date();
    const timeout = 30; // day
    const timeoutDate = new Date(date.setDate(date.getDate() - timeout));
    const { models } = this.client.database;

    models.GuildMember.find({
      banned_at: {
        $lt: timeoutDate,
      },
    }).then((guildMemberDoc) => {
      guildMemberDoc.forEach(async (user) => {
        const guild = this.client.guilds.cache.get(user.guild_id);

        guild.fetchBans().then(async () => {
          guild.members.fetch(user.user_id)
            .then(member => {
              guild.members
                .unban(user.user_id, {
                  reason: 'Ceza süresi doldu',
                })
                .then(async () => {
                  await models.GuildMember.findOneAndUpdate(
                    { guild_id: user.guild_id, user_id: user.user_id },
                    { $set: { banned_at: null } },
                    { setDefaultsOnInsert: true, upsert: true, new: true }
                  );
                  this.logger.info(`Ban Timeout: ${user.user_id}`);
                });
            })
            .catch(console.error)
        });
      });
    });
  }
}

module.exports = BanTimeoutEvent;
