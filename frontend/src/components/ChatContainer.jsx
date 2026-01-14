// components/ChatContainer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  IoArrowBack,
  IoVideocam,
  IoCall,
  IoEllipsisVertical,
  IoPaperPlane,
  IoImage,
  IoAttach,
  IoMic,
  IoHappy,
} from 'react-icons/io5';

const ChatContainer = ({ selectedUser, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { socket } = useSocket();
  const messagesEndRef = useRef();

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', handleNewMessage);
      socket.on('typing', handleTyping);
    }

    return () => {
      if (socket) {
        socket.off('newMessage', handleNewMessage);
        socket.off('typing', handleTyping);
      }
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/messages/${selectedUser._id}`, {
        withCredentials: true,
      });
      setMessages(response.data);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const handleNewMessage = (message) => {
    if (message.senderId === selectedUser._id || message.receiverId === selectedUser._id) {
      setMessages(prev => [...prev, message]);
    }
  };

  const handleTyping = ({ senderId, isTyping }) => {
    if (senderId === selectedUser._id) {
      setIsTyping(isTyping);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        { text: newMessage },
        { withCredentials: true }
      );

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <IoArrowBack size={20} />
          </button>
          
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
            <span className="font-semibold text-blue-600 dark:text-blue-300">
              {selectedUser?.fullName?.charAt(0)}
            </span>
          </div>
          
          <div>
            <h3 className="font-semibold">{selectedUser?.fullName}</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Online • {isTyping ? 'typing...' : 'Active now'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <IoCall size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <IoVideocam size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <IoEllipsisVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((message, index) => (
          <div
            key={message._id || index}
            className={`flex ${message.senderId === selectedUser._id ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                message.senderId === selectedUser._id
                  ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-none'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-none'
              }`}
            >
              {message.text && (
                <p className="text-sm md:text-base">{message.text}</p>
              )}
              {message.image && (
                <img
                  src={message.image}
                  alt="Shared"
                  className="mt-2 rounded-lg max-w-full h-auto"
                />
              )}
              <div className={`text-xs mt-1 ${
                message.senderId === selectedUser._id
                  ? 'text-gray-500 dark:text-gray-400'
                  : 'text-blue-100'
              }`}>
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-2xl rounded-tl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <IoImage size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <IoAttach size={20} />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="absolute right-3 top-2">
              <IoHappy size={20} className="text-gray-400" />
            </button>
          </div>
          
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <IoMic size={20} />
          </button>
          <button
            onClick={sendMessage}
            className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full transition-all transform hover:scale-105"
          >
            <IoPaperPlane size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;