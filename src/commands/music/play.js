const { Command, PermissionFlagsBits } = require('../../bot')
const { decode } = require('lavaclient')

class Play extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      description: "Call a music player to voice channel",
      aliases: ['play', 'p'],

      clientPermissions: PermissionFlagsBits.Connect | PermissionFlagsBits.Speak,
      memberPermissions: PermissionFlagsBits.Connect | PermissionFlagsBits.Speak,

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

  async run (term) {
    if (!this.client.lavalink) return

    const member = this.interaction.member
    const guild = member.guild
    const voiceChannel = member.voice.channel
    const interactionChannel = this.interaction.channel

    let player = this.client.players.get(guild.id)

    if (player && player.queue.voiceChannel !== voiceChannel) {
      return this.interaction.reply({
        embeds: [{
          description: `⛔ Music player is busy, you can listen on **${voiceChannel}** channel`
        }],
        ephemeral: true
      })
    }

    if (!voiceChannel) {
      return this.interaction.reply({
        embeds: [{
          description: `⛔ You can't listen to music without entering the voice channel`
        }],
        ephemeral: true
      })
    }

    let tracks = []

    const results = await this.client.lavalink.rest.loadTracks(
      /^https?:\/\//.test(term) ? term : `ytsearch:${term}`
    )

    switch (results.loadType) {
      case 'LOAD_FAILED':
      case 'NO_MATCHES':
        return this.interaction.reply({
          embeds: [{
            description: `⛔ Track not found or failed to load`
          }],
          ephemeral: true
        })
      case 'PLAYLIST_LOADED':
        tracks = results.tracks
        this.interaction.reply({
          embeds: [{
            description: `🎵 Playlist[**${results.playlistInfo.name}**](${this.argument(0)}) loaded and **${tracks.length
              }** songs queued`
          }],
          ephemeral: false
        })
        break
    }

    if (!player) {
      player = this.client.lavalink.createPlayer(guild.id)

      player.queue.interactionChannel = interactionChannel
      player.queue.voiceChannel = voiceChannel

      const filter = interaction => {
        return interaction.customId === 'resume'
          || interaction.customId === 'pause'
          || interaction.customId === 'skip'
          || interaction.customId === 'leave'
      }

      player.queue.collector = player.queue.interactionChannel.createMessageComponentCollector({ filter, time: 3600000 })

      player.queue.collector.on('collect', async interaction => {
        try {
          console.info(`[BUTTON] ${interaction.customId} button executed`)
          
          const command = this.client.commands.get(interaction.customId)
          if (command)
            command.execute(interaction)
        } catch (error) {
          console.error(error)
        }
      })

      player.queue.collector.on('end', collected => console.log(`Collected Music Player ${collected.size} items`))

      await player.connect(voiceChannel.id, { deafened: true })
        .on('trackStart', (track) => this.client.emit("trackStart", guild, decode(track)))
        .on('trackEnd', (track) => this.client.emit("trackEnd", guild, decode(track)))

      this.client.players.set(guild.id, player)
    }

    switch (results.loadType) {
      case 'TRACK_LOADED':
      case 'SEARCH_RESULT':
        {
          const [track] = results.tracks
          tracks = [track]
          this.client.emit("trackQueueAdd", this.interaction, track.info)
        }
        break
    }

    const started = player.playing || player.paused

    player.queue.add(tracks, { requester: member.id, next: false })

    if (!started) {
      await player.queue.start()
    }
  }
}

module.exports = Play
