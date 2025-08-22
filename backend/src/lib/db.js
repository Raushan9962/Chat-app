import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // ✅ loads .env

export const connectDB = async () => {
  try {
    console.log("🔍 MONGODB_URI:", process.env.MONGODB_URI); // debug

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Database connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};
