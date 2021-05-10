const { Event } = require('../../system');

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

        guild.fetchBans().then(async (banned) => {

          if (banned.has(user.user_id)) {
            guild.members
              .unban(user.user_id, {
                reason: 'Ceza süresi doldu',
              })
              .then(async () => {
                this.logger.info(`Ban Timeout: ${user.user_id}`);
              });
          }
        });
      });
    });
  }
}

module.exports = BanTimeoutEvent;
