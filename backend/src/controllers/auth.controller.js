import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js"; 
import cloudinary from "../lib/cloudinary.js";

// SIGNUP CONTROLLER
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Generate JWT token
    generateToken(newUser._id, res);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
    });

  } catch (error) {
    console.error("Signup Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// LOGIN CONTROLLER
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic || null,
    });

  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// LOGOUT CONTROLLER
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const updateProfile = async(req, res) =>{
  try{
    const {profilepic} = req.body;
    const userId =res.user._id;
    if(!profilepic){
        return res.status(400).json({message:"Profile picture is required"});
    }

    const uploadResponse =await cloudinary.uploader.upload(profilepic);
    const updatedUser =await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true});
    res.status(200).json(updatedUser);
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Internal server error"});
    }
};

export const checkAuth =async(req,
  res)=>{
  try{
    res.status(200).json(req.user);
  }
  catch(error){
    console.log(error);
    res.status(500).json({message:"Internal server error"});

  }
  }
