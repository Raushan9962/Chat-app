import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUserSelected: false,
  isUsersLoading: false,
  isMessageLoading: false,

  // Fetch users
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Fetch messages with selected user
  getMessages: async (userId) => {
    set({ isMessageLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessageLoading: false });
    }
  },

  // Send new message
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();

    if (!selectedUser?._id) {
      toast.error("No user selected");
      return;
    }

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      // Ensure you're pushing the full message object
      set({ messages: [...messages, res.data] });

      toast.success("Message sent");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  // Select a user for chatting
  setSelectedUser: (selectedUser) =>
    set({
      selectedUser,
      isUserSelected: !!selectedUser,
      messages: [], // clear old chat messages when switching
    }),
}));
