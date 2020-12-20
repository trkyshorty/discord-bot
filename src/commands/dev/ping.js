const { Command } = require('../../system');

module.exports = class PingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'ping',
      aliases: ['latency'],

      clientPermissions: [],
      userPermissions: [],
      moderatorOnly: false,
      ownerOnly: true,
    });
  }

  run(message) {
    message.channel.send('Pinging...').then((sentMsg) => {
      sentMsg.edit(`:ping_pong: Pong! Took \`${sentMsg.createdTimestamp - message.createdTimestamp}ms\``);
    });
  }
};
