const { Event } = require('../system');

class MessageReactionRemoveEvent extends Event {
  async run(messageReaction, user) {
    if (messageReaction.message.partial) await messageReaction.message.fetch();

    const { models } = this.client.database;

    models.Guild.findOne({ guild_id: messageReaction.message.channel.guild.id }).then((guildDoc) => {
      const reactionRolePlugin = guildDoc.plugins.reaction_role;

      const takeIndex = reactionRolePlugin.take.findIndex((x) => {
        return x.channel_id === messageReaction.message.channel.id;
      });

      if (takeIndex === -1) return;

      const reaction = reactionRolePlugin.take.find((x) => {
        const emojiMatch = x.emoji.match(/^<a:\w+:(\d+)>|<:\w+:(\d+)>?$/);
        return (emojiMatch && emojiMatch[1] === messageReaction.emoji.id) || x.emoji === messageReaction.emoji.name;
      });

      if (reaction) {
        const member = messageReaction.message.channel.guild.members.cache.get(user.id);
        if (!member) return;
        member.roles.remove(reaction.role_id).catch((err) => this.logger.warn(err));
      }
    });
  }
}

module.exports = MessageReactionRemoveEvent;
