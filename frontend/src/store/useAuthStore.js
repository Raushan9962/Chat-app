// src/store/useAuthStore.js
import { create } from "zustand";
import axios from "axios";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client"; 

// ✅ Define your backend base URL
const BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  (import.meta.env.MODE === "production"
    ? "https://your-backend-url.com"
    : "http://localhost:8080");

const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
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

      localStorage.setItem("token", res.data.token); // store token
      set({ authUser: res.data.user });
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  // ✅ Login user
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);

      localStorage.setItem("token", res.data.token); // store token
      set({ authUser: res.data.user });

      toast.success("Login successful");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // ✅ Logout user
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      localStorage.removeItem("token");
      set({ authUser: null, onlineUsers: [] });
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
      set({ authUser: res.data.user });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally { 
      set({ isUpdatingProfile: false });
    }
  },

  // ✅ Connect socket
  connectSocket: () => {
    const { authUser, socket } = get();

    if (!authUser) return;
    if (socket?.connected) return; // avoid duplicate connections

    console.log("🔌 Connecting socket to:", BASE_URL);

    const newSocket = io(BASE_URL, {
      withCredentials: true,
      query: {
        userId: authUser._id, // 🔑 important for backend mapping
      },
    });

    set({ socket: newSocket });

    // listen for online users update
    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });
  },

  // ✅ Disconnect socket
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));

export default useAuthStore;
