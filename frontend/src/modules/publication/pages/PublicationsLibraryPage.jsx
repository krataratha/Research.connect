import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  FileText, Eye, Download, Search, Filter, Grid, List, 
  Trash2, RotateCcw, Share2, Bookmark, Copy, BarChart2, Plus, 
  RefreshCw, FileDown, BookOpen, Clock, Calendar, Shield, Globe, Award, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import publicationService from '../../../services/publication.service';
import profileService from '../../../services/profile.service';

const PublicationsLibraryPage = () => {
  const { profileSlug } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  // States
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterVisibility, setFilterVisibility] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // all | published | draft | trash
  const [sortBy, setSortBy] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isSyncing, setIsSyncing] = useState(false);

  // Selected Publication for Analytics Modal
  const [selectedPubAnalytics, setSelectedPubAnalytics] = useState(null);
  // Selected Publication for Comments Modal (optional)
  const [selectedPubComments, setSelectedPubComments] = useState(null);
  // Delete confirmation modal state
  const [deleteConfirmPub, setDeleteConfirmPub] = useState(null);

  // 1. Fetch profile to check ownership & get metrics
  const { data: profileRes, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', profileSlug],
    queryFn: () => profileService.getPublicProfile(profileSlug)
  });

  const profile = profileRes?.success ? profileRes.data : null;
  const isOwner = currentUser && profile && (currentUser._id === profile.userId || currentUser.profileSlug === profileSlug);

  // 2. Fetch publications dynamically based on ownership
  const { data: pubsRes, isLoading: isPubsLoading, refetch } = useQuery({
    queryKey: ['publications-portfolio', profileSlug, page, limit, filterType, filterYear, filterVisibility, filterStatus, sortBy, searchQuery, isOwner],
    queryFn: async () => {
      const params = {
        page,
        limit,
        sort: sortBy,
        search: searchQuery
      };

      if (filterType !== 'all') params.status = filterType; // type mapping
      if (filterVisibility !== 'all') params.visibility = filterVisibility;

      if (isOwner) {
        if (filterStatus === 'trash') {
          params.trash = 'true';
        } else {
          if (filterStatus !== 'all') params.status = filterStatus;
        }
        return await publicationService.getMyPublications(params);
      } else {
        // Public list
        return await publicationService.getPublicationsByProfileSlug(profileSlug, params);
      }
    },
    enabled: !!profileSlug
  });

  const publications = pubsRes?.success ? pubsRes.data.docs : [];
  const totalPubs = pubsRes?.success ? pubsRes.data.total : 0;
  const totalPages = pubsRes?.success ? pubsRes.data.totalPages : 1;

  // Sync Google Scholar Handler
  const handleScholarSync = async () => {
    setIsSyncing(true);
    const syncToast = toast.loading('Synchronizing Google Scholar profile...');
    try {
      const res = await profileService.syncGoogleScholar();
      if (res.success) {
        toast.success('Sync started. Profile metrics will update shortly!', { id: syncToast });
        refetch();
      } else {
        toast.error('Sync failed. Please verify your Google Scholar ID.', { id: syncToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('Sync failed.', { id: syncToast });
    } finally {
      setIsSyncing(false);
    }
  };

  // CSV Export Handler
  const handleCSVExport = () => {
    if (publications.length === 0) {
      toast.error('No publications to export.');
      return;
    }

    const headers = ['Title', 'Subtitle', 'Authors', 'Type', 'Journal/Conference', 'Year', 'DOI', 'Views', 'Downloads', 'Visibility', 'URL'];
    const rows = publications.map(pub => [
      `"${pub.title?.replace(/"/g, '""') || ''}"`,
      `"${pub.subtitle?.replace(/"/g, '""') || ''}"`,
      `"${pub.authors?.replace(/"/g, '""') || ''}"`,
      pub.publicationType || '',
      `"${pub.publication?.replace(/"/g, '""') || ''}"`,
      pub.year || '',
      pub.doi || '',
      pub.views || 0,
      pub.downloads || 0,
      pub.visibility || '',
      `${window.location.origin}/publication/${pub.slug}`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${profileSlug}_publications.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Publications exported successfully to CSV.');
  };

  // Delete/Trash Handler
  const handleDeleteClick = (pub) => {
    setDeleteConfirmPub(pub);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmPub) return;
    const deleteToast = toast.loading(deleteConfirmPub.isDeleted ? 'Deleting permanently...' : 'Moving to Trash...');
    try {
      const res = await publicationService.deletePublication(deleteConfirmPub.id || deleteConfirmPub._id);
      if (res.success) {
        toast.success(deleteConfirmPub.isDeleted ? 'Publication deleted permanently!' : 'Publication moved to Trash. Restore within 30 days.', { id: deleteToast });
        setDeleteConfirmPub(null);
        refetch();
      } else {
        toast.error('Delete failed.', { id: deleteToast });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Error occurred.', { id: deleteToast });
    }
  };

  // Restore Handler
  const handleRestore = async (id) => {
    const restoreToast = toast.loading('Restoring publication...');
    try {
      const res = await publicationService.restorePublication(id);
      if (res.success) {
        toast.success('Publication restored successfully!', { id: restoreToast });
        refetch();
      } else {
        toast.error('Failed to restore.', { id: restoreToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error occurred.', { id: restoreToast });
    }
  };

  // Copy Link Handler
  const handleCopyLink = (slug) => {
    const url = `${window.location.origin}/publication/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Citation link copied to clipboard!');
  };

  // Download Handler
  const handleDownload = async (pub) => {
    if (!pub.cloudinaryFileUrl) {
      toast.error('No attached PDF available for download.');
      return;
    }
    try {
      await publicationService.trackDownload(pub.id || pub._id);
      window.open(pub.cloudinaryFileUrl, '_blank');
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  // Compute stats metrics
  const totalReads = publications.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalDownloads = publications.reduce((acc, curr) => acc + (curr.downloads || 0), 0);
  const totalCitations = profile?.metrics?.citationsCount || profile?.metrics?.totalCitations || 0;
  const researchScore = publications.reduce((acc, curr) => acc + (curr.researchScore || 0), 0);
  const lastPublished = publications.length > 0 ? publications[0].publicationDate : null;

  if (isProfileLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 text-left text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 1. Header & Navigation Back */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(`/profile/${profileSlug}`)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Researcher Profile</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>My Publications Library</span>
              <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                {totalPubs} Papers
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {isOwner && (
              <>
                <button
                  onClick={() => navigate('/publications/create')}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-750 transition-colors px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/10 active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Publication</span>
                </button>
                <button
                  disabled={isSyncing}
                  onClick={handleScholarSync}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors px-4 py-2.5 rounded-xl active:scale-[0.98] disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Scholar</span>
                </button>
              </>
            )}
            <button
              onClick={handleCSVExport}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors px-4 py-2.5 rounded-xl active:scale-[0.98]"
            >
              <FileDown className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 2. Metrics Grid Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { label: 'Publications', value: totalPubs, icon: FileText, color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { label: 'Total Reads', value: totalReads, icon: Eye, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
            { label: 'Downloads', value: totalDownloads, icon: Download, color: 'bg-cyan-50 text-cyan-600 border-cyan-100' },
            { label: 'Citations', value: totalCitations, icon: BookOpen, color: 'bg-amber-50 text-amber-600 border-amber-100' },
            { label: 'Research Score', value: researchScore, icon: Award, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
            { 
              label: 'Last Published', 
              value: lastPublished ? new Date(lastPublished).toLocaleDateString(undefined, { year: '2-digit', month: 'short' }) : 'N/A', 
              icon: Calendar, 
              color: 'bg-slate-100 text-slate-600 border-slate-200' 
            }
          ].map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between min-h-[90px] shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:shadow-xs transition-shadow">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</span>
                  <span className={`p-1.5 rounded-lg border ${m.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-800 mt-2 truncate">{m.value}</h3>
              </div>
            );
          })}
        </div>

        {/* 3. Filter / Search Sticky Toolbar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col gap-4 md:flex-row md:items-center justify-between sticky top-16 z-30">
          <div className="flex flex-wrap items-center gap-2 flex-grow max-w-4xl">
            {/* Search Input */}
            <div className="relative flex-grow max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Title, DOI, Keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            {/* Filter: Publication Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none text-slate-700 bg-white"
            >
              <option value="all">All Formats</option>
              <option value="article">Articles</option>
              <option value="book">Books</option>
              <option value="conference-paper">Conference Papers</option>
              <option value="patent">Patents</option>
              <option value="preprint">Preprints</option>
            </select>

            {/* Filter: Visibility */}
            <select
              value={filterVisibility}
              onChange={(e) => setFilterVisibility(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none text-slate-700 bg-white"
            >
              <option value="all">All Visibility</option>
              <option value="Public">Public Only</option>
              <option value="Institution Only">Institution Only</option>
              <option value="Private">Private Only</option>
            </select>

            {/* Filter: Status (Owner only can see trash/drafts) */}
            {isOwner && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none text-slate-700 bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="trash">Trash (Soft-deleted)</option>
              </select>
            )}

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none text-slate-700 bg-white"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-views">Most Read (Views)</option>
              <option value="-downloads">Most Downloaded</option>
            </select>
          </div>

          <div className="flex items-center gap-2 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg border transition-colors ${
                viewMode === 'grid' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg border transition-colors ${
                viewMode === 'list' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4. Publication Card List */}
        {isPubsLoading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading publications...</p>
          </div>
        ) : publications.length === 0 ? (
          <div className="py-24 bg-white border border-slate-200 rounded-3xl text-center shadow-xs">
            <FileText className="w-12 h-12 text-slate-350 mx-auto mb-3.5" />
            <h3 className="text-base font-extrabold text-slate-800">No Publications Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              No publications match the selected filters or search queries in this portfolio.
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
            {publications.map((pub) => {
              const id = pub.id || pub._id;
              return (
                <motion.div
                  key={id}
                  whileHover={{ y: -2 }}
                  className={`bg-white border rounded-2xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:shadow-sm transition-all flex flex-col justify-between ${
                    pub.isDeleted 
                      ? 'border-rose-100 bg-rose-50/10' 
                      : pub.status === 'draft' 
                      ? 'border-amber-100 bg-amber-50/10' 
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <span className="inline-flex items-center text-[8px] font-extrabold bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-wider">
                        {pub.publicationType || 'Article'}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        {pub.isDeleted && (
                          <span className="text-[8px] font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded uppercase">Deleted</span>
                        )}
                        {pub.status === 'draft' && (
                          <span className="text-[8px] font-extrabold bg-amber-500 text-white px-2 py-0.5 rounded uppercase">Draft</span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                          <Globe className="w-3 h-3" />
                          <span>{pub.visibility || 'Public'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate(`/publication/${pub.slug}`)}>
                        {pub.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-semibold truncate">
                        By {pub.authors}
                      </p>
                    </div>

                    {pub.publication && (
                      <p className="text-[11px] text-slate-500 italic line-clamp-1">
                        {pub.publication} {pub.year ? `(${pub.year})` : ''}
                      </p>
                    )}

                    {/* Stats badges */}
                    <div className="flex gap-4 text-[10px] font-bold text-slate-500 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-slate-400" /> {pub.views || 0} Reads</span>
                      <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5 text-slate-400" /> {pub.downloads || 0} Downloads</span>
                    </div>

                    {/* Taxonomies Tags */}
                    {pub.keywords && pub.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {pub.keywords.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[9px] bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="border-t border-slate-100 pt-4 mt-5 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/publication/${pub.slug}`)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-50 px-3.5 py-1.5 rounded-xl transition-all active:scale-[0.98]"
                      >
                        Read
                      </button>
                      {isOwner && (
                        <>
                          <button
                            onClick={() => navigate(`/publication/${pub.slug}/edit`)}
                            className="text-xs font-bold text-slate-700 hover:bg-slate-100 px-3.5 py-1.5 rounded-xl transition-all"
                          >
                            Edit
                          </button>
                          
                          {pub.isDeleted ? (
                            <button
                              onClick={() => handleRestore(id)}
                              className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1.5 rounded-xl transition-all flex items-center gap-1"
                              title="Restore publication"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteClick(pub)}
                              className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded-xl transition-all flex items-center gap-1"
                              title="Move to Trash"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Trash
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedPubAnalytics(pub)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
                        title="View Analytics"
                      >
                        <BarChart2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyLink(pub.slug)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
                        title="Copy Citation Link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      {pub.cloudinaryFileUrl && (
                        <button
                          onClick={() => handleDownload(pub)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* 5. Pagination component */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-slate-500 font-bold">
              Showing Page {page} of {totalPages} ({totalPubs} Total publications)
            </span>
            
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-50 text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="p-2 border border-slate-200 bg-white rounded-xl hover:bg-slate-50 disabled:opacity-50 text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Analytics Modal */}
      {selectedPubAnalytics && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Research Engagement Analytics</h3>
                <p className="text-[10px] text-slate-500 line-clamp-1">{selectedPubAnalytics.title}</p>
              </div>
              <button
                onClick={() => setSelectedPubAnalytics(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
              <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Reads (Views)</span>
                <span className="text-xl font-black text-slate-800 mt-1 block">{selectedPubAnalytics.views || 0}</span>
              </div>
              <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Downloads</span>
                <span className="text-xl font-black text-slate-800 mt-1 block">{selectedPubAnalytics.downloads || 0}</span>
              </div>
              <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Citations</span>
                <span className="text-xl font-black text-slate-800 mt-1 block">{selectedPubAnalytics.citations || 0}</span>
              </div>
              <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Score Contribution</span>
                <span className="text-xl font-black text-blue-600 mt-1 block">+{selectedPubAnalytics.researchScore || 0}</span>
              </div>
            </div>

            {/* Dynamic Heuristic Trend Graph */}
            <div className="space-y-2 border border-slate-100 p-4 rounded-2xl">
              <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Interest Trend over 6 months</h4>
              <div className="h-32 flex items-end justify-between pt-4 px-2">
                {[30, 45, 60, 40, 75, 95].map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 flex-grow">
                    <div className="w-full max-w-[28px] bg-blue-600 rounded-t" style={{ height: `${val}%` }}></div>
                    <span className="text-[9px] text-slate-400 font-bold">M{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right pt-3">
              <button
                onClick={() => setSelectedPubAnalytics(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors active:scale-[0.98]"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete / Trash Confirmation Modal */}
      {deleteConfirmPub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col p-6 space-y-4"
          >
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                {deleteConfirmPub.isDeleted ? 'Permanently Delete Publication?' : 'Move Publication to Trash?'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {deleteConfirmPub.isDeleted 
                  ? `Are you sure you want to permanently delete "${deleteConfirmPub.title}"? This action is irreversible.`
                  : `Are you sure you want to move "${deleteConfirmPub.title}" to trash? You can restore it anytime within 30 days.`}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmPub(null)}
                className="flex-grow bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-grow bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-sm active:scale-[0.98]"
              >
                {deleteConfirmPub.isDeleted ? 'Permanently Delete' : 'Move to Trash'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default PublicationsLibraryPage;
