import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Share2, 
  UserPlus, 
  MessageSquare, 
  CheckCircle, 
  Edit2, 
  GraduationCap, 
  Award, 
  Github, 
  Linkedin, 
  Globe, 
  Database,
  Bookmark,
  Camera
} from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';

const ProfileHeader = ({ 
  profile, 
  user, 
  onEdit, 
  onShare, 
  onConnect, 
  onFollow, 
  onAvatarChange,
  onCoverChange,
  isFollowing = false, 
  isConnected = false, 
  isOwnProfile = false, 
  onSync 
}) => {
  const defaultCover = 'https://iili.io/C7pZ8Ss.jpg';
  const coverInputRef = useRef(null);

  const handleCoverClick = () => {
    coverInputRef.current?.click();
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file && onCoverChange) {
      onCoverChange(file);
    }
  };
  
  const socialIcons = {
    googleScholar: { icon: GraduationCap, label: 'Google Scholar', color: 'hover:bg-blue-50 hover:text-blue-600' },
    orcid: { icon: Award, label: 'ORCID', color: 'hover:bg-green-50 hover:text-green-600' },
    github: { icon: Github, label: 'GitHub', color: 'hover:bg-slate-50 hover:text-slate-900' },
    linkedin: { icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-blue-50 hover:text-blue-700' },
    researchGate: { icon: Bookmark, label: 'ResearchGate', color: 'hover:bg-cyan-50 hover:text-cyan-600' },
    scopus: { icon: Database, label: 'Scopus', color: 'hover:bg-orange-50 hover:text-orange-600' },
    website: { icon: Globe, label: 'Website', color: 'hover:bg-purple-50 hover:text-purple-600' }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl overflow-hidden border border-border shadow-sm"
    >
      {/* Cover Image */}
      <div className="h-44 sm:h-60 relative w-full overflow-hidden group">
        <img
          src={profile?.coverImage || defaultCover}
          alt="Profile Cover"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {isOwnProfile && (
          <>
            <button
              type="button"
              onClick={handleCoverClick}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer backdrop-blur-sm transition-all active:scale-95 z-20"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Change Cover</span>
            </button>
            <input 
              type="file" 
              ref={coverInputRef} 
              onChange={handleCoverChange} 
              accept="image/*" 
              className="hidden" 
            />
          </>
        )}
      </div>

      {/* Profile Details Area */}
      <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end gap-6 -mt-16 sm:-mt-20">
        
        {/* Avatar */}
        <ProfileAvatar 
          imageUrl={profile?.profileImage || user?.profileImage} 
          onAvatarChange={onAvatarChange} 
          editable={isOwnProfile}
        />

        {/* Bio Details */}
        <div className="flex-grow space-y-2 mt-4 md:mt-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
              {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`}
            </h2>
            <CheckCircle className="w-5 h-5 text-primary fill-primary/10" title="Verified Researcher" />
          </div>

          <p className="text-xs sm:text-sm font-bold text-primary">
            {profile?.designation || 'Academic Researcher'} 
            {profile?.department && ` @ ${profile.department}`}
          </p>

          <p className="text-xs text-text-secondary font-medium">
            {profile?.institution || 'Research Connect Network'}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-text-secondary font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>{profile?.country || user?.country || 'Global'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0 self-start md:self-end">
          {isOwnProfile ? (
            <>
              {profile?.socialLinks?.googleScholar && (
                <button
                  onClick={onSync}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-primary/10 transition-all active:scale-95"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Sync Scholar
                </button>
              )}
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-4 py-2 border border-border bg-white rounded-xl text-xs font-bold text-text-secondary hover:bg-bg-page hover:text-text-primary transition-all active:scale-95"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
              <button
                onClick={onShare}
                className="flex items-center gap-1.5 px-4 py-2 border border-border bg-white rounded-xl text-xs font-bold text-text-secondary hover:bg-bg-page hover:text-text-primary transition-all active:scale-95"
                title="Share Profile"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onShare}
                className="flex items-center gap-1.5 px-4 py-2 border border-border bg-white rounded-xl text-xs font-bold text-text-secondary hover:bg-bg-page hover:text-text-primary transition-all active:scale-95"
                title="Share Profile"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
              <button
                onClick={onFollow}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  isFollowing 
                    ? 'border border-primary text-primary bg-primary/5 hover:bg-primary/10' 
                    : 'bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/15'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button
                onClick={onConnect}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  isConnected 
                    ? 'bg-slate-100 text-text-secondary hover:bg-slate-200' 
                    : 'bg-gradient-primary text-white hover:opacity-90 shadow-md shadow-primary/15'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                {isConnected ? 'Connected' : 'Connect'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Social and Portfolios Links bar */}
      <div className="border-t border-border px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-bg-page/20">
        <div className="flex flex-wrap items-center gap-2.5">
          {Object.entries(socialIcons).map(([key, config]) => {
            const url = profile?.socialLinks?.[key];
            if (!url) return null;
            const Icon = config.icon;
            return (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 border border-border bg-white rounded-xl text-text-secondary transition-all ${config.color}`}
                title={config.label}
              >
                <Icon className="w-4 h-4" />
              </a>
            );
          })}
        </div>
        
        {profile?.bio && (
          <p className="text-xs text-text-secondary max-w-lg italic font-medium leading-relaxed">
            "{profile.bio}"
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
