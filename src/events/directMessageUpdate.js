const { Event } = require('../system');

class DirectMessageUpdateEvent extends Event {
  run(oldMesssage, newMessage) {}
}

module.exports = DirectMessageUpdateEvent;
