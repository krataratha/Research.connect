import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, FileText, User, BookOpen, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import searchService from '../../../services/search.service';

const useDebounce = (fn, delay) => {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
};

const SearchBar = ({ placeholder = 'Search publications, authors, journals…', className = '', onSearch, minimal = false, initialValue = '' }) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState(null);
  const [history, setHistory] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Sync initialValue to local query state
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Load history on focus
  const loadHistory = async () => {
    try {
      const h = await searchService.getHistory();
      setHistory(h.slice(0, 6));
    } catch { /* guest user */ }
  };

  // Debounced autocomplete
  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setSuggestions(null); return; }
    setIsLoading(true);
    try {
      const data = await searchService.getAutocomplete(q);
      setSuggestions(data);
    } catch { setSuggestions(null); }
    finally { setIsLoading(false); }
  }, []);

  const debouncedFetch = useDebounce(fetchSuggestions, 280);

  useEffect(() => {
    debouncedFetch(query);
  }, [query, debouncedFetch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!dropdownRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (q = query) => {
    if (!q.trim()) return;
    setIsFocused(false);
    if (onSearch) { onSearch(q); return; }
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') { handleSearch(); return; }
    if (e.key === 'Escape') { setIsFocused(false); return; }
  };

  const clearHistory = async (id) => {
    await searchService.clearHistory(id);
    setHistory(prev => id ? prev.filter(h => h._id !== id) : []);
  };

  const showDropdown = isFocused && (query.length >= 2 ? true : history.length > 0);
  const hasSuggestions = suggestions && (
    suggestions.publications?.length > 0 ||
    suggestions.authors?.length > 0 ||
    suggestions.journals?.length > 0 ||
    suggestions.keywords?.length > 0 ||
    suggestions.researchers?.length > 0 ||
    suggestions.projects?.length > 0
  );

  return (
    <div className={`relative ${className}`}>
      {/* Input */}
      <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all duration-200 bg-white ${
        isFocused ? 'border-blue-500 shadow-lg shadow-blue-100 ring-2 ring-blue-100' : 'border-gray-200 shadow-sm hover:border-gray-300'
      }`}>
        {isLoading
          ? <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin flex-shrink-0" />
          : <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
        }
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { setIsFocused(true); if (!query) loadHistory(); }}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-sm"
          autoComplete="off"
          spellCheck="false"
        />
        {query && (
          <button onClick={() => { setQuery(''); setSuggestions(null); inputRef.current?.focus(); }} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
        {!minimal && (
          <button
            onClick={() => handleSearch()}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors flex-shrink-0"
          >
            Search
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 overflow-hidden"
          >
            {/* Autocomplete Suggestions */}
            {query.length >= 2 && hasSuggestions && (
              <div className="p-2">
                {suggestions.researchers?.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Researchers</div>
                    {suggestions.researchers.map((res, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(res.profileSlug ? `/profile/${res.profileSlug}` : `/profile/${res.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl transition-colors text-left"
                      >
                        {res.avatar ? (
                          <img src={res.avatar} alt={res.fullName} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                            {res.fullName?.charAt(0).toUpperCase() || 'R'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">{res.fullName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {suggestions.publications?.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Publications</div>
                    {suggestions.publications.map((pub, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(`/publications/${pub.slug}`)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl transition-colors text-left group"
                      >
                        <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{pub.title}</p>
                          <p className="text-xs text-gray-400">{pub.type} · {pub.year}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {suggestions.authors?.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Authors</div>
                    {suggestions.authors.map((author, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearch(author.name)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl transition-colors text-left"
                      >
                        <User className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900">{author.name}</p>
                          {author.institution && <p className="text-xs text-gray-400 truncate">{author.institution}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {suggestions.keywords?.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Keywords</div>
                    <div className="flex flex-wrap gap-2 px-3 pb-2">
                      {suggestions.keywords.map((kw, i) => (
                        <button
                          key={i}
                          onClick={() => handleSearch(kw)}
                          className="px-3 py-1 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-700 rounded-full text-xs font-medium transition-colors"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {suggestions.journals?.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">Journals</div>
                    {suggestions.journals.map((j, i) => (
                      <button
                        key={i}
                        onClick={() => handleSearch(j)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl transition-colors text-left"
                      >
                        <BookOpen className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-800">{j}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recent Searches (shown when no query or query < 2 chars) */}
            {query.length < 2 && history.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-3 py-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Recent Searches</span>
                  <button onClick={() => clearHistory()} className="text-xs text-blue-500 hover:text-blue-700 transition-colors">Clear all</button>
                </div>
                {history.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-xl group">
                    <Clock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                    <button
                      onClick={() => { setQuery(item.query); handleSearch(item.query); }}
                      className="flex-1 text-sm text-gray-700 text-left truncate"
                    >
                      {item.query}
                    </button>
                    <button onClick={() => clearHistory(item._id)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-lg transition-all">
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick actions */}
            {query.trim() && (
              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={() => handleSearch()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl transition-colors text-left"
                >
                  <Search className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-700">Search for <strong className="text-gray-900">"{query}"</strong></span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
