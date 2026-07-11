import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Bookmark, 
  ExternalLink,
  ChevronRight,
  UserPlus, 
  Calendar, 
  Users,
  Search,
  MessageSquare,
  DollarSign,
  Clock,
  Briefcase,
  MapPin,
  Heart,
  MessageCircle,
  Share2,
  Tag,
  Filter,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DiscoveryDashboard = () => {
  const { user } = useAuth();
  
  // Data States
  const [researchers, setResearchers] = useState([]);
  const [trending, setTrending] = useState({ trendingTopics: [], wordCloud: [] });
  const [recent, setRecent] = useState([]);
  const [topResearchers, setTopResearchers] = useState([]);
  const [publications, setPublications] = useState([]);
  const [collaborations, setCollaborations] = useState([]);

  // Filters for Top Leaderboard
  const [leaderboardCountry, setLeaderboardCountry] = useState('');
  const [leaderboardInst, setLeaderboardInst] = useState('');
  const [leaderboardTab, setLeaderboardTab] = useState('global');

  // Loading States
  const [loadingRes, setLoadingRes] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [loadingTop, setLoadingTop] = useState(true);
  const [loadingPubs, setLoadingPubs] = useState(true);
  const [loadingCollab, setLoadingCollab] = useState(true);

  // Liked/Saved local states to maintain instant interactivity
  const [likedPubs, setLikedPubs] = useState({});
  const [savedPubs, setSavedPubs] = useState({});
  const [appliedCollabs, setAppliedCollabs] = useState({});
  const [followedUsers, setFollowedUsers] = useState({});

  // Fetch Recommended Researchers
  const fetchRecommendedResearchers = async () => {
    try {
      setLoadingRes(true);
      const response = await api.get('/discovery/researchers?limit=3');
      setResearchers(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRes(false);
    }
  };

  // Fetch Trending Topics
  const fetchTrendingTopics = async () => {
    try {
      setLoadingTrending(true);
      const response = await api.get('/discovery/trending');
      setTrending(response.data.data || { trendingTopics: [], wordCloud: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTrending(false);
    }
  };

  // Fetch Recently Joined
  const fetchRecentResearchers = async () => {
    try {
      setLoadingRecent(true);
      const response = await api.get('/discovery/recent');
      setRecent(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecent(false);
    }
  };

  // Fetch Top Researchers Leaderboard
  const fetchTopResearchers = async () => {
    try {
      setLoadingTop(true);
      let query = `?limit=10`;
      if (leaderboardCountry) query += `&country=${leaderboardCountry}`;
      if (leaderboardInst) query += `&institution=${leaderboardInst}`;

      const response = await api.get(`/discovery/top-researchers${query}`);
      setTopResearchers(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTop(false);
    }
  };

  // Fetch Suggested Publications
  const fetchSuggestedPublications = async () => {
    try {
      setLoadingPubs(true);
      const response = await api.get('/discovery/publications?limit=6');
      setPublications(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPubs(false);
    }
  };

  // Fetch Open Collaborations Feed
  const fetchCollaborations = async () => {
    try {
      setLoadingCollab(true);
      const response = await api.get('/discovery/collaborations');
      setCollaborations(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCollab(false);
    }
  };

  useEffect(() => {
    fetchRecommendedResearchers();
    fetchTrendingTopics();
    fetchRecentResearchers();
    fetchTopResearchers();
    fetchSuggestedPublications();
    fetchCollaborations();
  }, []);

  useEffect(() => {
    fetchTopResearchers();
  }, [leaderboardCountry, leaderboardInst]);

  // Click Actions
  const handleLikePublication = (pubId) => {
    setLikedPubs(prev => ({ ...prev, [pubId]: !prev[pubId] }));
  };

  const handleSavePublication = (pubId) => {
    setSavedPubs(prev => ({ ...prev, [pubId]: !prev[pubId] }));
  };

  const handleApplyCollaboration = (collabId) => {
    setAppliedCollabs(prev => ({ ...prev, [collabId]: true }));
  };

  const handleFollowUser = (userId) => {
    setFollowedUsers(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-1 py-2 text-left space-y-8 pb-16">
      
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
          <Sparkles className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="px-3 py-1 bg-white/20 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider">
            Research Gate Feed
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight font-display">
            Discover Global Academic Breakthroughs
          </h1>
          <p className="text-white/80 text-sm md:text-base leading-relaxed">
            Browse trending areas, leaderboard publications, connect with elite researchers, and apply for funded global studies.
          </p>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Column (3/4 on Desktop): Open Feed and Publications */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Section 1: Suggested Publications Feed */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Suggested Publications for You
            </h2>

            {loadingPubs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 animate-pulse">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    <div className="h-10 bg-slate-50 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publications.map((pub) => (
                  <div 
                    key={pub._id}
                    className="bg-white border border-slate-200/80 hover:border-blue-500/30 hover:shadow-md rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {pub.publicationType || 'Journal'}
                        </span>
                        {pub.score && (
                          <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full text-[10px] font-extrabold">
                            {pub.score}% Match
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                        {pub.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {pub.abstract}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 mt-4 pt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span className="truncate max-w-[150px]">{pub.journal || 'Academic Publisher'} ({pub.publicationYear})</span>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleLikePublication(pub._id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            likedPubs[pub._id] ? 'bg-red-50 text-red-500' : 'hover:bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${likedPubs[pub._id] ? 'fill-current' : ''}`} />
                        </button>
                        <button 
                          onClick={() => handleSavePublication(pub._id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            savedPubs[pub._id] ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${savedPubs[pub._id] ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 2: Open Collaboration LinkedIn Style Feed */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Open Collaborations & Studies
            </h2>

            {loadingCollab ? (
              <div className="space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100"></div>
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-slate-100 rounded w-1/4"></div>
                        <div className="h-2.5 bg-slate-100 rounded w-1/3"></div>
                      </div>
                    </div>
                    <div className="h-16 bg-slate-50 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {collaborations.map((collab) => (
                  <div 
                    key={collab._id}
                    className="bg-white border border-slate-200/80 hover:shadow-md rounded-2xl p-6 transition-all duration-300 text-left space-y-4"
                  >
                    {/* Author block */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={collab.author?.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                          alt={collab.author?.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm"
                        />
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 leading-none">{collab.author?.fullName}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">{collab.author?.role || 'Researcher'}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        {new Date(collab.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Post Content */}
                    <div className="space-y-2.5">
                      <h3 className="font-extrabold text-base text-slate-900 leading-snug font-display">
                        {collab.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {collab.purpose}
                      </p>

                      {/* Project Meta Chips */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          <span>{collab.funding}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span>{collab.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                          <Briefcase className="w-4 h-4 text-blue-500" />
                          <span>{collab.researchArea}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                          <MapPin className="w-4 h-4 text-indigo-500" />
                          <span>{collab.institution}, {collab.country}</span>
                        </div>
                      </div>

                      {/* Required Skills */}
                      <div className="flex flex-wrap gap-1.5 pt-3">
                        <span className="text-xs font-bold text-slate-400 self-center mr-1">Skills:</span>
                        {collab.skillsRequired.map((skill, index) => (
                          <span key={index} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold border border-slate-200/50">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action buttons */}
                    <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleApplyCollaboration(collab._id)}
                          disabled={appliedCollabs[collab._id]}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                            appliedCollabs[collab._id]
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow shadow-blue-500/10'
                          }`}
                        >
                          {appliedCollabs[collab._id] ? (
                            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Applied</span>
                          ) : 'Apply to Join'}
                        </button>
                        <button className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer">
                          Message
                        </button>
                      </div>

                      <button className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 3: Leaderboard (Top Researchers) */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3 gap-4">
              <h2 className="text-lg font-bold font-display text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Top Researchers Leaderboard
              </h2>

              {/* Filters */}
              <div className="flex gap-2.5">
                <input 
                  type="text" 
                  placeholder="Filter by Country" 
                  value={leaderboardCountry}
                  onChange={(e) => setLeaderboardCountry(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
                <input 
                  type="text" 
                  placeholder="Filter by Inst" 
                  value={leaderboardInst}
                  onChange={(e) => setLeaderboardInst(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-sans focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {loadingTop ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 animate-pulse space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-10 bg-slate-100 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-semibold text-slate-600">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200/60 uppercase tracking-wider text-[10px] text-slate-400">
                        <th className="px-6 py-3.5 text-center">Rank</th>
                        <th className="px-6 py-3.5">Researcher</th>
                        <th className="px-6 py-3.5">Institution</th>
                        <th className="px-6 py-3.5 text-center">Publications</th>
                        <th className="px-6 py-3.5 text-center">Citations</th>
                        <th className="px-6 py-3.5 text-center">h-index</th>
                        <th className="px-6 py-3.5 text-center">Impact Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topResearchers.map((resItem) => (
                        <tr key={resItem._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-[10px] font-extrabold ${
                              resItem.rank === 1 ? 'bg-amber-100 text-amber-600' :
                              resItem.rank === 2 ? 'bg-slate-100 text-slate-600' :
                              resItem.rank === 3 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'
                            }`}>
                              {resItem.rank}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            <div className="flex items-center gap-3">
                              <img 
                                src={resItem.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                                alt={resItem.fullName}
                                className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-sm"
                              />
                              <div>
                                <span className="line-clamp-1">{resItem.fullName}</span>
                                <span className="text-[9px] text-slate-400 font-semibold block">{resItem.role}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 truncate max-w-[150px]">{resItem.institution || 'N/A'}, {resItem.country}</td>
                          <td className="px-6 py-4 text-center font-extrabold text-slate-900">{resItem.publications}</td>
                          <td className="px-6 py-4 text-center font-extrabold text-slate-900">{resItem.citations}</td>
                          <td className="px-6 py-4 text-center font-extrabold text-slate-900">{resItem.hIndex}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-md font-extrabold">
                              {resItem.researchScore}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {topResearchers.length === 0 && (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-400">
                            No top researchers match filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column (1/4 on Desktop): Recommended Colleagues, Trending Keywords, Recent Users */}
        <div className="space-y-8">
          
          {/* Widget 1: Recommended Researchers */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm text-left">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
              <Sparkles className="w-4.5 h-4.5 text-blue-600" /> Suggested Colleagues
            </h3>

            {loadingRes ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="flex items-center gap-3 animate-pulse">
                    <div className="w-9 h-9 bg-slate-100 rounded-full"></div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-100 rounded w-20"></div>
                      <div className="h-2 bg-slate-100 rounded w-28"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {researchers.map((rec) => (
                  <div key={rec.user._id} className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 last:border-b-0 last:pb-0">
                    <div className="flex items-start gap-2.5">
                      <img 
                        src={rec.profile?.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                        alt={rec.user.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-sm shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 leading-none truncate hover:text-blue-600 transition-colors cursor-pointer">
                          {rec.user.fullName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-semibold mt-1 block truncate">
                          {rec.profile?.institution || 'Stanford Research'}
                        </span>
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold mt-1.5 inline-block">
                          {rec.finalMatch}% Match
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleFollowUser(rec.user._id)}
                      className={`px-2.5 py-1.5 border rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                        followedUsers[rec.user._id]
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {followedUsers[rec.user._id] ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Widget 2: Trending Tag Cloud */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm text-left">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
              <TrendingUp className="w-4.5 h-4.5 text-indigo-600" /> Trending Topics
            </h3>

            {loadingTrending ? (
              <div className="flex flex-wrap gap-2 animate-pulse">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-6 bg-slate-100 rounded w-12"></div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {trending.wordCloud.map((item, index) => (
                  <span 
                    key={index} 
                    className="px-2.5 py-1 bg-slate-50 border border-slate-100 hover:border-blue-600/20 hover:bg-blue-50/20 transition-all rounded-lg text-xs font-bold text-slate-600 flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-slate-400" />
                    {item.text}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Widget 3: Recently Joined Researchers */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm text-left">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
              <Users className="w-4.5 h-4.5 text-blue-600" /> Newest Members
            </h3>

            {loadingRecent ? (
              <div className="space-y-3">
                {[1, 2].map((n) => (
                  <div key={n} className="flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-slate-100 rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-slate-100 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3.5">
                {recent.map((item) => (
                  <div key={item._id} className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={item.profile?.profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                        alt={item.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-sm shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 leading-none truncate">{item.fullName}</h4>
                        <p className="text-[9px] text-slate-400 truncate mt-1">Joined ResearchConnect</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleFollowUser(item._id)}
                      className={`px-2 py-1 border rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                        followedUsers[item._id]
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {followedUsers[item._id] ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default DiscoveryDashboard;
