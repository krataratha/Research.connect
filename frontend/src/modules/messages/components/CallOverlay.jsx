import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, ScreenShare, Hand, Volume2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CallOverlay = ({ callState, onAccept, onDecline, onHangup, socket }) => {
  const { status, type, callerName, callerImage, callId, targetUserId } = callState;

  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(type === 'video');
  const [screenSharing, setScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const screenTrackRef = useRef(null);

  // Call timer effect
  useEffect(() => {
    let timer;
    if (status === 'active') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [status]);

  // Setup WebRTC connection when call becomes active
  useEffect(() => {
    if (status !== 'active' || !socket || !targetUserId) return;

    const setupWebRTC = async () => {
      try {
        // 1. Get User Media
        const constraints = {
          audio: true,
          video: type === 'video' ? { width: 1280, height: 720 } : false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;
        if (localVideoRef.current && type === 'video') {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Create Peer Connection
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        });
        peerConnectionRef.current = pc;

        // Add local tracks
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        // Handle remote tracks
        pc.ontrack = (event) => {
          console.log('📡 WebRTC: Received remote track');
          remoteStreamRef.current = event.streams[0];
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate && socket) {
            socket.emit('call:signal', {
              targetUserId,
              signal: { candidate: event.candidate }
            });
          }
        };

        // Signaling socket listener
        socket.on('call:signal', async ({ senderId, signal }) => {
          if (senderId.toString() !== targetUserId.toString()) return;

          try {
            if (signal.sdp) {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
              if (signal.sdp.type === 'offer') {
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('call:signal', {
                  targetUserId: senderId,
                  signal: { sdp: answer }
                });
              }
            } else if (signal.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
          } catch (signalingErr) {
            console.error('WebRTC description/candidate error:', signalingErr);
          }
        });

        // If I am the initiator/caller, create the SDP offer
        // (Wait briefly for candidates or generate offer immediately)
        if (callState.initiator === true) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('call:signal', {
            targetUserId,
            signal: { sdp: offer }
          });
        }
      } catch (err) {
        console.error('Error starting WebRTC call stream:', err);
      }
    };

    setupWebRTC();

    return () => {
      // Clean up Peer Connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      // Clean up Local Stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      // Clean up screen tracks
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }
      if (socket) {
        socket.off('call:signal');
      }
    };
  }, [status, targetUserId, type, socket]);

  // Toggle Microphone
  const toggleMic = () => {
    const nextVal = !micActive;
    setMicActive(nextVal);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = nextVal;
      });
    }
  };

  // Toggle Video
  const toggleVideo = () => {
    const nextVal = !videoActive;
    setVideoActive(nextVal);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = nextVal;
      });
    }
  };

  // Screen Share Handler
  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        if (peerConnectionRef.current) {
          const senders = peerConnectionRef.current.getSenders();
          const videoSender = senders.find(s => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          }
        }

        screenTrack.onended = () => {
          stopScreenSharing();
        };

        setScreenSharing(true);
      } catch (err) {
        console.error('Failed to share screen:', err);
      }
    } else {
      stopScreenSharing();
    }
  };

  const stopScreenSharing = () => {
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }
    // Restore normal video track
    if (localStreamRef.current && peerConnectionRef.current) {
      const normalVideoTrack = localStreamRef.current.getVideoTracks()[0];
      const senders = peerConnectionRef.current.getSenders();
      const videoSender = senders.find(s => s.track && s.track.kind === 'video');
      if (videoSender && normalVideoTrack) {
        videoSender.replaceTrack(normalVideoTrack);
      }
    }
    setScreenSharing(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#0F172A] flex flex-col items-center justify-between p-6 text-white select-none animate-in fade-in"
      >
        {/* Top Header */}
        <div className="w-full flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/5 text-xs font-bold uppercase tracking-wider">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Secure WebRTC {type} call</span>
          </div>
          {status === 'active' && (
            <div className="text-sm font-black text-slate-300 tabular-nums bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
              {formatTime(callDuration)}
            </div>
          )}
        </div>

        {/* Center Content Section */}
        <div className="flex-1 w-full max-w-6xl flex items-center justify-center py-4 relative">
          {status === 'active' && type === 'video' ? (
            <div className="w-full h-full min-h-[450px] relative rounded-3xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl">
              {/* Remote full screen video */}
              <video 
                ref={remoteVideoRef}
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              
              {/* Floating pip local video */}
              {videoActive && (
                <div className="absolute top-4 right-4 w-40 h-28 sm:w-48 sm:h-36 rounded-2xl overflow-hidden border border-white/20 shadow-lg bg-slate-950 z-10">
                  <video 
                    ref={localVideoRef}
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                </div>
              )}

              {/* Overlay controls when screen sharing or raising hand */}
              {handRaised && (
                <div className="absolute bottom-4 left-4 bg-amber-500 text-slate-950 px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 animate-bounce">
                  <Hand className="w-4 h-4 fill-slate-950" /> Hand Raised
                </div>
              )}
            </div>
          ) : (
            // Audio call view / Dialing / Incoming Call View
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl bg-slate-800">
                <img 
                  src={callerImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"}
                  alt={callerName}
                  className="w-full h-full object-cover"
                />
                {(status === 'dialing' || status === 'incoming') && (
                  <span className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-60" />
                )}
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black">{callerName || 'Researcher'}</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  {status === 'dialing' && 'Dialing call...'}
                  {status === 'incoming' && 'Incoming Call'}
                  {status === 'active' && 'Call Connected'}
                </p>
              </div>

              {/* Remote Audio output tag for audio-only calls */}
              {status === 'active' && type === 'voice' && (
                <audio ref={remoteVideoRef} autoPlay playsInline className="hidden" />
              )}
            </div>
          )}
        </div>

        {/* Bottom Call Action Controls Bar */}
        <div className="w-full max-w-md flex items-center justify-center gap-6 py-4 bg-white/5 border border-white/5 rounded-3xl backdrop-blur-md px-8 shadow-xl mb-4">
          {status === 'incoming' ? (
            <>
              {/* Accept button */}
              <button 
                onClick={onAccept}
                className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Phone className="w-6 h-6 fill-white" />
              </button>
              {/* Decline button */}
              <button 
                onClick={onDecline}
                className="w-14 h-14 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-rose-500/20"
              >
                <PhoneOff className="w-6 h-6 fill-white" />
              </button>
            </>
          ) : (
            <>
              {/* Audio mute toggle */}
              <button 
                onClick={toggleMic}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer border ${micActive ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-rose-500 border-rose-500 hover:bg-rose-600'}`}
                title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              {type === 'video' && (
                <>
                  {/* Camera toggle */}
                  <button 
                    onClick={toggleVideo}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer border ${videoActive ? 'bg-white/10 border-white/10 hover:bg-white/20' : 'bg-slate-700 border-slate-700 hover:bg-slate-600'}`}
                    title={videoActive ? 'Turn Video Off' : 'Turn Video On'}
                  >
                    {videoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>

                  {/* Screen share toggle */}
                  <button 
                    onClick={toggleScreenShare}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer border ${screenSharing ? 'bg-emerald-500 border-emerald-500 hover:bg-emerald-600' : 'bg-white/10 border-white/10 hover:bg-white/20'}`}
                    title={screenSharing ? 'Stop Screen Share' : 'Start Screen Share'}
                  >
                    <ScreenShare className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Hand raise */}
              <button 
                onClick={() => setHandRaised(!handRaised)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer border ${handRaised ? 'bg-amber-500 border-amber-500' : 'bg-white/10 border-white/10 hover:bg-white/20'}`}
                title="Raise Hand"
              >
                <Hand className="w-5 h-5" />
              </button>

              {/* Hangup button */}
              <button 
                onClick={onHangup}
                className="w-12 h-12 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-rose-500/20"
                title="End Call"
              >
                <PhoneOff className="w-5 h-5 fill-white" />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CallOverlay;
