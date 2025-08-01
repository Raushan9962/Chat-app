import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const signup =async (req, res) => {
    const {FullName, email, password} = req.body
    try{
     //hash password
     if(password.length<6){
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters long",
          });
        }
        const user =await User.findOne({email})
        if(user)return res.status(400).json({
            success: false,
            message: "User already exists",
          });
     }

    catch(error){
    }
    res.send("signup route working!");
};
export const login = (req, res) => {
    res.send("login route working!");
};
export const logout = (req, res) => {
    res.send("logout route working!");
};