import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, GraduationCap } from 'lucide-react';
import FollowButton from './FollowButton';
import MutualFollowers from './MutualFollowers';

const SuggestedResearcherCard = ({ suggestion, currentUserId }) => {
  const navigate = useNavigate();
  const { user, profile, mutualFollowers, reason } = suggestion;

  if (!user) return null;

  const handleCardClick = () => {
    navigate(`/profile/${user.profileSlug || user.username}`);
  };

  const researchAreas = profile?.researchAreas || [];
  const isSelf = currentUserId === user._id;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4 text-left relative overflow-hidden">
      {/* Top Tag showing matching reasons */}
      {reason && (
        <div className="absolute top-0 right-0 bg-[#EDE9FE] text-[#4F46E5] text-[8px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 fill-[#4F46E5]/10" />
          <span>{reason}</span>
        </div>
      )}

      <div className="flex gap-4 items-start pt-2">
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
            className="text-sm font-black text-[#0F172A] hover:text-[#2563EB] cursor-pointer transition-colors leading-tight truncate pr-24"
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

      {/* Footer (Mutual followers & Follow button) */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 mt-1 min-h-[36px]">
        <div className="flex-1 min-w-0">
          {mutualFollowers && mutualFollowers.length > 0 ? (
            <MutualFollowers mutualCount={mutualFollowers.length} mutualPreview={mutualFollowers} />
          ) : (
            <div className="text-[10px] text-slate-400 font-semibold italic">Suggested for you</div>
          )}
        </div>

        {!isSelf && (
          <FollowButton targetUserId={user._id} username={user.profileSlug || user.username} />
        )}
      </div>
    </div>
  );
};

export default SuggestedResearcherCard;
