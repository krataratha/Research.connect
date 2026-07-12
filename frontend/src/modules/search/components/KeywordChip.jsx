import React from 'react';
import { Tag, BookOpen, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const KeywordChip = ({ item, onClick, index = 0 }) => {
  if (!item) return null;
  const { keyword, relatedPublicationsCount, relatedResearchersCount } = item;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      onClick={() => onClick(keyword)}
      className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Tag className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{keyword}</p>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400 font-semibold">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-slate-350" />
              {relatedPublicationsCount} papers
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-350" />
              {relatedResearchersCount} researchers
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default KeywordChip;
