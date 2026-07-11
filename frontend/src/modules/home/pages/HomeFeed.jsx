import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { setQuery } from '../../../redux/slices/searchSlice';
import feedService from '../../../services/feed.service';
import scholarService from '../../../services/scholar.service';
import recommendationService from '../../../services/recommendation.service';
import PublicationCard from '../../../components/common/cards/PublicationCard';
import { 
  Sparkles, Award, Star, Compass, Calendar, 
  Briefcase, TrendingUp, Users, RefreshCw, Flame, 
  Clock, CheckCircle, ArrowRight, BrainCircuit, BookOpen,
  Database, PlusCircle, Check, Network, HelpCircle, Download, Loader2,
  Mail, MessageSquare, Search, Heart
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const HomeFeed = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { user, profile } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('recommended'); 
  const [refreshing, setRefreshing] = useState(false);
  const [sharingDataset, setSharingDataset] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showAllCoAuthorsModal, setShowAllCoAuthorsModal] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const profileCompletionRef = useRef(null);
  const tabRef = useRef(activeTab);

  // New dataset form state
  const [datasetTitle, setDatasetTitle] = useState('');
  const [datasetDesc, setDatasetDesc] = useState('');
  const [datasetFormat, setDatasetFormat] = useState('CSV');

  // Infinite Scroll Feed States
  const [page, setPage] = useState(1);
  const [accumulatedFeed, setAccumulatedFeed] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);

  // React Query for suggested researchers widget (Cached for 10 minutes)
  const { data: suggestionsData, refetch: refetchSuggestions } = useQuery({
    queryKey: ['suggestedResearchers'],
    queryFn: async () => {
      const res = await recommendationService.getResearchers(5);
      return res.success ? res.data?.docs || [] : [];
    },
    staleTime: 10 * 60 * 1000
  });

  // React Query for upcoming conferences widget (Cached for 15 minutes)
  const { data: conferencesData } = useQuery({
    queryKey: ['conferences'],
    queryFn: async () => {
      const res = await recommendationService.getConferences(3);
      return res.success ? res.data?.docs || [] : [];
    },
    staleTime: 15 * 60 * 1000
  });

  // React Query for funding opportunities widget (Cached for 15 minutes)
  const { data: fundingData } = useQuery({
    queryKey: ['funding'],
    queryFn: async () => {
      const res = await recommendationService.getFunding(3);
      return res.success ? res.data?.docs || [] : [];
    },
    staleTime: 15 * 60 * 1000
  });

  // React Query for feed sidebar data (contains trending keywords, AI insights, suggested researchers)
  const { data: sidebarData } = useQuery({
    queryKey: ['feedSidebar'],
    queryFn: async () => {
      const res = await feedService.getFeedSidebar();
      return res.success ? res.data : null;
    },
    staleTime: 5 * 60 * 1000
  });

  // React Query for Google Scholar citations widget & co-authors (Cached for 30 minutes)
  const { data: scholarData } = useQuery({
    queryKey: ['scholarProfile'],
    queryFn: async () => {
      try {
        const res = await scholarService.getProfile();
        if (res.success) {
          const [pubsRes, citesRes, coauthorsRes] = await Promise.all([
            scholarService.getPublications({ page: 1, limit: 5 }),
            scholarService.getCitations(),
            scholarService.getCoauthors()
          ]);
          return {
            profile: res.data,
            publications: pubsRes.success ? pubsRes.data : null,
            citations: citesRes.success ? citesRes.data : null,
            coauthors: coauthorsRes.success ? coauthorsRes.data : []
          };
        }
      } catch (err) {
        console.log('Google Scholar not connected yet.');
      }
      return null;
    },
    retry: false,
    staleTime: 5000
  });

  const suggestedResearchers = suggestionsData || [];
  const conferences = conferencesData || [];
  const funding = fundingData || [];
  const scholarProfile = scholarData?.profile || null;
  const citations = scholarData?.citations || null;
  const dbCoAuthors = scholarData?.coauthors || [];

  // Co-authors come exclusively from synced Google Scholar data — no hardcoded fallbacks
  const coAuthors = dbCoAuthors;

  const citationsVal = scholarProfile ? (scholarProfile.totalCitations ?? scholarProfile.citations ?? 0) : 0;
  const hIndexVal = scholarProfile ? (scholarProfile.hIndex ?? 0) : 0;
  const i10IndexVal = scholarProfile ? (scholarProfile.i10Index ?? 0) : 0;

  // Reset feed on tab change
  useEffect(() => {
    setPage(1);
    setAccumulatedFeed([]);
    setHasMore(true);
  }, [activeTab]);

  // Fetch page data
  useEffect(() => {
    
    // If activeTab changed but page is not 1 yet, do not fetch to avoid duplicate/stale requests.
    const isTabChanged = tabRef.current !== activeTab;
    if (isTabChanged && page !== 1) {
      return;
    }
    
    tabRef.current = activeTab;

    let isSubscribed = true;
    const fetchFeedPage = async () => {
      setFeedLoading(true);
      try {
        let res;
        if (activeTab === 'recommended') res = await feedService.getFeed(page, 10);
        else if (activeTab === 'trending') res = await feedService.getTrending(page, 10);
        else if (activeTab === 'latest') res = await feedService.getLatest(page, 10);
        else if (activeTab === 'following') res = await feedService.getFollowingFeed(page, 10);
        else if (activeTab === 'projects') res = await feedService.getProjects(page, 10);
        else if (activeTab === 'questions') res = await feedService.getQuestions(page, 10);
        else if (activeTab === 'datasets') res = await feedService.getDatasets(page, 10);

        if (res && res.success && isSubscribed) {
          let docs = [];
          if (activeTab === 'projects' || activeTab === 'datasets') {
            docs = res.data?.data?.docs || res.data?.docs || [];
          } else {
            docs = res.data?.docs || [];
          }
          
          if (docs.length < 10) {
            setHasMore(false);
          }

          setAccumulatedFeed(prev => {
            const existingIds = new Set(prev.map(item => item._id || item.id));
            const filteredDocs = docs.filter(item => !existingIds.has(item._id || item.id));
            return page === 1 ? docs : [...prev, ...filteredDocs];
          });
        } else if (isSubscribed) {
          setHasMore(false);
        }
      } catch (err) {
        console.error('Error fetching feed:', err);
        if (isSubscribed) setHasMore(false);
      } finally {
        if (isSubscribed) setFeedLoading(false);
      }
    };

    fetchFeedPage();

    return () => {
      isSubscribed = false;
    };
  }, [activeTab, page]);

  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !feedLoading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, hasMore, feedLoading, activeTab]);

  // Sticky Sidebar Intersection Observer
  useEffect(() => {
    const checkStickySupport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Mobile: disable
      if (width < 768) return false;
      // Tablet: MD breakpoint (768 to 1024) - only enable if enough height exists (height >= 800px)
      if (width >= 768 && width < 1024) {
        return height >= 800;
      }
      // Desktop: LG and up (>= 1024)
      return true;
    };

    const target = profileCompletionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (checkStickySupport()) {
          setIsSticky(entry.isIntersecting);
        } else {
          setIsSticky(false);
        }
      },
      {
        root: null,
        rootMargin: '0px 0px 0px 0px',
        threshold: 0.1,
      }
    );

    observer.observe(target);

    const handleResize = () => {
      if (!checkStickySupport()) {
        setIsSticky(false);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      observer.unobserve(target);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const activeList = accumulatedFeed;
  const loading = feedLoading && page === 1;

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['feed', activeTab] }),
      queryClient.invalidateQueries({ queryKey: ['scholarProfile'] })
    ]);
    setRefreshing(false);
    toast.success('Feed refreshed!');
  };

  const handleSyncScholar = async () => {
    setSyncing(true);
    try {
      const res = await scholarService.reimport();
      if (res.success) {
        toast.success('Scholar Sync started in background!');
        queryClient.invalidateQueries({ queryKey: ['scholarProfile'] });
        navigate('/research-identity');
      }
    } catch (err) {
      toast.error('Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  const handleFollowResearcher = async (userId) => {
    try {
      const res = await feedService.toggleFollow(userId);
      if (res.success) {
        toast.success(res.data.following ? 'Researcher followed' : 'Researcher unfollowed');
        refetchSuggestions();
        queryClient.invalidateQueries({ queryKey: ['feed'] });
      }
    } catch (err) {
      toast.error('Could not complete follow operation');
    }
  };

  const handleShareDatasetSubmit = async (e) => {
    e.preventDefault();
    if (!datasetTitle.trim() || !datasetDesc.trim()) return;

    try {
      const res = await feedService.createDataset({
        title: datasetTitle,
        description: datasetDesc,
        format: datasetFormat,
        size: '15 MB'
      });
      if (res.success) {
        toast.success('Dataset shared successfully!');
        setDatasetTitle('');
        setDatasetDesc('');
        setSharingDataset(false);
        queryClient.invalidateQueries({ queryKey: ['feed', 'datasets'] });
      }
    } catch (err) {
      toast.error('Failed to share dataset.');
    }
  };

  const [keywordSearchQuery, setKeywordSearchQuery] = useState('');

  const getCitationGrowth = () => {
    if (!citations || citations.length < 2) return '+12.4%';
    const sorted = [...citations].sort((a, b) => b.year - a.year);
    const latest = sorted[0].citations;
    const previous = sorted[1].citations;
    if (previous === 0) return '+12.4%';
    const growth = ((latest - previous) / previous) * 100;
    return `${growth >= 0 ? '+' : ''}${Math.min(100, Math.round(growth))}%`;
  };

  const getNewCitations = () => {
    if (!citations || citations.length < 2) return 0;
    const sorted = [...citations].sort((a, b) => b.year - a.year);
    const latest = sorted[0].citations;
    const previous = sorted[1].citations;
    const diff = latest - previous;
    return diff > 0 ? diff : 0;
  };

  const renderCitationChart = () => {
    if (!citations || citations.length === 0) return null;
    const padding = 20;
    const width = 300;
    const height = 120;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    const maxCitations = Math.max(...citations.map(c => c.citations)) || 1;
    const years = citations.map(c => c.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const yearRange = maxYear - minYear || 1;

    const points = citations.map(c => {
      const x = padding + ((c.year - minYear) / yearRange) * chartWidth;
      const y = height - padding - (c.citations / maxCitations) * chartHeight;
      return `${x},${y}`;
    }).join(' ');

    const areaPoints = `${padding},${height - padding} ` + points + ` ${width - padding},${height - padding}`;

    return (
      <svg className="w-full h-28 mt-2 text-indigo-600 dark:text-indigo-400" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon fill="url(#chartGrad)" points={areaPoints} />
        <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
        {citations.map((c, idx) => {
          const x = padding + ((c.year - minYear) / yearRange) * chartWidth;
          const y = height - padding - (c.citations / maxCitations) * chartHeight;
          return (
            <g key={idx} className="group">
              <circle cx={x} cy={y} r="3" className="fill-white stroke-indigo-600 dark:stroke-indigo-400 stroke-2 cursor-pointer hover:r-4 transition-all" />
              <title>{c.year}: {c.citations} citations</title>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderGoogleScholarBarChart = () => {
    const maxVal = Math.max(citationsVal, hIndexVal, i10IndexVal, 10);
    const getPercentHeight = (val) => `${(val / maxVal) * 100}%`;
    
    return (
      <div className="space-y-4">
        {/* Bars Container */}
        <div className="flex items-end justify-between h-40 pt-6 px-2 relative border-b border-slate-100 dark:border-slate-800">
          {/* Y-axis line */}
          <div className="absolute left-0 bottom-0 top-0 border-l border-dashed border-slate-200 dark:border-slate-800 w-0"></div>
          
          {/* Citation Bar */}
          <div className="flex-1 flex flex-col items-center group relative z-10 mx-2">
            <div className="w-full flex items-end justify-center h-28">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: getPercentHeight(citationsVal) }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="w-10 rounded-t-lg bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 shadow-md group-hover:shadow-lg group-hover:brightness-110 transition-all cursor-pointer relative"
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-extrabold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-20">
                  Citations: {citationsVal}
                </div>
              </motion.div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 mt-2">Citations</span>
            <span className="text-xs font-black text-slate-800 mt-0.5">{citationsVal}</span>
          </div>

          {/* h-index Bar */}
          <div className="flex-1 flex flex-col items-center group relative z-10 mx-2">
            <div className="w-full flex items-end justify-center h-28">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: getPercentHeight(hIndexVal) }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
                className="w-10 rounded-t-lg bg-gradient-to-t from-emerald-500 via-emerald-400 to-teal-300 shadow-md group-hover:shadow-lg group-hover:brightness-110 transition-all cursor-pointer relative"
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-extrabold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-20">
                  h-index: {hIndexVal}
                </div>
              </motion.div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 mt-2">h-index</span>
            <span className="text-xs font-black text-slate-850 mt-0.5">{hIndexVal}</span>
          </div>

          {/* i10-index Bar */}
          <div className="flex-1 flex flex-col items-center group relative z-10 mx-2">
            <div className="w-full flex items-end justify-center h-28">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: getPercentHeight(i10IndexVal) }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                className="w-10 rounded-t-lg bg-gradient-to-t from-purple-600 via-purple-500 to-pink-400 shadow-md group-hover:shadow-lg group-hover:brightness-110 transition-all cursor-pointer relative"
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-extrabold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-20">
                  i10-index: {i10IndexVal}
                </div>
              </motion.div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 mt-2">i10-index</span>
            <span className="text-xs font-black text-slate-850 mt-0.5">{i10IndexVal}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderAcademicStanding = () => {
    const rawScore = profile?.metrics?.researchScore || 0;
    const scorePercent = Math.min(100, Math.round((rawScore / 100) * 100));

    return (
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[18px] shadow-sm space-y-4 text-left">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <h3 className="font-bold text-xs text-[#475569] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#2563EB]" /> Academic Standing
            </h3>
            {scholarProfile ? (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#22C55E] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full mt-1 border border-[#DCFCE7] shadow-sm">
                Verified Scholar
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full mt-1 border border-slate-100 shadow-sm">
                Standard Profile
              </span>
            )}
          </div>
          <Star className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
        </div>
        
        <div className="flex items-center gap-4 pt-1">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full p-1 shadow-inner">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-[#2563EB]" strokeDasharray={`${scorePercent}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-[10px] font-black text-[#0F172A] tracking-tighter">{Math.round(rawScore)}</span>
          </div>
          <div className="min-w-0">
            <h4 className="font-extrabold text-sm text-[#0F172A] leading-tight">Research Score: {rawScore}</h4>
            <p className="text-xs text-[#475569] font-semibold mt-1">Academic Rank: {profile?.academicRank || 'Student'}</p>
            <p className="text-[10px] text-[#475569]/80 font-medium leading-normal mt-0.5">
              Top {Math.max(1, 100 - Math.min(99, Math.floor(profile?.metrics?.researchScore || 0)))}% of collaborators worldwide.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#E2E8F0] text-center text-xs">
          <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col items-center">
            <span className="text-[9px] text-[#475569] block font-bold uppercase tracking-wider">Completion</span>
            <span className="font-extrabold text-[#22C55E] mt-0.5">{profile?.profileCompletion || 0}%</span>
          </div>
          <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex flex-col items-center">
            <span className="text-[9px] text-[#475569] block font-bold uppercase tracking-wider">Research Rank</span>
            <span className="font-extrabold text-[#4F46E5] mt-0.5">{profile?.researchRank || 'Junior'}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderTrendingKeywords = () => {
    const keywordsList = sidebarData?.trendingKeywords || [];

    const filteredKeywords = keywordsList.filter(k => 
      k.tag.toLowerCase().includes(keywordSearchQuery.toLowerCase())
    );

    return (
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[18px] shadow-sm space-y-4 text-left">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs text-[#475569] uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#2563EB]" /> Trending Keywords
          </h3>
          <span className="text-[10px] text-[#475569] font-bold bg-[#F8FAFC] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
            {keywordsList.length} tags
          </span>
        </div>

        {/* Search Keywords */}
        <div className="relative">
          <input 
            type="text"
            placeholder="Search keywords..."
            value={keywordSearchQuery}
            onChange={(e) => setKeywordSearchQuery(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:bg-white transition-all font-semibold"
          />
          <Search className="w-3.5 h-3.5 text-[#475569]/60 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap gap-2">
          {filteredKeywords.map((k) => (
            <span 
              key={k.tag}
              onClick={() => {
                dispatch(setQuery(k.tag));
                navigate(`/search?q=${encodeURIComponent(k.tag)}`);
              }}
              className="text-xs bg-[#DBEAFE] hover:bg-[#2563EB] hover:text-white border border-[#DBEAFE] hover:border-[#2563EB] text-[#2563EB] px-2.5 py-1 rounded-full font-bold cursor-pointer transition-all duration-200 transform hover:scale-[1.03] active:scale-95 flex items-center gap-1"
            >
              #{k.tag}
              <span className="text-[9px] opacity-75 font-normal">({k.count})</span>
            </span>
          ))}
        </div>

        <button 
          onClick={() => {
            dispatch(setQuery(''));
            navigate('/search');
          }}
          className="w-full py-2 bg-[#F8FAFC] hover:bg-[#2563EB] border border-[#E2E8F0] hover:border-[#2563EB] text-[#475569] hover:text-white font-bold text-xs rounded-xl transition-all duration-200 transform hover:scale-[1.03] active:scale-95 hover:shadow-md shadow-sm"
        >
          View All Keywords
        </button>
      </div>
    );
  };

  const renderSuggestedResearchers = () => {
    return (
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[18px] shadow-sm space-y-4 text-left">
        <h3 className="font-bold text-xs text-[#475569] uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-[#4F46E5]" /> Suggested Researchers
        </h3>
        
        <div className="space-y-4">
          {suggestedResearchers.length === 0 ? (
            <p className="text-xs text-[#475569]/60 text-center py-2">No recommendations at this time.</p>
          ) : (
            suggestedResearchers.slice(0, 3).map((res, idx) => {
              const matchPercent = res.matchPercentage || (90 - idx * 5);
              return (
                <div key={idx} className="group border-b border-[#E2E8F0]/60 pb-3.5 last:border-0 last:pb-0 transition-all duration-200">
                  <div className="flex gap-3 min-w-0">
                    <div 
                      onClick={() => navigate(`/profile/${res.profileSlug || res.userId}`)}
                      className="w-10 h-10 rounded-full bg-[#F8FAFC] flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 border border-[#E2E8F0] cursor-pointer hover:border-blue-500 transition-all"
                    >
                      {res.avatar ? (
                        <img src={res.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{res.name ? res.name[0] : 'S'}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-start gap-1">
                        <h4 
                          onClick={() => navigate(`/profile/${res.profileSlug || res.userId}`)}
                          className="font-bold text-xs text-[#0F172A] truncate leading-tight hover:text-[#2563EB] cursor-pointer transition-colors"
                        >
                          {res.name}
                        </h4>
                        <span className="text-[9px] font-bold text-[#22C55E] bg-[#DCFCE7] px-1.5 py-0.5 rounded-full shrink-0">
                          {matchPercent}% match
                        </span>
                      </div>
                      <p className="text-[10px] text-[#475569] truncate leading-tight mt-0.5">
                        {res.designation || 'Scholar'} • {res.institution || 'Institute'}
                      </p>
                      <p className="text-[10px] text-[#475569]/80 truncate mt-1">
                        Reason: {res.reasons && res.reasons.length > 0 ? res.reasons.join(', ') : 'Suggested Match'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action buttons with Blue Hover and Scale transitions */}
                  <div className="flex gap-2 mt-3.5 pl-13">
                    <button 
                      onClick={() => handleFollowResearcher(res.userId)}
                      className="flex-1 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[10px] rounded-lg transition-all duration-200 transform hover:scale-[1.03] active:scale-95 hover:shadow shadow-sm"
                    >
                      Follow
                    </button>
                    <button 
                      onClick={() => {
                        navigate(`/messages?participantId=${res.userId}`);
                      }}
                      className="flex-1 py-1.5 bg-white hover:bg-[#2563EB] border border-[#E2E8F0] hover:border-[#2563EB] text-[#475569] hover:text-white font-bold text-[10px] rounded-lg transition-all duration-200 transform hover:scale-[1.03] active:scale-95 hover:shadow shadow-sm flex items-center justify-center gap-1"
                    >
                      <Mail className="w-3 h-3 text-[#475569]/60 group-hover:text-white" /> Message
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderTopCoAuthors = () => {
    return (
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[18px] shadow-sm space-y-4 text-left">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs text-[#475569] uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-[#4F46E5]" /> Top Co-authors
          </h3>
          <span className="text-[10px] text-[#475569] font-bold bg-[#F8FAFC] px-2 py-0.5 rounded-full border border-[#E2E8F0]">
            {coAuthors.length} co-authors
          </span>
        </div>
        
        <div className="space-y-3">
          {coAuthors.length === 0 ? (
            <div className="text-center py-4">
              <Users className="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
              <p className="text-xs text-[#94A3B8] font-medium">No co-authors yet.</p>
              <p className="text-[10px] text-[#CBD5E1] mt-0.5">Sync your Google Scholar profile to discover co-authors.</p>
            </div>
          ) : (
            coAuthors.slice(0, 5).map((author, idx) => (
              <div key={idx} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-[#F8FAFC] transition-colors">
                <div className="w-9 h-9 rounded-full bg-[#EDE9FE] flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 border border-[#E2E8F0]">
                  {author.photo && author.photo !== '#' ? (
                    <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#4F46E5]">{author.name?.[0] || '?'}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-[#0F172A] truncate leading-tight">{author.name}</h4>
                    <span className="text-[9px] font-bold text-[#4F46E5] bg-[#EDE9FE] px-1.5 py-0.5 rounded-full shrink-0">
                      {author.collaborationCount ?? idx + 1} colabs
                    </span>
                  </div>
                  <p className="text-[10px] text-[#475569] truncate mt-0.5">{author.affiliation || 'Independent Scholar'}</p>
                  <p className="text-[9px] text-[#475569]/70 truncate font-medium">Interest: {author.researchInterest || 'Research'}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {coAuthors.length > 0 && (
          <button 
            onClick={() => setShowAllCoAuthorsModal(true)}
            className="w-full py-2 bg-[#F8FAFC] hover:bg-[#2563EB] border border-[#E2E8F0] hover:border-[#2563EB] text-[#475569] hover:text-white font-bold text-xs rounded-xl transition-all duration-200 transform hover:scale-[1.03] active:scale-95 hover:shadow-md shadow-sm"
          >
            View All Co-Authors
          </button>
        )}
      </div>
    );
  };



  const renderGoogleScholarAnalytics = () => {
    // Dynamic values from MongoDB (loaded via scholarData query)
    const publicationsCount = scholarData?.publications?.total ?? 0;
    const citationGrowth = getCitationGrowth(); 

    // Radial Progress calculations
    const researchScore = profile?.metrics?.researchScore || 75;
    const impactPercentile = Math.min(99, 90 + Math.round(hIndexVal / 10));
    const strokeDash = `${impactPercentile}, 100`;

    return (
      <div className="bg-white border border-slate-200 p-6 rounded-[18px] shadow-sm space-y-5 text-left">
        <div className="flex justify-between items-center pb-2 border-b border-slate-55">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Network className="w-4 h-4 text-indigo-500" /> Google Scholar Analytics
          </h3>
          <button 
            onClick={handleSyncScholar}
            disabled={syncing}
            className="p-1 rounded hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
            title="Sync Profile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-blue-650' : ''}`} />
          </button>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-start relative overflow-hidden group">
            <span className="text-[10px] text-slate-450 block font-bold uppercase tracking-wider">Total Citations</span>
            <span className="font-extrabold text-xl text-slate-900 mt-1">{citationsVal}</span>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Network className="w-4 h-4" />
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-start relative overflow-hidden">
            <span className="text-[10px] text-slate-450 block font-bold uppercase tracking-wider">Publication Count</span>
            <span className="font-extrabold text-xl text-slate-900 mt-1">{publicationsCount}</span>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-start relative overflow-hidden">
            <span className="text-[10px] text-slate-455 block font-bold uppercase tracking-wider">Citation Growth</span>
            <span className="font-extrabold text-xl text-emerald-600 mt-1">{citationGrowth}</span>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-start relative overflow-hidden">
            <span className="text-[10px] text-slate-455 block font-bold uppercase tracking-wider">Research Score</span>
            <span className="font-extrabold text-xl text-purple-600 mt-1">{researchScore}</span>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Vertical Bar Chart (Citations, h-index, i10-index) */}
        {renderGoogleScholarBarChart()}

        {/* Radial Progress and h-index/i10-index details */}
        <div className="flex gap-4 items-center bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-200" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-orange-500" strokeDasharray={strokeDash} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-xs font-black text-slate-900">{impactPercentile}%</span>
          </div>
          <div className="text-left">
            <h4 className="font-bold text-xs text-slate-900">Academic Standing Impact</h4>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
              Based on h-index <span className="font-bold text-slate-700">{hIndexVal}</span> and i10-index <span className="font-bold text-slate-700">{i10IndexVal}</span>. Dynamic citation tracking synced securely with MongoDB.
            </p>
          </div>
        </div>

        {/* Timeline Area/Line Chart */}
        {citations && citations.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-450 block mb-2 uppercase tracking-wider">Citation Timeline</span>
            {renderCitationChart()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* CENTER FEED SECTION (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="border border-[#E2E8F0] p-8 rounded-3xl shadow-sm text-left relative overflow-hidden bg-gradient-to-tr from-[#F8FAFC] to-[#FFFFFF]">
            {/* Background elements */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-[#2563EB]/10 via-[#4F46E5]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">
                      Welcome back, {user?.firstName || 'Scholar'} {user?.lastName || ''}
                    </h1>
                    <span className="inline-flex items-center justify-center bg-[#DBEAFE] text-[#2563EB] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#DBEAFE]">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-[#475569] mt-1 font-semibold">Your research feed is dynamically optimized based on your interests.</p>
                </div>
                
                {/* Micro metrics */}
                <div className="flex gap-4 shrink-0">
                  <div className="text-left">
                    <span className="text-[10px] text-[#475569]/70 uppercase font-bold tracking-wider block">New Citations</span>
                    <span className="text-lg font-black text-[#2563EB] flex items-center gap-1">
                      {getNewCitations() > 0 ? `+${getNewCitations()}` : '0'} <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                    </span>
                  </div>
                  <div className="h-8 w-px bg-[#E2E8F0] self-center"></div>
                  <div className="text-left">
                    <span className="text-[10px] text-[#475569]/70 uppercase font-bold tracking-wider block">Suggested Collaborations</span>
                    <span className="text-lg font-black text-[#4F46E5]">
                      {suggestedResearchers.length} {suggestedResearchers.length === 1 ? 'match' : 'matches'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Research Insights Banner */}
              {sidebarData?.aiInsight && (
                <div className="bg-[#EDE9FE]/40 border border-[#EDE9FE] rounded-2xl p-4 flex gap-3 items-start">
                  <BrainCircuit className="w-5 h-5 text-[#4F46E5] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">Today's Research Insights</h4>
                    <p className="text-xs text-[#475569] mt-0.5 font-semibold leading-relaxed">
                      {sidebarData.aiInsight.insight}
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Actions Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button 
                  onClick={() => navigate(user?.profileSlug ? `/profile/${user.profileSlug}` : '/profile')}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-[1.03] active:scale-95 hover:shadow-md shadow-sm"
                >
                  Continue Profile
                </button>
                <button 
                  onClick={handleSyncScholar}
                  disabled={syncing}
                  className="bg-white hover:bg-[#2563EB] border border-[#E2E8F0] hover:border-[#2563EB] text-[#475569] hover:text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-[1.03] active:scale-95 hover:shadow-md shadow-sm flex items-center gap-1.5"
                >
                  {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Sync Scholar
                </button>
                <button 
                  onClick={() => toast.success('Upload Publication Modal')}
                  className="bg-white hover:bg-[#2563EB] border border-[#E2E8F0] hover:border-[#2563EB] text-[#475569] hover:text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-[1.03] active:scale-95 hover:shadow-md shadow-sm"
                >
                  Create Publication
                </button>
                <button 
                  onClick={() => toast.success('Create Project Modal')}
                  className="bg-white hover:bg-[#2563EB] border border-[#E2E8F0] hover:border-[#2563EB] text-[#475569] hover:text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all duration-200 transform hover:scale-[1.03] active:scale-95 hover:shadow-md shadow-sm"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>

          {/* Feed Tabs Container */}
          <div className="flex overflow-x-auto whitespace-nowrap border-b border-slate-200 text-sm font-semibold text-slate-500 no-scrollbar">
            {[
              { id: 'recommended', label: 'AI Recommended', icon: Sparkles },
              { id: 'trending', label: 'Trending', icon: Flame },
              { id: 'latest', label: 'Latest', icon: Clock },
              { id: 'following', label: 'Following', icon: Users },
              { id: 'projects', label: 'Projects', icon: Briefcase },
              { id: 'questions', label: 'Q&A', icon: Compass },
              { id: 'datasets', label: 'Datasets', icon: Database }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all font-semibold ${
                    isActive 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Share Dataset Form Popup overlay */}
          {sharingDataset && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white border border-slate-200 p-6 rounded-[18px] max-w-md w-full text-left space-y-4 shadow-xl">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-sm text-slate-900">Share New Research Dataset</h3>
                  <button onClick={() => setSharingDataset(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <form onSubmit={handleShareDatasetSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Dataset Title</label>
                    <input type="text" required value={datasetTitle} onChange={e => setDatasetTitle(e.target.value)} placeholder="e.g. Brain Wave recordings..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Description & Methodology</label>
                    <textarea required value={datasetDesc} onChange={e => setDatasetDesc(e.target.value)} placeholder="Explain variables, frequency, and extraction..." rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Format</label>
                    <select value={datasetFormat} onChange={e => setDatasetFormat(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600">
                      <option>CSV</option>
                      <option>JSON</option>
                      <option>HDF5</option>
                      <option>Parquet</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm">
                    Post Shared Dataset
                  </button>
                </form>
              </motion.div>
            </div>
          )}
            {/* Feed List */}
          <div className="space-y-6">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white border border-slate-200 rounded-[18px] p-6 space-y-4 animate-pulse shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-20 bg-slate-100 rounded w-full"></div>
                </div>
              ))
            ) : activeList.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-[18px] p-12 text-center text-slate-500 shadow-sm">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="font-bold text-sm text-slate-900">No items found in this section.</p>
                <p className="text-xs text-slate-500 mt-1">Try following other researchers or exploring trending papers.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {activeTab === 'projects' ? (
                  activeList.map(proj => (
                    <motion.div 
                      key={proj._id}
                      className="bg-white border border-slate-200 p-6 rounded-[18px] shadow-sm text-left relative overflow-hidden transition-all hover:shadow-lg"
                      whileHover={{ y: -2 }}
                    >
                      <span className="absolute top-4 right-4 text-xs font-bold bg-[#DBEAFE] text-blue-600 px-2.5 py-0.5 rounded-full">
                        {proj.status}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 leading-snug">{proj.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">Lead: {proj.userId?.fullName || 'Researcher'} • {proj.researchAreas?.join(', ')}</p>
                      <p className="text-sm text-slate-600 mt-3 leading-relaxed font-normal">{proj.description}</p>
                    </motion.div>
                  ))
                ) : activeTab === 'questions' ? (
                  activeList.map(q => (
                    <motion.div 
                      key={q._id}
                      className="bg-white border border-slate-200 p-6 rounded-[18px] shadow-sm text-left hover:shadow-lg transition-all"
                      whileHover={{ y: -2 }}
                    >
                      <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 leading-snug">
                        <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs font-bold">Q</span>
                        {q.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Asked by {q.userId?.fullName || 'Scholar'} • {q.researchAreas?.join(', ')}</p>
                      <p className="text-sm text-slate-600 mt-3 leading-relaxed font-normal">{q.description}</p>
                    </motion.div>
                  ))
                ) : activeTab === 'datasets' ? (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <button 
                        onClick={() => setSharingDataset(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <PlusCircle className="w-4 h-4" /> Share Dataset
                      </button>
                    </div>
                    {activeList.map(ds => (
                      <motion.div 
                        key={ds._id}
                        className="bg-white border border-slate-200 p-6 rounded-[18px] shadow-sm text-left relative hover:shadow-lg transition-all"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5 leading-snug">
                              <Database className="w-4.5 h-4.5 text-blue-500" />
                              {ds.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Shared by {ds.userId?.fullName || 'Scholar'} • Format: <span className="font-bold text-indigo-600">{ds.format}</span> ({ds.size || '12 MB'})</p>
                          </div>
                          <button 
                            onClick={() => {
                              toast.success('Downloading dataset...');
                              if (ds.url) window.open(ds.url, '_blank');
                            }}
                            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </div>
                        <p className="text-sm text-slate-600 mt-3 leading-relaxed font-normal">{ds.description}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  activeList.map(pub => (
                    <PublicationCard 
                      key={pub._id || pub.id} 
                      pub={pub} 
                    />
                  ))
                )}
              </AnimatePresence>
            )}

            {/* Intersection Observer scroll target */}
            <div ref={observerTarget} className="h-12 flex items-center justify-center pt-4">
              {feedLoading && page > 1 && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Loading more feeds...</span>
                </div>
              )}
              {!hasMore && accumulatedFeed.length > 0 && (
                <span className="text-xs font-semibold text-slate-400">You've reached the bottom of your feed</span>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR SECTION (4 Cols) */}
        <div className={`lg:col-span-4 space-y-6 text-left pr-2 no-scrollbar self-start transition-all duration-300 ${
          isSticky 
            ? 'lg:sticky lg:bottom-6' 
            : 'relative'
        }`}>
          
          {/* 1. Academic Standing */}
          {renderAcademicStanding()}

          {/* 2. Trending Keywords */}
          {renderTrendingKeywords()}

          {/* 3. Suggested Researchers */}
          {renderSuggestedResearchers()}

          {/* 4. Top Co-authors */}
          {renderTopCoAuthors()}



          {/* 6. Google Scholar Analytics */}
          {renderGoogleScholarAnalytics()}


          {/* 8. Upcoming Conferences */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[18px] shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-[#475569] uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#22C55E]" /> Upcoming Conferences
            </h3>
            <div className="space-y-3.5">
              {conferences.length === 0 ? (
                <p className="text-xs text-[#475569]/60 text-center py-2">No upcoming conferences.</p>
              ) : (
                conferences.slice(0, 3).map((e, idx) => (
                  <div key={idx} className="flex gap-3 text-xs text-left">
                    <div className="w-10 h-10 rounded-lg bg-[#DCFCE7] text-[#22C55E] flex flex-col items-center justify-center font-bold border border-[#DCFCE7]/60 shrink-0">
                      <span className="text-[10px] uppercase font-black">{e.type}</span>
                    </div>
                    <div>
                      <h4 
                        onClick={() => e.link && window.open(e.link, '_blank')}
                        className="font-bold text-[#0F172A] hover:underline cursor-pointer leading-tight"
                      >
                        {e.title}
                      </h4>
                      <p className="text-[10px] text-[#475569] mt-1">Date: {new Date(e.date).toLocaleDateString()} • {e.organization}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 9. Funding Opportunities */}
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[18px] shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-[#F59E0B] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F59E0B]" /> Funding Opportunities
            </h3>
            <div className="space-y-4">
              {funding.length === 0 ? (
                <p className="text-xs text-[#475569]/60 text-center py-2">No funding opportunities found.</p>
              ) : (
                funding.slice(0, 3).map((f, idx) => (
                  <div key={idx} className="text-xs border-b border-[#E2E8F0] last:border-0 pb-3 last:pb-0">
                    <h4 className="font-bold text-[#0F172A] leading-tight">{f.title || f.metadata?.title}</h4>
                    <p className="text-[10px] text-[#475569] mt-1">{f.description || f.metadata?.description}</p>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#E2E8F0]/40">
                      <span className="text-[10px] font-bold text-[#475569]/85">
                        Amount: {f.metadata?.grantAmount || 'Varies'} • Deadline: {f.metadata?.deadline ? new Date(f.metadata.deadline).toLocaleDateString() : 'N/A'}
                      </span>
                      {f.metadata?.applyUrl && (
                        <button 
                          onClick={() => window.open(f.metadata.applyUrl, '_blank')}
                          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-3 py-1.5 rounded-lg text-[10px] transition-all duration-200 transform hover:scale-[1.03] active:scale-95 shadow-sm"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 10. Profile Completion */}
          <div ref={profileCompletionRef} className="bg-[#FFFFFF] border border-[#E2E8F0] p-6 rounded-[18px] shadow-sm space-y-4">
            <h3 className="font-bold text-xs text-[#475569] uppercase tracking-wider flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#22C55E]" /> Profile Completion
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-[#22C55E]" strokeDasharray={`${profile?.profileCompletion || 0}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="absolute text-xs font-black text-[#0F172A]">{profile?.profileCompletion || 0}%</span>
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-[#0F172A] leading-tight">
                  {profile?.profileCompletion >= 80 ? 'Almost complete!' : 'Keep going!'}
                </h4>
                <p className="text-[10px] text-[#475569]/80 leading-tight font-normal">Add remaining details to reach maximum visibility.</p>
              </div>
            </div>
            <div className="pt-2 border-t border-[#E2E8F0] space-y-2 text-[11px] font-semibold text-[#475569]">
              <div className={`flex items-center gap-2 ${user?.emailVerified ? 'text-[#22C55E]' : 'text-slate-450'}`}>
                {user?.emailVerified ? <Check className="w-3.5 h-3.5 shrink-0" /> : <PlusCircle className="w-3.5 h-3.5 shrink-0 opacity-60" />}
                Verified Email Address
              </div>
              <div className={`flex items-center gap-2 ${!!(profile?.socialLinks?.orcid || profile?.socialLinks?.googleScholar) ? 'text-[#22C55E]' : 'text-slate-450'}`}>
                {!!(profile?.socialLinks?.orcid || profile?.socialLinks?.googleScholar) ? <Check className="w-3.5 h-3.5 shrink-0" /> : <PlusCircle className="w-3.5 h-3.5 shrink-0 opacity-60" />}
                Academic Identifier Connected
              </div>
              <div 
                className={`flex items-center gap-2 cursor-pointer transition-colors ${coAuthors.length > 0 ? 'text-[#22C55E]' : 'text-[#475569] hover:text-[#2563EB]'}`} 
                onClick={() => navigate(user?.profileSlug ? `/profile/${user.profileSlug}` : '/profile')}
              >
                {coAuthors.length > 0 ? <Check className="w-3.5 h-3.5 shrink-0" /> : <PlusCircle className="w-3.5 h-3.5 text-[#475569]/60 shrink-0" />}
                Add Co-Authors & Affiliations
              </div>
            </div>
          </div>
      </div>
    </div>
  </div>

      {/* Co-Authors Full List Modal */}
      <AnimatePresence>
        {showAllCoAuthorsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[24px] max-w-lg w-full text-left space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-500" />
                  All Co-Authors ({coAuthors.length})
                </h3>
                <button 
                  onClick={() => setShowAllCoAuthorsModal(false)}
                  className="text-slate-450 hover:text-slate-655 dark:hover:text-slate-200 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-bold transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="overflow-y-auto pr-1 flex-1 py-2 space-y-3">
                {coAuthors.map((author, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-50 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-slate-850 flex items-center justify-center font-extrabold text-sm overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                        {author.photo && author.photo !== '#' ? (
                          <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-indigo-600 dark:text-indigo-400">{author.name[0]}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{author.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-405 mt-0.5">{author.affiliation || 'Independent Researcher'}</p>
                        {author.email && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{author.email}</p>
                        )}
                      </div>
                    </div>
                    {author.profileURL && author.profileURL !== '#' && (
                      <a 
                        href={author.profileURL}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                      >
                        Profile
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Footer Section */}
      <footer className="mt-24 border-t border-slate-200 pt-16 pb-12 bg-white text-left text-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Column 1: Brand details */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-blue-500/20">
                  R
                </div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Research<span className="text-blue-600">.connect</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-normal max-w-sm">
                The next-generation, AI-driven academic collaboration and discovery network. Empowering researchers worldwide to connect, share, and accelerate global innovation.
              </p>
              <div className="flex gap-3 pt-2">
                {['twitter', 'linkedin', 'database'].map((social, idx) => (
                  <a 
                    key={idx} 
                    href="#" 
                    className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-blue-600 hover:text-white border border-slate-200 flex items-center justify-center text-slate-450 transition-all duration-200 transform hover:scale-[1.05] shadow-sm"
                  >
                    <span className="text-[10px] font-bold uppercase">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>
            
            {/* Column 2: Research */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Research</h4>
              <ul className="space-y-2.5 text-xs text-slate-500 font-semibold">
                {['Publications Feed', 'Trending Research', 'Academic Standings', 'Conferences & Events'].map(link => (
                  <li key={link} className="hover:text-blue-600 transition-colors cursor-pointer">{link}</li>
                ))}
              </ul>
            </div>

            {/* Column 3: Developers / Resources */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Developers</h4>
              <ul className="space-y-2.5 text-xs text-slate-500 font-semibold">
                {['AI Summary Tool', 'Google Scholar Import', 'Open Datasets', 'Developer API'].map(link => (
                  <li key={link} className="hover:text-blue-600 transition-colors cursor-pointer">{link}</li>
                ))}
              </ul>
            </div>

            {/* Column 4: Resources / Support */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Resources</h4>
              <ul className="space-y-2.5 text-xs text-slate-500 font-semibold">
                {[
                  { label: 'Privacy Policy', to: '/privacy' },
                  { label: 'Terms of Service', to: '/terms' },
                  { label: 'Support Forum', to: '#' },
                  { label: 'Contact Us', to: '#' },
                ].map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="hover:text-blue-600 transition-colors cursor-pointer">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter section & copyright */}
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Subscribe to Newsletter:</span>
              <div className="flex gap-2 w-full sm:w-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition-all font-semibold w-full sm:w-60"
                />
                <button 
                  onClick={() => toast.success('Subscribed successfully!')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition-all duration-200 transform hover:scale-[1.03] active:scale-95 shadow-sm shrink-0"
                >
                  Subscribe
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-450 flex flex-col sm:flex-row items-center gap-4">
              <p>© {new Date().getFullYear()} Research Connect. Made with ❤️ for Researchers.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeFeed;