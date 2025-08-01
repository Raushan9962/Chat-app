// --- src/server.js ---
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.route.js';

import path from 'path';
import { fileURLToPath } from 'url';

// ✅ Setup __dirname manually (ESM doesn't have it)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load .env from specific directory using path
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(express.json());

// ✅ Connect to database
connectDB();

// ✅ Mount routes
app.use('/api/auth', authRoutes);

// ✅ Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port: ${PORT}`);
});
