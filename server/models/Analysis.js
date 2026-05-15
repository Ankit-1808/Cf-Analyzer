const mongoose = require("mongoose");

const { Schema } = mongoose;

const analysisSchema = new Schema(
  {
    handleOriginal: {
      type: String,
      required: true,
      trim: true
    },
    handleLower: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true
    },
    profile: {
      type: Schema.Types.Mixed,
      required: true
    },
    stats: {
      type: Schema.Types.Mixed,
      required: true
    },
    studyPlan: {
      type: Schema.Types.Mixed,
      required: true
    },
    meta: {
      fallbackUsed: {
        type: Boolean,
        default: false
      }
    },
    generatedAt: {
      type: Date,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: {
        expireAfterSeconds: 0
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Analysis || mongoose.model("Analysis", analysisSchema);
