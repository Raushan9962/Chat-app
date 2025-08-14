// --- src/server.js ---
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import messageRoutes from './routes/message.route.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname manually (ESM doesn't have it)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from specific directory using path
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Increase payload limit for JSON & URL encoded data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"], // allow both
  credentials: true
}));

// Connect to database
connectDB();

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port: ${PORT}`);
});
