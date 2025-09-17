// --- src/server.js ---
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/message.route.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import socket setup
import { server, app as socketApp } from "./lib/socket.js";

// ✅ Setup __dirname manually (ESM doesn't have it)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env (Render will inject env vars automatically)
dotenv.config();

// ✅ use the same `app` instance from socket.js
const app = socketApp;

// Increase payload limit for JSON & URL encoded data
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.CLIENT_URL, // ✅ works on Render
    ],
    credentials: true,
  })
);

// Connect to database
connectDB();

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ✅ Start the server with socket.io attached
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Server is running on port: ${PORT}`);
});
