import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Check, 
  Trash2, 
  Award, 
  MessageSquare, 
  UserPlus, 
  BookOpen, 
  ShieldAlert, 
  Heart, 
  MessageCircle, 
  Share2, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/notifications');
      setNotifications(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Could not load notifications. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'Recommendation':
        return {
          bg: 'bg-indigo-50/50 border-indigo-100',
          icon: <Sparkles className="w-5 h-5 text-indigo-600" />,
          color: 'text-indigo-600'
        };
      case 'Publication':
        return {
          bg: 'bg-blue-50/50 border-blue-100',
          icon: <BookOpen className="w-5 h-5 text-blue-600" />,
          color: 'text-blue-600'
        };
      case 'Collaboration':
        return {
          bg: 'bg-emerald-50/50 border-emerald-100',
          icon: <RefreshCw className="w-5 h-5 text-emerald-600" />,
          color: 'text-emerald-600'
        };
      case 'Follow':
        return {
          bg: 'bg-purple-50/50 border-purple-100',
          icon: <UserPlus className="w-5 h-5 text-purple-600" />,
          color: 'text-purple-600'
        };
      case 'Message':
        return {
          bg: 'bg-orange-50/50 border-orange-100',
          icon: <MessageSquare className="w-5 h-5 text-orange-600" />,
          color: 'text-orange-600'
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-100',
          icon: <Bell className="w-5 h-5 text-slate-500" />,
          color: 'text-slate-500'
        };
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type.toLowerCase() === filter.toLowerCase();
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-3">
            <Bell className="w-7 h-7 text-blue-600 animate-bounce" /> Notifications Center
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Stay updated with your co-authors, citations, and collaboration projects.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200/40 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-blue-500/5"
            >
              <Check className="w-4 h-4" /> Mark All Read
            </button>
          )}
          <button 
            onClick={fetchNotifications}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-all cursor-pointer"
            title="Refresh Feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {[
          { label: 'All', id: 'all' },
          { label: `Unread (${unreadCount})`, id: 'unread' },
          { label: 'Publications', id: 'publication' },
          { label: 'Collaborations', id: 'collaboration' },
          { label: 'Recommendations', id: 'recommendation' },
          { label: 'Follows', id: 'follow' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              filter === tab.id 
                ? 'bg-slate-900 border-slate-900 text-white' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-white border border-slate-200 rounded-xl animate-pulse p-4 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3.5 bg-slate-100 rounded w-1/3"></div>
                <div className="h-3 bg-slate-100 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white border border-red-200 rounded-2xl shadow-sm text-red-500">
          <ShieldAlert className="w-10 h-10 mx-auto mb-2" />
          <p className="font-bold">{error}</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="p-16 text-center bg-white border border-slate-200/80 rounded-2xl space-y-4 shadow-sm">
          <Bell className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h4 className="font-bold text-slate-800 text-base">All caught up!</h4>
            <p className="text-xs text-slate-400 mt-1">
              No notifications matching the selected filter.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filteredNotifications.map((notif) => {
              const styles = getNotificationStyles(notif.type);
              return (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className={`relative p-5 bg-white border rounded-2xl transition-all duration-300 hover:shadow-md flex items-start gap-4 ${
                    !notif.read ? 'border-l-4 border-l-blue-600 shadow-sm' : 'border-slate-200/80'
                  }`}
                >
                  {/* Icon Block */}
                  <div className={`p-2.5 rounded-xl border border-slate-100/80 ${styles.bg}`}>
                    {styles.icon}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className={`text-sm font-extrabold text-slate-900 leading-snug`}>
                          {notif.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                      
                      {/* Action buttons */}
                      <button
                        onClick={() => handleDeleteNotification(notif._id)}
                        className="p-1.5 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-[10px] font-bold text-slate-400">
                      <span className="uppercase tracking-wider px-2 py-0.5 bg-slate-50 rounded border border-slate-200/50">
                        {notif.type}
                      </span>
                      <span>•</span>
                      <span>{new Date(notif.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
