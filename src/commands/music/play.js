const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const { MessageEmbed } = require('discord.js');
const { Command } = require('../../system');

class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: ['play', 'p', 'çal'],

      clientPermissions: ['ADMINISTRATOR'],
      userPermissions: [],
      moderatorOnly: false,
      ownerOnly: false,

      args: [
        {
          name: 'search',
          type: 'string',
        },
      ],
    });
  }

  /**
   * @param {Message} message
   * @param {String} color
   */
  messageEmbeed(message, color = '#0099ff') {
    const messageEmbed = new MessageEmbed();
    messageEmbed.setDescription(message).setColor(color);
    return messageEmbed;
  }

  /** @param {String} search */
  async getSongs(search) {
    const node = this.client.manager.idealNodes[0];

    const params = new URLSearchParams();
    params.append('identifier', search);

    return fetch(`http://${node.host}:${node.port}/loadtracks?${params}`, {
      headers: { Authorization: node.password },
    })
      .then((res) => res.json())
      .then((data) => data.tracks)
      .catch((err) => this.logger.warn(err));
  }

  /**
   * @param {Guild} guild
   * @param {Object} song
   */
  async play(guild, song) {
    const serverQueue = this.client.queue.get(guild.id);
    if (!song) {
      this.client.user.setActivity(`👀 |`, { type: 'WATCHING' });
      this.client.queue.delete(guild.id);
      return;
    }

    await serverQueue.player.play(song.track);

    serverQueue.player.once('error', (error) => console.error(error));
    serverQueue.player.once('end', (data) => {
      if (data.reason === 'REPLACED') return false;
      serverQueue.songs.shift();
      this.play(guild, serverQueue.songs[0]);
    });

    this.client.user.setActivity(`🎵 | ${song.info.title}`, { type: 'WATCHING' });

    serverQueue.textChannel.send(
      this.messageEmbeed(`🎵 Çalınıyor [${song.info.title}](${song.info.uri}) [ ${song.requested} ]`, '#00FF00')
    );
  }

  /**
   * @param {Message} message
   * @param {Array} search
   */
  run(message, [search]) {
    if (!search) return;
    if (!message.member.voice.channel)
      return message
        .reply(this.messageEmbeed('Önce bir ses kanalına girmen gerekiyor', '#FF0000'))
        .catch(console.error);

    let searchString = `ytsearch:${search}`;
    if (search.match(/\b(https?:\/\/.*?\.[a-z]{2,4}\/[^\s]*\b)/g)) searchString = `${search}`;

    this.getSongs(`${searchString}`).then(async (songs) => {
      if (!songs || !songs[0]) {
        this.client.queue.delete(message.guild.id);
        return message.reply(this.messageEmbeed(`${search} bulunamadı`, '#FF0000')).catch(console.error);
      }

      Object.assign(songs[0], { requested: message.author });

      const serverQueue = this.client.queue.get(message.guild.id);

      if (!serverQueue) {
        const queueContruct = {
          textChannel: message.channel,
          voiceChannel: message.member.voice.channel,
          connection: null,
          songs: [],
          volume: 5,
          playing: true,
          player: await this.client.manager.join({
            guild: message.guild.id,
            channel: message.member.voice.channelID,
            node: '1',
          }),
        };

        this.client.queue.set(message.guild.id, queueContruct);
        queueContruct.songs.push(songs[0]);
        await this.play(message.guild, queueContruct.songs[0]);
      } else {
        serverQueue.songs.push(songs[0]);
        serverQueue.textChannel
          .send(
            this.messageEmbeed(
              `🎵 Sıraya alındı [${songs[0].info.title}](${songs[0].info.uri}) [ ${songs[0].requested} ]`,
              '#00FF00'
            )
          )
          .catch((err) => this.logger.warn(err));
      }
    });
  }
}

module.exports = PlayCommand;
