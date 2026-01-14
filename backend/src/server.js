import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./lib/db.js";
import { setupSocket } from "./lib/socket.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Connect to database
connectDB();

// Setup Socket.IO
setupSocket(io);

// Import routes
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import videoRoutes from "./routes/video.route.js";
import meetingRoutes from "./routes/meeting.route.js";

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/meetings", meetingRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
});