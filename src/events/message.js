const { Event } = require('../system');

class MessageEvent extends Event {
  run(message) {
    this.client.emit('messageAnalyze', message);
    this.client.emit('messageLevelUpdate', message);
  }
}

module.exports = MessageEvent;
