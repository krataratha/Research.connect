import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Trash2, Eye, Circle, Mail, Users, FileText, Sparkles, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import notificationsService from '../services/notifications.service';

const formatTimeAgo = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDays}d ago`;
};

const getNotificationIcon = (type) => {
  const baseClass = "w-4 h-4";
  if (type.startsWith('follow')) return <Sparkles className={`${baseClass} text-indigo-500`} />;
  if (type.startsWith('connection')) return <Users className={`${baseClass} text-blue-500`} />;
  if (type.startsWith('publication')) return <FileText className={`${baseClass} text-emerald-500`} />;
  if (type.startsWith('comment') || type.startsWith('mention')) return <MessageSquare className={`${baseClass} text-pink-500`} />;
  return <Mail className={`${baseClass} text-slate-400`} />;
};

const NotificationCard = ({ notification }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { _id, actorId, title, message, isRead, createdAt, targetUrl } = notification;

  const actorName = actorId ? `${actorId.firstName} ${actorId.lastName}` : 'Someone';
  const actorImage = actorId?.profileImage;

  // Mark read mutation
  const markReadMutation = useMutation({
    mutationFn: async () => {
      return await notificationsService.markAsRead(_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await notificationsService.deleteNotification(_id);
    },
    onSuccess: () => {
      toast.success('Notification deleted');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    }
  });

  const handleCardClick = () => {
    if (!isRead) {
      markReadMutation.mutate();
    }
    if (targetUrl) {
      navigate(targetUrl);
    }
  };

  return (
    <div 
      className={`p-4 border rounded-2xl transition-all duration-250 flex items-start justify-between gap-4 text-left relative overflow-hidden ${
        isRead 
          ? 'bg-white border-slate-200 hover:border-slate-350' 
          : 'bg-blue-50/30 border-blue-100 hover:border-blue-200'
      }`}
    >
      {/* Unread indicator dot */}
      {!isRead && (
        <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-blue-600 rounded-full" />
      )}

      <div className="flex gap-3.5 items-start cursor-pointer flex-1 min-w-0" onClick={handleCardClick}>
        {/* Actor Avatar / Icon stack */}
        <div className="relative shrink-0">
          <img
            src={actorImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
            alt={actorName}
            className="w-11 h-11 rounded-full object-cover border border-slate-100"
          />
          <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-xs border border-slate-100 flex items-center justify-center">
            {getNotificationIcon(notification.type)}
          </div>
        </div>

        {/* Message details */}
        <div className="space-y-0.5 flex-1 min-w-0 pr-8">
          <h4 className="text-xs font-black text-slate-900 leading-tight">
            {title}
          </h4>
          <p className="text-[11px] font-semibold text-[#475569] leading-relaxed break-words">
            {message}
          </p>
          <span className="text-[9px] font-bold text-slate-400 block pt-0.5">
            {formatTimeAgo(createdAt)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 shrink-0 self-center">
        {!isRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              markReadMutation.mutate();
            }}
            disabled={markReadMutation.isPending}
            className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all cursor-pointer border border-transparent hover:border-emerald-100"
            title="Mark as Read"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteMutation.mutate();
          }}
          disabled={deleteMutation.isPending}
          className="p-1.5 hover:bg-red-50 text-red-650 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-100"
          title="Delete Notification"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;
export { formatTimeAgo };
