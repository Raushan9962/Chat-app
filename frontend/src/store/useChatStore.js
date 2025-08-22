import { create } from "zustand";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";
import  useAuthStore  from "./useAuthStore"; // ✅ Make sure this exists 

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
    const { selectedUser } = get();

    if (!selectedUser?._id) {
      toast.error("No user selected");
      return;
    }

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      set((state) => ({
        messages: [...state.messages, res.data], // ✅ safe update
      }));

      toast.success("Message sent");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  // Listen for new messages via socket.io
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser?._id) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentfromSelectedUser =
        newMessage.senderId === selectedUser._id ||
        newMessage.receiverId === selectedUser._id;

      if (!isMessageSentfromSelectedUser) return;
      // Only push if it belongs to the selected user chat
       {
        set(({
          messages: [...get().messages, newMessage],
        }));
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },

  // Select a user for chatting
  setSelectedUser: (selectedUser) =>
    set({
      selectedUser,
      isUserSelected: !!selectedUser,
      messages: [], // clear old chat messages when switching
    }),
}));
