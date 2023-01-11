const mongoose = require('mongoose')

const guildMemberSchema = mongoose.Schema({
  user_id: {
    type: String,
    ref: 'User.user_id',
    required: true,
  },
  guild_id: {
    type: String,
    ref: 'Guild.user_id',
    required: true,
  },
  experience: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 1,
  },
})

const GuildMember = mongoose.model('GuildMember', guildMemberSchema)

module.exports = GuildMember
