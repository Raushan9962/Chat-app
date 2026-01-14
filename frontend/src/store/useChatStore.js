import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import axiosInstance from "../lib/axios";

export const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      users: [],
      selectedUser: null,
      isUserSelected: false,
      isUsersLoading: false,
      isMessageLoading: false,
      onlineUsers: new Set(), // Track online users
      unreadCounts: {}, // {userId: count}
      typingUsers: {}, // {userId: boolean}

      // Fetch users
      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");
          set({ users: res.data });
          return res.data;
        } catch (error) {
          toast.error(error?.response?.data?.message || "Failed to load users");
          throw error;
        } finally {
          set({ isUsersLoading: false });
        }
      },

      // Fetch messages with selected user
      getMessages: async (userId) => {
        set({ isMessageLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          set({ 
            messages: res.data,
            // Reset unread count when opening chat
            unreadCounts: {
              ...get().unreadCounts,
              [userId]: 0
            }
          });
          return res.data;
        } catch (error) {
          toast.error(error?.response?.data?.message || "Failed to load messages");
          throw error;
        } finally {
          set({ isMessageLoading: false });
        }
      },

      // Send new message
      sendMessage: async (messageData) => {
        const { selectedUser } = get();

        if (!selectedUser?._id) {
          toast.error("No user selected");
          return null;
        }

        try {
          const res = await axiosInstance.post(
            `/messages/send/${selectedUser._id}`,
            messageData
          );

          // Add to local state immediately (optimistic update)
          const newMessage = res.data;
          set((state) => ({
            messages: [...state.messages, newMessage],
          }));

          toast.success("Message sent");
          return newMessage;
        } catch (error) {
          toast.error(error?.response?.data?.message || "Failed to send message");
          throw error;
        }
      },

      // Delete message
      deleteMessage: async (messageId) => {
        try {
          await axiosInstance.delete(`/messages/${messageId}`);
          set((state) => ({
            messages: state.messages.filter(msg => msg._id !== messageId)
          }));
          toast.success("Message deleted");
        } catch (error) {
          toast.error(error?.response?.data?.message || "Failed to delete message");
          throw error;
        }
      },

      // Mark messages as read
      markMessagesAsRead: async (userId) => {
        const unreadMessages = get().messages.filter(
          msg => msg.senderId === userId && !msg.read
        );

        if (unreadMessages.length === 0) return;

        try {
          const messageIds = unreadMessages.map(msg => msg._id);
          await axiosInstance.put("/messages/mark-read", { messageIds });
          
          // Update local state
          set((state) => ({
            messages: state.messages.map(msg => 
              messageIds.includes(msg._id) ? { ...msg, read: true } : msg
            ),
            unreadCounts: {
              ...state.unreadCounts,
              [userId]: 0
            }
          }));
        } catch (error) {
          console.error("Failed to mark messages as read:", error);
        }
      },

      // Handle incoming message from socket
      handleNewMessage: (newMessage) => {
        const state = get();
        const { selectedUser } = state;
        
        // Check if message belongs to current chat
        const isCurrentChatMessage = 
          (newMessage.senderId === selectedUser?._id && newMessage.receiverId === state.authUser?._id) ||
          (newMessage.senderId === state.authUser?._id && newMessage.receiverId === selectedUser?._id);

        if (isCurrentChatMessage) {
          // Add to current chat
          set({ 
            messages: [...state.messages, newMessage] 
          });
          
          // Mark as read if user is viewing the chat
          if (selectedUser?._id === newMessage.senderId) {
            setTimeout(() => {
              get().markMessagesAsRead(newMessage.senderId);
            }, 1000);
          }
        } else {
          // Increment unread count for other chats
          const senderId = newMessage.senderId;
          set({
            unreadCounts: {
              ...state.unreadCounts,
              [senderId]: (state.unreadCounts[senderId] || 0) + 1
            }
          });
          
          // Show notification toast
          const sender = state.users.find(u => u._id === senderId);
          if (sender) {
            toast.success(`New message from ${sender.fullName || sender.username}`);
          }
        }
      },

      // Handle typing indicator
      setTyping: (userId, isTyping) => {
        set({
          typingUsers: {
            ...get().typingUsers,
            [userId]: isTyping
          }
        });
      },

      // Handle user online/offline status
      setUserOnline: (userId) => {
        const onlineUsers = new Set(get().onlineUsers);
        onlineUsers.add(userId);
        set({ onlineUsers });
      },

      setUserOffline: (userId) => {
        const onlineUsers = new Set(get().onlineUsers);
        onlineUsers.delete(userId);
        set({ onlineUsers });
      },

      // Check if user is online
      isUserOnline: (userId) => {
        return get().onlineUsers.has(userId);
      },

      // Get unread count for a user
      getUnreadCount: (userId) => {
        return get().unreadCounts[userId] || 0;
      },

      // Select a user for chatting
      setSelectedUser: (user) => {
        const state = get();
        const prevSelectedUserId = state.selectedUser?._id;
        
        if (user) {
          set({
            selectedUser: user,
            isUserSelected: true,
            // Only clear messages if switching to different user
            messages: prevSelectedUserId === user._id ? state.messages : [],
            // Reset typing indicator
            typingUsers: {
              ...state.typingUsers,
              [user._id]: false
            }
          });
          
          // Mark messages as read when selecting user
          get().markMessagesAsRead(user._id);
        } else {
          set({
            selectedUser: null,
            isUserSelected: false,
            messages: []
          });
        }
      },

      // Clear chat store (for logout)
      clearStore: () => {
        set({
          messages: [],
          users: [],
          selectedUser: null,
          isUserSelected: false,
          isUsersLoading: false,
          isMessageLoading: false,
          onlineUsers: new Set(),
          unreadCounts: {},
          typingUsers: {}
        });
      }
    }),
    {
      name: "chat-storage", // unique name for localStorage
      partialize: (state) => ({ 
        // Only persist these fields
        users: state.users,
        unreadCounts: state.unreadCounts
      })
    }
  )
);