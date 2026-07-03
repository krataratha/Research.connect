import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, MessageSquare, ExternalLink } from 'lucide-react';
import ConnectButton from './ConnectButton';

const ConnectionCard = ({ connection, currentUserId }) => {
  const navigate = useNavigate();
  const { user, profile, _id: connectionId } = connection;

  if (!user) return null;

  const handleCardClick = () => {
    navigate(`/profile/${user.profileSlug || user.username}`);
  };

  const researchAreas = profile?.researchAreas || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4 text-left relative overflow-hidden">
      <div className="flex gap-4 items-start">
        {/* Avatar */}
        <div className="cursor-pointer shrink-0" onClick={handleCardClick}>
          <img
            src={user.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"}
            alt={user.fullName}
            className="w-14 h-14 rounded-full object-cover border border-slate-100"
          />
        </div>

        {/* User Details */}
        <div className="space-y-1 min-w-0 flex-1">
          <h4 
            onClick={handleCardClick}
            className="text-sm font-black text-[#0F172A] hover:text-[#2563EB] cursor-pointer transition-colors leading-tight truncate"
          >
            {user.fullName}
          </h4>

          {profile?.headline && (
            <p className="text-[11px] font-semibold text-[#475569] leading-snug line-clamp-2">
              {profile.headline}
            </p>
          )}

          {profile?.institution && (
            <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{profile.institution}</span>
            </p>
          )}
        </div>
      </div>

      {/* Research Areas (Tags) */}
      {researchAreas.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {researchAreas.slice(0, 3).map((area, idx) => (
            <span
              key={area._id || area.name || idx}
              className="text-[9px] font-black bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase tracking-wider"
            >
              {area.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer (Actions) */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1 gap-2">
        <button
          onClick={handleCardClick}
          className="flex items-center gap-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-[#475569] rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border border-slate-200"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Profile</span>
        </button>

        <div className="flex gap-2">
          {/* Message button (disabled for future Messaging phase) */}
          <button
            disabled
            className="flex items-center gap-1 px-3 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed border border-slate-200"
            title="Messaging coming in Phase 4"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Message</span>
          </button>
          
          <ConnectButton targetUserId={user._id} username={user.profileSlug || user.username} />
        </div>
      </div>
    </div>
  );
};

export default ConnectionCard;
