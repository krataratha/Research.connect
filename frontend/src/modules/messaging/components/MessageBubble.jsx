import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, CheckCheck, Smile, Edit2, Trash2, Reply, Copy, FileText, ExternalLink, MoreHorizontal, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import messagesService from '../services/messages.service';

const EMOJIS = ['👍', '❤️', '👏', '💡', '😮', '❓'];

const MessageBubble = ({ message, onReply, onEditInit, otherParticipant }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);

  const { _id, senderId, text, type, attachment, replyTo, status, edited, deleted, createdAt, reactions = [] } = message;

  // senderId can arrive as a plain string, a raw ObjectId, or a populated
  // { _id, firstName, ... } user object depending on the API path. Normalize
  // both sides to a plain string before comparing, otherwise messages can
  // silently all render on the same side (e.g. "aaa123" !== { _id: "aaa123" }).
  const toIdString = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return String(val._id || val.id || val);
    return String(val);
  };
  const isMe = toIdString(senderId) === toIdString(user?.userId || user?._id || user?.id);

  const reactMutation = useMutation({
    mutationFn: async (emoji) => await messagesService.reactToMessage(_id, emoji),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages', message.conversationId] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (deleteType) => await messagesService.deleteMessage(_id, deleteType),
    onSuccess: (_, variables) => {
      toast.success(variables === 'everyone' ? 'Message deleted for everyone' : 'Message deleted');
      queryClient.invalidateQueries({ queryKey: ['messages', message.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(text || '');
    toast.success('Text copied to clipboard');
    setSheetOpen(false);
  };

  const getStatusIcon = () => {
    if (status === 'seen') return <CheckCheck className="w-3.5 h-3.5 text-sky-300" />;
    if (status === 'delivered') return <CheckCheck className="w-3.5 h-3.5 text-white/60" />;
    return <Check className="w-3.5 h-3.5 text-white/60" />;
  };

  let parsedMeta = null;
  if (text && (type === 'publication' || type === 'project' || type === 'dataset')) {
    try { parsedMeta = JSON.parse(text); } catch (e) { /* fallback to plain text */ }
  }

  const avatarUrl = otherParticipant?.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150";

  return (
    <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] gap-1 relative group ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
      {replyTo && !deleted && (
        <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 px-1">
          <Reply className="w-3 h-3 text-slate-350" />
          <span className="truncate max-w-[220px]">{replyTo.deleted ? 'Deleted message' : replyTo.text}</span>
        </div>
      )}

      <div className="flex items-end gap-1.5">
        {isMe && (
          <button onClick={() => setSheetOpen(true)} className="p-1.5 text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0 order-1">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}

        <div className={`px-3.5 py-2.5 rounded-3xl relative leading-relaxed text-[13px] ${
          deleted ? 'bg-slate-100 text-slate-400 italic'
            : isMe ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-md shadow-sm shadow-blue-200'
              : 'bg-white text-slate-800 rounded-bl-md shadow-sm border border-slate-100'
        }`}>
          {deleted ? (
            <span>{text}</span>
          ) : parsedMeta ? (
            <div className="space-y-2 text-left min-w-[180px]">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${isMe ? 'text-white/70' : 'text-slate-400'}`}>📄 Shared {type}</span>
              <h5 className={`font-bold text-[13px] ${isMe ? 'text-white' : 'text-slate-900'}`}>{parsedMeta.title || parsedMeta.name}</h5>
              {parsedMeta.authors && <p className="text-[11px] opacity-90 font-medium">{parsedMeta.authors}</p>}
              {parsedMeta.journal && <p className="text-[10px] opacity-75 font-medium italic">{parsedMeta.journal}</p>}
              <a href={parsedMeta.url || `/publication/${parsedMeta.slug}`} target="_blank" rel="noopener noreferrer"
                className={`flex items-center gap-1 text-[11px] font-bold pt-1 w-fit ${isMe ? 'text-white hover:underline' : 'text-blue-600 hover:text-blue-700'}`}>
                <span>View Resource</span><ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <span className="whitespace-pre-wrap break-words">{text}</span>
          )}

          {attachment && !deleted && (
            <div className={`mt-2 pt-2 text-left space-y-1.5 ${text ? `border-t ${isMe ? 'border-white/20' : 'border-slate-100'}` : ''}`}>
              {attachment.fileType?.startsWith('image/') ? (
                <img src={attachment.url} alt={attachment.filename} className="max-h-56 w-full rounded-2xl object-cover cursor-pointer" onClick={() => window.open(attachment.url, '_blank')} />
              ) : (
                <a href={attachment.url} target="_blank" rel="noreferrer"
                  className={`flex items-center gap-2 p-2 rounded-xl text-[11px] font-bold transition-all ${isMe ? 'bg-white/15 hover:bg-white/25 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'}`}>
                  <FileText className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="truncate max-w-[160px]">{attachment.filename}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              )}
            </div>
          )}

          <div className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] font-semibold ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
            {edited && <span>edited</span>}
            <span>{new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {isMe && !deleted && getStatusIcon()}
          </div>
        </div>

        {!isMe && (
          <button onClick={() => setSheetOpen(true)} className="p-1.5 text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        )}
      </div>

      <button onClick={() => setSheetOpen(true)} className={`sm:hidden text-[10px] text-slate-300 px-1 ${isMe ? 'self-end' : 'self-start'}`}>•••</button>

      {reactions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {reactions.map((react) => (
            <span key={react._id} className="px-1.5 py-0.5 bg-white border border-slate-200 text-[11px] rounded-full shadow-xs cursor-help" title={`${react.userId?.firstName} reacted with ${react.reaction}`}>
              {react.reaction}
            </span>
          ))}
        </div>
      )}

      {sheetOpen && !deleted && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center sm:justify-center" onClick={() => setSheetOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div onClick={(e) => e.stopPropagation()} className="relative w-full sm:w-64 bg-white rounded-t-3xl sm:rounded-2xl p-2 shadow-2xl">
            <div className="sm:hidden w-10 h-1 bg-slate-200 rounded-full mx-auto my-2.5" />
            <div className="flex items-center justify-center gap-2 px-2 py-3 border-b border-slate-100 mb-1">
              {EMOJIS.map(emoji => (
                <button key={emoji} onClick={() => { reactMutation.mutate(emoji); setSheetOpen(false); }} className="text-xl hover:scale-125 transition-transform cursor-pointer">{emoji}</button>
              ))}
            </div>
            <button onClick={() => { onReply(); setSheetOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 cursor-pointer">
              <Reply className="w-4 h-4" /> Reply
            </button>
            <button onClick={handleCopy} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 cursor-pointer">
              <Copy className="w-4 h-4" /> Copy text
            </button>
            {isMe && (
              <button onClick={() => { onEditInit(); setSheetOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 cursor-pointer">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            )}
            <button
              onClick={() => {
                const confirmMsg = isMe ? 'Delete message for everyone?' : 'Delete message for yourself?';
                if (window.confirm(confirmMsg)) deleteMutation.mutate(isMe ? 'everyone' : 'me');
                setSheetOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-red-50 rounded-xl text-sm font-semibold text-red-500 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> {isMe ? 'Delete for everyone' : 'Delete for me'}
            </button>
            <button onClick={() => setSheetOpen(false)} className="w-full text-center px-3 py-3 mt-1 text-sm font-bold text-slate-400 hover:text-slate-600 cursor-pointer sm:hidden">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;