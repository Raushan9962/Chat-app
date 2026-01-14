import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";

const useAuthStore = create(
  persist(
    (set, get) => ({
      authUser: null,
      isAuthLoading: true,
      socket: null,

      // Login
      login: async (credentials) => {
        try {
          const res = await axiosInstance.post("/auth/login", credentials);
          set({ authUser: res.data.user });
          toast.success("Login successful");
          return res.data;
        } catch (error) {
          toast.error(error?.response?.data?.message || "Login failed");
          throw error;
        }
      },

      // Signup
      signup: async (userData) => {
        try {
          const res = await axiosInstance.post("/auth/signup", userData);
          set({ authUser: res.data.user });
          toast.success("Account created successfully");
          return res.data;
        } catch (error) {
          toast.error(error?.response?.data?.message || "Signup failed");
          throw error;
        }
      },

      // Logout
      logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
          // Disconnect socket if exists
          if (get().socket) {
            get().socket.disconnect();
          }
          set({ 
            authUser: null,
            socket: null 
          });
          toast.success("Logged out successfully");
        } catch (error) {
          toast.error("Logout failed");
          throw error;
        }
      },

      // Check auth status
      checkAuth: async () => {
        set({ isAuthLoading: true });
        try {
          const res = await axiosInstance.get("/auth/check");
          set({ authUser: res.data.user });
          return res.data;
        } catch (error) {
          set({ authUser: null });
          return null;
        } finally {
          set({ isAuthLoading: false });
        }
      },

      // Set socket
      setSocket: (socket) => {
        set({ socket });
      },

      // Update profile
      updateProfile: async (userData) => {
        try {
          const res = await axiosInstance.put("/auth/update-profile", userData);
          set({ authUser: res.data.user });
          toast.success("Profile updated successfully");
          return res.data;
        } catch (error) {
          toast.error(error?.response?.data?.message || "Failed to update profile");
          throw error;
        }
      },

      // Clear store
      clearStore: () => {
        set({
          authUser: null,
          isAuthLoading: true,
          socket: null
        });
      }
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;