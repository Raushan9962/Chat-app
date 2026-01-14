import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import Peer from 'simple-peer';
import {
  IoCall,
  IoVideocam,
  IoVideocamOff,
  IoMic,
  IoMicOff,
  IoClose,
  IoPerson,
  IoExpand,
  IoContract,
} from 'react-icons/io5';
import toast from 'react-hot-toast';

const VideoCallModal = ({
  isOpen,
  onClose,
  selectedUser,
  isIncoming = false,
  callOffer = null,
}) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callStarted, setCallStarted] = useState(false);
  const [callStatus, setCallStatus] = useState(isIncoming ? 'ringing' : 'calling');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef();
  const intervalRef = useRef();
  const modalRef = useRef();

  useEffect(() => {
    if (isOpen) {
      getLocalStream();
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!socket) return;

    const handleCallAccepted = ({ answer }) => {
      setCallStatus('connected');
      setCallStarted(true);
      startCallTimer();
      peerRef.current?.signal(answer);
    };

    const handleCallRejected = () => {
      setCallStatus('rejected');
      toast.error('Call was rejected');
      setTimeout(() => onClose(), 2000);
    };

    const handleCallEnded = () => {
      setCallStatus('ended');
      endCall();
      toast.info('Call ended by other user');
    };

    const handleIceCandidate = ({ candidate }) => {
      peerRef.current?.signal(candidate);
    };

    socket.on('call-accepted', handleCallAccepted);
    socket.on('call-rejected', handleCallRejected);
    socket.on('call-ended', handleCallEnded);
    socket.on('ice-candidate', handleIceCandidate);

    return () => {
      socket.off('call-accepted', handleCallAccepted);
      socket.off('call-rejected', handleCallRejected);
      socket.off('call-ended', handleCallEnded);
      socket.off('ice-candidate', handleIceCandidate);
    };
  }, [socket, onClose]);

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Could not access camera/microphone');
    }
  };

  const startCallTimer = () => {
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  };

  const createPeer = (initiator = false, signalData = null) => {
    if (!localStream) {
      toast.error('Local stream not available');
      return;
    }

    const peer = new Peer({
      initiator,
      trickle: true,
      stream: localStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
        ],
      },
    });

    peer.on('signal', (data) => {
      if (initiator) {
        socket.emit('call-user', {
          to: selectedUser._id,
          offer: data,
          from: user._id,
          name: user.fullName,
        });
      } else if (signalData) {
        socket.emit('call-accepted', {
          to: selectedUser._id,
          answer: data,
        });
      }
    });

    peer.on('stream', (stream) => {
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      toast.error('Connection error occurred');
    });

    peer.on('close', () => {
      endCall();
    });

    if (signalData && !initiator) {
      peer.signal(signalData);
    }

    peerRef.current = peer;
    setPeer(peer);
  };

  const handleAcceptCall = () => {
    setCallStatus('connected');
    setCallStarted(true);
    startCallTimer();
    createPeer(false, callOffer);
  };

  const handleRejectCall = () => {
    socket.emit('call-rejected', { to: selectedUser._id });
    setCallStatus('rejected');
    endCall();
    onClose();
  };

  const handleStartCall = () => {
    setCallStatus('calling');
    createPeer(true);
  };

  const endCall = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    socket.emit('end-call', { to: selectedUser._id });
    setCallStatus('ended');
    setTimeout(() => onClose(), 1000);
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div 
        ref={modalRef}
        className="relative w-full h-full max-w-6xl mx-auto bg-gray-900 rounded-lg overflow-hidden"
      >
        {/* Remote Video */}
        <div className="relative w-full h-full bg-gray-800">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <IoPerson className="w-32 h-32 text-gray-600 mx-auto mb-4" />
                <p className="text-2xl text-white font-semibold">
                  {selectedUser?.fullName || 'User'}
                </p>
                <p className="text-gray-400 mt-2">
                  {callStatus === 'ringing' && 'Incoming call...'}
                  {callStatus === 'calling' && 'Calling...'}
                  {callStatus === 'connected' && formatDuration(callDuration)}
                  {callStatus === 'rejected' && 'Call rejected'}
                  {callStatus === 'ended' && 'Call ended'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video Preview */}
        <div className="absolute bottom-32 right-6 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-xl">
          {localStream && (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}
          {!localStream && (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <IoPerson className="w-12 h-12 text-gray-600" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="absolute top-6 left-6 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
          <p className="font-semibold">{selectedUser?.fullName}</p>
          <p className="text-sm text-gray-300">@{selectedUser?.username}</p>
        </div>

        {/* Call Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
          {!callStarted ? (
            isIncoming ? (
              <>
                <button
                  onClick={handleAcceptCall}
                  className="bg-green-500 hover:bg-green-600 text-white p-5 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg"
                  title="Accept Call"
                >
                  <IoCall className="w-8 h-8" />
                </button>
                <button
                  onClick={handleRejectCall}
                  className="bg-red-500 hover:bg-red-600 text-white p-5 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg"
                  title="Reject Call"
                >
                  <IoClose className="w-8 h-8" />
                </button>
              </>
            ) : (
              <button
                onClick={handleStartCall}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-3"
              >
                <IoCall className="w-6 h-6" />
                <span className="font-medium">Start Call</span>
              </button>
            )
          ) : (
            <>
              <button
                onClick={toggleVideo}
                className={`p-5 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg ${
                  isVideoOn 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
                title={isVideoOn ? 'Turn off video' : 'Turn on video'}
              >
                {isVideoOn ? (
                  <IoVideocam className="w-8 h-8" />
                ) : (
                  <IoVideocamOff className="w-8 h-8" />
                )}
              </button>
              
              <button
                onClick={toggleAudio}
                className={`p-5 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg ${
                  isAudioOn 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
                title={isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
              >
                {isAudioOn ? (
                  <IoMic className="w-8 h-8" />
                ) : (
                  <IoMicOff className="w-8 h-8" />
                )}
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="bg-gray-700 hover:bg-gray-600 text-white p-5 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg"
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <IoContract className="w-8 h-8" />
                ) : (
                  <IoExpand className="w-8 h-8" />
                )}
              </button>
              
              <button
                onClick={endCall}
                className="bg-red-500 hover:bg-red-600 text-white p-5 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg"
                title="End Call"
              >
                <IoClose className="w-8 h-8" />
              </button>
            </>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2"
          title="Close"
        >
          <IoClose className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};

export default VideoCallModal;