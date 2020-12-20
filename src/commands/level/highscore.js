const { Command } = require('../../system');

class HighScoreCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'highscore',
      aliases: ['levels', 'highscore'],

      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: [],
      moderatorOnly: false,
      ownerOnly: false,
    });
  }

  run(message) {}
}

module.exports = HighScoreCommand;
