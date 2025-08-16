import {server} from "socket.io";
import http from "http";
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174"], // allow both
        credentials: true
    }
});
io.on("connection", (socket) => {
    console.log("a user connected", socket.id);
    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
    });
});
export {io,app,server};