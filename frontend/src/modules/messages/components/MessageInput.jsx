import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, Paperclip, Smile, FileText, X, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import messagesService from '../services/messages.service';
import publicationService from '../../../services/publication.service';

const MessageInput = ({ conversationId, onSend, replyContext, onClearReply, editContext, onClearEdit, socket }) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [showPubDropdown, setShowPubDropdown] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Load user's publications for sharing
  const { data: pubsData } = useQuery({
    queryKey: ['myPublicationsForSharing'],
    queryFn: async () => {
      const res = await publicationService.getMyPublications({ limit: 10 });
      return res.data;
    },
    enabled: showPubDropdown
  });

  const publicationsList = pubsData?.docs || [];

  // When editContext changes, set the text input
  useEffect(() => {
    if (editContext) {
      setText(editContext.text || '');
    } else {
      setText('');
    }
  }, [editContext]);

  // Handle typing emissions
  const handleInputChange = (e) => {
    setText(e.target.value);

    if (socket && conversationId) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('chat:typing', { conversationId });
      }

      // Debounce stop typing signal
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('chat:stopTyping', { conversationId });
      }, 2000);
    }
  };

  // Upload attachment file
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Enforce 100MB limit
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size cannot exceed 100MB.');
      return;
    }

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await messagesService.uploadAttachment(formData);
      if (res.success) {
        setAttachedFile(res.data);
        toast.success(`Attached: ${file.name}`);
      } else {
        toast.error('File upload failed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload error');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSend = () => {
    if (!text.trim() && !attachedFile) return;

    if (editContext) {
      // Call edit
      onSend({
        action: 'edit',
        messageId: editContext._id,
        text: text.trim()
      });
    } else {
      // Send message
      onSend({
        action: 'send',
        text: text.trim(),
        attachmentId: attachedFile?._id,
        replyTo: replyContext?._id,
        type: attachedFile ? (attachedFile.fileType.startsWith('image/') ? 'image' : 'pdf') : 'text'
      });
    }

    // Reset input
    setText('');
    setAttachedFile(null);
    if (isTyping && socket && conversationId) {
      setIsTyping(false);
      socket.emit('chat:stopTyping', { conversationId });
    }
  };

  const handleSharePublication = (pub) => {
    const meta = {
      title: pub.title,
      slug: pub.slug,
      authors: pub.authors ? pub.authors.join(', ') : '',
      journal: pub.journal || ''
    };

    onSend({
      action: 'send',
      text: JSON.stringify(meta),
      type: 'publication'
    });

    setShowPubDropdown(false);
  };

  return (
    <div className="border-t border-slate-200 p-4 bg-white space-y-3 relative z-20">
      
      {/* Reply Scope Preview */}
      {replyContext && (
        <div className="flex justify-between items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
            Replying to: <span className="italic">"{replyContext.text}"</span>
          </span>
          <button onClick={onClearReply} className="p-0.5 hover:bg-slate-200 rounded-full cursor-pointer">
            <X className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      )}

      {/* Edit Scope Preview */}
      {editContext && (
        <div className="flex justify-between items-center bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
            Editing message
          </span>
          <button onClick={onClearEdit} className="p-0.5 hover:bg-amber-100 rounded-full cursor-pointer">
            <X className="w-3.5 h-3.5 text-amber-750" />
          </button>
        </div>
      )}

      {/* Attached file bar */}
      {attachedFile && (
        <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide truncate max-w-[250px]">
            Attachment: {attachedFile.filename}
          </span>
          <button onClick={() => setAttachedFile(null)} className="p-0.5 hover:bg-emerald-100 rounded-full cursor-pointer">
            <X className="w-3.5 h-3.5 text-emerald-700" />
          </button>
        </div>
      )}

      {/* Input controls bar */}
      <div className="flex items-center gap-2 relative">
        {/* Attachment uploader */}
        <label className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer border border-slate-200 shadow-xs relative">
          <Paperclip className="w-4 h-4" />
          <input 
            type="file" 
            onChange={handleFileChange} 
            className="hidden" 
            disabled={uploadingFile || !!editContext}
          />
          {uploadingFile && (
            <span className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
              <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </span>
          )}
        </label>

        {/* Share Publication Button */}
        {!editContext && (
          <div className="relative">
            <button
              onClick={() => setShowPubDropdown(!showPubDropdown)}
              className="p-2 hover:bg-slate-100 text-slate-500 hover:text-[#2563EB] rounded-xl transition-all border border-slate-200 shadow-xs cursor-pointer"
              title="Share Publication"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Publication Dropdown */}
            {showPubDropdown && (
              <div className="absolute bottom-10 left-0 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 max-h-60 overflow-y-auto space-y-2 text-left animate-in fade-in duration-200">
                <div className="flex justify-between items-center border-b border-slate-150 pb-1.5 mb-1">
                  <h6 className="text-[10px] font-black uppercase text-slate-800 tracking-wider">
                    Share a Publication
                  </h6>
                  <button onClick={() => setShowPubDropdown(false)} className="p-0.5 hover:bg-slate-150 rounded-full cursor-pointer">
                    <X className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
                {publicationsList.length > 0 ? (
                  publicationsList.map((pub) => (
                    <div 
                      key={pub._id}
                      onClick={() => handleSharePublication(pub)}
                      className="p-2 hover:bg-slate-50 border border-slate-100 rounded-xl cursor-pointer transition-colors text-left space-y-0.5"
                    >
                      <p className="text-[11px] font-black text-slate-800 line-clamp-1">{pub.title}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase truncate">
                        {pub.authors ? pub.authors.join(', ') : 'Me'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 font-bold py-4 text-center">
                    No publications found to share
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Text Input */}
        <input
          type="text"
          value={text}
          onChange={handleInputChange}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          placeholder={editContext ? "Edit message..." : "Type a message..."}
          className="flex-1 px-4 py-2 border border-slate-250 bg-slate-50 focus:bg-white rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-colors shadow-xs pr-8"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!text.trim() && !attachedFile}
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-40 disabled:scale-100 active:scale-95 flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
