// components/Sidebar.jsx
import React, { useState } from 'react';
import {
  IoSearch,
  IoVideocam,
  IoPeople,
  IoPerson,
  IoAdd,
  IoChevronDown,
} from 'react-icons/io5';

const Sidebar = ({ 
  users = [], 
  selectedUser, 
  onUserSelect, 
  onCreateMeeting, 
  onStartVideoCall,
  isSidebarOpen 
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('chats');

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    user.username?.toLowerCase().includes(search.toLowerCase())
  );

  // Mobile sidebar overlay
  if (!isSidebarOpen) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <IoSearch className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="space-y-2">
          <button
            onClick={onCreateMeeting}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-colors text-sm font-medium"
          >
            <IoVideocam size={18} />
            <span>New Meeting</span>
          </button>
          
          <button
            onClick={onStartVideoCall}
            disabled={!selectedUser}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoPeople size={18} />
            <span>Video Call</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'chats'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Chats
        </button>
        <button
          onClick={() => setActiveTab('meetings')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'meetings'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Meetings
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === 'contacts'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Contacts
        </button>
      </div>

      {/* Users/Contacts List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {activeTab === 'chats' || activeTab === 'contacts' ? (
            <>
              <div className="px-2 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {activeTab === 'chats' ? 'Recent Chats' : 'All Contacts'}
                  </h3>
                  {activeTab === 'contacts' && (
                    <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                      <IoAdd size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  onClick={() => onUserSelect(user)}
                  className={`p-3 rounded-lg cursor-pointer transition-all mb-1 ${
                    selectedUser?._id === user._id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-blue-600 dark:text-blue-300">
                          {user.fullName?.charAt(0)}
                        </span>
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm truncate">
                          {user.fullName}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          12:30
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            // Meetings Tab
            <div className="p-4">
              <h3 className="text-sm font-medium mb-3">Recent Meetings</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">Team Meeting</span>
                      <span className="text-xs text-gray-500">2h ago</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <IoPeople className="mr-1" size={12} />
                      <span>5 participants</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Profile Mini */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
            <IoPerson className="text-blue-600 dark:text-blue-300" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">You</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Online</p>
          </div>
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
            <IoChevronDown size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;