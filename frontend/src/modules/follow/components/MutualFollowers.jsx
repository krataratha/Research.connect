import React from 'react';

const MutualFollowers = ({ mutualCount = 0, mutualPreview = [], className = '' }) => {
  if (mutualCount === 0 || !mutualPreview || mutualPreview.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 text-[10px] text-[#475569] font-semibold ${className}`}>
      <div className="flex -space-x-2.5 overflow-hidden">
        {mutualPreview.slice(0, 3).map((user, idx) => (
          <img
            key={user.userId || user._id || idx}
            className="inline-block h-5.5 w-5.5 rounded-full ring-2 ring-white object-cover"
            src={user.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
            alt={user.fullName || "User Avatar"}
          />
        ))}
      </div>
      <span>
        {mutualCount === 1 ? (
          <>
            Followed by <span className="font-extrabold text-[#0F172A]">{mutualPreview[0].fullName}</span>
          </>
        ) : (
          <>
            Followed by <span className="font-extrabold text-[#0F172A]">{mutualPreview[0].fullName}</span> and{' '}
            <span className="font-extrabold text-[#0F172A]">{mutualCount - 1} other{mutualCount > 2 ? 's' : ''}</span>
          </>
        )}
      </span>
    </div>
  );
};

export default MutualFollowers;
