import Meeting from "../models/Meeting.model.js";
import { v4 as uuidv4 } from "uuid";

// Schedule a future meeting
export const scheduleMeeting = async (req, res) => {
  try {
    const {
      title,
      description,
      scheduledTime,
      duration,
      participants,
      settings
    } = req.body;

    const hostId = req.user._id;
    const roomId = uuidv4().split('-')[0];

    const meeting = new Meeting({
      roomId,
      hostId,
      title,
      description,
      scheduledTime: new Date(scheduledTime),
      duration,
      invitedParticipants: participants || [],
      settings: {
        allowScreenShare: settings?.allowScreenShare ?? true,
        allowChat: settings?.allowChat ?? true,
        allowRecording: settings?.allowRecording ?? false,
        muteOnEntry: settings?.muteOnEntry ?? false,
      },
      isActive: false,
      isScheduled: true,
    });

    await meeting.save();

    res.status(201).json({
      success: true,
      meeting,
    });
  } catch (error) {
    console.error("Error scheduling meeting:", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule meeting",
    });
  }
};

// Get scheduled meetings
export const getScheduledMeetings = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const meetings = await Meeting.find({
      hostId: userId,
      isScheduled: true,
      scheduledTime: { $gt: now },
    }).sort({ scheduledTime: 1 });

    res.status(200).json({
      success: true,
      meetings,
    });
  } catch (error) {
    console.error("Error getting scheduled meetings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get scheduled meetings",
    });
  }
};

// Update meeting
export const updateMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const updates = req.body;

    const meeting = await Meeting.findOneAndUpdate(
      { _id: meetingId, hostId: req.user._id },
      updates,
      { new: true }
    );

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
    console.error("Error updating meeting:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update meeting",
    });
  }
};

// Delete meeting
export const deleteMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOneAndDelete({
      _id: meetingId,
      hostId: req.user._id,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Meeting deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete meeting",
    });
  }
};