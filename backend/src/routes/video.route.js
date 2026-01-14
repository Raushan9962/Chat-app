import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createMeeting,
  joinMeeting,
  endMeeting,
  getMeetingDetails,
  getUserMeetings,
} from "../controllers/video.controller.js";

const router = express.Router();

router.post("/create-meeting", protectRoute, createMeeting);
router.get("/join/:roomId", protectRoute, joinMeeting);
router.post("/end/:roomId", protectRoute, endMeeting);
router.get("/details/:roomId", protectRoute, getMeetingDetails);
router.get("/my-meetings", protectRoute, getUserMeetings);

export default router;