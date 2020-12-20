const { Command } = require('../../system');

module.exports = class PurgeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'purge',
      aliases: ['purge'],

      clientPermissions: [],
      userPermissions: [],
      moderatorOnly: true,
      ownerOnly: false,

      args: [
        {
          name: 'amount',
          type: 'integer',
        },
      ],
    });
  }

  async run(message, [amount]) {
    if (!amount || amount < 2 || amount > 100) return message.reply('Silinecek mesaj adeti 2 ~ 100 aralığında olmalı!');
    const fetchedMessages = await message.channel.messages.fetch({ limit: amount });
    const filteredMessages = fetchedMessages.filter((msg) => {
      return msg.createdTimestamp > Date.now() - 1000 * 60 * 60 * 24 * 14;
    });
    message.channel.bulkDelete(filteredMessages).catch((err) => {
      message.channel.send(err.message).then((msg) => {
        msg.delete({ timeout: 3000 });
      });
    });
  }
};
