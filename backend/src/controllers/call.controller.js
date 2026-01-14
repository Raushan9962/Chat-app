import Call from "../models/Call.model.js";
import User from "../models/User.js";
import { v4 as uuidv4 } from "uuid";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Initiate a call
export const initiateCall = async (req, res) => {
  try {
    const { receiverId, callType } = req.body;
    const callerId = req.user._id;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Generate unique room ID
    const roomId = uuidv4();

    // Create call record
    const call = await Call.create({
      callerId,
      receiverId,
      callType,
      roomId,
      status: "ringing",
      startTime: new Date(),
    });

    // Populate user details
    const populatedCall = await Call.findById(call._id)
      .populate("callerId", "fullName profilePic email")
      .populate("receiverId", "fullName profilePic email");

    // Socket.io notification
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:incoming", {
        callerId,
        callType,
        roomId,
        callData: populatedCall,
      });
    }

    res.status(201).json({
      success: true,
      message: "Call initiated",
      call: populatedCall,
    });
  } catch (error) {
    console.error("Error in initiateCall:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// End a call
export const endCall = async (req, res) => {
  try {
    const { roomId, duration, endReason } = req.body;
    const userId = req.user._id;

    const call = await Call.findOne({ roomId });

    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    // Update call record
    call.status = "ended";
    call.duration = duration || 0;
    call.endTime = new Date();
    call.endReason = endReason || "completed";
    
    await call.save();

    // Notify both users via socket
    const populatedCall = await Call.findById(call._id)
      .populate("callerId", "fullName profilePic email")
      .populate("receiverId", "fullName profilePic email");

    const receiverSocketId = getReceiverSocketId(call.receiverId);
    const callerSocketId = getReceiverSocketId(call.callerId);

    [receiverSocketId, callerSocketId].forEach((socketId) => {
      if (socketId) {
        io.to(socketId).emit("call:ended", {
          roomId,
          duration,
          endReason,
          call: populatedCall,
        });
      }
    });

    res.status(200).json({
      success: true,
      message: "Call ended",
      call: populatedCall,
    });
  } catch (error) {
    console.error("Error in endCall:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get call history
export const getCallHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const calls = await Call.find({
      $or: [{ callerId: userId }, { receiverId: userId }],
    })
      .populate("callerId", "fullName profilePic email")
      .populate("receiverId", "fullName profilePic email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(calls);
  } catch (error) {
    console.error("Error in getCallHistory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get call by ID
export const getCallById = async (req, res) => {
  try {
    const { roomId } = req.params;

    const call = await Call.findOne({ roomId })
      .populate("callerId", "fullName profilePic email")
      .populate("receiverId", "fullName profilePic email");

    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    res.status(200).json(call);
  } catch (error) {
    console.error("Error in getCallById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update call status
export const updateCallStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { status } = req.body;

    const call = await Call.findOneAndUpdate(
      { roomId },
      { status },
      { new: true }
    )
      .populate("callerId", "fullName profilePic email")
      .populate("receiverId", "fullName profilePic email");

    if (!call) {
      return res.status(404).json({ message: "Call not found" });
    }

    res.status(200).json({
      success: true,
      message: "Call status updated",
      call,
    });
  } catch (error) {
    console.error("Error in updateCallStatus:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};