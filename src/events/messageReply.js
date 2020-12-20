const { Event } = require('../system');

class MessageReplyEvent extends Event {
  run(message) {
    const helloWords = [
      'hi',
      'hello',
      'sa',
      's.a',
      'slm',
      'hello',
      'selam',
      'merhaba',
      'merhabalar',
      'selamlar',
      'saleykum',
      's.aleykum',
      'saleyküm',
      's.aleyküm',
      'selamaleyküm',
      'selam aleyküm',
      'selamaleykum',
      'selam aleykum',
      'selamınaleyküm',
      'selamın aleyküm',
    ];

    if (helloWords.includes(message.content.toLocaleLowerCase('tr-TR'))) {
      const answerEmoji = message.guild.emojis.cache.find((emoji) => emoji.name === 'as');
      if (answerEmoji) message.react(answerEmoji);
    }
  }
}

module.exports = MessageReplyEvent;
