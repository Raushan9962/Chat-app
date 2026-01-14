import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import Peer from 'simple-peer';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  IoVideocam,
  IoVideocamOff,
  IoMic,
  IoMicOff,
  IoClose,
  IoPeople,
  IoChatbubble,
  IoShare,
  IoSettings,
  IoExit,
  IoDesktop,
  IoDesktopOutline,
  IoPerson,
} from 'react-icons/io5';

const MeetingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();
  
  const [peers, setPeers] = useState({});
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState(null);

  const localVideoRef = useRef();
  const screenShareRef = useRef();
  const chatRef = useRef();
  const peersRef = useRef({});

  useEffect(() => {
    if (!roomId || !socket || !user) return;

    const initMeeting = async () => {
      try {
        // Join meeting
        await axios.get(`/api/video/join/${roomId}`, {
          withCredentials: true,
        });

        // Get meeting details
        const infoResponse = await axios.get(`/api/video/details/${roomId}`, {
          withCredentials: true,
        });
        setMeetingInfo(infoResponse.data.meeting);

        // Get local media stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Join socket room
        socket.emit('join-room', {
          roomId,
          userId: user._id,
          userName: user.fullName,
        });

        // Setup socket listeners
        socket.on('user-connected', handleUserConnected);
        socket.on('user-disconnected', handleUserDisconnected);
        socket.on('current-users', handleCurrentUsers);
        socket.on('receive-meeting-message', handleNewMessage);
        socket.on('screen-share-started', handleScreenShareStarted);
        socket.on('screen-share-stopped', handleScreenShareStopped);

      } catch (error) {
        console.error('Meeting init error:', error);
        toast.error('Failed to join meeting');
        navigate('/');
      }
    };

    initMeeting();

    return () => {
      leaveMeeting();
    };
  }, [roomId, socket, user, navigate]);

  const handleUserConnected = ({ userId, userName }) => {
    toast.success(`${userName} joined the meeting`);
    
    // Create peer for new user
    const peer = createPeer(userId, localStream);
    peersRef.current = {
      ...peersRef.current,
      [userId]: peer,
    };
    setPeers(prev => ({
      ...prev,
      [userId]: { peer, stream: null, userName },
    }));
  };

  const handleUserDisconnected = ({ userId }) => {
    if (peersRef.current[userId]) {
      peersRef.current[userId].destroy();
    }
    const newPeers = { ...peersRef.current };
    delete newPeers[userId];
    peersRef.current = newPeers;
    setPeers(prev => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
    toast.info('A user left the meeting');
  };

  const handleCurrentUsers = (currentUsers) => {
    setUsers(currentUsers);
    
    // Create peers for existing users
    currentUsers.forEach(({ userId, userName }) => {
      const peer = createPeer(userId, localStream);
      peersRef.current = {
        ...peersRef.current,
        [userId]: peer,
      };
      setPeers(prev => ({
        ...prev,
        [userId]: { peer, stream: null, userName },
      }));
    });
  };

  const createPeer = (userId, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: true,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
        ],
      },
    });

    peer.on('signal', (signal) => {
      socket.emit('signal', { userId, signal, roomId });
    });

    peer.on('stream', (remoteStream) => {
      setPeers(prev => ({
        ...prev,
        [userId]: { ...prev[userId], stream: remoteStream },
      }));
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
    });

    return peer;
  };

  const handleSignal = ({ userId, signal }) => {
    if (peersRef.current[userId]) {
      peersRef.current[userId].signal(signal);
    }
  };

  const handleNewMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleScreenShareStarted = ({ userId }) => {
    // Handle screen share started
  };

  const handleScreenShareStopped = ({ userId }) => {
    // Handle screen share stopped
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        setScreenStream(stream);
        setIsScreenSharing(true);
        
        // Replace video track in all peers
        const screenTrack = stream.getVideoTracks()[0];
        Object.values(peersRef.current).forEach(peer => {
          const sender = peer._pc.getSenders().find(s => s.track.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        socket.emit('screen-share-started', { roomId, userId: user._id });

        stream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
      } else {
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop());
        }
        setScreenStream(null);
        setIsScreenSharing(false);
        
        // Restore camera track
        const cameraTrack = localStream.getVideoTracks()[0];
        Object.values(peersRef.current).forEach(peer => {
          const sender = peer._pc.getSenders().find(s => s.track.kind === 'video');
          if (sender) sender.replaceTrack(cameraTrack);
        });

        socket.emit('screen-share-stopped', { roomId, userId: user._id });
      }
    } catch (error) {
      console.error('Screen share error:', error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      message: newMessage,
      userName: user.fullName,
      userId: user._id,
      timestamp: new Date(),
    };

    socket.emit('send-meeting-message', {
      roomId,
      ...message,
    });

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const leaveMeeting = async () => {
    try {
      // Stop all media tracks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }

      // Destroy all peers
      Object.values(peersRef.current).forEach(peer => peer.destroy());

      // Leave socket room
      socket.emit('leave-room', { roomId, userId: user._id });

      // Remove socket listeners
      socket.off('user-connected', handleUserConnected);
      socket.off('user-disconnected', handleUserDisconnected);
      socket.off('current-users', handleCurrentUsers);
      socket.off('receive-meeting-message', handleNewMessage);
      socket.off('screen-share-started', handleScreenShareStarted);
      socket.off('screen-share-stopped', handleScreenShareStopped);

      navigate('/');
      toast.success('Left the meeting');
    } catch (error) {
      console.error('Leave meeting error:', error);
    }
  };

  if (!meetingInfo) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Joining meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{meetingInfo.title}</h1>
          <p className="text-gray-400 text-sm">
            {Object.keys(peers).length + 1} participants
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Toggle Chat"
          >
            <IoChatbubble size={24} />
          </button>
          <button
            onClick={leaveMeeting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <IoExit />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className={`flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-y-auto ${showChat ? 'lg:col-span-2' : ''}`}>
          {/* Local Video */}
          <div className="bg-gray-800 rounded-lg overflow-hidden relative">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              You {isVideoOn ? '' : '(Video Off)'}
            </div>
          </div>

          {/* Remote Videos */}
          {Object.entries(peers).map(([userId, { stream, userName }]) => (
            <div key={userId} className="bg-gray-800 rounded-lg overflow-hidden relative">
              {stream ? (
                <video
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  ref={videoRef => {
                    if (videoRef && stream) {
                      videoRef.srcObject = stream;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                  <IoPerson className="w-20 h-20 text-gray-600" />
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {userName}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-white font-semibold">Meeting Chat</h2>
            </div>
            <div 
              ref={chatRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((msg, index) => (
                <div key={index} className="text-white">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">{msg.userName}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-gray-300">{msg.message}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-center space-x-6">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-colors ${
            isAudioOn 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          title={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isAudioOn ? <IoMic size={24} /> : <IoMicOff size={24} />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-colors ${
            isVideoOn 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
          title={isVideoOn ? 'Turn off video' : 'Turn on video'}
        >
          {isVideoOn ? <IoVideocam size={24} /> : <IoVideocamOff size={24} />}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`p-3 rounded-full transition-colors ${
            isScreenSharing 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title={isScreenSharing ? 'Stop screen share' : 'Share screen'}
        >
          {isScreenSharing ? <IoDesktop size={24} /> : <IoDesktopOutline size={24} />}
        </button>

        <button
          onClick={leaveMeeting}
          className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
          title="Leave meeting"
        >
          <IoClose size={24} />
        </button>
      </div>
    </div>
  );
};

export default MeetingRoom;