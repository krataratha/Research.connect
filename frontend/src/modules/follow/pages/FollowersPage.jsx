import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Users, Search, AlertCircle } from 'lucide-react';
import followService from '../services/follow.service';
import FollowerCard from '../components/FollowerCard';

const FollowersPage = () => {
  const { username, profile } = useOutletContext();
  const currentUser = useSelector((state) => state.auth.user);
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [followersList, setFollowersList] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch initial list when username or search term changes
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['followers', username, debouncedSearch],
    queryFn: async () => {
      const res = await followService.getFollowers(username, {
        limit: 12,
        search: debouncedSearch
      });
      return res.data;
    },
    enabled: !!username
  });

  useEffect(() => {
    if (data) {
      setFollowersList(data.docs || []);
      setNextCursor(data.nextCursor);
      setHasNextPage(data.hasNextPage);
    }
  }, [data]);

  const loadMore = async () => {
    if (!nextCursor || isFetchingMore) return;
    setIsFetchingMore(true);
    try {
      const res = await followService.getFollowers(username, {
        limit: 12,
        cursor: nextCursor,
        search: debouncedSearch
      });
      if (res.success) {
        setFollowersList((prev) => [...prev, ...res.data.docs]);
        setNextCursor(res.data.nextCursor);
        setHasNextPage(res.data.hasNextPage);
      }
    } catch (err) {
      console.error('Failed to load more followers:', err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.02)]">
        <div>
          <h3 className="text-base font-black text-[#0F172A] tracking-tight uppercase flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2563EB]" />
            <span>Followers ({profile?.followersCount || 0})</span>
          </h3>
          <p className="text-[10px] text-[#475569] font-bold uppercase tracking-wider mt-0.5">Researchers who follow this profile</p>
        </div>
        
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search followers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-blue-650 focus:border-transparent text-slate-900 placeholder-slate-400 font-bold rounded-xl"
          />
        </div>
      </div>

      {/* Followers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 h-44 animate-pulse space-y-4">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-8 bg-slate-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : followersList.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {followersList.map((follower) => (
              <FollowerCard
                key={follower._id}
                follower={follower}
                currentUserId={currentUser?._id}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <button
              onClick={loadMore}
              disabled={isFetchingMore}
              className="w-full py-2.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-black text-[#475569] uppercase tracking-wider rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              {isFetchingMore ? 'Loading...' : 'Load More Followers'}
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto opacity-50 animate-pulse" />
          <h4 className="text-sm font-black text-slate-900 uppercase">No Followers Found</h4>
          <p className="text-xs text-[#475569] max-w-xs mx-auto font-semibold">
            {debouncedSearch ? 'No followers match your search criteria. Try a different query.' : 'This researcher does not have any followers yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FollowersPage;
