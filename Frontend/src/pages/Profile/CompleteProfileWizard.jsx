import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { 
  User, Building2, Link2, Award, ArrowRight, ArrowLeft, 
  CheckCircle2, Loader2, Camera, Compass, Plus, Globe
} from 'lucide-react';
import { 
  useMyProfile, useUpdateProfile, useUploadPhoto, 
  useConnectScholar, useAddEducation, useAddExperience 
} from '../../hooks/profile.hooks.js';

const CompleteProfileWizard = () => {
  const navigate = useNavigate();
  const { data: profileData, isLoading } = useMyProfile();
  const updateProfileMutation = useUpdateProfile();
  const uploadPhotoMutation = useUploadPhoto();
  const connectScholarMutation = useConnectScholar();
  const addEduMutation = useAddEducation();
  const addExpMutation = useAddExperience();

  const [step, setStep] = useState(1);
  const [profilePic, setProfilePic] = useState(null);
  const [coverPic, setCoverPic] = useState(null);
  const [scholarId, setScholarId] = useState('');
  
  // Education form state
  const [edu, setEdu] = useState({ degree: '', university: '', fieldOfStudy: '', startYear: 2020, endYear: 2024 });
  // Experience form state
  const [exp, setExp] = useState({ title: '', company: '', location: '', startYear: 2022, endYear: 2026 });

  const { register, handleSubmit, formState: { errors } } = useForm();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  const profile = profileData?.profile || {};

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
      await uploadPhotoMutation.mutateAsync({ file, isCover: false });
    }
  };

  const handleCoverPicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPic(URL.createObjectURL(file));
      await uploadPhotoMutation.mutateAsync({ file, isCover: true });
    }
  };

  const onSubmitStep1 = async (data) => {
    await updateProfileMutation.mutateAsync({
      displayName: data.displayName,
      bio: data.bio,
      designation: data.designation,
      department: data.department,
    });
    setStep(2);
  };

  const onSubmitStep2 = async (data) => {
    await updateProfileMutation.mutateAsync({
      institution: data.institution,
      country: data.country,
      city: data.city,
      phone: data.phone,
      website: data.website,
    });
    setStep(3);
  };

  const handleConnectScholar = async () => {
    if (scholarId) {
      await connectScholarMutation.mutateAsync(scholarId);
    }
    setStep(4);
  };

  const handleFinish = async () => {
    // Add education if filled
    if (edu.degree && edu.university) {
      await addEduMutation.mutateAsync(edu);
    }
    // Add experience if filled
    if (exp.title && exp.company) {
      await addExpMutation.mutateAsync(exp);
    }
    navigate('/profile');
  };

  const steps = [
    { id: 1, name: 'Basic Info', icon: User },
    { id: 2, name: 'Affiliation', icon: Building2 },
    { id: 3, name: 'Scholar & Identity', icon: Link2 },
    { id: 4, name: 'Experience', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Progress bar & Completion percentage */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">Complete Your Profile</h1>
              <p className="text-sm text-[#475569]">Unlock full collaborations, metrics, and portfolio features.</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-[#2563EB]">{profile.profileCompletion || 0}%</span>
              <p className="text-xs text-[#475569]">Completed</p>
            </div>
          </div>
          <div className="w-full bg-[#E2E8F0] h-3 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5]"
              initial={{ width: 0 }}
              animate={{ width: `${profile.profileCompletion || 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Wizard Navigation Steps */}
        <div className="flex justify-between mb-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step >= s.id;
            const isCurrent = step === s.id;
            return (
              <div key={s.id} className="flex-1 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-lg' 
                    : isActive 
                    ? 'bg-[#DBEAFE] border-[#2563EB] text-[#2563EB]' 
                    : 'bg-white border-[#E2E8F0] text-[#475569]'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-2 font-medium hidden md:block ${isCurrent ? 'text-[#2563EB] font-bold' : 'text-[#475569]'}`}>
                  {s.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Steps Forms */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden min-h-[400px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <h2 className="text-xl font-bold text-[#0F172A] mb-6">Let's start with your basic information</h2>
                
                {/* Cover & Profile Pic Upload */}
                <div className="relative mb-8">
                  <div className="w-full h-32 bg-[#DBEAFE] rounded-xl overflow-hidden relative border border-[#E2E8F0]">
                    {coverPic || profile.coverPhoto ? (
                      <img src={coverPic || profile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                    ) : null}
                    <label className="absolute bottom-2 right-2 p-2 bg-white rounded-full border border-[#E2E8F0] cursor-pointer hover:bg-[#F8FAFC] shadow">
                      <Camera className="w-4 h-4 text-[#475569]" />
                      <input type="file" onChange={handleCoverPicChange} className="hidden" accept="image/*" />
                    </label>
                  </div>
                  <div className="absolute -bottom-8 left-6 w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white shadow-md relative">
                    <img 
                      src={profilePic || profile.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-white">
                      <Camera className="w-4 h-4" />
                      <input type="file" onChange={handleProfilePicChange} className="hidden" accept="image/*" />
                    </label>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmitStep1)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] mb-2">Display Name</label>
                      <input 
                        defaultValue={profile.displayName || ''}
                        type="text" 
                        {...register('displayName', { required: 'Display name is required' })}
                        className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none transition" 
                        placeholder="e.g. Dr. Sarah Jenkins"
                      />
                      {errors.displayName && <p className="text-red-500 text-xs mt-1">{errors.displayName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] mb-2">Designation</label>
                      <input 
                        defaultValue={profile.designation || ''}
                        type="text" 
                        {...register('designation', { required: 'Designation is required' })}
                        className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none transition" 
                        placeholder="e.g. Associate Professor"
                      />
                      {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">Department</label>
                    <input 
                      defaultValue={profile.department || ''}
                      type="text" 
                      {...register('department')}
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none transition" 
                      placeholder="e.g. Department of Computer Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">Short Bio</label>
                    <textarea 
                      defaultValue={profile.bio || ''}
                      rows={3} 
                      {...register('bio')}
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none transition resize-none" 
                      placeholder="Briefly describe your research domain, background, and goals."
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit" 
                      className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl shadow transition"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <h2 className="text-xl font-bold text-[#0F172A] mb-6">Affiliation & Contact Info</h2>
                <form onSubmit={handleSubmit(onSubmitStep2)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">Primary Institution</label>
                    <input 
                      defaultValue={profile.institution || ''}
                      type="text" 
                      {...register('institution', { required: 'Institution is required' })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none transition" 
                      placeholder="e.g. Stanford University"
                    />
                    {errors.institution && <p className="text-red-500 text-xs mt-1">{errors.institution.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] mb-2">Country</label>
                      <input 
                        defaultValue={profile.country || ''}
                        type="text" 
                        {...register('country', { required: 'Country is required' })}
                        className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none transition" 
                        placeholder="e.g. United States"
                      />
                      {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] mb-2">City</label>
                      <input 
                        defaultValue={profile.city || ''}
                        type="text" 
                        {...register('city')}
                        className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none transition" 
                        placeholder="e.g. Stanford"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] mb-2">Phone</label>
                      <input 
                        defaultValue={profile.phone || ''}
                        type="text" 
                        {...register('phone')}
                        className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none transition" 
                        placeholder="e.g. +1 650-723-2300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0F172A] mb-2">Personal Website</label>
                      <input 
                        defaultValue={profile.website || ''}
                        type="url" 
                        {...register('website')}
                        className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none transition" 
                        placeholder="e.g. https://sarahjenkins.com"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 px-6 py-3 border border-[#E2E8F0] hover:bg-[#F8FAFC] font-semibold rounded-xl text-[#475569] transition"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button 
                      type="submit" 
                      className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-xl shadow transition"
                    >
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <h2 className="text-xl font-bold text-[#0F172A] mb-2">Link Research Identities</h2>
                <p className="text-sm text-[#475569] mb-6">Connecting Google Scholar syncs publications and citation metrics automatically.</p>

                <div className="space-y-6">
                  <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0]">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="w-6 h-6 text-[#2563EB]" />
                      <h3 className="font-bold text-[#0F172A]">Google Scholar</h3>
                    </div>
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        value={scholarId}
                        onChange={(e) => setScholarId(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none bg-white transition" 
                        placeholder="Enter Scholar ID (e.g. LsR1t3AAAAAJ)"
                      />
                      <button 
                        type="button" 
                        onClick={handleConnectScholar}
                        disabled={connectScholarMutation.isPending}
                        className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#DBEAFE] text-white font-bold rounded-xl transition flex items-center gap-2"
                      >
                        {connectScholarMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect & Sync'}
                      </button>
                    </div>
                    <p className="text-xs text-[#475569] mt-2">
                      Find your ID in your Google Scholar profile URL: `user=YOUR_ID`. Leave empty to skip.
                    </p>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button 
                      type="button" 
                      onClick={() => setStep(2)}
                      className="flex items-center gap-2 px-6 py-3 border border-[#E2E8F0] hover:bg-[#F8FAFC] font-semibold rounded-xl text-[#475569] transition"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setStep(4)}
                      className="flex items-center gap-2 px-6 py-3 bg-[#475569] hover:bg-[#334155] text-white font-bold rounded-xl shadow transition"
                    >
                      Skip <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <h2 className="text-xl font-bold text-[#0F172A] mb-2">Education & Experience</h2>
                <p className="text-sm text-[#475569] mb-6">Add your background to make your profile complete and easy to discover.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Quick Education Form */}
                  <div className="border border-[#E2E8F0] p-6 rounded-2xl">
                    <h3 className="font-bold text-[#0F172A] mb-4 flex items-center gap-2"><Building2 className="w-5 h-5 text-[#2563EB]" /> Education</h3>
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        value={edu.degree}
                        onChange={(e) => setEdu({...edu, degree: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none text-sm transition" 
                        placeholder="Degree (e.g. Ph.D. Computer Science)"
                      />
                      <input 
                        type="text" 
                        value={edu.university}
                        onChange={(e) => setEdu({...edu, university: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none text-sm transition" 
                        placeholder="University (e.g. Stanford University)"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          type="number" 
                          value={edu.startYear}
                          onChange={(e) => setEdu({...edu, startYear: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none text-sm transition" 
                          placeholder="Start Year"
                        />
                        <input 
                          type="number" 
                          value={edu.endYear}
                          onChange={(e) => setEdu({...edu, endYear: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none text-sm transition" 
                          placeholder="End Year"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Experience Form */}
                  <div className="border border-[#E2E8F0] p-6 rounded-2xl">
                    <h3 className="font-bold text-[#0F172A] mb-4 flex items-center gap-2"><Compass className="w-5 h-5 text-[#2563EB]" /> Work Experience</h3>
                    <div className="space-y-4">
                      <input 
                        type="text" 
                        value={exp.title}
                        onChange={(e) => setExp({...exp, title: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none text-sm transition" 
                        placeholder="Job Title (e.g. Postdoctoral Researcher)"
                      />
                      <input 
                        type="text" 
                        value={exp.company}
                        onChange={(e) => setExp({...exp, company: e.target.value})}
                        className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none text-sm transition" 
                        placeholder="Company/Institution"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          type="number" 
                          value={exp.startYear}
                          onChange={(e) => setExp({...exp, startYear: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none text-sm transition" 
                          placeholder="Start Year"
                        />
                        <input 
                          type="number" 
                          value={exp.endYear}
                          onChange={(e) => setExp({...exp, endYear: parseInt(e.target.value)})}
                          className="w-full px-4 py-2 rounded-xl border border-[#E2E8F0] focus:ring-2 focus:ring-[#2563EB] outline-none text-sm transition" 
                          placeholder="End Year"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-8">
                  <button 
                    type="button" 
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-6 py-3 border border-[#E2E8F0] hover:bg-[#F8FAFC] font-semibold rounded-xl text-[#475569] transition"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button 
                    type="button" 
                    onClick={handleFinish}
                    disabled={addEduMutation.isPending || addExpMutation.isPending}
                    className="flex items-center gap-2 px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold rounded-xl shadow-lg transition"
                  >
                    {addEduMutation.isPending || addExpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Finish Profile</>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default CompleteProfileWizard;
