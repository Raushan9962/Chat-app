// backend/src/middlewares/auth.middleware.js

import jwt from "jsonwebtoken"; // ✅ Use this in backend
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies?.jwt;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized, token missing" });
        }

        // Verify token and decode payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
