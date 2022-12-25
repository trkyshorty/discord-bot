const { Command, PermissionFlagsBits } = require('../../bot')
const { SpotifyItemType } = require('@lavaclient/spotify')
const { decode } = require('lavaclient')

class Play extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      description: 'Call a music player to voice channel',
      aliases: ['play', 'p'],
      category: 'music',

      clientPermissions:
        PermissionFlagsBits.Connect | PermissionFlagsBits.Speak,
      memberPermissions:
        PermissionFlagsBits.Connect | PermissionFlagsBits.Speak,

      args: [
        {
          name: 'term-or-link',
          description: 'Enter the link or name of the song',
          type: 'string',
          required: true,
        },
      ],
    })
  }

  async run(term) {
    if (!this.client.lavalink)
      return this.interaction
        .reply({
          embeds: [
            {
              description: `⛔ Lavalink is not ready`,
            },
          ],
          ephemeral: true,
        })
        .catch((err) => this.logger.error(err))

    let player = this.client.players.get(this.interaction.member.guild.id)

    if (
      player &&
      player.queue.voiceChannel !== this.interaction.member.voice.channel
    ) {
      return this.interaction
        .reply({
          embeds: [
            {
              description: `⛔ Music player is busy, you can listen on **${this.interaction.member.voice.channel}** channel`,
            },
          ],
          ephemeral: true,
        })
        .catch((err) => this.logger.error(err))
    }

    if (!this.interaction.member.voice.channel) {
      return this.interaction
        .reply({
          embeds: [
            {
              description: `⛔ You can't listen to music without entering the voice channel`,
            },
          ],
          ephemeral: true,
        })
        .catch((err) => this.logger.error(err))
    }

    this.interaction.deferReply().catch((err) => this.logger.error(err))

    if (this.client.lavalink.spotify.isSpotifyUrl(term))
      this.playWithSpotify(player, term)
    else this.playWithYoutube(player, term)
  }

  async playWithSpotify(player, term) {
    let tracks = []

    const results = await this.client.lavalink.spotify.load(term)

    switch (results?.type) {
      case SpotifyItemType.Track:
        {
          const track = await results.resolveYoutubeTrack()

          tracks = [track]
          this.client.emit('trackQueueAdd', this.interaction, track.info)
        }
        break
      case SpotifyItemType.Artist:
        // Getting Artist Top Track
        tracks = await results.resolveYoutubeTracks() 
        this.client.emit('trackQueueAdd', this.interaction, tracks.info)
        break
      case SpotifyItemType.Album:
      case SpotifyItemType.Playlist:
        tracks = await results.resolveYoutubeTracks()

        this.interaction.channel
          .send({
            embeds: [
              {
                description: `🎵 Queued **${
                  tracks.length
                } tracks** from ${SpotifyItemType[
                  results.type
                ].toLowerCase()} [**${results.name}**](${term}).`,
              },
            ],
            ephemeral: false,
          })
          .catch((err) => this.logger.error(err))
        break
      default:
        return this.interaction.channel
          .send({
            embeds: [
              {
                description: `⛔ Track not found or failed to load`,
              },
            ],
            ephemeral: true,
          })
          .catch((err) => this.logger.error(err))
    }

    this.play(player, tracks)
  }

  async playWithYoutube(player, term) {
    let tracks = []

    const results = await this.client.lavalink.rest.loadTracks(
      /^https?:\/\//.test(term) ? term : `ytsearch:${term}`
    )

    switch (results.loadType) {
      case 'LOAD_FAILED':
      case 'NO_MATCHES':
        return this.interaction.channel
          .send({
            embeds: [
              {
                description: `⛔ Track not found or failed to load`,
              },
            ],
            ephemeral: true,
          })
          .catch((err) => this.logger.error(err))
      case 'TRACK_LOADED':
      case 'SEARCH_RESULT':
        {
          const [track] = results.tracks
          tracks = [track]
          this.client.emit('trackQueueAdd', this.interaction, track.info)
        }
        break
      case 'PLAYLIST_LOADED':
        tracks = results.tracks
        this.interaction.channel
          .send({
            embeds: [
              {
                description: `🎵 Queued playlist [**${results.playlistInfo.name}**](${term}), it has a total of **${tracks.length}** tracks.`,
              },
            ],
            ephemeral: false,
          })
          .catch((err) => this.logger.error(err))
        break
    }

    this.play(player, tracks)
  }

  async play(player, tracks) {
    if (!player || !player?.connected) {
      player = this.client.lavalink.createPlayer(
        this.interaction.member.guild.id
      )

      player.queue.interactionChannel = this.interaction.channel
      player.queue.voiceChannel = this.interaction.member.voice.channel

      const filter = (interaction) => {
        return (
          interaction.customId === 'resume' ||
          interaction.customId === 'pause' ||
          interaction.customId === 'skip' ||
          interaction.customId === 'leave'
        )
      }

      player.queue.collector =
        player.queue.interactionChannel.createMessageComponentCollector({
          filter,
          time: 3600000,
        })

      player.queue.collector.on('collect', async (interaction) => {
        try {
          this.logger.info(
            `[COLLECTOR] ${interaction.customId} button executed`
          )

          const command = this.client.commands.get(interaction.customId)
          if (command) command.execute(interaction)
        } catch (error) {
          this.logger.error(error)
        }
      })

      player.queue.collector.on('end', (collected) =>
        console.log(
          `[COLLECTOR] Collected Music Player ${collected.size} items`
        )
      )

      await player
        .connect(this.interaction.member.voice.channel.id, { deafened: true })
        .on('trackStart', (track) =>
          this.client.emit(
            'trackStart',
            this.interaction.member.guild,
            decode(track)
          )
        )
        .on('trackEnd', (track) =>
          this.client.emit(
            'trackEnd',
            this.interaction.member.guild,
            decode(track)
          )
        )

      this.client.emit('musicPlayerReady', player)

      this.client.players.set(this.interaction.member.guild.id, player)
    }

    const started = player.playing || player.paused

    player.queue.add(tracks, {
      requester: this.interaction.member.id,
      next: false,
    })

    if (!started) {
      await player.queue.start()
    }

    this.interaction.deleteReply().catch((err) => this.logger.error(err))
  }
}

module.exports = Play
