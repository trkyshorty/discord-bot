const { Event } = require('../../system');

class MuteTimeoutEvent extends Event {
  run() {
    const date = new Date();
    const timeout = 1; // day
    const timeoutDate = new Date(date.setDate(date.getDate() - timeout));
    const { models } = this.client.database;

    models.GuildMember.find({
      muted_at: {
        $lt: timeoutDate,
      },
    }).then((guildMemberDoc) => {
      guildMemberDoc.forEach(async (user) => {
        const guild = this.client.guilds.cache.get(user.guild_id);

        let muteRole = guild.roles.cache.find((val) => val.name === 'Susturuldu');
        if (!muteRole) {
          try {
            muteRole = await guild.roles.create({
              data: {
                name: 'Susturuldu',
                color: '#000000',
                permissions: [],
              },
            });
          } catch (e) {
            console.log(e.stack);
          }
        }

        guild.channels.cache.forEach(async (channel) => {
          await channel.createOverwrite(muteRole, {
            SEND_MESSAGES: false,
            MANAGE_MESSAGES: false,
            READ_MESSAGES: false,
            ADD_REACTIONS: false,
          });
        });

        guild.members.fetch(user.user_id).then((member) => {
          member.roles
            .remove(muteRole)
            .then(async () => {
              await models.GuildMember.findOneAndUpdate(
                { guild_id: member.guild.id, user_id: member.user.id },
                { $set: { muted_at: null } },
                { setDefaultsOnInsert: true, upsert: true, new: true }
              );
              this.logger.info(`Mute Timeout: ${user.user_id}`);
            })
            .catch((err) => console.error(err));
        });
      });
    });
  }
}

module.exports = MuteTimeoutEvent;
