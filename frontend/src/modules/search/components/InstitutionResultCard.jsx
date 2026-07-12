import React from 'react';
import { Building2, BookOpen, Users, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const InstitutionResultCard = ({ institution, onBrowse, index = 0 }) => {
  if (!institution) return null;
  const { name, country, website, researchersCount, publicationsCount } = institution;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex items-center gap-5 justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">{name}</h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">{country || 'Academic Institution'}</p>
          
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 font-semibold">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-350" />
              {researchersCount} researchers
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-350" />
              {publicationsCount} publications
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-colors"
            title="Visit Website"
          >
            <Globe className="w-4 h-4" />
          </a>
        )}
        <button
          onClick={() => onBrowse(name)}
          className="px-4 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors border border-indigo-200"
        >
          Browse
        </button>
      </div>
    </motion.article>
  );
};

export default InstitutionResultCard;
