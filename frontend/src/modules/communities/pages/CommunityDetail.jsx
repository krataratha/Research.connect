import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import communitiesService from '../services/communities.service';
import CommunityFeed from '../components/CommunityFeed';
import CommunityChat from '../components/CommunityChat';

const TABS = ['Feed', 'Discussions', 'Events', 'Jobs', 'Members', 'Chat'];

export default function CommunityDetail() {
  const { slug } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('Feed');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['community', slug],
    queryFn: () => communitiesService.getCommunityBySlug(slug),
    select: (res) => res.data.data,
  });

  const joinMutation = useMutation({
    mutationFn: () => communitiesService.joinCommunity(data.community._id),
    onSuccess: () => {
      toast.success('Successfully joined community!');
      queryClient.invalidateQueries(['community', slug]);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Could not join community.'),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-violet-500" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        Community not found.
      </div>
    );
  }

  const { community, memberCount, myMembership } = data;
  const isMember = myMembership?.status === 'Active';
  const isPending = myMembership?.status === 'PendingApproval';

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Banner */}
      <div className="relative h-44 bg-gradient-to-r from-violet-900/50 via-cyan-900/30 to-gray-900 border-b border-gray-800 flex items-end px-6 pb-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(139,92,246,0.25)_0%,transparent_60%)]" />
        <div className="relative flex items-end gap-6 pb-0 translate-y-1/2">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-600 flex items-center justify-center text-4xl border-4 border-gray-950 shadow-lg">
            {community.avatar ? <img src={community.avatar} alt="" className="w-full h-full rounded-2xl object-cover" /> : '🔬'}
          </div>
          <div className="pb-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{community.name}</h1>
              {community.verified && <span className="text-blue-400 text-sm">✓</span>}
            </div>
            <p className="text-gray-400 text-sm">{memberCount} members · {community.visibility}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16">
        {/* Actions row */}
        <div className="flex items-center justify-end mb-4 gap-3">
          {!isMember && !isPending && (
            <button
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {joinMutation.isPending ? 'Joining...' : 'Join Community'}
            </button>
          )}
          {isPending && (
            <span className="px-4 py-2 rounded-xl border border-yellow-500/30 text-yellow-400 text-sm">
              Pending Approval
            </span>
          )}
          {isMember && (
            <span className="px-4 py-2 rounded-xl border border-emerald-500/30 text-emerald-400 text-sm">
              ✓ Member
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-800 mb-6 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex gap-6">
          {/* Main area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'Feed' && (
              <CommunityFeed communityId={community._id} isMember={isMember} />
            )}
            {activeTab === 'Chat' && (
              <CommunityChat community={community} isMember={isMember} />
            )}
            {['Discussions', 'Events', 'Jobs', 'Members'].includes(activeTab) && (
              <div className="text-center py-16 text-gray-500">
                <div className="text-4xl mb-4">🚧</div>
                <p>{activeTab} panel coming soon.</p>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <aside className="hidden xl:block w-72 space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">About</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{community.description || 'No description available.'}</p>
              {community.researchArea && (
                <p className="text-xs text-gray-500 mt-3">📌 {community.researchArea}</p>
              )}
              {community.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {community.tags.slice(0, 5).map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 bg-gray-800 rounded-full text-gray-400">{t}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Stats</h3>
              <div className="space-y-2 text-xs text-gray-400">
                <div className="flex justify-between"><span>Members</span><span className="text-white font-medium">{memberCount}</span></div>
                {community.createdAt && (
                  <div className="flex justify-between"><span>Founded</span><span className="text-white font-medium">{new Date(community.createdAt).toLocaleDateString()}</span></div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
