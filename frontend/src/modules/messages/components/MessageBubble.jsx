import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, CheckCheck, Smile, Edit2, Trash2, Reply, Copy, FileText, ExternalLink, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import messagesService from '../services/messages.service';

const EMOJIS = ['👍', '❤️', '👏', '💡', '😮', '❓'];

const MessageBubble = ({ message, onReply, onEditInit }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showReactions, setShowReactions] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const { _id, senderId, text, type, attachment, replyTo, status, edited, deleted, createdAt, reactions = [] } = message;
  const isMe = senderId === user.id || senderId._id === user.id;

  // React mutation
  const reactMutation = useMutation({
    mutationFn: async (emoji) => {
      return await messagesService.reactToMessage(_id, emoji);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', message.conversationId] });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (deleteType) => {
      return await messagesService.deleteMessage(_id, deleteType);
    },
    onSuccess: (_, variables) => {
      toast.success(variables === 'everyone' ? 'Message deleted for everyone' : 'Message deleted');
      queryClient.invalidateQueries({ queryKey: ['messages', message.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(text || '');
    toast.success('Text copied to clipboard');
  };

  const getStatusIcon = () => {
    if (status === 'seen') return <CheckCheck className="w-3.5 h-3.5 text-blue-500" />;
    if (status === 'delivered') return <CheckCheck className="w-3.5 h-3.5 text-slate-400" />;
    return <Check className="w-3.5 h-3.5 text-slate-350" />;
  };

  // Parse custom metadata fields (e.g. shared publication info)
  let parsedMeta = null;
  if (text && (type === 'publication' || type === 'project' || type === 'dataset')) {
    try {
      parsedMeta = JSON.parse(text);
    } catch (e) {
      // Treat as plain text fallback
    }
  }

  return (
    <div 
      className={`flex flex-col max-w-[70%] space-y-1 relative group ${
        isMe ? 'self-end items-end' : 'self-start items-start'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactions(false);
      }}
    >
      {/* Reply header preview */}
      {replyTo && !deleted && (
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
          <Reply className="w-3 h-3 text-slate-350" />
          <span>Replied to: {replyTo.deleted ? 'Deleted message' : replyTo.text}</span>
        </div>
      )}

      {/* Main Bubble */}
      <div 
        className={`p-3 rounded-2xl relative shadow-xs leading-relaxed text-xs border ${
          deleted
            ? 'bg-slate-50 border-slate-200 text-slate-400 italic'
            : isMe
              ? 'bg-blue-600 border-blue-600 text-white rounded-br-none'
              : 'bg-white border-slate-250 text-slate-800 rounded-bl-none'
        }`}
      >
        {/* Render text / parsed metadata */}
        {deleted ? (
          <span>{text}</span>
        ) : parsedMeta ? (
          <div className="space-y-2 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider block text-slate-400">
              Shared {type}
            </span>
            <h5 className={`font-black text-xs ${isMe ? 'text-white' : 'text-slate-900'}`}>
              {parsedMeta.title || parsedMeta.name}
            </h5>
            {parsedMeta.authors && (
              <p className="text-[10px] opacity-90 font-semibold">{parsedMeta.authors}</p>
            )}
            {parsedMeta.journal && (
              <p className="text-[9px] opacity-75 font-semibold italic">{parsedMeta.journal}</p>
            )}
            <a 
              href={parsedMeta.url || `/publication/${parsedMeta.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1 text-[10px] font-black uppercase pt-1.5 w-fit ${
                isMe ? 'text-white hover:underline' : 'text-[#2563EB] hover:text-[#1D4ED8]'
              }`}
            >
              <span>View Resource</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ) : (
          <span className="whitespace-pre-wrap">{text}</span>
        )}

        {/* Attachment rendering */}
        {attachment && !deleted && (
          <div className="mt-2 pt-2 border-t border-white/10 text-left space-y-1.5">
            {attachment.fileType?.startsWith('image/') ? (
              <img 
                src={attachment.url} 
                alt={attachment.filename} 
                className="max-h-48 rounded-xl object-cover border border-slate-200 cursor-pointer"
                onClick={() => window.open(attachment.url, '_blank')}
              />
            ) : (
              <a 
                href={attachment.url} 
                target="_blank" 
                rel="noreferrer"
                className={`flex items-center gap-2 p-2 rounded-xl text-[10px] font-bold border transition-all ${
                  isMe 
                    ? 'bg-blue-700/50 border-blue-500 text-white hover:bg-blue-700' 
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-500" />
                <span className="truncate max-w-[150px]">{attachment.filename}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            )}
          </div>
        )}

        {/* Edit / Time footer */}
        <div className="flex items-center justify-end gap-1.5 mt-1.5 opacity-75 text-[9px] font-bold">
          {edited && <span>(edited)</span>}
          <span>
            {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {isMe && !deleted && getStatusIcon()}
        </div>
      </div>

      {/* Reactions List */}
      {reactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {reactions.map((react) => (
            <span 
              key={react._id}
              className="px-1.5 py-0.5 bg-slate-50 border border-slate-200 text-[10px] rounded-lg cursor-help flex items-center gap-0.5"
              title={`${react.userId?.firstName} reacted with ${react.reaction}`}
            >
              <span>{react.reaction}</span>
            </span>
          ))}
        </div>
      )}

      {/* Bubble Action Floating Controls */}
      {showActions && !deleted && (
        <div 
          className={`absolute top-0 p-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 flex items-center gap-1 animate-in fade-in duration-100 ${
            isMe ? 'left-0 -translate-x-full -ml-2' : 'right-0 translate-x-full mr-2'
          }`}
        >
          {/* Reaction Picker Button */}
          <div className="relative">
            <button 
              onClick={() => setShowReactions(!showReactions)}
              className="p-1 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Add Reaction"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>
            {showReactions && (
              <div className="absolute bottom-6 left-0 bg-white border border-slate-250 p-1.5 rounded-xl shadow-xl flex gap-1.5 z-20">
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      reactMutation.mutate(emoji);
                      setShowReactions(false);
                    }}
                    className="text-sm hover:scale-125 transition-transform cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={onReply}
            className="p-1 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Reply"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={handleCopy}
            className="p-1 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Copy Text"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {isMe && (
            <button 
              onClick={onEditInit}
              className="p-1 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {isMe ? (
            <button 
              onClick={() => {
                if (window.confirm('Delete message for everyone?')) {
                  deleteMutation.mutate('everyone');
                }
              }}
              className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
              title="Delete for Everyone"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button 
              onClick={() => {
                if (window.confirm('Delete message for yourself?')) {
                  deleteMutation.mutate('me');
                }
              }}
              className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
              title="Delete for Me"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
