// src/store/useAuthStore.js
import { create } from "zustand";
import axios from "axios";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client"; 

// Define your base URL - adjust this to match your backend
const BASE_URL = process.env.REACT_APP_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.com' 
    : 'http://localhost:5000'); // Change this port to match your backend

const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false, // Fixed: was 'isUpdating'
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // ✅ Check if the user is logged in
  checkAuth: async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axiosInstance.get("/auth/check", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      });

      console.log("✅ checkAuth success:", res.data);
      set({ authUser: res.data.user });
      get().connectSocket();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("❌ checkAuth error:", error.response?.data || error.message);
      } else {
        console.error("Unexpected error in checkAuth:", error);
      }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // ✅ Sign up user
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      toast.success("Account created successfully");
      console.log("✅ signup success:", res.data);
      set({ authUser: res.data.user });
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  // ✅ Login user - Fixed multiple issues
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user }); // Fixed: should be res.data.user for consistency
      toast.success("Login successful");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false }); // Fixed: was 'isLoggingIng' (typo)
    }
  },

  // ✅ Logout user
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      localStorage.removeItem("token");
      set({ authUser: null });
      toast.success("Logout successful");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  // ✅ Update user profile
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data.user }); // Fixed: should be res.data.user for consistency
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally { 
      set({ isUpdatingProfile: false });
    }
  },

  // ✅ Connect socket
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) {
      return;
    }
    
    console.log('🔌 Connecting socket to:', BASE_URL);
    
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id, 
      },
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      timeout: 20000,
      forceNew: true,
    });
    
    set({ socket: socket });
    
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });
    
    socket.on("getOnlineUsers", (userIds) => {
      console.log('👥 Online users updated:', userIds);
      set({ onlineUsers: userIds });
    });
  },

  // ✅ Disconnect socket
  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
    }
    set({ socket: null }); // Added: clear the socket reference
  },
}));

export default useAuthStore;