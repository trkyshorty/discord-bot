const mongoose = require('mongoose');

const guildSchema = mongoose.Schema(
  {
    guild_id: {
      type: String,
      required: true,
    },
    leaved_at: {
      type: Date,
      default: null,
    },
    plugins: {
      reaction_role: {
        enable: { type: Boolean, default: true },
        take: [{ channel_id: String, emoji: String, role_id: String }],
        give: [{ channel_id: String, emoji: String, role_id: String }],
      },
      moderation: {
        enable: { type: Boolean, default: true },
        mute_timeout: { type: Number, default: 60 * 60 * 24 }, // 24 hours
        ban_timeout: { type: Number, default: 60 * 60 * 24 * 7 }, // 7 Days
        log_channel: String,
        roles: [String],
      },
      level: {
        enable: { type: Boolean, default: true },
        rewards: [{ role_id: String, level: Number }],
        no_xp_roles: [String],
        no_xp_channels: [String],
      },
    },
  },
  {
    timestamps: false,
  }
);

const Guild = mongoose.model('Guild', guildSchema);

module.exports = Guild;
