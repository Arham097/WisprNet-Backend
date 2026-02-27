const mongoose = require("mongoose");

const emergencyMessageSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: [true, "messageId is required"],
      unique: true,
      trim: true,
    },
    fromNumber: {
      type: String,
      required: [true, "fromNumber is required"],
      trim: true,
    },
    toNumber: {
      type: String,
      required: [true, "toNumber is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "content is required"],
      trim: true,
    },
    ttl: {
      type: Number,
      default: 5,
    },
    meshTimestamp: {
      // original timestamp from the mesh packet
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "failed"],
      default: "pending",
    },
    twilioSid: {
      type: String,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const EmergencyMessage = mongoose.model(
  "EmergencyMessage",
  emergencyMessageSchema
);

module.exports = EmergencyMessage;
