import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Trash2, CheckCheck, Settings, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import notificationsService from '../services/notifications.service';
import profileService from '../../../services/profile.service';
import NotificationCard from '../components/NotificationCard';
import NotificationFilters from '../components/NotificationFilters';

const NotificationCenter = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all'); // all, unread, mention, connection, publication, community, system
  const [activeDateFilter, setActiveDateFilter] = useState('all'); // all, today, yesterday, week, month
  const [notificationsList, setNotificationsList] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Fetch current user's notification settings from profile
  const { data: profileData } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: async () => {
      const res = await profileService.getProfile();
      return res.data;
    }
  });

  const notificationSettings = profileData?.notificationSettings || {
    follow: true,
    connection: true,
    publication: true,
    comment: true,
    mention: true,
    system: true
  };

  // Update Settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings) => {
      return await notificationsService.updateSettings(updatedSettings);
    },
    onSuccess: () => {
      toast.success('Notification settings updated');
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
    }
  });

  const handleSettingToggle = (key) => {
    const newVal = !notificationSettings[key];
    updateSettingsMutation.mutate({ [key]: newVal });
  };

  // Fetch notifications
  const buildQueryParams = () => {
    const params = { limit: 15 };
    if (activeTab !== 'all') {
      if (activeTab === 'unread') {
        params.isRead = false;
      } else {
        params.type = activeTab;
      }
    }
    return params;
  };

  const { data: fetchResult, isLoading, refetch } = useQuery({
    queryKey: ['notifications', { tab: activeTab, dateFilter: activeDateFilter }],
    queryFn: async () => {
      const params = buildQueryParams();
      const res = await notificationsService.getNotifications(params);
      return res.data;
    }
  });

  // Filter client-side by date if required
  const filterByDate = (docs) => {
    if (!docs) return [];
    if (activeDateFilter === 'all') return docs;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const startOfWeek = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);

    return docs.filter(doc => {
      const date = new Date(doc.createdAt);
      if (activeDateFilter === 'today') {
        return date >= startOfToday;
      }
      if (activeDateFilter === 'yesterday') {
        return date >= startOfYesterday && date < startOfToday;
      }
      if (activeDateFilter === 'week') {
        return date >= startOfWeek;
      }
      if (activeDateFilter === 'month') {
        return date >= startOfMonth;
      }
      return true;
    });
  };

  useEffect(() => {
    if (fetchResult) {
      setNotificationsList(filterByDate(fetchResult.docs || []));
      setNextCursor(fetchResult.nextCursor);
      setHasNextPage(fetchResult.hasNextPage);
    }
  }, [fetchResult, activeDateFilter]);

  const loadMore = async () => {
    if (!nextCursor || isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const params = {
        ...buildQueryParams(),
        cursor: nextCursor
      };
      const res = await notificationsService.getNotifications(params);
      if (res.success) {
        const filteredDocs = filterByDate(res.data.docs);
        setNotificationsList((prev) => [...prev, ...filteredDocs]);
        setNextCursor(res.data.nextCursor);
        setHasNextPage(res.data.hasNextPage);
      }
    } catch (err) {
      console.error('Failed to load more notifications:', err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  // Mark all read mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      return await notificationsService.markAllRead();
    },
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      refetch();
    }
  });

  // Clear all mutation
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      return await notificationsService.clearAllNotifications();
    },
    onSuccess: () => {
      toast.success('All notifications cleared');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      setNotificationsList([]);
      setNextCursor(null);
      setHasNextPage(false);
    }
  });

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
        <div>
          <h3 className="text-base font-black text-[#0F172A] tracking-tight uppercase flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#2563EB]" />
            <span>Notification Center</span>
          </h3>
          <p className="text-[10px] text-[#475569] font-bold uppercase tracking-wider mt-0.5">Manage and filter your notifications and preferences</p>
        </div>

        {/* Global actions */}
        <div className="flex gap-2">
          {notificationsList.some(n => !n.isRead) && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="flex items-center gap-1 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#2563EB] rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all read</span>
            </button>
          )}

          {notificationsList.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete all notifications? This cannot be undone.")) {
                  clearAllMutation.mutate();
                }
              }}
              disabled={clearAllMutation.isPending}
              className="flex items-center gap-1 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left list, Right filters/settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 h-20 animate-pulse" />
              ))}
            </div>
          ) : notificationsList.length > 0 ? (
            <div className="space-y-4">
              {notificationsList.map((notification) => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                />
              ))}

              {/* Load More */}
              {hasNextPage && (
                <button
                  onClick={loadMore}
                  disabled={isFetchingMore}
                  className="w-full py-2.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-black text-[#475569] uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  {isFetchingMore ? 'Loading...' : 'Load More Notifications'}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto opacity-55 animate-pulse" />
              <h4 className="text-sm font-black text-slate-900 uppercase">No Notifications Found</h4>
              <p className="text-xs text-[#475569] max-w-xs mx-auto font-semibold">
                You have no notifications matching the selected tab category or date filters.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Filters and Preferences */}
        <div className="space-y-6">
          
          {/* Filters component */}
          <NotificationFilters
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeDateFilter={activeDateFilter}
            setActiveDateFilter={setActiveDateFilter}
          />

          {/* Preferences Switches */}
          <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.02)] space-y-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Settings className="w-4 h-4 text-[#2563EB]" />
              <span>Notification Settings</span>
            </h4>

            <div className="space-y-3.5 text-xs font-bold text-[#475569]">
              {/* Follow switch */}
              <div className="flex justify-between items-center">
                <span>Follow Notifications</span>
                <input
                  type="checkbox"
                  checked={notificationSettings.follow}
                  onChange={() => handleSettingToggle('follow')}
                  className="w-4 h-4 text-[#2563EB] border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Connection switch */}
              <div className="flex justify-between items-center">
                <span>Connection Notifications</span>
                <input
                  type="checkbox"
                  checked={notificationSettings.connection}
                  onChange={() => handleSettingToggle('connection')}
                  className="w-4 h-4 text-[#2563EB] border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Publication switch */}
              <div className="flex justify-between items-center">
                <span>Publication Notifications</span>
                <input
                  type="checkbox"
                  checked={notificationSettings.publication}
                  onChange={() => handleSettingToggle('publication')}
                  className="w-4 h-4 text-[#2563EB] border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Comment switch */}
              <div className="flex justify-between items-center">
                <span>Comment Notifications</span>
                <input
                  type="checkbox"
                  checked={notificationSettings.comment}
                  onChange={() => handleSettingToggle('comment')}
                  className="w-4 h-4 text-[#2563EB] border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Mention switch */}
              <div className="flex justify-between items-center">
                <span>Mention Notifications</span>
                <input
                  type="checkbox"
                  checked={notificationSettings.mention}
                  onChange={() => handleSettingToggle('mention')}
                  className="w-4 h-4 text-[#2563EB] border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* System switch */}
              <div className="flex justify-between items-center">
                <span>System Notifications</span>
                <input
                  type="checkbox"
                  checked={notificationSettings.system}
                  onChange={() => handleSettingToggle('system')}
                  className="w-4 h-4 text-[#2563EB] border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default NotificationCenter;
