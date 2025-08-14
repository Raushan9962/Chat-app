// src/store/useAuthStore.js
import { create } from "zustand";
import axios from "axios";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdating: false,
  isCheckingAuth: true,

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
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login" ,data);
        set({ authUser: res.data });
      toast.success("Login successful");
    
    } catch (error) {
      toast.error(error.response.data.message || "Login failed");
    } finally {
      set({ isLoggingIng: false });
    }
  },


  // ✅ Logout user
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      localStorage.removeItem("token");
      set({ authUser: null });
      toast.success("Logout successful");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

updateProfile: async (data) => {
  set({isUpdatingProfile: true});
  try{
    const res =await axiosInstance.put("/auth/update-profile",data);
    set({authUser: res.data});
    toast.success("Profile updated successfully");
  }catch(error){
    toast.error(error.response?.data?.message);
  }finally{ 
    set({isUpdatingProfile: false});
  }
},




}));

export default useAuthStore;
