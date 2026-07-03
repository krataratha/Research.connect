import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import communitiesService from '../services/communities.service';

const CATEGORIES = ['All', 'AI / ML', 'Bioinformatics', 'Climate Science', 'Physics', 'Social Sciences', 'Computer Science', 'Medicine', 'Engineering'];

export default function CommunityExplorer() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  let debounceTimer;

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => setDebouncedSearch(val), 400);
  };

  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['communities', debouncedSearch],
    queryFn: () => communitiesService.getCommunities({ search: debouncedSearch }),
    select: (res) => res.data.data || [],
  });

  const filteredCommunities = activeCategory === 'All'
    ? communities
    : communities.filter(c => c.researchArea?.includes(activeCategory));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-violet-950/60 via-gray-950 to-gray-950 border-b border-gray-800 py-14 px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15)_0%,transparent_70%)]" />
        <div className="relative max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Research Communities</h1>
          <p className="text-gray-400 mb-6">Discover and join vibrant communities of researchers around your field.</p>

          {/* Search */}
          <div className="relative">
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search communities..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-3 pl-11 text-white focus:border-violet-500 focus:outline-none"
            />
            <span className="absolute left-4 top-3.5 text-gray-500">🔍</span>
          </div>

          <Link
            to="/communities/create"
            className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-semibold hover:opacity-90 transition-all"
          >
            + Create Community
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm transition-all ${
                activeCategory === cat
                  ? 'bg-violet-600 text-white'
                  : 'border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-56 bg-gray-900 animate-pulse rounded-2xl" />
            ))}
          </div>
        )}

        {/* Community Grid */}
        {!isLoading && filteredCommunities.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCommunities.map(community => (
              <CommunityCard key={community._id} community={community} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCommunities.length === 0 && (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🌐</div>
            <h2 className="text-xl font-semibold text-gray-300">No communities found</h2>
            <p className="text-gray-500 mt-2">Try a different search term or category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CommunityCard({ community }) {
  return (
    <Link
      to={`/communities/${community.slug}`}
      className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all group"
    >
      {/* Card Banner */}
      <div className="h-24 bg-gradient-to-br from-violet-900/40 to-cyan-900/40 flex items-center justify-center text-5xl">
        {community.avatar ? (
          <img src={community.avatar} alt="" className="w-full h-full object-cover" />
        ) : '🔬'}
      </div>

      <div className="p-5">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-2">
          {community.verified && (
            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full">✓ Verified</span>
          )}
          <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full capitalize">
            {community.visibility}
          </span>
        </div>

        <h3 className="font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
          {community.name}
        </h3>

        {community.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{community.description}</p>
        )}

        <div className="flex items-center gap-3 mt-4 text-xs text-gray-500">
          <span>👥 {community.memberCount || 0} members</span>
          {community.researchArea && <span>📌 {community.researchArea}</span>}
        </div>
      </div>
    </Link>
  );
}
