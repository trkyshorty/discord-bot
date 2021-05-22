const { Command } = require('../../system');
const fetch = require('node-fetch');

class WatchCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'watch',
      aliases: ['watch', 'izle'],

      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: [],
      moderatorOnly: false,
      ownerOnly: false,
    });
  }

  async run(message) {
    var watchPartyChannels = ["845647868902768690", "845648089355649055", "845648157174136902", "845648211493650432", "845648237150076948"];
    watchPartyChannels.reverse();
    var availableChannel;
    watchPartyChannels.forEach((entry) => {
      let channel = message.guild.channels.cache.get(entry);
      const channelMemberSize = channel.members.size;
      if (channelMemberSize > 0) return;
      availableChannel = channel;
    });

    if (!availableChannel) return message.channel.send("**Henüz musait bir izleme kanalı yok**");

    fetch(`https://discord.com/api/v8/channels/${availableChannel.id}/invites`, {
      method: "POST",
      body: JSON.stringify({
        max_age: 86400,
        max_uses: 0,
        target_application_id: "755600276941176913",
        target_type: 2,
        temporary: false,
        validate: null
      }),
      headers: {
        "Authorization": `Bot ${process.env.BOT_TOKEN}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(invite => {
        message.channel.send(`**YouTube \`${invite.channel.name}\` adlı kanalda başlatılıyor. İzlemek için lütfen <https://discord.gg/${invite.code}> tıklayınız.**`);
      })
      .catch(e => {
        console.info(e)
        message.channel.send("**Hata, YouTube başlatılamadı.**");
      })
  }
}

module.exports = WatchCommand;
