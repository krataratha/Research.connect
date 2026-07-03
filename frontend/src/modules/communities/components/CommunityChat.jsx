import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from '../../../context/SocketContext';

export default function CommunityChat({ community, isMember }) {
  const { socket } = useSocket();
  const { user } = useSelector(state => state.auth);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(null);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    if (!socket || !community?._id) return;
    socket.emit('community:join', { communityId: community._id });

    socket.on('community:message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('community:typing', ({ userId, username }) => {
      if (userId !== user?._id) setTyping(username);
    });

    socket.on('community:stopTyping', () => setTyping(null));

    return () => {
      socket.emit('community:leave', { communityId: community._id });
      socket.off('community:message');
      socket.off('community:typing');
      socket.off('community:stopTyping');
    };
  }, [socket, community?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim() || !socket) return;
    socket.emit('community:message', { communityId: community._id, text });
    setText('');
    socket.emit('community:stopTyping', { communityId: community._id });
  };

  const handleTyping = (val) => {
    setText(val);
    if (!socket) return;
    socket.emit('community:typing', { communityId: community._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('community:stopTyping', { communityId: community._id });
    }, 2000);
  };

  if (!isMember) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <div className="text-4xl mb-3">🔒</div>
        <p>Join the community to access the chat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center pt-12 text-gray-500 text-sm">
            Start the conversation — say hello!
          </div>
        )}
        {messages.map((msg, idx) => {
          const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
          const senderName = msg.senderId?.firstName || 'Someone';
          return (
            <div key={idx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {senderName.charAt(0)}
              </div>
              <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {!isMe && <span className="text-xs text-gray-500">{senderName}</span>}
                <div className={`px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-tr-sm'
                    : 'bg-gray-800 text-gray-200 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      {typing && (
        <div className="px-4 py-1 text-xs text-gray-500">{typing} is typing...</div>
      )}

      {/* Input */}
      <div className="border-t border-gray-800 p-4 flex items-center gap-3">
        <input
          value={text}
          onChange={e => handleTyping(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Message the community..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 flex items-center justify-center text-white disabled:opacity-50 hover:opacity-90 transition-all"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
