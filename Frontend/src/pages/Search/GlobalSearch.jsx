import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, BookOpen, Award, Eye, Download, ChevronLeft, 
  ChevronRight, Calendar, Sparkles, Building2, HelpCircle 
} from 'lucide-react';
import { useSearchPublications } from '../../hooks/publication.hooks.js';

const GlobalSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sort = searchParams.get('sort') || 'latest';
  const type = searchParams.get('type') || 'All';
  const filter = searchParams.get('filter') || '';
  const year = searchParams.get('year') || '';

  const [searchVal, setSearchVal] = useState(query);

  const { data, isLoading } = useSearchPublications({
    q: query,
    page,
    sort,
    publicationType: type === 'All' ? undefined : type,
    filter: filter || undefined,
    year: year || undefined,
    limit: 10,
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: searchVal, page: '1', sort, type, filter, year });
  };

  const handleFilterChange = (key, value) => {
    const newParams = {
      q: query,
      page: '1',
      sort,
      type,
      filter,
      year,
    };
    newParams[key] = value;
    
    // Clean up empty params
    Object.keys(newParams).forEach(k => {
      if (!newParams[k]) delete newParams[k];
    });

    setSearchParams(newParams);
  };

  const results = data?.results || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Search Header */}
        <div className="bg-white p-8 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-6">
          <div>
            <h1 className="text-2xl font-black text-[#0F172A] flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#2563EB]" /> Global Research Search
            </h1>
            <p className="text-sm text-[#475569] mt-1">Discover publications, datasets, and articles from researchers around the world.</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] w-5 h-5" />
              <input 
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search by title, keywords, DOI, or abstract..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none text-sm transition"
              />
            </div>
            <button 
              type="submit"
              className="px-8 py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-2xl shadow-md transition text-sm"
            >
              Search
            </button>
          </form>
        </div>

        {/* Main Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <div className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-sm space-y-6 self-start">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-3">
              <Filter className="w-4 h-4 text-[#2563EB]" />
              <h3 className="font-bold text-[#0F172A] text-sm uppercase tracking-wider">Filters</h3>
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#475569] uppercase">Document Type</label>
              <select 
                value={type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs font-semibold outline-none bg-white text-[#475569]"
              >
                <option value="All">All Types</option>
                <option value="Journal Article">Journal Article</option>
                <option value="Conference Paper">Conference Paper</option>
                <option value="Book Chapter">Book Chapter</option>
                <option value="Book">Book</option>
                <option value="Technical Report">Technical Report</option>
                <option value="Thesis">Thesis</option>
              </select>
            </div>

            {/* Publication Year */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#475569] uppercase">Publication Year</label>
              <input 
                type="number"
                value={year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                placeholder="e.g. 2024"
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            {/* Sorting */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#475569] uppercase">Sort By</label>
              <select 
                value={sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs font-semibold outline-none bg-white text-[#475569]"
              >
                <option value="latest">Latest Works</option>
                <option value="mostCited">Most Cited</option>
                <option value="trending">Trending (Views)</option>
              </select>
            </div>

            {/* Open Access Toggle */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-[#475569] uppercase">Open Access Only</span>
              <input 
                type="checkbox"
                checked={filter === 'openAccess'}
                onChange={(e) => handleFilterChange('filter', e.target.checked ? 'openAccess' : '')}
                className="w-4 h-4 text-[#2563EB] border-[#E2E8F0] rounded focus:ring-[#2563EB]"
              />
            </div>

          </div>

          {/* Results List */}
          <div className="lg:col-span-3 space-y-6">
            
            {isLoading ? (
              <div className="bg-white p-12 rounded-3xl border border-[#E2E8F0] shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#2563EB] mb-2" />
                <p className="text-sm font-semibold text-[#475569]">Searching publications...</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {results.map((pub) => (
                    <div key={pub._id} className="bg-white p-6 rounded-3xl border border-[#E2E8F0] shadow-sm hover:border-[#2563EB] transition duration-200 space-y-3">
                      
                      {/* Meta information */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2563EB] bg-[#DBEAFE] px-2.5 py-0.5 rounded-full">{pub.publicationType}</span>
                        <span className="text-xs font-semibold text-[#475569] flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {pub.publicationYear}</span>
                        {pub.user?.isVerified && (
                          <span className="text-xs font-semibold text-[#22C55E] bg-[#DCFCE7] px-2 py-0.5 rounded-full">Verified Author</span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-[#0F172A] hover:text-[#2563EB] transition">
                        <a href={`/publications/${pub._id}`}>{pub.title}</a>
                      </h3>

                      {/* Abstract Snippet */}
                      <p className="text-sm text-[#475569] line-clamp-3 leading-relaxed">{pub.abstract}</p>

                      {/* Author names */}
                      {pub.authors && pub.authors.length > 0 && (
                        <p className="text-xs text-[#475569] font-semibold flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-[#2563EB]" /> Authors: {pub.authors.map(a => a.name).join(', ')}
                        </p>
                      )}

                      {/* Interactions */}
                      <div className="flex gap-4 pt-2 text-xs font-bold text-[#475569]">
                        <span>{pub.analytics?.views || 0} Views</span>
                        <span>{pub.analytics?.downloads || 0} Downloads</span>
                        <span className="text-[#2563EB]">{pub.citationCount || 0} Citations</span>
                      </div>

                    </div>
                  ))}

                  {results.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-[#E2E8F0] shadow-sm">
                      <BookOpen className="w-16 h-16 text-[#94A3B8] mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-[#0F172A] mb-1">No publications found</h3>
                      <p className="text-sm text-[#475569]">Try refining your search keywords or adjusting your sidebar filters.</p>
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm text-sm font-bold text-[#475569]">
                    <button 
                      disabled={page <= 1}
                      onClick={() => handleFilterChange('page', page - 1)}
                      className="flex items-center gap-1 px-4 py-2 border border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-50 rounded-xl transition"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button 
                      disabled={page >= totalPages}
                      onClick={() => handleFilterChange('page', page + 1)}
                      className="flex items-center gap-1 px-4 py-2 border border-[#E2E8F0] hover:bg-[#F8FAFC] disabled:opacity-50 rounded-xl transition"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default GlobalSearch;
