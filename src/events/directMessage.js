const { Event } = require('../system');

class DirectMessageEvent extends Event {
  run(message) {
    if (message.author.bot) return;
    message
      .reply(
        `Yardıma ihtiyacın varsa https://support.elym2.com adresini kullanabilirsin, sana kısa süre içerisinde yardımcı olacağız.`
      )
      .catch((err) => this.logger.warn(err));
  }
}

module.exports = DirectMessageEvent;
