const { Event } = require('../system');

class ReadyEvent extends Event {
  run() {
    this.client.user.setActivity(`👀 |`, { type: 'WATCHING' });
  }
}

module.exports = ReadyEvent;
