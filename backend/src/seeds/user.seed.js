// src/seeds/user.seed.js
import { config } from "dotenv";
import { connectDB } from "../lib/db.js";
import User from "../models/User.js";

config();



const seedUsers = [
  // Female Users
  {
    email: "emma.thompson@example.com",
    fullName: "Emma Thompson",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    email: "olivia.miller@example.com",
    fullName: "Olivia Miller",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    email: "sophia.davis@example.com",
    fullName: "Sophia Davis",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/women/3.jpg",
  },

  // Male Users
  {
    email: "liam.johnson@example.com",
    fullName: "Liam Johnson",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    email: "noah.smith@example.com",
    fullName: "Noah Smith",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    email: "james.wilson@example.com",
    fullName: "James Wilson",
    password: "123456",
    profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear old users (optional)
    await User.insertMany(seedUsers);
    console.log("✅ Database seeded successfully");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } 
};

// call the function
seedDatabase();

