import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useInfiniteQuery } from '@tanstack/react-query';
import { setQuery as setGlobalQuery } from '../../../redux/slices/searchSlice';
import searchService from '../../../services/search.service';

// Components
import MinimalSearchHero from '../components/MinimalSearchHero';
import MinimalResultCard from '../components/MinimalResultCard';
import { Loader2 } from 'lucide-react';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const qParam = searchParams.get('q') || '';
  const citationsParam = searchParams.get('citations') || '';
  const yearParam = searchParams.get('year') || '';
  const locationParam = searchParams.get('location') || '';

  const [query, setQuery] = useState(qParam);
  const [filters, setFilters] = useState({ citations: citationsParam, year: yearParam, location: locationParam });

  // Sync URL state
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const c = searchParams.get('citations') || '';
    const y = searchParams.get('year') || '';
    const l = searchParams.get('location') || '';
    setQuery(q);
    setFilters({ citations: c, year: y, location: l });
    dispatch(setGlobalQuery(q));
  }, [searchParams, dispatch]);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['searchResearchers', query, filters.citations, filters.year, filters.location],
    queryFn: ({ pageParam = 1 }) => searchService.searchResearchers({ 
      q: query, 
      citations: filters.citations,
      year: filters.year,
      location: filters.location,
      page: pageParam, 
      limit: 10 
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

  const rawResults = data?.pages.flatMap(page => page.results || []) || [];

  // Map backend user data to what MinimalResultCard expects
  const mappedResults = rawResults.map((r, index) => ({
    id: r._id,
    uniqueKey: `${r._id}-${index}`, // ensure completely unique keys
    name: r.fullName || `${r.firstName} ${r.lastName}`,
    initials: (r.firstName?.[0] || '') + (r.lastName?.[0] || ''),
    role: (r.profile?.designation && r.profile?.department) 
            ? `${r.profile.designation} - ${r.profile.department}`
            : r.profile?.designation || r.profile?.department || r.researcherType || 'Researcher',
    affiliation: r.institution || 'Independent Researcher',
    type: 'RESEARCHER',
    verified: true,
    views: r.profile?.metrics?.viewsCount || r.profile?.views || 0,
    citations: r.profile?.metrics?.totalCitations || r.profile?.citations || 0,
    profileSlug: r.profileSlug,
    avatar: r.profileImage || r.profile?.profileImage || null
  }));

  // Intersection Observer for infinite scrolling
  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (isLoading || isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      <div className="max-w-[960px] mx-auto px-6 lg:px-8 py-10">
        
        {/* Minimal Hero */}
        <MinimalSearchHero />

        {/* Results Area */}
        <main className="mt-12">
          
          {isLoading && (
            <div className="flex justify-center items-center py-20 opacity-0 animate-fade-in">
              <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
            </div>
          )}

          {!isLoading && isError && (
            <div className="text-center text-red-500 py-10 opacity-0 animate-fade-in">
              Failed to load search results. Please try again.
            </div>
          )}

          {!isLoading && !isError && mappedResults.length === 0 && (
            <div className="text-center text-[#94A3B8] py-20 opacity-0 animate-fade-in">
              No results found for "{query}". Try a different search term.
            </div>
          )}

          {/* Results List */}
          {!isLoading && !isError && mappedResults.length > 0 && (
            <div className="space-y-5">
              {mappedResults.map((res, i) => {
                if (mappedResults.length === i + 1) {
                  return (
                    <div ref={lastElementRef} key={res.uniqueKey} className="opacity-0 animate-fade-up" style={{ animationDelay: `${(i % 10) * 100}ms`, animationFillMode: 'forwards' }}>
                      <MinimalResultCard result={res} index={i} />
                    </div>
                  );
                }
                return (
                  <div key={res.uniqueKey} className="opacity-0 animate-fade-up" style={{ animationDelay: `${(i % 10) * 100}ms`, animationFillMode: 'forwards' }}>
                    <MinimalResultCard result={res} index={i} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Infinite Scroll Loading Spinner */}
          {isFetchingNextPage && (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default SearchPage;
