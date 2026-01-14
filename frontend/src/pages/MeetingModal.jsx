import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { IoClose, IoVideocam, IoCopy, IoShareSocial } from 'react-icons/io5';

const MeetingModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    allowScreenShare: true,
    allowChat: true,
    allowRecording: false,
    muteOnEntry: false,
  });

  const createMeeting = async (instant = true) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/video/create-meeting', {
        title: title || (instant ? 'Quick Meeting' : 'Scheduled Meeting'),
        description,
        settings,
      }, {
        withCredentials: true,
      });

      const { roomId } = response.data.meeting;
      const link = `${window.location.origin}/meeting/${roomId}`;
      
      if (instant) {
        navigate(`/meeting/${roomId}`);
        toast.success('Meeting created!');
      } else {
        setMeetingLink(link);
        toast.success('Meeting created! Copy the link to share.');
      }
    } catch (error) {
      toast.error('Failed to create meeting');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetingLink);
    toast.success('Meeting link copied to clipboard!');
  };

  const shareMeeting = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my meeting',
          text: `Join my video meeting: ${title}`,
          url: meetingLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <IoVideocam className="text-blue-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create Meeting</h2>
              <p className="text-gray-500">Start or schedule a video meeting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Team Meeting, Client Call, etc."
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Meeting agenda or notes"
                rows="3"
                className="input-field resize-none"
              />
            </div>

            {/* Settings */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Meeting Settings</h3>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Allow Screen Sharing</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowScreenShare}
                    onChange={(e) => setSettings({
                      ...settings,
                      allowScreenShare: e.target.checked,
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Allow Chat</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowChat}
                    onChange={(e) => setSettings({
                      ...settings,
                      allowChat: e.target.checked,
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Mute on Entry</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.muteOnEntry}
                    onChange={(e) => setSettings({
                      ...settings,
                      muteOnEntry: e.target.checked,
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Meeting Link (if created) */}
            {meetingLink && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  Meeting Created Successfully!
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={meetingLink}
                    readOnly
                    className="flex-1 bg-white border border-blue-200 rounded px-3 py-2 text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg"
                    title="Copy link"
                  >
                    <IoCopy className="text-blue-600" />
                  </button>
                  <button
                    onClick={shareMeeting}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg"
                    title="Share meeting"
                  >
                    <IoShareSocial className="text-blue-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => createMeeting(true)}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <IoVideocam />
                <span>Start Instant Meeting</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingModal;