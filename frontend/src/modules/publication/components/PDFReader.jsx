import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize2, Minimize2, Download, 
  Copy, Bookmark, ChevronLeft, ChevronRight, Eye, Check, Loader2, Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PDFReader = ({ title, pdfUrl, authors, journal, year, doi, onDownload }) => {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);

  // States
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(6); // Mock page counts if unknown
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  // Scroll listener to update reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const progress = Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
      setReadProgress(isNaN(progress) ? 0 : progress);

      // Estimate current page based on scroll position
      const pageHeight = (scrollHeight - clientHeight) / totalPages;
      const estPage = Math.min(totalPages, Math.max(1, Math.ceil(scrollTop / (pageHeight || 1))));
      setCurrentPage(estPage);
    };

    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [totalPages]);

  // Fullscreen Toggler
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        toast.error('Fullscreen mode failed.');
        console.error(err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Listen to escape key or exit-fullscreen events to sync state
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // APA Citation generator
  const copyCitation = () => {
    const authorNames = authors || 'Researcher';
    const pubYear = year || new Date().getFullYear();
    const venue = journal || 'Research Connect Database';
    const doiSuffix = doi ? `. https://doi.org/${doi}` : '';
    
    const citation = `${authorNames}. (${pubYear}). ${title}. ${venue}${doiSuffix}`;
    
    navigator.clipboard.writeText(citation);
    setCopySuccess(true);
    toast.success('APA Citation copied to clipboard!');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 20, 50));

  // Page handlers (Scrolling simulation)
  const navigatePage = (direction) => {
    if (!scrollRef.current) return;
    const { scrollHeight, clientHeight } = scrollRef.current;
    const step = (scrollHeight - clientHeight) / totalPages;

    let targetScroll = scrollRef.current.scrollTop;
    if (direction === 'next' && currentPage < totalPages) {
      targetScroll = Math.min(scrollHeight, scrollRef.current.scrollTop + step);
    } else if (direction === 'prev' && currentPage > 1) {
      targetScroll = Math.max(0, scrollRef.current.scrollTop - step);
    }

    scrollRef.current.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  return (
    <div 
      ref={containerRef}
      className={`bg-slate-900 flex flex-col rounded-3xl border border-slate-800 overflow-hidden shadow-xl transition-all ${
        isFullscreen ? 'w-screen h-screen rounded-none' : 'w-full min-h-[600px] h-[75vh]'
      }`}
    >
      
      {/* 1. Header Toolbar */}
      <div className="bg-slate-950 p-4 border-b border-slate-800/80 flex items-center justify-between flex-wrap gap-3 z-10">
        
        {/* Left Actions (Navigation & Pagination) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigatePage('prev')}
            disabled={currentPage === 1}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-[11px] font-bold text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => navigatePage('next')}
            disabled={currentPage === totalPages}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center Actions (Zoom & Format Tools) */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-bold text-slate-400 min-w-[35px] text-center">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Right Actions (Citation, Bookmark, Download, Fullscreen) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={copyCitation}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
            title="Copy APA Citation"
          >
            {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Cite</span>
          </button>
          
          <button
            onClick={() => {
              setIsBookmarked(!isBookmarked);
              toast.success(isBookmarked ? 'Bookmark removed.' : 'Page bookmarked successfully.');
            }}
            className={`p-2 rounded-lg transition-colors border ${
              isBookmarked 
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-600/10' 
                : 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Bookmark publication"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={onDownload}
            className="p-2 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Reading Progress bar */}
      <div className="w-full bg-slate-950 h-1 overflow-hidden relative border-b border-slate-900">
        <div 
          className="bg-blue-600 h-full transition-all duration-100"
          style={{ width: `${readProgress}%` }}
        ></div>
      </div>

      {/* 3. Document Canvas Area */}
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-6 flex flex-col items-center select-none bg-slate-900/60 backdrop-blur-xs relative scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-800"
      >
        <div 
          className="transition-all duration-150 origin-top flex flex-col gap-6"
          style={{ width: `${zoom}%`, maxWidth: '100%' }}
        >
          {/* We embed the PDF directly in a scrollable frame for standard browsers */}
          {pdfUrl ? (
            <iframe 
              src={`${pdfUrl}#toolbar=0&navpanes=0`}
              title={title}
              className="w-full min-h-[500px] h-[65vh] border-0 rounded-2xl bg-white shadow-xl"
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-xs font-bold uppercase tracking-wider">Loading PDF Canvas...</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky footer progress indicator */}
      <div className="bg-slate-950 px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest z-10">
        <span>{title}</span>
        <span className="flex items-center gap-1 text-slate-400">
          <Eye className="w-3.5 h-3.5" /> Progress {readProgress}%
        </span>
      </div>

    </div>
  );
};

export default PDFReader;
