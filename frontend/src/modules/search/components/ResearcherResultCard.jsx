import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, GraduationCap, MapPin, Award, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ResearcherResultCard = ({ researcher, index = 0 }) => {
  const navigate = useNavigate();

  if (!researcher) return null;
  const { _id, firstName, lastName, fullName, profileImage, profileSlug, username, researcherType, institution, profile } = researcher;
  const displayName = fullName || `${firstName} ${lastName}`;
  const slugToUse = profileSlug || username || _id;

  const citationsCount = profile?.metrics?.totalCitations || 0;
  const publicationsCount = profile?.metrics?.totalPublications || 0;
  const design = profile?.designation || researcherType || 'Researcher';
  const dep = profile?.department || '';
  const country = profile?.institutionLocation?.country || '';
  const areas = profile?.researchAreas || [];

  const initials = firstName && lastName 
    ? `${firstName[0]}${lastName[0]}`.toUpperCase() 
    : displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center gap-5"
    >
      {/* Profile Photo / Avatar */}
      <div 
        onClick={() => navigate(`/profile/${slugToUse}`)}
        className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 cursor-pointer bg-slate-50 flex items-center justify-center shadow-xs"
      >
        {profileImage ? (
          <img 
            src={typeof profileImage === 'string' ? profileImage : profileImage.url} 
            alt={displayName} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xl font-bold text-blue-700">{initials}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h3 
            onClick={() => navigate(`/profile/${slugToUse}`)}
            className="text-base font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
          >
            {displayName}
          </h3>
          {profile?.googleScholarVerified && (
            <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500/10 shrink-0" title="Verified Researcher" />
          )}
        </div>

        <p className="text-xs text-gray-500 font-medium mt-0.5">
          {design} {dep && `· ${dep}`}
        </p>

        {institution && (
          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1 font-semibold">
            <GraduationCap className="w-4 h-4 text-gray-400 shrink-0" />
            {institution}
          </p>
        )}

        {country && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {country}
          </p>
        )}

        {/* Research Areas */}
        {areas.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {areas.slice(0, 3).map((area, i) => (
              <span 
                key={i} 
                className="px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg text-[10px] font-bold"
              >
                {area}
              </span>
            ))}
            {areas.length > 3 && (
              <span className="text-[10px] text-gray-400 font-bold self-center">
                +{areas.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Metrics & Actions */}
      <div className="flex sm:flex-col items-end gap-3 sm:gap-2 flex-shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-between">
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-sm font-bold text-slate-800">{publicationsCount}</p>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Publications</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{citationsCount}</p>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Citations</p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/profile/${slugToUse}`)}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          View Profile
        </button>
      </div>
    </motion.article>
  );
};

export default ResearcherResultCard;
