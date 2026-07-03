import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Users, Mail, Compass, UserCheck, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import connectionsService from '../services/connections.service';
import followService from '../../follow/services/follow.service';
import InvitationCard from '../components/InvitationCard';
import SuggestedResearcherCard from '../../follow/components/SuggestedResearcherCard';
import profileService from '../../../services/profile.service';

const NetworkPage = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  // Fetch current user's profile details to get connectionsCount, etc.
  const { data: profileData } = useQuery({
    queryKey: ['profile', currentUser?.username || 'me'],
    queryFn: async () => {
      const res = await profileService.getProfile();
      return res.data;
    },
    enabled: !!currentUser
  });

  const profile = profileData;

  // Fetch received requests
  const { data: receivedRequests, isLoading: loadingReqs } = useQuery({
    queryKey: ['connectionRequests', 'received'],
    queryFn: async () => {
      const res = await connectionsService.getReceivedRequests();
      return res.data || [];
    }
  });

  // Fetch suggestions
  const { data: suggestionsData, isLoading: loadingSugs } = useQuery({
    queryKey: ['suggestions', 1],
    queryFn: async () => {
      const res = await followService.getFollowSuggestions({ limit: 6, page: 1 });
      return res.data;
    }
  });

  const suggestions = suggestionsData?.docs || [];

  return (
    <div className="space-y-8 text-left">
      
      {/* Network Overview Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Connections summary card */}
        <div 
          onClick={() => navigate('/network/connections')}
          className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-[#2563EB] rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Connections</h4>
              <p className="text-2xl font-black text-slate-900 leading-tight mt-1">{profile?.connectionsCount || 0}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>

        {/* Received requests summary card */}
        <div 
          onClick={() => navigate('/network/invitations')}
          className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-[#22C55E] rounded-2xl">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Pending Invitations</h4>
              <p className="text-2xl font-black text-slate-900 leading-tight mt-1">
                {(receivedRequests?.length || profile?.pendingReceivedCount || 0)}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>

        {/* Discover summary card */}
        <div 
          onClick={() => navigate('/discover/researchers')}
          className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-[#4F46E5] rounded-2xl">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Discover</h4>
              <p className="text-sm font-black text-[#4F46E5] mt-1.5 flex items-center gap-1">
                <span>Recommendations</span>
                <Sparkles className="w-3.5 h-3.5 fill-[#4F46E5]/10 animate-pulse" />
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Received Requests Preview */}
      {receivedRequests && receivedRequests.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase">Received Requests</h3>
              <p className="text-[10px] text-[#475569] font-bold uppercase tracking-wider mt-0.5">Invitations waiting for your response</p>
            </div>
            <Link to="/network/invitations" className="text-xs font-bold text-blue-650 hover:underline flex items-center gap-0.5">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {receivedRequests.slice(0, 2).map((request) => (
              <InvitationCard
                key={request._id}
                request={request}
                type="received"
                currentUserId={currentUser?._id}
              />
            ))}
          </div>
        </div>
      )}

      {/* People You May Know / Suggestions Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase">Suggested Researchers</h3>
            <p className="text-[10px] text-[#475569] font-bold uppercase tracking-wider mt-0.5">People you may know in your field</p>
          </div>
          <Link to="/discover/researchers" className="text-xs font-bold text-blue-650 hover:underline flex items-center gap-0.5">
            <span>See More</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingSugs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-5 h-44 animate-pulse space-y-4" />
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((suggestion) => (
              <SuggestedResearcherCard
                key={suggestion.user._id}
                suggestion={suggestion}
                currentUserId={currentUser?._id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto opacity-55" />
            <p className="text-xs text-slate-500 font-bold italic">No recommendations available at the moment.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default NetworkPage;
