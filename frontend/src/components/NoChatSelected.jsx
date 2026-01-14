// components/NoChatSelected.jsx
import React from 'react';
import { IoVideocam, IoPeople, IoChatbubbles } from 'react-icons/io5';

const NoChatSelected = ({ onCreateMeeting }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
          <IoChatbubbles className="text-blue-600 dark:text-blue-400" size={48} />
        </div>
        
        <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
          Welcome to Video Chat Pro
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Select a conversation from the sidebar or start a new video meeting to collaborate with your team.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={onCreateMeeting}
            className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all transform hover:-translate-y-1 hover:shadow-lg"
          >
            <IoVideocam className="w-8 h-8 mx-auto mb-2" />
            <div className="font-medium">Start Meeting</div>
            <div className="text-sm opacity-90">Quick video conference</div>
          </button>

          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all transform hover:-translate-y-1 hover:shadow-lg">
            <IoPeople className="w-8 h-8 mx-auto mb-2" />
            <div className="font-medium">Group Chat</div>
            <div className="text-sm opacity-90">Team collaboration</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all transform hover:-translate-y-1 hover:shadow-lg">
            <IoChatbubbles className="w-8 h-8 mx-auto mb-2" />
            <div className="font-medium">Private Chat</div>
            <div className="text-sm opacity-90">One-on-one conversation</div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Tips</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Click on any contact to start chatting
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Use the video call button for instant calls
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Schedule meetings for team collaboration
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;