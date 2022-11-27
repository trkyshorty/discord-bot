const mongoose = require('mongoose')

const guildSchema = mongoose.Schema({
  guild_id: {
    type: String,
    required: true,
  },
  reaction_role: [{ message_id: String, emoji: String, role_id: String }],
  level: {
    rewards: [{ role_id: String, level: Number }],
    no_experience_roles: [String],
    no_experience_channels: [String],
  },
  log_channel: { type: String, default: '0' },
})

const Guild = mongoose.model('Guild', guildSchema)

module.exports = Guild
