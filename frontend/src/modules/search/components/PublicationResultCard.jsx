import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Eye, Download, BookMarked, Share2, ExternalLink,
  Globe, Lock, GraduationCap, BookOpen, Award, Clock, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

const TYPE_COLORS = {
  'Article': 'bg-blue-100 text-blue-700',
  'Conference Paper': 'bg-purple-100 text-purple-700',
  'Book': 'bg-amber-100 text-amber-700',
  'Book Chapter': 'bg-orange-100 text-orange-700',
  'Thesis': 'bg-green-100 text-green-700',
  'Review': 'bg-teal-100 text-teal-700',
  'Report': 'bg-gray-100 text-gray-700',
  'Preprint': 'bg-rose-100 text-rose-700',
  'Dataset': 'bg-cyan-100 text-cyan-700',
  'Patent': 'bg-indigo-100 text-indigo-700',
};

const Stat = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-1.5 text-gray-500">
    <Icon className="w-3.5 h-3.5" />
    <span className="text-xs font-medium text-gray-600">{value?.toLocaleString?.() ?? value}</span>
    {label && <span className="text-xs text-gray-400 hidden sm:inline">{label}</span>}
  </div>
);

const PublicationResultCard = ({ publication, index = 0 }) => {
  const navigate = useNavigate();

  if (!publication) return null;

  const {
    id, slug, title, subtitle, authors, authorsList = [],
    publicationType, journal, publication: pubVenue, conference,
    publisher, year, abstract, keywords = [], doi,
    views = 0, downloads = 0, citations = 0, recommendations = 0,
    openAccess, googleScholarVerified, hasPDF, pdfUrl,
    institution, language, readingTime, createdAt,
  } = publication;

  const venue = journal || pubVenue || conference || '';
  const typeColor = TYPE_COLORS[publicationType] || 'bg-gray-100 text-gray-700';
  const authorsDisplay = authorsList.length > 0
    ? authorsList.slice(0, 3).map(a => a.name).join(', ') + (authorsList.length > 3 ? ` +${authorsList.length - 3}` : '')
    : (authors || '');

  const goToReader = () => navigate(`/publications/${slug}`);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeColor}`}>
            <FileText className="w-3 h-3" />
            {publicationType || 'Article'}
          </span>
          {openAccess && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
              <Globe className="w-3 h-3" /> Open Access
            </span>
          )}
          {hasPDF || pdfUrl ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
              <FileText className="w-3 h-3" /> PDF
            </span>
          ) : null}
          {googleScholarVerified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
              <GraduationCap className="w-3 h-3" /> Scholar
            </span>
          )}
        </div>
        {year && (
          <span className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
            <Calendar className="w-3 h-3" /> {year}
          </span>
        )}
      </div>

      {/* Title */}
      <button
        onClick={goToReader}
        className="w-full text-left mb-2 group-hover:text-blue-600 transition-colors"
      >
        <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-700 leading-snug line-clamp-2">
          {title}
        </h2>
      </button>

      {/* Authors */}
      {authorsList.length > 0 ? (
        <div className="text-sm text-gray-500 mb-2 flex flex-wrap gap-1 items-center">
          {authorsList.slice(0, 3).map((author, idx) => {
            const isClickable = author.profileSlug || author.authorId;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-gray-400">, </span>}
                <span
                  onClick={(e) => {
                    if (isClickable) {
                      e.stopPropagation();
                      navigate(`/profile/${author.profileSlug || author.authorId}`);
                    }
                  }}
                  className={isClickable ? "hover:text-blue-600 hover:underline cursor-pointer font-medium transition-colors" : ""}
                >
                  {author.name}
                </span>
              </React.Fragment>
            );
          })}
          {authorsList.length > 3 && <span className="text-gray-400"> +{authorsList.length - 3}</span>}
          {institution && <span className="text-gray-400"> · {institution}</span>}
        </div>
      ) : authors && (
        <p className="text-sm text-gray-500 mb-2 truncate">
          {authors}
          {institution && <span className="text-gray-400"> · {institution}</span>}
        </p>
      )}

      {/* Venue */}
      {venue && (
        <p className="text-sm text-blue-600 font-medium mb-3 truncate flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
          {venue}
        </p>
      )}

      {/* Abstract Preview */}
      {abstract && (
        <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
          {abstract}
        </p>
      )}

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {keywords.slice(0, 5).map((kw, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600 rounded-full text-xs transition-colors cursor-default">
              {kw}
            </span>
          ))}
          {keywords.length > 5 && (
            <span className="px-2 py-0.5 text-gray-400 text-xs">+{keywords.length - 5} more</span>
          )}
        </div>
      )}

      {/* Stats & Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <Stat icon={Eye} value={views} label="views" />
          <Stat icon={Download} value={downloads} label="downloads" />
          <Stat icon={Award} value={citations} label="citations" />
          {readingTime && <Stat icon={Clock} value={`${readingTime}m`} />}
        </div>

        <div className="flex items-center gap-1.5">
          {doi && (
            <a
              href={`https://doi.org/${doi}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              title="View DOI"
            >
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          )}
          <button
            onClick={goToReader}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Read
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default PublicationResultCard;
