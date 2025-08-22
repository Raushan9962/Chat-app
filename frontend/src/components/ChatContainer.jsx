import React, { use, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import useAuthStore from '../store/useAuthStore';
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput'; 
import MessageSkeleton from './skeletons/MessageSkeleton'; 
import { formatMessageTime } from '../lib/utils';

const ChatContainer = () => { 
  const { 
    messages, 
    getMessages, 
    isMessageLoading, 
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages 
  } = useChatStore();
  
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    }
    
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);
  
  useEffect(() => {
    if (messagesEndRef.current && messages) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Early return if no user is selected
  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-2xl font-semibold mb-2">Welcome to ChatApp!</h3>
            <p className="text-base-content/60">Select a conversation to start messaging</p>
          </div>
        </div>
      </div>
    );
  }

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
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">💭</div>
              <p className="text-base-content/60">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
              ref={messagesEndRef}
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
                    className="rounded-full"
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

              {/* Message Content */}
              <div className="chat-bubble">
                {message.text && (
                  <p className="break-words">{message.text}</p>
                )}
                {message.image && (
                  <div className="mt-2">
                    <img 
                      src={message.image} 
                      alt="attachment" 
                      className="rounded-md max-w-xs cursor-pointer hover:opacity-80 transition-opacity" 
                      onClick={() => window.open(message.image, '_blank')}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <MessageInput />
    </div>
  );
};

export default ChatContainer;