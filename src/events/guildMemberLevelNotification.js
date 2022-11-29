const { Event } = require('../bot')

class GuildMemberLevelNotification extends Event {
  constructor(client) {
    super(client, {
      name: 'guildMemberLevelNotification',
      description: 'Guild level notification event',
    })
  }

  async run (member, level) {
    member
      .send(
        `Tebrikler! Seviye **${level}** oldun. Sohbete daha çok katkı sağlayarak seviyeni yükseltebilir ve özel ayrıcalıklara sahip olabilirsin.`
      )
      .catch((err) => this.logger.error(err))
  }
}

module.exports = GuildMemberLevelNotification
