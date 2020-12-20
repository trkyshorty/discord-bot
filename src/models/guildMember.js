const mongoose = require('mongoose');

const guildMemberSchema = mongoose.Schema(
  {
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
    exp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    banned_at: {
      type: Date,
      default: null,
    },
    muted_at: {
      type: Date,
      default: null,
    },
    leaved_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

const GuildMember = mongoose.model('GuildMember', guildMemberSchema);

module.exports = GuildMember;
