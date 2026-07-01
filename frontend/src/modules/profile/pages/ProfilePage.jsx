import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion as motionFramer, AnimatePresence as AnimatePresenceFramer } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  Sparkles, 
  BookOpen, 
  MapPin, 
  Globe, 
  Activity, 
  BookMarked,
  Award,
  FileText,
  Bookmark,
  Calendar,
  Layers,
  ShieldCheck,
  User,
  HeartHandshake,
  TrendingUp,
  BarChart2,
  Database,
  Download,
  Eye,
  Camera,
  Users,
  Linkedin,
  Github
} from 'lucide-react';

import profileService from '../../../services/profile.service';
import { updateProfileState, updateUserState } from '../../../redux/slices/authSlice';

// Subcomponents
import ProfileHeader from '../components/ProfileHeader';
import ResearchMetrics from '../components/ResearchMetrics';
import EducationTimeline from '../components/EducationTimeline';
import ExperienceTimeline from '../components/ExperienceTimeline';
import PublicationTable from '../components/PublicationTable';
import ProjectCard from '../components/ProjectCard';
import ProfileCompletion from '../components/ProfileCompletion';
import RecentActivity from '../components/RecentActivity';
import SkillsList from '../components/SkillsList';
import EditProfileModal from '../components/EditProfileModal';
import ShareProfileModal from '../components/ShareProfileModal';
import Button from '../../../components/common/buttons/Button';

const ProfilePage = () => {
  const { profileSlug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  
  const currentUser = useSelector((state) => state.auth.user);
  
  const [saveLoading, setSaveLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('about');

  // Determine if viewing own profile
  const isOwnProfile = currentUser && currentUser.profileSlug === profileSlug;

  // Query to fetch profile details (hydrated from all collections)
  const { data: profileData, isLoading, error, refetch } = useQuery({
    queryKey: ['profile', profileSlug],
    queryFn: async () => {
      return await profileService.getPublicProfile(profileSlug);
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const profile = profileData?.data;

  // Sync own profile data to Redux auth state when loaded
  useEffect(() => {
    if (profile && isOwnProfile) {
      dispatch(updateProfileState(profile));
    }
  }, [profile, isOwnProfile, dispatch]);

  const handleSaveProfile = async (formData) => {
    setSaveLoading(true);
    try {
      const res = await profileService.updateProfile(formData);
      if (res.success) {
        toast.success('Researcher profile updated successfully!');
        
        // 1. Update Redux Auth state (if it is own profile)
        if (isOwnProfile) {
          dispatch(updateProfileState(res.data));
          dispatch(updateUserState({
            firstName: formData.firstName,
            lastName: formData.lastName,
            fullName: `${formData.firstName} ${formData.lastName}`,
            profileImage: formData.profileImage,
            username: res.data.username,
            profileSlug: res.data.profileSlug,
            profileUrl: res.data.profileUrl
          }));
        }

        // 2. Update React Query Cache
        queryClient.setQueryData(['profile', profileSlug], {
          ...profileData,
          data: res.data
        });

        setIsEditOpen(false);
        refetch();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const [showAllCoAuthors, setShowAllCoAuthors] = useState(false);
  const [publicationsLimit, setPublicationsLimit] = useState(10);

  const handleUploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const loadingToast = toast.loading('Uploading profile image...');
    try {
      const uploadRes = await profileService.uploadFile(formData);
      if (uploadRes.success) {
        const imageUrl = uploadRes.data.url;
        const res = await profileService.updateAvatar(imageUrl);
        if (res.success) {
          toast.success('Profile avatar updated successfully!', { id: loadingToast });
          // Update Query cache and Redux state
          queryClient.setQueryData(['profile', profileSlug], {
            ...profileData,
            data: { ...profile, profileImage: imageUrl }
          });
          if (isOwnProfile) {
            dispatch(updateProfileState({ ...profile, profileImage: imageUrl }));
            dispatch(updateUserState({
              ...currentUser,
              profileImage: imageUrl
            }));
          }
          refetch();
        } else {
          toast.error('Failed to update avatar profile record', { id: loadingToast });
        }
      } else {
        toast.error('Failed to upload file to server', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to upload profile photo', { id: loadingToast });
    }
  };

  const handleUploadCover = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const loadingToast = toast.loading('Uploading cover banner...');
    try {
      const uploadRes = await profileService.uploadFile(formData);
      if (uploadRes.success) {
        const coverUrl = uploadRes.data.url;
        const res = await profileService.updateBanner(coverUrl);
        if (res.success) {
          toast.success('Cover banner updated successfully!', { id: loadingToast });
          // Update Query cache and Redux state
          queryClient.setQueryData(['profile', profileSlug], {
            ...profileData,
            data: { ...profile, coverImage: coverUrl }
          });
          if (isOwnProfile) {
            dispatch(updateProfileState({ ...profile, coverImage: coverUrl }));
          }
          refetch();
        } else {
          toast.error('Failed to update banner profile record', { id: loadingToast });
        }
      } else {
        toast.error('Failed to upload file to server', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to upload cover banner', { id: loadingToast });
    }
  };

  const handleFollow = () => {
    toast.success('Successfully followed researcher!');
  };

  const handleConnect = () => {
    toast.success('Connection request sent!');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 max-w-md mx-auto space-y-4">
        <div className="p-4 bg-red-50 text-accent-red rounded-full w-fit mx-auto">
          <BookMarked className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-text-primary tracking-tight">Failed to Load Profile</h3>
        <p className="text-xs text-text-secondary leading-relaxed font-semibold">
          {error.message || 'The requested researcher profile does not exist or has been suspended.'}
        </p>
        <Button variant="ghost" onClick={() => refetch()} className="mx-auto">Retry Loading</Button>
      </div>
    );
  }

  const tabs = [
    { id: 'about', name: 'About' },
    { id: 'timeline', name: 'Education & Experience' },
    { id: 'publications', name: 'Publications' },
    { id: 'projects', name: 'Projects' },
    { id: 'skills', name: 'Skills' },
    { id: 'patents', name: 'Patents' },
    { id: 'books', name: 'Books' },
    { id: 'awards', name: 'Awards & Certificates' },
    { id: 'analytics', name: 'Research Analytics' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        user={profile} // Since profile object holds user properties now
        onEdit={() => setIsEditOpen(true)}
        onShare={() => setIsShareOpen(true)}
        onFollow={handleFollow}
        onConnect={handleConnect}
        onAvatarChange={handleUploadAvatar}
        onCoverChange={handleUploadCover}
        isOwnProfile={isOwnProfile}
        onSync={() => navigate('/research-identity')}
      />

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Center Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tab Navigation */}
          <div className="bg-white border border-border rounded-2xl p-2 flex gap-1 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:bg-bg-page hover:text-text-primary'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content Panel */}
          <div className="min-h-[400px]">
            <AnimatePresenceFramer mode="wait">
              <motionFramer.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'about' && (
                  <div className="bg-white border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                    <div className="space-y-2">
                      <h3 className="text-base font-black text-text-primary tracking-tight">Professional Biography</h3>
                      <p className="text-xs text-text-secondary leading-relaxed font-medium whitespace-pre-line">
                        {profile?.researchSummary || profile?.bio || 'No professional biography added yet.'}
                      </p>
                    </div>

                    {/* Academic & Personal Information section */}
                    <div className="space-y-4 pt-6 border-t border-border/50">
                      <h3 className="text-base font-black text-text-primary tracking-tight">Academic & Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-3 p-5 bg-bg-page/10 rounded-2xl border border-border/50">
                          <div className="flex justify-between items-center text-xs py-2 border-b border-border/30">
                            <span className="font-extrabold text-text-secondary">Full Name</span>
                            <span className="font-semibold text-text-primary">{profile?.displayName || user?.fullName || `${profile?.firstName || ''} ${profile?.lastName || ''}`}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs py-2 border-b border-border/30">
                            <span className="font-extrabold text-text-secondary">Date of Birth</span>
                            <span className="font-semibold text-text-primary">{profile?.dateOfBirth || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs py-2 border-b border-border/30">
                            <span className="font-extrabold text-text-secondary">Nationality</span>
                            <span className="font-semibold text-text-primary">{profile?.nationality || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs py-2 border-b border-border/30">
                            <span className="font-extrabold text-text-secondary">Designation</span>
                            <span className="font-semibold text-text-primary">{profile?.designation || 'Academic Researcher'}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs py-2 border-b border-border/30">
                            <span className="font-extrabold text-text-secondary">Department</span>
                            <span className="font-semibold text-text-primary">{profile?.department || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs py-2 border-b border-border/30">
                            <span className="font-extrabold text-text-secondary">Institution</span>
                            <span className="font-semibold text-text-primary">{profile?.institution || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs py-2">
                            <span className="font-extrabold text-text-secondary">Email ID</span>
                            <span className="font-semibold text-text-primary truncate ml-2 max-w-[180px] sm:max-w-xs">{profile?.email || user?.email || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Right Column (With Icons) */}
                        <div className="space-y-3 p-5 bg-bg-page/10 rounded-2xl border border-border/50">
                          {[
                            { label: 'Google Scholar ID', key: 'googleScholar', icon: BookOpen, color: 'text-blue-500 bg-blue-50' },
                            { label: 'ORCID', key: 'orcid', icon: Award, color: 'text-green-500 bg-green-50' },
                            { label: 'SCOPUS AUTHOR ID', key: 'scopus', icon: Database, color: 'text-orange-500 bg-orange-50' },
                            { label: 'LinkedIn', key: 'linkedin', icon: Linkedin, color: 'text-blue-600 bg-blue-50' },
                            { label: 'GITHUB', key: 'github', icon: Github, color: 'text-slate-800 bg-slate-100' }
                          ].map((network) => {
                            const rawValue = profile?.socialLinks?.[network.key] || '';
                            let valDisplay = rawValue;
                            if (rawValue && rawValue.startsWith('http')) {
                              try {
                                const urlObj = new URL(rawValue);
                                if (network.key === 'googleScholar') {
                                  valDisplay = urlObj.searchParams.get('user') || rawValue;
                                } else {
                                  valDisplay = urlObj.pathname.split('/').filter(Boolean).pop() || rawValue;
                                }
                              } catch (e) {
                                valDisplay = rawValue;
                              }
                            }
                            
                            const Icon = network.icon;
                            return (
                              <div key={network.key} className="flex items-center justify-between gap-3 text-xs py-2 border-b border-border/30 last:border-0">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1.5 rounded-lg ${network.color}`}>
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="font-extrabold text-text-secondary">{network.label}</span>
                                </div>
                                {rawValue ? (
                                  <a href={rawValue} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline truncate max-w-[150px] sm:max-w-xs">
                                    {valDisplay}
                                  </a>
                                ) : (
                                  <span className="text-text-secondary italic">Not Connected</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Education & Experience Section */}
                    <div className="space-y-4 pt-6 border-t border-border/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Education Column */}
                        <div className="space-y-3">
                          <h3 className="text-base font-black text-text-primary tracking-tight">Education</h3>
                          <EducationTimeline education={profile?.education} />
                        </div>
                        
                        {/* Experience Column */}
                        <div className="space-y-3">
                          <h3 className="text-base font-black text-text-primary tracking-tight">Experience</h3>
                          <ExperienceTimeline experience={profile?.experience} />
                        </div>
                      </div>
                    </div>

                    {/* Publications Section */}
                    <div className="space-y-4 pt-6 border-t border-border/50">
                      <h3 className="text-base font-black text-text-primary tracking-tight">Publications</h3>
                      {profile?.publications && profile.publications.length > 0 ? (
                        <div className="space-y-4">
                          <PublicationTable publications={profile.publications.slice(0, publicationsLimit)} />
                          
                          {profile.publications.length > publicationsLimit && (
                            <button
                              onClick={() => setPublicationsLimit(prev => prev + 10)}
                              className="w-full text-center py-2.5 border border-border bg-white hover:bg-bg-page text-xs font-bold text-text-secondary hover:text-text-primary uppercase tracking-wider rounded-2xl transition-all active:scale-[0.98]"
                            >
                              Load More Publications ({profile.publications.length - publicationsLimit} remaining)
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-text-secondary italic">No publications indexed yet.</p>
                      )}
                    </div>

                    {profile?.currentResearch && (
                      <div className="space-y-2 pt-4 border-t border-border/50">
                        <h3 className="text-sm font-black text-text-primary tracking-tight">Current Research</h3>
                        <p className="text-xs text-text-secondary leading-relaxed font-medium whitespace-pre-line">
                          {profile.currentResearch}
                        </p>
                      </div>
                    )}

                    {profile?.researchVision && (
                      <div className="space-y-2 pt-4 border-t border-border/50">
                        <h3 className="text-sm font-black text-text-primary tracking-tight">Research Vision</h3>
                        <p className="text-xs text-text-secondary leading-relaxed font-medium whitespace-pre-line">
                          {profile.researchVision}
                        </p>
                      </div>
                    )}

                    {profile?.languages && profile.languages.length > 0 && (
                      <div className="space-y-2 pt-4 border-t border-border/50">
                        <h3 className="text-sm font-black text-text-primary tracking-tight">Languages</h3>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {profile.languages.map((lang, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Collaboration/Availability Card */}
                    {profile?.availability && (
                      <div className="pt-6 border-t border-border/50">
                        <div className="flex items-start gap-2.5 p-4 border border-border rounded-2xl bg-bg-page/10">
                          <Calendar className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Availability</h4>
                            <p className="text-xs text-text-secondary mt-0.5 font-medium">{profile.availability}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-black text-text-primary tracking-tight pl-2">Education History</h3>
                      <EducationTimeline education={profile?.education} />
                    </div>

                    <div className="space-y-4 pt-6 border-t border-border">
                      <h3 className="text-base font-black text-text-primary tracking-tight pl-2">Professional Work Experience</h3>
                      <ExperienceTimeline experience={profile?.experience} />
                    </div>
                  </div>
                )}

                {activeTab === 'publications' && (
                  <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="text-base font-black text-text-primary tracking-tight">Publications Portfolio</h3>
                    <PublicationTable publications={profile?.publications} />
                  </div>
                )}

                {activeTab === 'projects' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-black text-text-primary tracking-tight pl-2">Research Projects</h3>
                    {profile?.projects && profile.projects.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {profile.projects.map((proj, i) => (
                          <ProjectCard key={i} project={proj} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white border border-border rounded-2xl shadow-sm">
                        <BookMarked className="w-8 h-8 text-text-secondary mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-bold text-text-secondary uppercase">No projects added yet</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'skills' && (
                  <div className="bg-white border border-border rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                    <h3 className="text-base font-black text-text-primary tracking-tight">Skills & Expertise</h3>
                    <SkillsList skills={profile?.skills} />
                  </div>
                )}

                {activeTab === 'patents' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-black text-text-primary tracking-tight pl-2">Patents Portfolio</h3>
                    {profile?.patents && profile.patents.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {profile.patents.map((pat, i) => (
                          <div key={i} className="p-5 bg-white border border-border rounded-2xl shadow-sm space-y-2">
                            <div className="flex justify-between items-start gap-4">
                              <h4 className="text-sm font-extrabold text-text-primary">{pat.title}</h4>
                              {pat.patentNumber && (
                                <span className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-lg border border-slate-200">
                                  No: {pat.patentNumber}
                                </span>
                              )}
                            </div>
                            {pat.inventors && (
                              <p className="text-xs text-primary font-bold">Inventors: {pat.inventors}</p>
                            )}
                            {pat.description && (
                              <p className="text-xs text-text-secondary leading-relaxed font-semibold">{pat.description}</p>
                            )}
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-text-secondary font-medium">Issued: {pat.issueDate || 'N/A'}</span>
                              {pat.url && (
                                <a href={pat.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary font-bold hover:underline">
                                  View Patent Document &rarr;
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white border border-border rounded-2xl shadow-sm">
                        <FileText className="w-8 h-8 text-text-secondary mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-bold text-text-secondary uppercase">No patents registered yet</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'books' && (
                  <div className="space-y-4">
                    <h3 className="text-base font-black text-text-primary tracking-tight pl-2">Published Books & Chapters</h3>
                    {profile?.books && profile.books.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {profile.books.map((bk, i) => (
                          <div key={i} className="p-5 bg-white border border-border rounded-2xl shadow-sm space-y-2">
                            <h4 className="text-sm font-extrabold text-text-primary">{bk.title}</h4>
                            {bk.authors && (
                              <p className="text-xs text-text-secondary font-semibold">By: {bk.authors}</p>
                            )}
                            {bk.publisher && (
                              <p className="text-xs text-primary font-bold">Publisher: {bk.publisher} ({bk.year || 'N/A'})</p>
                            )}
                            {bk.description && (
                              <p className="text-xs text-text-secondary leading-relaxed font-medium">{bk.description}</p>
                            )}
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-text-secondary font-medium">ISBN: {bk.isbn || 'N/A'}</span>
                              {bk.url && (
                                <a href={bk.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary font-bold hover:underline">
                                  Publisher Link &rarr;
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-white border border-border rounded-2xl shadow-sm">
                        <Bookmark className="w-8 h-8 text-text-secondary mx-auto mb-2 opacity-50" />
                        <p className="text-xs font-bold text-text-secondary uppercase">No books added yet</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'awards' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-text-primary uppercase tracking-wider pl-2">Awards & Honors</h4>
                      {profile?.awards && profile.awards.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {profile.awards.map((aw, i) => (
                            <div key={i} className="p-4 bg-white border border-border rounded-2xl shadow-sm space-y-1.5 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none flex items-center justify-center">
                                <Award className="w-5 h-5 text-primary opacity-20 -mt-4 -mr-4" />
                              </div>
                              <h5 className="text-xs font-bold text-text-primary pr-8">{aw.title}</h5>
                              <p className="text-[10px] text-primary font-bold">{aw.organization} ({aw.year})</p>
                              {aw.description && (
                                <p className="text-[10px] text-text-secondary font-medium">{aw.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-white border border-border rounded-2xl shadow-sm">
                          <p className="text-xs font-bold text-text-secondary uppercase">No awards declared yet</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-border">
                      <h4 className="text-xs font-black text-text-primary uppercase tracking-wider pl-2">Certificates</h4>
                      {profile?.certificates && profile.certificates.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {profile.certificates.map((cert, i) => (
                            <div key={i} className="p-4 bg-white border border-border rounded-2xl shadow-sm flex items-start gap-3">
                              <ShieldCheck className="w-5 h-5 text-accent-green mt-0.5" />
                              <div className="space-y-1 flex-grow">
                                <h5 className="text-xs font-bold text-text-primary">{cert.name}</h5>
                                <p className="text-[10px] text-text-secondary font-semibold">{cert.organization} | {cert.issueDate || 'N/A'}</p>
                                {cert.credentialUrl && (
                                  <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-primary font-bold hover:underline block pt-0.5">
                                    Verify Credential &rarr;
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-white border border-border rounded-2xl shadow-sm">
                          <p className="text-xs font-bold text-text-secondary uppercase">No certificates uploaded yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    {/* SVG Citation Graph Card */}
                    <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-base font-black text-text-primary tracking-tight">Citations Over Time</h3>
                          <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-0.5">Google Scholar Citation Index Graph</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-primary">{profile?.metrics?.totalCitations || 0}</p>
                          <p className="text-[9px] text-text-secondary uppercase font-bold tracking-wider">Total Citations</p>
                        </div>
                      </div>
                      
                      <CitationChart citationGraph={profile?.citationGraph || []} />
                    </div>

                    {/* Derived Analytics Grid Card */}
                    <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                      <h3 className="text-base font-black text-text-primary tracking-tight">Derived Academic Analytics</h3>
                      
                      {profile?.derivedAnalytics ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                          <div className="p-4 border border-border rounded-2xl bg-bg-page/50">
                            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Publication Distribution</p>
                            <div className="mt-2 flex items-center justify-between text-xs font-bold text-text-primary">
                              <span>Journals: {profile.derivedAnalytics.journalPapers || 0}</span>
                              <span>Conferences: {profile.derivedAnalytics.conferencePapers || 0}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5 flex">
                              <div className="bg-primary h-full" style={{ width: `${(profile.derivedAnalytics.journalPapers / (profile.derivedAnalytics.totalPublications || 1)) * 100}%` }} />
                              <div className="bg-accent-indigo h-full flex-grow" />
                            </div>
                          </div>

                          <div className="p-4 border border-border rounded-2xl bg-bg-page/50">
                            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Avg Citations Per Paper</p>
                            <p className="text-xl font-black text-text-primary mt-1">{profile.derivedAnalytics.averageCitations || 0}</p>
                          </div>

                          <div className="p-4 border border-border rounded-2xl bg-bg-page/50">
                            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Most Active Research Year</p>
                            <p className="text-xl font-black text-text-primary mt-1">{profile.derivedAnalytics.mostActiveResearchYear || 'N/A'}</p>
                          </div>

                          <div className="p-4 border border-border rounded-2xl bg-bg-page/50">
                            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Research Experience</p>
                            <p className="text-xl font-black text-text-primary mt-1">{profile.derivedAnalytics.researchExperience || 0} Years</p>
                          </div>

                          <div className="p-4 border border-border rounded-2xl bg-bg-page/50">
                            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Citations Growth Rate</p>
                            <p className="text-xl font-black text-accent-green mt-1">+{profile.derivedAnalytics.citationGrowthRate || 0}%</p>
                          </div>

                          <div className="p-4 border border-border rounded-2xl bg-bg-page/50">
                            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Avg Papers Per Year</p>
                            <p className="text-xl font-black text-text-primary mt-1">{profile.derivedAnalytics.averagePublicationsPerYear || 0}</p>
                          </div>

                          <div className="sm:col-span-2 md:col-span-3 p-4 border border-border rounded-2xl bg-bg-page/50 space-y-1">
                            <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Most Cited Work</p>
                            <p className="text-xs font-black text-primary leading-snug">{profile.derivedAnalytics.mostCitedPublicationTitle || 'N/A'}</p>
                            <p className="text-[10px] text-text-secondary font-semibold">Citations: {profile.derivedAnalytics.mostCitedPublicationCitations || 0}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-xs text-text-secondary font-bold uppercase tracking-widest bg-bg-page/30 rounded-2xl">
                          No derived analytics available. Try syncing your Google Scholar profile.
                        </div>
                      )}
                    </div>

                    {/* Co-Authors Network Card */}
                    <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
                      <h3 className="text-base font-black text-text-primary tracking-tight">Co-Author Network</h3>
                      {profile?.coAuthors && profile.coAuthors.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {profile.coAuthors.map((co) => (
                            <div key={co._id || co.name} className="p-4 border border-border rounded-2xl bg-bg-page/30 flex items-start gap-3">
                              {co.photo ? (
                                <img src={co.photo} alt={co.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                                  {co.name.charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <h4 className="text-xs font-black text-text-primary truncate">{co.name}</h4>
                                <p className="text-[10px] text-text-secondary truncate mt-0.5">{co.affiliation || 'Researcher'}</p>
                                {co.profileURL && (
                                  <a href={co.profileURL} target="_blank" rel="noopener noreferrer" className="text-[9px] text-primary font-bold hover:underline block mt-1">
                                    Scholar Profile &rarr;
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-text-secondary italic">No co-authors indexed.</p>
                      )}
                    </div>
                  </div>
                )}
              </motionFramer.div>
            </AnimatePresenceFramer>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* Research Analytics & Metrics Sidebar Widget */}
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h4 className="text-xs font-black text-text-primary tracking-tight uppercase">Research Analytics & Metrics</h4>
              <p className="text-[10px] text-text-secondary mt-0.5 font-bold uppercase tracking-wider">Academic Performance Indicators</p>
            </div>
            
            {(() => {
              const activeMetrics = [
                { label: 'Publications', value: profile?.metrics?.publicationsCount ?? 0, icon: FileText, color: 'text-blue-500 bg-blue-50/50 border border-blue-100/50' },
                { label: 'Citations', value: profile?.metrics?.citationsCount ?? profile?.metrics?.totalCitations ?? 0, icon: TrendingUp, color: 'text-indigo-500 bg-indigo-50/50 border border-indigo-100/50' },
                { label: 'h-index', value: profile?.metrics?.hIndex ?? 0, icon: Award, color: 'text-orange-500 bg-orange-50/50 border border-orange-100/50' },
                { label: 'i10-index', value: profile?.metrics?.i10Index ?? 0, icon: BarChart2, color: 'text-emerald-500 bg-emerald-50/50 border border-emerald-100/50' },
                { label: 'Experience (Y)', value: profile?.metrics?.experienceYears ?? profile?.metrics?.researchExperience ?? 0, icon: Calendar, color: 'text-purple-500 bg-purple-50/50 border border-purple-100/50' },
                { label: 'Projects', value: profile?.metrics?.projectsCount ?? 0, icon: BookMarked, color: 'text-pink-500 bg-pink-50/50 border border-pink-100/50' },
                { label: 'Patents', value: profile?.metrics?.patentsCount ?? 0, icon: ShieldCheck, color: 'text-teal-500 bg-teal-50/50 border border-teal-100/50' },
                { label: 'Books', value: profile?.metrics?.booksCount ?? 0, icon: BookOpen, color: 'text-red-500 bg-red-50/50 border border-red-100/50' },
                { label: 'Datasets', value: profile?.metrics?.datasetsCount ?? 0, icon: Database, color: 'text-yellow-500 bg-yellow-50/50 border border-yellow-100/50' },
                { label: 'Downloads', value: profile?.metrics?.downloadsCount ?? 0, icon: Download, color: 'text-cyan-500 bg-cyan-50/50 border border-cyan-100/50' },
                { label: 'Views', value: profile?.metrics?.viewsCount ?? 0, icon: Eye, color: 'text-rose-500 bg-rose-50/50 border border-rose-100/50' },
                { label: 'Research Score', value: profile?.metrics?.researchScore ?? 0, icon: Activity, color: 'text-violet-500 bg-violet-50/50 border border-violet-100/50' }
              ].filter(item => Number(item.value) !== 0);

              if (activeMetrics.length === 0) {
                return (
                  <p className="text-[11px] text-text-secondary italic text-center py-2">
                    No active academic metrics synced.
                  </p>
                );
              }

              return (
                <div className="grid grid-cols-2 gap-2.5">
                  {activeMetrics.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="p-2.5 rounded-xl border border-border hover:border-slate-300 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[9px] uppercase font-extrabold tracking-wider text-text-secondary truncate">
                            {item.label}
                          </span>
                          <div className={`p-1 rounded-lg ${item.color} flex-shrink-0`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div className="mt-2">
                          <h5 className="text-sm font-black text-text-primary tracking-tight truncate">
                            {item.value}
                          </h5>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Profile Completion Card */}
          <ProfileCompletion profile={profile} user={profile} />

          {/* Research Areas / Tags */}
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-text-primary tracking-tight">Research Areas</h4>
            <div className="flex flex-wrap gap-1.5">
              {profile?.researchAreas && profile.researchAreas.length > 0 ? (
                profile.researchAreas.map((area) => (
                  <span
                    key={area._id || area.name}
                    className="text-[10px] bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors"
                  >
                    {area.name}
                  </span>
                ))
              ) : (
                <p className="text-[11px] text-text-secondary italic">No research areas defined</p>
              )}
            </div>
          </div>

          {/* Keywords / Chips */}
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-text-primary tracking-tight">Top Keywords</h4>
            <div className="flex flex-wrap gap-1">
              {profile?.keywords && profile.keywords.length > 0 ? (
                profile.keywords.slice(0, 15).map((key) => (
                  <span
                    key={key._id || key.name}
                    className="text-[10px] bg-bg-page border border-border px-2 py-0.5 rounded-md font-semibold text-text-secondary"
                  >
                    {key.name} ({key.count})
                  </span>
                ))
              ) : (
                <p className="text-[11px] text-text-secondary italic">No keywords synced</p>
              )}
            </div>
          </div>

          {/* Co-Authors Network Sidebar Widget */}
          <div className="bg-white border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h4 className="text-xs font-black text-text-primary tracking-tight uppercase">Co-Authors</h4>
              <p className="text-[10px] text-text-secondary mt-0.5 font-bold uppercase tracking-wider">Academic Collaboration Network</p>
            </div>
            
            {profile?.coAuthors && profile.coAuthors.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2.5">
                  {(showAllCoAuthors ? profile.coAuthors : profile.coAuthors.slice(0, 5)).map((co) => (
                    <div key={co._id || co.name} className="p-3 border border-border rounded-xl bg-bg-page/20 hover:bg-bg-page/45 transition-all flex items-start gap-2.5">
                      {co.photo ? (
                        <img src={co.photo} alt={co.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                          {co.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-grow">
                        <h5 className="text-xs font-black text-text-primary truncate">{co.name}</h5>
                        <p className="text-[9px] text-text-secondary truncate font-semibold">{co.affiliation || 'Academic Researcher'}</p>
                        {co.profileURL && (
                          <a href={co.profileURL} target="_blank" rel="noopener noreferrer" className="text-[9px] text-primary font-bold hover:underline block mt-0.5">
                            Scholar Profile &rarr;
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {profile.coAuthors.length > 5 && (
                  <button
                    onClick={() => setShowAllCoAuthors(!showAllCoAuthors)}
                    className="w-full text-center py-2 border border-border bg-bg-page/30 hover:bg-bg-page/60 text-[10px] font-black text-text-secondary hover:text-text-primary uppercase tracking-wider rounded-xl transition-all active:scale-[0.98]"
                  >
                    {showAllCoAuthors ? 'Show Less' : `View All (${profile.coAuthors.length})`}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-text-secondary italic">No co-authors indexed yet.</p>
            )}
          </div>

          {/* AI recommendations */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 text-white rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider">AI Recommendations</h4>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">NLP Matches</p>
                <div className="text-[11px] font-semibold text-slate-200">
                  <p className="hover:underline cursor-pointer">Dr. Sarah Connor (Stanford)</p>
                  <p className="hover:underline cursor-pointer">Prof. Alan Turing (Cambridge)</p>
                </div>
              </div>

              <div className="space-y-1 pt-1.5 border-t border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Relevant Journals</p>
                <div className="text-[11px] font-semibold text-slate-200">
                  <p className="hover:underline cursor-pointer">IEEE Transactions on Pattern Analysis</p>
                  <p className="hover:underline cursor-pointer">Nature Machine Intelligence</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>



      {/* Edit Profile Modal Dialog */}
      {isOwnProfile && (
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          profile={profile}
          user={profile}
          onSave={handleSaveProfile}
          loading={saveLoading}
        />
      )}

      {/* Share Profile Modal Dialog */}
      <ShareProfileModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        profileUrl={profile?.profileUrl || `/profile/${profileSlug}`}
        fullName={profile?.fullName || `${profile?.firstName || ''} ${profile?.lastName || ''}`}
      />
    </div>
  );
};

// Custom premium SVG Citation Timeline Chart
const CitationChart = ({ citationGraph }) => {
  if (!citationGraph || citationGraph.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-2xl bg-bg-page/30 text-xs text-text-secondary italic">
        No citation history available.
      </div>
    );
  }

  const maxCitations = Math.max(...citationGraph.map(d => d.citations), 1);
  const minCitations = Math.min(...citationGraph.map(d => d.citations), 0);
  const range = maxCitations - minCitations;
  const buffer = range * 0.1 || 10;
  const chartMax = maxCitations + buffer;

  const width = 600;
  const height = 200;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = citationGraph.map((d, i) => {
    const x = paddingLeft + (i / Math.max(1, citationGraph.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.citations / chartMax) * chartHeight;
    return { x, y, data: d };
  });

  let dPath = '';
  let areaPath = '';
  if (points.length > 0) {
    dPath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      dPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    areaPath = `${dPath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-none">
      <div className="min-w-[600px] h-[200px] relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
            const y = paddingTop + chartHeight * r;
            const val = Math.round(chartMax * (1 - r));
            return (
              <g key={idx} className="opacity-40">
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="var(--color-border, #e2e8f0)" 
                  strokeDasharray="4 4" 
                />
                <text 
                  x={paddingLeft - 8} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="font-sans font-bold text-[9px] fill-text-secondary"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area */}
          {areaPath && (
            <path d={areaPath} fill="url(#chartGrad)" />
          )}

          {/* Curve */}
          {dPath && (
            <path 
              d={dPath} 
              fill="none" 
              stroke="rgb(59, 130, 246)" 
              strokeWidth="2.5" 
              strokeLinecap="round"
            />
          )}

          {/* Points */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="4" 
                className="fill-white stroke-primary stroke-2 hover:r-5 hover:fill-primary transition-all"
              />
              <text 
                x={p.x} 
                y={height - paddingBottom + 16} 
                textAnchor="middle" 
                className="font-sans font-extrabold text-[9px] fill-text-secondary group-hover:fill-primary transition-colors"
              >
                {p.data.year}
              </text>
              <title>{`${p.data.year}: ${p.data.citations} Citations`}</title>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default ProfilePage;
