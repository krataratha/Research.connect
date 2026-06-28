import React, { useState } from 'react';
import { Bookmark, FileText, Download, Share2, Award } from 'lucide-react';

export default function PublicationCard({ publication }) {
  const [bookmarked, setBookmarked] = useState(false);

  const pub = publication || {};

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200 shadow-lg text-white flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] uppercase font-semibold bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-lg text-slate-400">
            {pub.publicationType || 'Journal Article'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-medium">Citations: {pub.citationCount || 0}</span>
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`p-1.5 rounded-lg border transition-all ${
                bookmarked 
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                  : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base hover:text-blue-400 cursor-pointer mb-2 leading-snug">
          {pub.title}
        </h3>

        {/* Journal / Conference / Year info */}
        <p className="text-xs text-slate-400 mb-3">
          {pub.journal || pub.conference || 'Published paper'} • <span className="font-medium text-slate-300">{pub.publicationYear || '2026'}</span>
        </p>

        {/* Abstract snippet */}
        {pub.abstract && (
          <p className="text-xs text-slate-450 line-clamp-3 leading-relaxed mb-4">
            {pub.abstract}
          </p>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="border-t border-slate-850 pt-4 mt-auto flex items-center justify-between">
        <div className="text-[10px] text-slate-500">
          {pub.doi ? (
            <span className="font-mono">DOI: {pub.doi}</span>
          ) : (
            <span>No DOI available</span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs font-semibold border border-slate-800 hover:bg-slate-850 rounded-lg text-slate-300 transition-colors">
            Cite
          </button>
          <button className="px-3 py-1.5 text-xs font-bold bg-blue-500 hover:bg-blue-600 text-slate-950 rounded-lg flex items-center gap-1 shadow-md shadow-blue-500/10 transition-all">
            <Download className="w-3 h-3" />
            Read
          </button>
        </div>
      </div>
    </div>
  );
}
