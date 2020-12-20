const { Bot } = require('./system');
// import the Manager class from lavacord

const client = new Bot({
  commandPrefix: process.env.COMMAND_PREFIX,
  botOwner: process.env.BOT_OWNER,
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.bootstrap(process.env.BOT_TOKEN);
