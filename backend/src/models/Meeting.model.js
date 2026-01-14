import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    leftAt: Date,
  }],
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  settings: {
    allowScreenShare: {
      type: Boolean,
      default: true,
    },
    allowChat: {
      type: Boolean,
      default: true,
    },
    allowRecording: {
      type: Boolean,
      default: false,
    },
    muteOnEntry: {
      type: Boolean,
      default: false,
    },
  },
  recordingUrl: String,
}, {
  timestamps: true,
});

export default mongoose.model("Meeting", meetingSchema);