import User from "../models/User.js";
import Message from "../models/Message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId } from "../lib/socket.js"; // ✅ Remove io import here

// ---------------- Get Users ----------------
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------- Get Messages ----------------
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }); // oldest -> newest

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------- Send Message ----------------
export const sendMessage = async (req, res) => {
  try {
    const { text, image, type, callDuration, callStatus } = req.body; // ✅ Added call fields
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId: userToChatId,
      text,
      image: imageUrl,
      type: type || 'text', // ✅ Added message type
      callDuration, // ✅ For video calls
      callStatus, // ✅ For video calls
    });

    await newMessage.save();

    // ✅ Get receiver socket id
    const receiverSocketId = getReceiverSocketId(userToChatId);

    // ✅ Get io instance properly
    import('../lib/socket.js').then(({ io }) => {
      if (receiverSocketId && io) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    }).catch(err => {
      console.error("Error importing socket:", err);
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------- Delete Message ----------------
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const deletedMessage = await Message.findByIdAndDelete(messageId);
    if (!deletedMessage) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------- Mark Messages as Read ----------------
export const markAsRead = async (req, res) => {
  try {
    const { messageIds } = req.body;
    const myId = req.user._id;

    await Message.updateMany(
      { 
        _id: { $in: messageIds },
        receiverId: myId 
      },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error in markAsRead:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};