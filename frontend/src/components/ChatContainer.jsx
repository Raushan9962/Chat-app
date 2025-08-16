import React, { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore'; // ✅ FIXED import
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput'; 
import MessageSkeleton from './skeletons/MessageSkeleton'; 
import { formatMessageTime } from '../lib/utils';

const ChatContainer = () => { 
  const { messages, getMessages, isMessageLoading, selectedUser } = useChatStore(); // ✅ FIXED isMessageLoading
  const { authUser } = useAuthStore();

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);  

  if (isMessageLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`} // ✅ FIXED
          >
            {/* Avatar */}
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser?.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div> 

            {/* Username + Time */}
            <div className="chat-header mb-1">
              <span className="font-semibold">
                {message.senderId === authUser._id ? "You" : selectedUser?.username}
              </span>
              <time className="text-xs opacity-50 ml-2">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            {/* Message */}
            <div className="chat-bubble">
              {message.text} {/* ✅ FIXED field name */}
              {message.image && (
                <img src={message.image} alt="attachment" className="mt-2 rounded-md max-w-xs" />
              )}
            </div>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
