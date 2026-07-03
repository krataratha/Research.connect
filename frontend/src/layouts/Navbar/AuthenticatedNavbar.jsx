import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutSuccess } from '../../redux/slices/authSlice';
import authService from '../../services/auth.service';
import searchService from '../../services/search.service';
import { setQuery } from '../../redux/slices/searchSlice';
import { setChatOpen } from '../../redux/slices/messageSlice';
import { 
  Bell, MessageSquare, UserPlus, Plus, ChevronDown, 
  Search, LogOut, User, Compass,
  FileText, Briefcase, Award, Settings, BookOpen, HelpCircle,
  Share2, Users, Bookmark
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import connectionsService from '../../modules/connections/services/connections.service';
import NotificationBell from '../../modules/notifications/components/NotificationBell';

const AuthenticatedNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, profile } = useSelector((state) => state.auth);
  const searchState = useSelector((state) => state.search);
  const queryClient = useQueryClient();

  // Fetch pending received connection requests
  const { data: receivedRequests } = useQuery({
    queryKey: ['connectionRequests', 'received'],
    queryFn: async () => {
      const res = await connectionsService.getReceivedRequests();
      return res.data || [];
    },
    enabled: !!user
  });

  // Accept connection request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      return await connectionsService.acceptConnectionRequest(requestId);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Connection request accepted!');
        queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
        queryClient.invalidateQueries({ queryKey: ['connections'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    }
  });

  // Reject/Ignore connection request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId) => {
      return await connectionsService.rejectConnectionRequest(requestId);
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Connection request ignored.');
        queryClient.invalidateQueries({ queryKey: ['connectionRequests'] });
      }
    }
  });

  // Dropdown states
  const [profileOpen, setProfileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);

  const profileRef = useRef(null);
  const createRef = useRef(null);
  const notifRef = useRef(null);
  const reqRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Close dropdowns and suggestions on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (createRef.current && !createRef.current.contains(e.target)) setCreateOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (reqRef.current && !reqRef.current.contains(e.target)) setReqOpen(false);
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Debounced search suggestions fetch
  useEffect(() => {
    if (!searchState.query || searchState.query.trim().length < 2) {
      setSuggestions(null);
      setIsSearchingSuggestions(false);
      return;
    }

    setIsSearchingSuggestions(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const data = await searchService.getAutocomplete(searchState.query);
        setSuggestions(data);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setIsSearchingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchState.query]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      dispatch(logoutSuccess());
      toast.success('Logged out successfully');
      navigate('/');
    }
  };

  const handleSearchChange = (e) => {
    dispatch(setQuery(e.target.value));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchState.query.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchState.query)}`);
    }
  };

  const mockNotifications = [
    { id: 1, text: 'David Chen liked your publication.', time: '10m ago', unread: true },
    { id: 2, text: 'Elena Rostova cited your multi-modal search paper.', time: '2h ago', unread: true },
    { id: 3, text: 'You have a new follower: Robert Miller.', time: '1d ago', unread: false }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="max-w-[95%] xl:max-w-[92%] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </span>
              <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">
                Research <span className="text-blue-600">Connect</span>
              </span>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="hidden lg:flex items-center space-x-2 text-xs font-semibold text-slate-600">
            <Link to="/" className="px-3 py-2 rounded-lg hover:bg-slate-55 hover:text-blue-600 transition-all duration-150">Home</Link>
            <Link to="/#research" className="px-3 py-2 rounded-lg hover:bg-slate-55 hover:text-blue-600 transition-all duration-150">Research</Link>
            <Link to="/#communities" className="px-3 py-2 rounded-lg hover:bg-slate-55 hover:text-blue-600 transition-all duration-150">Communities</Link>
          </div>

          {/* Large Global Search with Autocomplete */}
          <div ref={searchContainerRef} className="flex-grow max-w-xl relative hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search researchers, papers, patents, keywords..."
                value={searchState.query}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-11 pr-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-slate-950 placeholder-slate-400 shadow-inner hover:bg-slate-100/50 focus:bg-white transition-all duration-200"
              />
            </form>

            {/* Realtime Autocomplete Suggestions */}
            {showSuggestions && (searchState.query.trim().length >= 2) && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-[420px] overflow-y-auto">
                {isSearchingSuggestions ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-xs font-semibold text-slate-400">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </div>
                ) : suggestions && (
                  Object.values(suggestions).some(arr => Array.isArray(arr) && arr.length > 0)
                ) ? (
                  <div className="py-2.5 divide-y divide-slate-100">
                    {/* Authors / Researchers */}
                    {suggestions.authors && suggestions.authors.length > 0 && (
                      <div className="py-2">
                        <div className="px-4 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">Researchers</div>
                        <div className="mt-1 space-y-0.5">
                          {suggestions.authors.map((author, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setShowSuggestions(false);
                                navigate(`/profile/${author.profileSlug || author.username || author.name}`);
                              }}
                              className="w-full px-4 py-2 hover:bg-slate-50 text-left flex items-center gap-3 transition-colors group cursor-pointer"
                            >
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                                {author.name?.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate">{author.name}</p>
                                {author.institution && (
                                  <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{author.institution}</p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Publications */}
                    {suggestions.publications && suggestions.publications.length > 0 && (
                      <div className="py-2">
                        <div className="px-4 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">Publications</div>
                        <div className="mt-1 space-y-0.5">
                          {suggestions.publications.map((pub) => (
                            <button
                              key={pub.id}
                              onClick={() => {
                                setShowSuggestions(false);
                                navigate(`/publications/${pub.slug || pub.id}`);
                              }}
                              className="w-full px-4 py-2 hover:bg-slate-50 text-left flex items-start gap-3 transition-colors group cursor-pointer"
                            >
                              <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0 group-hover:text-blue-600" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 line-clamp-1 leading-snug">{pub.title}</p>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                  {pub.type ? `${pub.type.charAt(0).toUpperCase() + pub.type.slice(1)}` : 'Paper'} • {pub.year || 'N/A'}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Keywords */}
                    {suggestions.keywords && suggestions.keywords.length > 0 && (
                      <div className="py-2">
                        <div className="px-4 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">Keywords / Areas</div>
                        <div className="mt-1 flex flex-wrap gap-1.5 px-4 py-1">
                          {suggestions.keywords.map((kw, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setShowSuggestions(false);
                                dispatch(setQuery(kw));
                                navigate(`/search?q=${encodeURIComponent(kw)}`);
                              }}
                              className="text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 px-2.5 py-1 rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              {kw}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer - Search all */}
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setShowSuggestions(false);
                          navigate(`/search?q=${encodeURIComponent(searchState.query)}`);
                        }}
                        className="w-full py-2 hover:bg-blue-50 text-blue-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        Search all results for "{searchState.query}"
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 px-4 text-center text-xs font-semibold text-slate-400 italic">
                    No suggestions found. Press Enter to search.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Utility Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Create Dropdown */}
            <div className="relative" ref={createRef}>
              <button
                onClick={() => setCreateOpen(!createOpen)}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-3.5 py-2 rounded-lg shadow-sm active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>
              {createOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-left text-sm font-semibold text-slate-700">
                  <button onClick={() => { setCreateOpen(false); navigate('/publications/create'); }} className="w-full px-4 py-2 hover:bg-slate-55 hover:text-blue-600 text-left flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" /> Upload Publication
                  </button>
                  <button onClick={() => { setCreateOpen(false); navigate('/projects/create'); }} className="w-full px-4 py-2 hover:bg-slate-55 hover:text-blue-600 text-left flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" /> Create Research Project
                  </button>
                  <button onClick={() => { setCreateOpen(false); navigate('/datasets/create'); }} className="w-full px-4 py-2 hover:bg-slate-55 hover:text-blue-600 text-left flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400" /> Share Dataset
                  </button>
                  <button onClick={() => { setCreateOpen(false); navigate('/questions/create'); }} className="w-full px-4 py-2 hover:bg-slate-55 hover:text-blue-600 text-left flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-slate-400" /> Ask Question
                  </button>
                  <button onClick={() => { setCreateOpen(false); navigate('/communities/create'); }} className="w-full px-4 py-2 hover:bg-slate-55 hover:text-blue-600 text-left flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" /> Create Community
                  </button>
                  <button onClick={() => { setCreateOpen(false); navigate('/collaborations/create'); }} className="w-full px-4 py-2 hover:bg-slate-55 hover:text-blue-600 text-left flex items-center gap-2">
                    <Plus className="w-4 h-4 text-slate-400" /> Create Collaboration
                  </button>
                  <button onClick={() => { setCreateOpen(false); navigate('/patents/create'); }} className="w-full px-4 py-2 hover:bg-slate-55 hover:text-blue-600 text-left flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-400" /> Upload Patent
                  </button>
                  <button onClick={() => { setCreateOpen(false); navigate('/articles/create'); }} className="w-full px-4 py-2 hover:bg-slate-55 hover:text-blue-600 text-left flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" /> Write Article
                  </button>
                  <button onClick={() => { setCreateOpen(false); navigate('/events/create'); }} className="w-full px-4 py-2 hover:bg-slate-55 hover:text-blue-600 text-left flex items-center gap-2">
                    <Compass className="w-4 h-4 text-slate-400" /> Create Event
                  </button>
                </div>
              )}
            </div>

            {/* Requests Popover */}
            <div className="relative" ref={reqRef}>
              <button
                onClick={() => setReqOpen(!reqOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-all relative cursor-pointer"
                title="Requests"
              >
                <UserPlus className="w-5 h-5" />
                {receivedRequests && receivedRequests.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                )}
              </button>
              {reqOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-4">
                  <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 mb-2 flex items-center justify-between">
                    <span>Pending Requests</span>
                    {receivedRequests && receivedRequests.length > 0 && (
                      <span className="text-[10px] bg-blue-100 text-blue-650 px-2 py-0.5 rounded-full font-black uppercase">
                        {receivedRequests.length} New
                      </span>
                    )}
                  </h4>
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {receivedRequests && receivedRequests.length > 0 ? (
                      receivedRequests.map(req => (
                        <div key={req._id} className="text-xs border-b border-slate-50 pb-2.5 last:border-0 last:pb-0 text-left space-y-1">
                          <p className="font-bold text-slate-800">{req.user?.fullName}</p>
                          {req.profile?.headline && (
                            <p className="text-slate-400 text-[10px] truncate font-semibold">{req.profile.headline}</p>
                          )}
                          {req.note && (
                            <p className="text-slate-500 mt-1 bg-slate-55 p-1.5 rounded-lg italic">"{req.note}"</p>
                          )}
                          <div className="flex gap-2 pt-1">
                            <button 
                              onClick={() => {
                                acceptRequestMutation.mutate(req._id);
                              }}
                              disabled={acceptRequestMutation.isPending}
                              className="bg-blue-600 text-white font-bold px-3 py-1 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => {
                                rejectRequestMutation.mutate(req._id);
                              }}
                              disabled={rejectRequestMutation.isPending}
                              className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors"
                            >
                              Ignore
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 py-3 text-center italic font-semibold">No pending requests</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Messages Chat Toggle */}
            <button
              onClick={() => dispatch(setChatOpen(true))}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-all relative"
              title="Messages"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full"></span>
            </button>

            {/* Notifications Popover */}
            <NotificationBell />

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 pr-2.5 rounded-full border border-slate-200 hover:border-blue-600 hover:bg-slate-50 focus:outline-none transition-all shadow-sm duration-200 group"
              >
                <img
                  src={profile?.profileImage || user?.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-100 transition-all shrink-0"
                />
                <span className="hidden lg:block text-xs font-bold text-slate-700 group-hover:text-blue-600 max-w-[90px] truncate transition-colors duration-150">
                  {user?.fullName?.split(' ')[0] || 'Scholar'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 transition-colors duration-150" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 text-left text-sm font-semibold text-slate-700">
                  <div className="px-4 py-2 border-b border-slate-150">
                    <p className="font-extrabold text-slate-900 truncate">{user?.fullName || 'Researcher'}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="py-1 grid grid-cols-1 gap-0.5">
                    <Link to={user?.profileSlug ? `/profile/${user.profileSlug}` : '/profile'} onClick={() => setProfileOpen(false)} className="px-4 py-2 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors">
                      <User className="w-4 h-4 text-slate-400" /> My Profile
                    </Link>
                    <Link to="/certificates" onClick={() => setProfileOpen(false)} className="px-4 py-2 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors">
                      <Award className="w-4 h-4 text-slate-400" /> Certificates
                    </Link>
                    <Link to="/achievements" onClick={() => setProfileOpen(false)} className="px-4 py-2 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors">
                      <Award className="w-4 h-4 text-slate-400" /> Achievements
                    </Link>
                    <Link to="/help" onClick={() => setProfileOpen(false)} className="px-4 py-2 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2.5 transition-colors">
                      <HelpCircle className="w-4 h-4 text-slate-400" /> Help Center
                    </Link>
                  </div>
                  <div className="border-t border-slate-150 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 hover:bg-red-50 text-red-650 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </nav>
  );
};

export default AuthenticatedNavbar;