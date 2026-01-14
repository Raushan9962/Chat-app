import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  scheduleMeeting,
  getScheduledMeetings,
  updateMeeting,
  deleteMeeting,
} from "../controllers/meeting.controller.js";

const router = express.Router();

router.post("/schedule", protectRoute, scheduleMeeting);
router.get("/scheduled", protectRoute, getScheduledMeetings);
router.put("/:meetingId", protectRoute, updateMeeting);
router.delete("/:meetingId", protectRoute, deleteMeeting);

export default router;