// backend/src/middlewares/auth.middleware.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies?.jwt;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized, token missing" });
        }
 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded ){
            return res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
        }
        
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Protect Route Error:", error.message);
        res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
    }
};
