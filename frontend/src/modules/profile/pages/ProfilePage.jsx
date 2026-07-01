import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  User, 
  ArrowLeft, 
  Save, 
  Globe, 
  Linkedin, 
  Link as LinkIcon, 
  Award, 
  MapPin, 
  Phone, 
  FileText 
} from 'lucide-react';
import profileService from '../../../services/profile.service';
import { updateProfileState, updateUserState } from '../../../redux/slices/authSlice';
import Input from '../../../components/common/inputs/Input';
import Button from '../../../components/common/buttons/Button';

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, profile } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'workplace', 'social'

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      profileImage: user?.profileImage || '',
      bio: profile?.bio || '',
      country: profile?.country || user?.country || '',
      // Academic
      institution: profile?.institution || '',
      department: profile?.department || '',
      designation: profile?.designation || '',
      // Corporate
      company: profile?.company || '',
      division: profile?.division || '',
      position: profile?.position || '',
      // Socials
      orcid: profile?.socialLinks?.orcid || '',
      googleScholar: profile?.socialLinks?.googleScholar || '',
      researchGate: profile?.socialLinks?.researchGate || '',
      linkedin: profile?.socialLinks?.linkedin || '',
      website: profile?.socialLinks?.website || ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        profileImage: data.profileImage,
        bio: data.bio,
        country: data.country,
        institution: data.institution,
        department: data.department,
        designation: data.designation,
        company: data.company,
        division: data.division,
        position: data.position,
        socialLinks: {
          orcid: data.orcid,
          googleScholar: data.googleScholar,
          researchGate: data.researchGate,
          linkedin: data.linkedin,
          website: data.website
        }
      };

      const response = await profileService.updateProfile(payload);
      
      if (response.success) {
        toast.success('Profile details updated successfully!');
        
        // Update Redux state and sync local storage
        dispatch(updateProfileState(response.data));
        dispatch(updateUserState({
          firstName: data.firstName,
          lastName: data.lastName,
          fullName: `${data.firstName} ${data.lastName}`,
          phone: data.phone,
          profileImage: data.profileImage,
          country: data.country
        }));
      }
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 border border-border bg-white rounded-lg hover:bg-bg-page text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Researcher Profile</h1>
          <p className="text-xs text-text-secondary">Configure your academic credentials, social indexes, and bio details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-xl transition-colors text-left ${
              activeTab === 'general' 
                ? 'bg-primary text-white shadow-sm' 
                : 'bg-white border border-border text-text-secondary hover:bg-bg-page'
            }`}
          >
            <User className="w-4 h-4" /> Personal Details
          </button>
          
          <button
            onClick={() => setActiveTab('workplace')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-xl transition-colors text-left ${
              activeTab === 'workplace' 
                ? 'bg-primary text-white shadow-sm' 
                : 'bg-white border border-border text-text-secondary hover:bg-bg-page'
            }`}
          >
            <FileText className="w-4 h-4" /> Affiliation Details
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-xl transition-colors text-left ${
              activeTab === 'social' 
                ? 'bg-primary text-white shadow-sm' 
                : 'bg-white border border-border text-text-secondary hover:bg-bg-page'
            }`}
          >
            <Globe className="w-4 h-4" /> Research Indexes
          </button>
        </div>

        {/* Form content */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)} className="glass-card rounded-2xl p-6 md:p-8 bg-white border border-border shadow-sm space-y-6">
            
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-text-primary border-b border-border pb-2">Personal Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    error={errors.firstName?.message}
                    required
                    {...register('firstName', { required: 'First name is required' })}
                  />
                  <Input
                    label="Last Name"
                    error={errors.lastName?.message}
                    required
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    {...register('phone')}
                    icon={<Phone className="w-4 h-4 text-text-secondary" />}
                  />
                  <Input
                    label="Country"
                    error={errors.country?.message}
                    required
                    {...register('country', { required: 'Country is required' })}
                    icon={<MapPin className="w-4 h-4 text-text-secondary" />}
                  />
                </div>

                <Input
                  label="Profile Image URL"
                  placeholder="https://example.com/avatar.jpg"
                  {...register('profileImage')}
                />

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary tracking-wide">About Me (Bio)</label>
                  <textarea
                    rows={4}
                    placeholder="Short description of your research focus..."
                    className="w-full px-4 py-2 text-sm bg-bg-card border border-border focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-40 rounded-lg focus:outline-none transition-colors"
                    {...register('bio')}
                  />
                </div>
              </div>
            )}

            {/* Workplace Tab */}
            {activeTab === 'workplace' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-text-primary border-b border-border pb-2">Workplace Affiliation</h3>

                <div className="space-y-4">
                  <Input
                    label="University / Institution / Company"
                    placeholder="e.g. Stanford University / Google DeepMind"
                    {...register('institution')}
                  />
                  <Input
                    label="Department / Division"
                    placeholder="e.g. Department of Biotechnology / AI Division"
                    {...register('department')}
                  />
                  <Input
                    label="Designation / Position / Title"
                    placeholder="e.g. Lead Research Engineer / Professor"
                    {...register('designation')}
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  <h4 className="text-xs font-bold text-text-secondary uppercase">Secondary / Corporate Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Company"
                      placeholder="Alternative Company"
                      {...register('company')}
                    />
                    <Input
                      label="Division"
                      placeholder="Alternative Division"
                      {...register('division')}
                    />
                    <Input
                      label="Position"
                      placeholder="Alternative Position"
                      {...register('position')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Social / Indexes Tab */}
            {activeTab === 'social' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-text-primary border-b border-border pb-2">Scientific & Social Portfolios</h3>

                <div className="space-y-4">
                  <Input
                    label="ORCID Identifier"
                    placeholder="e.g. 0000-0002-1825-0097"
                    {...register('orcid')}
                    icon={<Award className="w-4 h-4 text-text-secondary" />}
                  />
                  <Input
                    label="Google Scholar Profile URL"
                    placeholder="https://scholar.google.com/citations?user=..."
                    {...register('googleScholar')}
                    icon={<Globe className="w-4 h-4 text-text-secondary" />}
                  />
                  <Input
                    label="ResearchGate Profile URL"
                    placeholder="https://www.researchgate.net/profile/..."
                    {...register('researchGate')}
                    icon={<LinkIcon className="w-4 h-4 text-text-secondary" />}
                  />
                  <Input
                    label="LinkedIn Profile URL"
                    placeholder="https://linkedin.com/in/..."
                    {...register('linkedin')}
                    icon={<Linkedin className="w-4 h-4 text-text-secondary" />}
                  />
                  <Input
                    label="Personal Website"
                    placeholder="https://example.com"
                    {...register('website')}
                    icon={<LinkIcon className="w-4 h-4 text-text-secondary" />}
                  />
                </div>
              </div>
            )}

            {/* Submit button */}
            <div className="flex justify-end pt-4 border-t border-border">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                icon={<Save className="w-4 h-4" />}
                className="px-6 py-2.5 font-bold shadow-md"
              >
                Save Profile
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
