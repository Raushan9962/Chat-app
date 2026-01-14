import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Set cookie with token
const setTokenCookie = (res, token) => {
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Signup Controller
export const signup = async (req, res) => {
  try {
    const { email, password, fullName, profilePic } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle profile picture upload
    let profilePicUrl = "";
    if (profilePic) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "video-call/profiles",
      });
      profilePicUrl = uploadResponse.secure_url;
    }

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      fullName,
      profilePic: profilePicUrl,
      status: "offline",
    });

    // Generate token
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    // Update user status
    user.status = "online";
    user.lastSeen = new Date();
    await user.save();

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Logout Controller
export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Profile Controller
export const updateProfile = async (req, res) => {
  try {
    const { fullName, profilePic } = req.body;
    const userId = req.user._id;

    const updateData = { fullName };

    // Handle profile picture update
    if (profilePic && profilePic.startsWith("data:image")) {
      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "video-call/profiles",
      });
      updateData.profilePic = uploadResponse.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("Check auth error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};