import { useState, useEffect, useMemo } from 'react';
import { MOCK_CERTIFICATES } from '../constants/certificates.constants';

/**
 * useCertificates
 * ─────────────────────────────────────────────────────────────────────────────
 * Encapsulates all search / filter / sort state logic for the Certificates page.
 * Business logic is deliberately kept OUT of the page component per project rules.
 */
const useCertificates = () => {
  const [searchQuery, setSearchQuery]       = useState('');
  const [activeProvider, setActiveProvider] = useState('all');
  const [activeStatus, setActiveStatus]     = useState('all');

  // Simulate a brief loading state on first mount
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    let result = [...MOCK_CERTIFICATES];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.provider.toLowerCase().includes(q) ||
          c.credentialId.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (activeProvider !== 'all') {
      result = result.filter((c) => c.provider === activeProvider);
    }

    if (activeStatus !== 'all') {
      result = result.filter((c) => c.status === activeStatus);
    }

    return result;
  }, [searchQuery, activeProvider, activeStatus]);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveProvider('all');
    setActiveStatus('all');
  };

  return {
    certificates: filtered,
    totalCount:   MOCK_CERTIFICATES.length,
    isLoading,
    searchQuery,
    setSearchQuery,
    activeProvider,
    setActiveProvider,
    activeStatus,
    setActiveStatus,
    resetFilters,
    hasActiveFilters:
      searchQuery.trim() !== '' ||
      activeProvider !== 'all' ||
      activeStatus !== 'all',
  };
};

export default useCertificates;
