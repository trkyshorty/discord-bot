import {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  Partials,
  REST,
  Routes,
  EmbedBuilder,
} from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '.env') })

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [
    Partials.User,
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
  ],
})

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .toJSON(),
  new SlashCommandBuilder()
    .setName('set-mod-channel')
    .setDescription('Moderasyon log kanalını ayarlar.')
    .addStringOption((option) =>
      option
        .setName('channel-id')
        .setDescription(
          "Log kanalı olarak kullanmak istediğiniz kanalın ID'sini girin."
        )
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .toJSON(),
]

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)

let MOD_CHANNEL_ID = process.env.MOD_CHANNEL_ID

const voiceJoinTimes = new Map()

async function registerCommands() {
  try {
    console.log('Started refreshing application (/) commands.')
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    })
    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
}

async function updateEnvVariable(key, value) {
  const envConfig = dotenv.parse(
    fs.readFileSync(path.resolve(__dirname, '.env'))
  )

  if (envConfig[key] === value) {
    console.log(`${key} zaten ${value} olarak ayarlanmış.`)
    return
  }

  envConfig[key] = value
  fs.writeFileSync(
    path.resolve(__dirname, '.env'),
    Object.keys(envConfig)
      .map((k) => `${k}=${envConfig[k]}`)
      .join('\n')
  )
  console.log(`${key} güncellendi: ${value}`)
}

async function logMessage(channel, color, author, thumbnail, description) {
  return channel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(color)
        .setAuthor({
          name: `${author.tag}`,
          iconURL: author.displayAvatarURL({ format: 'png', size: 2048 }),
        })
        .setThumbnail(thumbnail)
        .setDescription(description)
        .setTimestamp(),
    ],
  })
}

async function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours > 0 ? hours + ' saat, ' : ''}${minutes > 0 ? minutes + ' dakika, ' : ''}${secs} saniye`
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`)
  await registerCommands()
})

client.on('userUpdate', async (oldUser, newUser) => {
  const oldAvatar = oldUser.displayAvatarURL({ format: 'png', size: 2048 })
  const newAvatar = newUser.displayAvatarURL({ format: 'png', size: 2048 })

  if (oldAvatar !== newAvatar) {
    try {
      const channel = await client.channels.fetch(MOD_CHANNEL_ID)
      await logMessage(
        channel,
        '#FFCC00',
        newUser,
        newAvatar,
        `🖼️ ${newUser.tag} avatarını değiştirdi\n\nEski: [Link](${oldAvatar})\nYeni: [Link](${newAvatar})`
      )
    } catch (err) {
      console.error('Avatar güncellenirken hata oluştu:', err)
    }
  }
})

client.on('messageDelete', async (message) => {
  try {
    const channel = await client.channels.fetch(MOD_CHANNEL_ID)
    if (message.embeds.length > 0) {
      const embedData = message.embeds[0]
      await logMessage(
        channel,
        '#FF0000',
        message.author,
        message.author.displayAvatarURL({ format: 'png', size: 2048 }),
        `💡 ${message.author} mesajı silindi\n\n${embedData.title || ''}\n${embedData.description || ''}`
      )
    } else {
      await logMessage(
        channel,
        '#FF0000',
        message.author,
        message.author.displayAvatarURL({ format: 'png', size: 2048 }),
        `💡 ${message.author} mesajı silindi\n\n${message.content || ''}`
      )
    }
  } catch (err) {
    console.error('Mesaj gönderilirken bir hata oluştu:', err)
  }
})

client.on('messageUpdate', async (oldMessage, newMessage) => {
  if (oldMessage.content !== newMessage.content) {
    try {
      const channel = await client.channels.fetch(MOD_CHANNEL_ID)
      const oldContent =
        oldMessage.content.slice(0, 1021) +
        (oldMessage.content.length > 1024 ? '...' : '')

      await logMessage(
        channel,
        '#FFCC00',
        oldMessage.author,
        oldMessage.author.displayAvatarURL({ format: 'png', size: 2048 }),
        `✏️ ${oldMessage.author} bir **[mesajını](https://discordapp.com/channels/${oldMessage.channel.guild.id}/${oldMessage.channel.id}/${oldMessage.id})** değiştirdi
                 \n${oldContent || 'Eski mesaj boş.'}`
      )
    } catch (err) {
      console.error('Mesaj gönderilirken bir hata oluştu:', err)
    }
  }
})

client.on('guildMemberAdd', async (member) => {
  try {
    const channel = await client.channels.fetch(MOD_CHANNEL_ID)
    await logMessage(
      channel,
      '#33FF00',
      member.user,
      member.user.displayAvatarURL({ format: 'png', size: 2048 }),
      `💡 ${member.user} sunucuya katıldı`
    )
  } catch (err) {
    console.error('Üye katıldı mesajı gönderilirken hata oluştu:', err)
  }
})

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  if (oldMember.nickname !== newMember.nickname) {
    try {
      const channel = await client.channels.fetch(MOD_CHANNEL_ID)
      await logMessage(
        channel,
        '#FFCC00',
        newMember.user,
        newMember.user.displayAvatarURL({ format: 'png', size: 2048 }),
        `📝 ${newMember.user} nickname değiştirdi\n\n**Eski**: ${oldMember.nickname || oldMember.user.username}\n**Yeni**: ${newMember.nickname || newMember.user.username}`
      )
    } catch (err) {
      console.error('Nickname güncellenirken hata oluştu:', err)
    }
  }
})

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const oldRoles = oldMember.roles.cache.map((role) => `${role}`).join(', ')
  const newRoles = newMember.roles.cache.map((role) => `${role}`).join(', ')

  if (oldRoles !== newRoles) {
    try {
      const channel = await client.channels.fetch(MOD_CHANNEL_ID)
      await logMessage(
        channel,
        '#FFCC00',
        newMember.user,
        newMember.user.displayAvatarURL({ format: 'png', size: 2048 }),
        `🎭 ${newMember.user} rolleri değişti\n\n**Eski**: ${oldRoles}\n**Yeni**: ${newRoles}`
      )
    } catch (err) {
      console.error('Rol güncellemesi loglanırken hata oluştu:', err)
    }
  }
})

client.on('guildMemberRemove', async (member) => {
  try {
    const channel = await client.channels.fetch(MOD_CHANNEL_ID)
    await logMessage(
      channel,
      '#FF0000',
      member.user,
      member.user.displayAvatarURL({ format: 'png', size: 2048 }),
      `💡 ${member.user} sunucudan ayrıldı`
    )
  } catch (err) {
    console.error('Üye ayrıldı mesajı gönderilirken hata oluştu:', err)
  }
})

client.on('voiceStateUpdate', async (oldState, newState) => {
  const oldChannel = oldState.channel
  const newChannel = newState.channel

  try {
    const channel = await client.channels.fetch(MOD_CHANNEL_ID)
    const user = newState.member.user
    const userId = user.id

    if (!oldChannel && newChannel) {
      voiceJoinTimes.set(userId, Date.now())
      await logMessage(
        channel,
        '#33FF00',
        user,
        user.displayAvatarURL({ format: 'png', size: 2048 }),
        `🔊 ${user} ses kanalına katıldı **${newChannel.name}**`
      )
    } else if (oldChannel && !newChannel) {
      const joinTime = voiceJoinTimes.get(userId)
      const timeSpent = joinTime
        ? Math.floor((Date.now() - joinTime) / 1000)
        : 0
      const duration = await formatDuration(timeSpent)

      voiceJoinTimes.delete(userId)
      await logMessage(
        channel,
        '#FF0000',
        user,
        user.displayAvatarURL({ format: 'png', size: 2048 }),
        `🔊 ${user} ses kanalından ayrıldı **${oldChannel.name}**\n\n**Kanalda geçirilen süre**: ${duration}`
      )
    } else if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
      const joinTime = voiceJoinTimes.get(userId)
      const timeSpent = joinTime
        ? Math.floor((Date.now() - joinTime) / 1000)
        : 0
      const duration = await formatDuration(timeSpent)

      voiceJoinTimes.set(userId, Date.now())
      await logMessage(
        channel,
        '#FFCC00',
        user,
        user.displayAvatarURL({ format: 'png', size: 2048 }),
        `🔊 ${user} **${oldChannel.name}** kanalından **${newChannel.name}** kanalına geçti\n\n**Önceki kanalda geçirilen süre**: ${duration}`
      )
    }
  } catch (err) {
    console.error('Ses durumu güncellenirken hata oluştu:', err)
  }
})

client.on('presenceUpdate', async (oldPresence, newPresence) => {
  const oldStatus = oldPresence ? oldPresence.status : 'offline'
  const newStatus = newPresence.status

  if (oldStatus !== newStatus) {
    try {
      const channel = await client.channels.fetch(MOD_CHANNEL_ID)
      await logMessage(
        channel,
        '#FFCC00',
        newPresence.user,
        newPresence.user.displayAvatarURL({ format: 'png', size: 2048 }),
        `🔔 ${newPresence.user.tag} durumu değişti ${oldStatus} -> ${newStatus}`
      )
    } catch (err) {
      console.error('Presence güncellenirken hata oluştu:', err)
    }
  }
})

client.on('channelCreate', async (channel) => {
  try {
    const modChannel = await client.channels.fetch(MOD_CHANNEL_ID)
    await logMessage(
      modChannel,
      '#33FF00',
      client.user,
      client.user.displayAvatarURL({ format: 'png', size: 2048 }),
      `📁 Yeni kanal oluşturuldu **${channel.name}** (ID: ${channel.id})`
    )
  } catch (err) {
    console.error('Kanal oluşturma loglanırken hata oluştu:', err)
  }
})

client.on('channelDelete', async (channel) => {
  try {
    const modChannel = await client.channels.fetch(MOD_CHANNEL_ID)
    await logMessage(
      modChannel,
      '#FF0000',
      client.user,
      client.user.displayAvatarURL({ format: 'png', size: 2048 }),
      `🗑️ Kanal silindi **${channel.name}** (ID: ${channel.id})`
    )
  } catch (err) {
    console.error('Kanal silme loglanırken hata oluştu:', err)
  }
})

client.on('roleCreate', async (role) => {
  try {
    const channel = await client.channels.fetch(MOD_CHANNEL_ID)
    await logMessage(
      channel,
      '#33FF00',
      client.user,
      client.user.displayAvatarURL({ format: 'png', size: 2048 }),
      `🛠️ Yeni rol oluşturuldu: **${role.name}** (ID: ${role.id})`
    )
  } catch (err) {
    console.error('Rol oluşturma loglanırken hata oluştu:', err)
  }
})

client.on('roleDelete', async (role) => {
  try {
    const channel = await client.channels.fetch(MOD_CHANNEL_ID)
    await logMessage(
      channel,
      '#FF0000',
      client.user,
      client.user.displayAvatarURL({ format: 'png', size: 2048 }),
      `🛠️ Rol silindi **${role.name}** (ID: ${role.id})`
    )
  } catch (err) {
    console.error('Rol silme loglanırken hata oluştu:', err)
  }
})

client.on('roleUpdate', async (oldRole, newRole) => {
  if (oldRole.name !== newRole.name) {
    try {
      const channel = await client.channels.fetch(MOD_CHANNEL_ID)
      await logMessage(
        channel,
        '#FFCC00',
        client.user,
        client.user.displayAvatarURL({ format: 'png', size: 2048 }),
        `🔧 Rol ismi güncellendi\n\n**Eski**: ${oldRole.name}\n**Yeni**: ${newRole.name}`
      )
    } catch (err) {
      console.error('Rol ismi güncellenirken hata oluştu:', err)
    }
  }
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!')
  }

  if (interaction.commandName === 'set-mod-channel') {
    MOD_CHANNEL_ID = interaction.options.getString('channel-id')
    updateEnvVariable('MOD_CHANNEL_ID', MOD_CHANNEL_ID)
    await interaction.reply(
      `Moderasyon log kanalı olarak <#${MOD_CHANNEL_ID}> ayarlandı!`
    )
  }
})

client.login(process.env.TOKEN)
