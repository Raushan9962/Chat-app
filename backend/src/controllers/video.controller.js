import Meeting from "../models/Meeting.model.js";
import { v4 as uuidv4 } from "uuid";

// Create a new meeting
export const createMeeting = async (req, res) => {
  try {
    const { title, description, settings } = req.body;
    const hostId = req.user._id;

    const roomId = uuidv4().split('-')[0]; // Simple room ID

    const meeting = new Meeting({
      roomId,
      hostId,
      title: title || "New Meeting",
      description,
      settings: {
        allowScreenShare: settings?.allowScreenShare ?? true,
        allowChat: settings?.allowChat ?? true,
        allowRecording: settings?.allowRecording ?? false,
        muteOnEntry: settings?.muteOnEntry ?? false,
      },
      participants: [{
        userId: hostId,
        joinedAt: new Date(),
      }],
    });

    await meeting.save();

    res.status(201).json({
      success: true,
      meeting: {
        roomId: meeting.roomId,
        title: meeting.title,
        hostId: meeting.hostId,
        settings: meeting.settings,
        startTime: meeting.startTime,
      },
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to create meeting" 
    });
  }
};

// Join a meeting
export const joinMeeting = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const meeting = await Meeting.findOne({ roomId, isActive: true });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found or has ended",
      });
    }

    // Check if user is already a participant
    const existingParticipant = meeting.participants.find(
      p => p.userId.toString() === userId.toString() && !p.leftAt
    );

    if (!existingParticipant) {
      meeting.participants.push({
        userId,
        joinedAt: new Date(),
      });
      await meeting.save();
    }

    res.status(200).json({
      success: true,
      meeting: {
        roomId: meeting.roomId,
        title: meeting.title,
        hostId: meeting.hostId,
        settings: meeting.settings,
        participants: meeting.participants.filter(p => !p.leftAt),
      },
    });
  } catch (error) {
    console.error("Error joining meeting:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join meeting",
    });
  }
};

// End a meeting
export const endMeeting = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user._id;

    const meeting = await Meeting.findOne({ roomId, hostId: userId });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found or you are not the host",
      });
    }

    meeting.isActive = false;
    meeting.endTime = new Date();
    await meeting.save();

    res.status(200).json({
      success: true,
      message: "Meeting ended successfully",
    });
  } catch (error) {
    console.error("Error ending meeting:", error);
    res.status(500).json({
      success: false,
      message: "Failed to end meeting",
    });
  }
};

// Get meeting details
export const getMeetingDetails = async (req, res) => {
  try {
    const { roomId } = req.params;

    const meeting = await Meeting.findOne({ roomId })
      .populate("hostId", "username fullName avatar")
      .populate("participants.userId", "username fullName avatar");

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    res.status(200).json({
      success: true,
      meeting,
    });
  } catch (error) {
    console.error("Error getting meeting details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get meeting details",
    });
  }
};

// Get user's meetings
export const getUserMeetings = async (req, res) => {
  try {
    const userId = req.user._id;

    const meetings = await Meeting.find({
      $or: [
        { hostId: userId },
        { "participants.userId": userId }
      ],
      isActive: false, // Get past meetings
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("hostId", "username fullName avatar");

    res.status(200).json({
      success: true,
      meetings,
    });
  } catch (error) {
    console.error("Error getting user meetings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get meetings",
    });
  }
};