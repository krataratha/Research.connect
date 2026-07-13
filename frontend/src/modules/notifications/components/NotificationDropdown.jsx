import React, { useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCheck, Trash2, ArrowUpRight, BellOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import notificationsService from '../services/notifications.service';
import connectionsService from '../../connections/services/connections.service';
import { formatTimeAgo } from './NotificationCard';
import UserAvatar from '../../../components/ui/Avatar';

const NotificationDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dropdownRef = useRef(null);

  // Pending connection requests (surfaced here on mobile, since the
  // standalone Requests icon is hidden below the md breakpoint)
  const { data: receivedRequests } = useQuery({
    queryKey: ['connectionRequests', 'received'],
    queryFn: async () => {
      const res = await connectionsService.getReceivedRequests();
      return res.data || [];
    }
  });

  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId) => connectionsService.acceptConnectionRequest(requestId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Connection request accepted!');
        queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
        queryClient.invalidateQueries({ queryKey: ['connections'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    }
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId) => connectionsService.rejectConnectionRequest(requestId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Connection request ignored.');
        queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
      }
    }
  });

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  // Fetch latest 20 notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications', { limit: 20 }],
    queryFn: async () => {
      const res = await notificationsService.getNotifications({ limit: 20 });
      return res.data;
    }
  });

  const notifications = notificationsData?.docs || [];

  // Mark all read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return await notificationsService.markAllRead();
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success('All notifications marked as read.');
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      }
    }
  });

  // Mark single read mutation
  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      return await notificationsService.markAsRead(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    }
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await notificationsService.deleteNotification(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    }
  });

  const handleItemClick = (n) => {
    if (!n.isRead) {
      markReadMutation.mutate(n._id);
    }
    if (n.targetUrl) {
      navigate(n.targetUrl);
    }
    onClose();
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    markAllReadMutation.mutate();
  };

  return (
    <div 
      ref={dropdownRef}
      className="fixed sm:absolute right-2 left-2 sm:left-auto sm:right-0 top-16 sm:top-auto mt-0 sm:mt-2 w-auto sm:w-80 max-w-[calc(100vw-1rem)] sm:max-w-none bg-white border border-slate-200 rounded-3xl shadow-xl z-50 overflow-hidden text-left flex flex-col max-h-[75vh] sm:max-h-[460px] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50">
        <div>
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Notifications</h4>
          <p className="text-[9px] text-[#475569] font-bold uppercase tracking-wider">Latest updates</p>
        </div>
        
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
            className="flex items-center gap-1 text-[10px] font-black uppercase text-[#2563EB] hover:text-[#1D4ED8] bg-white border border-slate-200 px-2 py-1 rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Pending Requests - mobile only (desktop has a dedicated Requests icon) */}
      <div className="md:hidden border-b border-slate-100 bg-slate-50/50 px-4 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-wide">Pending requests</span>
          {receivedRequests && receivedRequests.length > 0 && (
            <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {receivedRequests.length}
            </span>
          )}
        </div>
        {receivedRequests && receivedRequests.length > 0 ? (
          <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto">
            {receivedRequests.map((req) => (
              <div key={req._id} className="border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                <p className="text-xs font-bold text-slate-800">{req.user?.fullName}</p>
                {req.profile?.headline && (
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{req.profile.headline}</p>
                )}
                {req.note && (
                  <p className="text-[10px] text-slate-500 italic truncate mt-1" title={req.note}>
                    "{req.note}"
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => acceptRequestMutation.mutate(req._id)}
                    disabled={acceptRequestMutation.isPending}
                    className="text-[11px] font-bold px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectRequestMutation.mutate(req._id)}
                    disabled={rejectRequestMutation.isPending}
                    className="text-[11px] font-bold px-3 py-1 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Ignore
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 italic text-center py-1">No pending requests.</p>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
        {isLoading ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-400 animate-pulse">
            Loading notifications...
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <div 
              key={n._id}
              onClick={() => handleItemClick(n)}
              className={`p-3.5 flex items-start gap-3 hover:bg-slate-50/60 transition-colors cursor-pointer relative ${
                !n.isRead ? 'bg-blue-50/15' : ''
              }`}
            >
              {/* Unread indicator */}
              {!n.isRead && (
                <span className="absolute top-4 right-4 w-2 h-2 bg-blue-600 rounded-full" />
              )}

              {/* Avatar */}
              <UserAvatar
                user={n.actorId}
                size="sm"
                className="shrink-0"
              />

              {/* Text content */}
              <div className="flex-1 min-w-0 space-y-0.5 pr-4">
                <p className="text-[11px] font-bold text-slate-800 leading-tight">
                  {n.title}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 leading-relaxed truncate">
                  {n.message}
                </p>
                <span className="text-[8px] font-bold text-slate-400 block pt-0.5">
                  {formatTimeAgo(n.createdAt)}
                </span>
              </div>

              {/* Delete trigger */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMutation.mutate(n._id);
                }}
                className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded-md transition-colors shrink-0 align-middle"
                title="Dismiss"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <BellOff className="w-8 h-8 mx-auto opacity-40" />
            <p className="text-xs font-semibold">No notifications yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <Link 
        to="/notifications" 
        onClick={onClose}
        className="block text-center py-2.5 bg-slate-50 border-t border-slate-100 text-[10px] font-black uppercase text-[#2563EB] hover:text-[#1D4ED8] hover:bg-slate-100 transition-colors tracking-wider"
      >
        <span>View all notifications</span>
      </Link>
    </div>
  );
};

export default NotificationDropdown;