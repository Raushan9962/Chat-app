import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
  },
  image: {
    type: String,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'file', 'call'],
    default: 'text',
  },
  callDuration: {
    type: Number, // in seconds
    default: 0,
  },
  callStatus: {
    type: String,
    enum: ['missed', 'answered', 'rejected', 'ended'],
  },
  read: {
    type: Boolean,
    default: false,
  },
  delivered: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for faster querying
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, read: 1 });

export default mongoose.model("Message", messageSchema);