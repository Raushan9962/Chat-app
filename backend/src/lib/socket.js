import { Server } from "socket.io";

let io;
const userSocketMap = {}; // {userId: socketId}
const roomUsers = {}; // {roomId: [userId1, userId2]}
const userRooms = {}; // {userId: roomId}

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

export const setupSocket = (socketIO) => {
  io = socketIO;
  
  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

    // User connects with their userId
    socket.on("register-user", (userId) => {
      if (userId) {
        userSocketMap[userId] = socket.id;
        console.log(`📱 User ${userId} connected with socket ${socket.id}`);
      }
    });

    // Video call events
    socket.on("call-user", ({ to, offer, from, name }) => {
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("incoming-call", {
          from,
          offer,
          name,
        });
      }
    });

    socket.on("call-accepted", ({ to, answer }) => {
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("call-accepted", { answer });
      }
    });

    socket.on("call-rejected", ({ to }) => {
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("call-rejected");
      }
    });

    socket.on("end-call", ({ to }) => {
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("call-ended");
      }
    });

    // ICE Candidate exchange for WebRTC
    socket.on("ice-candidate", ({ to, candidate }) => {
      const receiverSocketId = getReceiverSocketId(to);
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("ice-candidate", { candidate });
      }
    });

    // Group/Meeting room events
    socket.on("join-room", ({ roomId, userId, userName }) => {
      socket.join(roomId);
      
      if (!roomUsers[roomId]) {
        roomUsers[roomId] = [];
      }
      roomUsers[roomId].push({ userId, userName, socketId: socket.id });
      userRooms[userId] = roomId;

      // Notify others in the room
      socket.to(roomId).emit("user-connected", { userId, userName });
      
      // Send list of current users to the new user
      socket.emit("current-users", roomUsers[roomId].filter(user => user.userId !== userId));
      
      console.log(`👥 ${userName} joined room ${roomId}`);
    });

    socket.on("leave-room", ({ roomId, userId }) => {
      socket.leave(roomId);
      
      if (roomUsers[roomId]) {
        roomUsers[roomId] = roomUsers[roomId].filter(user => user.userId !== userId);
        if (roomUsers[roomId].length === 0) {
          delete roomUsers[roomId];
        }
      }
      
      delete userRooms[userId];
      socket.to(roomId).emit("user-disconnected", { userId });
      
      console.log(`👋 User ${userId} left room ${roomId}`);
    });

    // Screen sharing
    socket.on("screen-share-started", ({ roomId, userId }) => {
      socket.to(roomId).emit("screen-share-started", { userId });
    });

    socket.on("screen-share-stopped", ({ roomId, userId }) => {
      socket.to(roomId).emit("screen-share-stopped", { userId });
    });

    // Chat in meeting
    socket.on("send-meeting-message", ({ roomId, message, userName, userId }) => {
      socket.to(roomId).emit("receive-meeting-message", {
        message,
        userName,
        userId,
        timestamp: new Date(),
      });
    });

    // Message events (for real-time chat)
    socket.on("new-message", (message) => {
      const receiverSocketId = getReceiverSocketId(message.receiverId);
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("new-message", message);
      }
    });

    // Typing indicators
    socket.on("typing", ({ receiverId, isTyping }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("typing", { 
          senderId: socket.id, 
          isTyping 
        });
      }
    });

    // Online status
    socket.on("user-online", (userId) => {
      socket.broadcast.emit("user-online", userId);
    });

    socket.on("user-offline", (userId) => {
      socket.broadcast.emit("user-offline", userId);
    });

    // Disconnect
    socket.on("disconnect", () => {
      const userId = Object.keys(userSocketMap).find(
        key => userSocketMap[key] === socket.id
      );
      
      if (userId) {
        delete userSocketMap[userId];
        
        // Leave room if in one
        const roomId = userRooms[userId];
        if (roomId) {
          socket.to(roomId).emit("user-disconnected", { userId });
          if (roomUsers[roomId]) {
            roomUsers[roomId] = roomUsers[roomId].filter(user => user.userId !== userId);
          }
          delete userRooms[userId];
        }
        
        // Notify others that user went offline
        socket.broadcast.emit("user-offline", userId);
        
        console.log(`❌ User ${userId} disconnected`);
      }
    });
  });

  return io;
};

export { io };