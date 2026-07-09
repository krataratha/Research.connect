import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, X } from 'lucide-react';
import Input from '../../../components/common/inputs/Input';
import profileService from '../../../services/profile.service';
import { useDispatch } from 'react-redux';
import { updateProfileState, updateUserState } from '../../../redux/slices/authSlice';

const countries = [
  { value: 'IN', label: '🇮🇳 India' },
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'GB', label: '🇬🇧 United Kingdom' },
  { value: 'CA', label: '🇨🇦 Canada' },
  { value: 'DE', label: '🇩🇪 Germany' },
  { value: 'FR', label: '🇫🇷 France' },
  { value: 'AU', label: '🇦🇺 Australia' },
  { value: 'JP', label: '🇯🇵 Japan' },
  { value: 'CN', label: '🇨🇳 China' }
];

const GeneralSettings = ({ profile, refetch, setSaveTrigger, setIsSubmittingParent }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    institution: '',
    department: '',
    country: '',
    city: '',
    orcid: '',
    googleScholar: '',
    website: '',
  });

  const [interests, setInterests] = useState([]);
  const [newInterest, setNewInterest] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize fields with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.displayName || profile.fullName || '',
        username: profile.username || '',
        email: profile.email || '',
        institution: profile.institution || '',
        department: profile.department || '',
        country: profile.country || '',
        city: profile.city || '',
        orcid: profile.socialLinks?.orcid || '',
        googleScholar: profile.socialLinks?.googleScholar || '',
        website: profile.socialLinks?.website || '',
      });

      if (profile.researchAreas) {
        setInterests(profile.researchAreas.map(area => typeof area === 'string' ? area : area.name));
      }
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Add a new research interest pill
  const handleAddInterest = (e) => {
    e.preventDefault();
    const cleanTag = newInterest.trim();
    if (!cleanTag) return;

    if (interests.some((tag) => tag.toLowerCase() === cleanTag.toLowerCase())) {
      toast.error('This research interest is already added.');
      return;
    }

    setInterests([...interests, cleanTag]);
    setNewInterest('');
  };

  // Remove a research interest pill
  const handleRemoveInterest = (tagToRemove) => {
    setInterests(interests.filter((tag) => tag !== tagToRemove));
  };

  // Basic Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain alphanumeric characters, hyphens, and underscores';
    }

    // URL validation if filled
    if (formData.website && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL (e.g. https://example.com)';
    }
    if (formData.googleScholar && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(formData.googleScholar)) {
      newErrors.googleScholar = 'Please enter a valid Google Scholar URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }

    setIsSubmitting(true);
    setIsSubmittingParent(true);

    try {
      const payload = {
        displayName: formData.fullName,
        username: formData.username,
        institution: formData.institution,
        department: formData.department,
        country: formData.country,
        city: formData.city,
        socialLinks: {
          orcid: formData.orcid,
          googleScholar: formData.googleScholar,
          website: formData.website,
        },
        researchAreas: interests,
      };

      const response = await profileService.updateProfile(payload);
      
      if (response && response.success) {
        const updatedProfile = response.data;
        if (updatedProfile) {
          dispatch(updateProfileState(updatedProfile));
          dispatch(updateUserState({
            username: updatedProfile.username,
            profileSlug: updatedProfile.profileSlug,
            firstName: updatedProfile.firstName,
            lastName: updatedProfile.lastName,
          }));
        }

        toast.success('Profile information updated successfully!');
        if (refetch) await refetch();
      } else {
        throw new Error(response?.message || 'Failed to save changes.');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.message || (typeof err === 'string' ? err : err.error || 'An error occurred while saving.');
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
      setIsSubmittingParent(false);
    }
  };

  // Bind the save action to the parent header trigger
  useEffect(() => {
    if (setSaveTrigger) {
      setSaveTrigger(() => () => {
        handleSave();
      });
    }
    return () => {
      if (setSaveTrigger) setSaveTrigger(null);
    };
  }, [formData, interests, setSaveTrigger]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Card Header */}
      <div>
        <h3 className="text-base font-black text-text-primary font-display">Profile Information</h3>
        <p className="text-[11px] font-semibold text-text-secondary mt-1">
          Manage your primary identity details, geographical presence, and academic affiliations.
        </p>
      </div>

      {/* Edge-to-edge Horizontal Line */}
      <div className="border-t border-slate-100 -mx-6 md:-mx-8" />

      {/* Form Fields */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Input
            label="Full Name"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            disabled={isSubmitting}
            placeholder="Pawan Agrahari"
            className="!space-y-1.5"
          />
          <Input
            label="Username"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            disabled={isSubmitting}
            placeholder="pawan-agrahari"
            className="!space-y-1.5"
          />
        </div>

        <Input
          label="Primary Email"
          name="email"
          type="email"
          value={formData.email}
          disabled
          placeholder="agrahari511@gmail.com"
          className="opacity-75 cursor-not-allowed !space-y-1.5"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Input
            label="Institution"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="e.g. Institute of Engineering and Management"
            className="!space-y-1.5"
          />
          <Input
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="e.g. CSE(AI & ML)"
            className="!space-y-1.5"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Country Selection Field */}
          <div className="flex flex-col space-y-1.5 w-full">
            <label className="text-xs font-semibold text-text-secondary tracking-wide flex items-center gap-1">
              Country
            </label>
            <div className="relative">
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 text-text-primary rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                <option value="">Select country...</option>
                {countries.map((c) => (
                  <option key={c.value} value={c.label.split(' ')[1] || c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="e.g. Kolkata"
            className="!space-y-1.5"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <Input
            label="ORCID ID"
            name="orcid"
            value={formData.orcid}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="e.g. 0000-0002-1825-0097"
            className="!space-y-1.5"
          />
          <Input
            label="Google Scholar URL"
            name="googleScholar"
            value={formData.googleScholar}
            onChange={handleChange}
            error={errors.googleScholar}
            disabled={isSubmitting}
            placeholder="e.g. https://scholar.google.com/citations?user"
            className="!space-y-1.5"
          />
        </div>

        <Input
          label="Personal Website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          error={errors.website}
          disabled={isSubmitting}
          placeholder="e.g. https://johndoe.com"
          className="!space-y-1.5"
        />

        {/* Research Interests tag manager */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-semibold text-text-secondary tracking-wide flex items-center gap-1">
            Research Interests
          </label>
          <div className="flex gap-2">
            <Input
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              placeholder="e.g. Machine Learning, NLP..."
              disabled={isSubmitting}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddInterest(e);
                }
              }}
              className="!space-y-0"
            />
            <button
              type="button"
              onClick={handleAddInterest}
              disabled={isSubmitting}
              className="px-3 bg-slate-55 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all rounded-lg shrink-0 flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {interests.map((interest, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-150 px-3 py-1.5 rounded-xl font-semibold text-text-primary"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  className="hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {interests.length === 0 && (
              <p className="text-xs text-text-secondary italic">No research interests added yet.</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default GeneralSettings;
