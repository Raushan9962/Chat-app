import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore';
import  useAuthStore  from '../store/useAuthStore';
import Sidebar from '../components/Sidebar';
import NoChatSelected from '../components/NoChatSelected';
import ChatContainer from '../components/ChatContainer';
import VideoCallModal from '../pages/VideoCallModal';
import MeetingModal from '../pages/MeetingModal';
import toast from 'react-hot-toast';
import {
  IoVideocam,
  IoLogOut,
  IoPerson,
  IoSearch,
  IoMenu,
  IoClose,
  IoCall,
  IoPeople,
  IoNotifications,
} from 'react-icons/io5';

const Home = () => {
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showVideoCallModal, setShowVideoCallModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const {
    users,
    selectedUser,
    getUsers,
    getMessages,
    isUserSelected,
    isUsersLoading,
    isMessageLoading,
    isUserOnline,
    getUnreadCount,
    setSelectedUser,
    clearStore: clearChatStore,
  } = useChatStore();
  
  const {
    authUser,
    logout,
    socket,
    clearStore: clearAuthStore,
  } = useAuthStore();
  
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    // Load users on component mount
    getUsers();
    
    // Setup socket listeners if socket exists
    if (socket) {
      setupSocketListeners();
    }

    return () => {
      // Cleanup socket listeners
      if (socket) {
        cleanupSocketListeners();
      }
    };
  }, [socket]);

  useEffect(() => {
    // Handle URL param for selected user
    if (userId && userId !== 'new-meeting') {
      const user = users.find(u => u._id === userId);
      if (user) {
        setSelectedUser(user);
        getMessages(userId);
      }
    } else if (userId === 'new-meeting') {
      setShowMeetingModal(true);
      navigate('/', { replace: true });
    }
  }, [userId, users]);

  const setupSocketListeners = () => {
    if (!socket) return;

    // Listen for incoming messages
    socket.on('newMessage', (message) => {
      const { handleNewMessage } = useChatStore.getState();
      handleNewMessage(message);
    });

    // Listen for typing indicators
    socket.on('typing', ({ senderId, isTyping }) => {
      const { setTyping } = useChatStore.getState();
      setTyping(senderId, isTyping);
    });

    // Listen for user online status
    socket.on('user-online', (userId) => {
      const { setUserOnline } = useChatStore.getState();
      setUserOnline(userId);
    });

    socket.on('user-offline', (userId) => {
      const { setUserOffline } = useChatStore.getState();
      setUserOffline(userId);
    });

    // Listen for incoming calls
    socket.on('incoming-call', (data) => {
      toast.success(`Incoming call from ${data.name}`, {
        duration: 10000,
        position: 'top-right',
        icon: '📞',
        action: {
          label: 'Answer',
          onClick: () => setShowVideoCallModal(true),
        },
      });
    });
  };

  const cleanupSocketListeners = () => {
    if (!socket) return;
    
    socket.off('newMessage');
    socket.off('typing');
    socket.off('user-online');
    socket.off('user-offline');
    socket.off('incoming-call');
  };

  const handleLogout = async () => {
    try {
      await logout();
      clearChatStore();
      clearAuthStore();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleStartVideoCall = () => {
    if (selectedUser) {
      setShowVideoCallModal(true);
    } else {
      toast.error('Please select a user to call');
    }
  };

  const handleCreateMeeting = () => {
    setShowMeetingModal(true);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    getMessages(user._id);
    navigate(`/chat/${user._id}`);
    setIsSidebarOpen(false);
  };

  const handleBack = () => {
    setSelectedUser(null);
    navigate('/');
  };

  const totalUnreadCount = Object.values(useChatStore.getState().unreadCounts)
    .reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Main Layout */}
      <div className="w-full max-w-7xl mx-auto h-screen rounded-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {/* Professional Header Bar */}
        <div className="h-12 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-3">
            {/* Mobile Sidebar Toggle */}
            <button
              className="md:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <IoClose size={20} /> : <IoMenu size={20} />}
            </button>

            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
              <IoCall className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">Video Chat Pro</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedUser 
                  ? `Connected to ${selectedUser.fullName || selectedUser.username}` 
                  : "Select a conversation"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                <span className="font-semibold text-blue-600 dark:text-blue-300">
                  {authUser?.fullName?.charAt(0) || authUser?.username?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{authUser?.fullName || authUser?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">@{authUser?.username}</p>
              </div>
            </div>

            {/* Notifications */}
            {totalUnreadCount > 0 && (
              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <IoNotifications size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {totalUnreadCount}
                </span>
              </button>
            )}

            {/* Call Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCreateMeeting}
                className="hidden md:flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <IoPeople size={16} />
                <span>New Meeting</span>
              </button>
              
              <button
                onClick={handleStartVideoCall}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                disabled={!selectedUser}
              >
                <IoVideocam size={16} />
                <span>Video Call</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Logout"
              >
                <IoLogOut size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex h-[calc(100%-3rem)]">
          {/* Sidebar */}
          <div className={`
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 transition-transform duration-300
            w-full md:w-64 border-r border-gray-200 dark:border-gray-800 
            bg-white dark:bg-gray-900 fixed md:relative z-30 h-full
          `}>
            <Sidebar 
              users={users}
              selectedUser={selectedUser}
              onUserSelect={handleUserSelect}
              onCreateMeeting={handleCreateMeeting}
              onStartVideoCall={handleStartVideoCall}
              isSidebarOpen={isSidebarOpen}
              isUserOnline={isUserOnline}
              getUnreadCount={getUnreadCount}
              loading={isUsersLoading}
            />
          </div>

          {/* Chat Area */}
          <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900">
            {isUserSelected ? (
              <ChatContainer 
                selectedUser={selectedUser}
                className="flex-1"
                onBack={handleBack}
                loading={isMessageLoading}
              />
            ) : (
              <NoChatSelected onCreateMeeting={handleCreateMeeting} />
            )}
            
            {/* Status Bar */}
            <div className="h-8 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between px-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {socket?.connected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modals */}
      {showVideoCallModal && (
        <VideoCallModal
          isOpen={showVideoCallModal}
          onClose={() => setShowVideoCallModal(false)}
          selectedUser={selectedUser}
          socket={socket}
          authUser={authUser}
        />
      )}

      {showMeetingModal && (
        <MeetingModal
          isOpen={showMeetingModal}
          onClose={() => setShowMeetingModal(false)}
        />
      )}
    </div>
  );
};

export default Home;