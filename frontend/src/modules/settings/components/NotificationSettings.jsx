import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Bell, ShieldAlert, Mail } from 'lucide-react';
import notificationsService from '../../notifications/services/notifications.service';

const ToggleSwitch = ({ label, description, checked, onChange, disabled }) => {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0 last:pb-0">
      <div className="space-y-0.5 max-w-[80%]">
        <label className="text-xs font-bold text-text-primary">{label}</label>
        {description && (
          <p className="text-[10px] text-text-secondary font-semibold leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-all duration-300 ${
          checked ? 'bg-primary' : 'bg-slate-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-all duration-300 ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

const NotificationSettings = ({ profile, refetch }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [backendPrefs, setBackendPrefs] = useState({
    publication: true,
    comment: true,
    connection: true,
    follow: true,
    mention: true,
    system: true,
  });

  const [localPrefs, setLocalPrefs] = useState({
    emailAlerts: true,
    weeklyDigest: true,
    newMessages: true,
  });

  useEffect(() => {
    if (profile?.notificationSettings) {
      const ns = profile.notificationSettings;
      setBackendPrefs({
        publication: ns.publication !== false,
        comment: ns.comment !== false,
        connection: ns.connection !== false,
        follow: ns.follow !== false,
        mention: ns.mention !== false,
        system: ns.system !== false,
      });
      setLocalPrefs({
        emailAlerts: ns.emailAlerts !== false,
        weeklyDigest: ns.weeklyDigest !== false,
        newMessages: ns.newMessages !== false,
      });
    }
  }, [profile]);

  const handleBackendChange = (key, value) => {
    setBackendPrefs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleLocalChange = (key, value) => {
    setLocalPrefs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const mergedPayload = {
        ...backendPrefs,
        ...localPrefs
      };
      const response = await notificationsService.updateSettings(mergedPayload);
      if (response && response.success) {
        toast.success('Notification preferences updated successfully!');
        if (refetch) await refetch();
      } else {
        throw new Error(response?.message || 'Failed to update preferences.');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.message || (typeof err === 'string' ? err : err.error || 'An error occurred while saving.');
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Research Updates */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-black text-text-primary uppercase tracking-tight">Research Updates</h3>
        </div>

        <div className="divide-y divide-slate-100">
          <ToggleSwitch
            label="Publication updates"
            description="Get notified when co-authors publish new articles or when publications matching your interests are uploaded."
            checked={backendPrefs.publication}
            onChange={(val) => handleBackendChange('publication', val)}
            disabled={isSubmitting}
          />
          <ToggleSwitch
            label="Citation alerts"
            description="Receive real-time alerts when one of your publications gets cited by other research publications."
            checked={backendPrefs.comment}
            onChange={(val) => handleBackendChange('comment', val)}
            disabled={isSubmitting}
          />
          <ToggleSwitch
            label="Collaboration requests"
            description="Get notified when other researchers send you connection or collaboration workspace requests."
            checked={backendPrefs.connection}
            onChange={(val) => handleBackendChange('connection', val)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Mail className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-black text-text-primary uppercase tracking-tight">Communication Channels</h3>
        </div>

        <div className="divide-y divide-slate-100">
          <ToggleSwitch
            label="Email notifications"
            description="Send core updates, citation summaries, and network invitation requests directly to your primary email."
            checked={localPrefs.emailAlerts}
            onChange={(val) => handleLocalChange('emailAlerts', val)}
            disabled={isSubmitting}
          />
          <ToggleSwitch
            label="Push notifications"
            description="Receive in-browser alerts and real-time alerts when you are active on the portal."
            checked={backendPrefs.system}
            onChange={(val) => handleBackendChange('system', val)}
            disabled={isSubmitting}
          />
          <ToggleSwitch
            label="Weekly digest"
            description="Receive a weekly curated newsletter highlighting top developments in your research interest areas."
            checked={localPrefs.weeklyDigest}
            onChange={(val) => handleLocalChange('weeklyDigest', val)}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="text-[10px] text-slate-400 font-semibold border-t border-slate-100 pt-3">
          <span className="font-extrabold text-amber-500 uppercase mr-1">Note:</span> Email notifications and Weekly digest toggle locally. Saving them requires adding `email` and `weeklyDigest` fields to the backend `Profile.notificationSettings` schema.
        </div>
      </div>

      {/* Activity Updates */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <ShieldAlert className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-black text-text-primary uppercase tracking-tight">Activity Preferences</h3>
        </div>

        <div className="divide-y divide-slate-100">
          <ToggleSwitch
            label="New followers"
            description="Get notified when other researchers start following your academic profile page."
            checked={backendPrefs.follow}
            onChange={(val) => handleBackendChange('follow', val)}
            disabled={isSubmitting}
          />
          <ToggleSwitch
            label="New messages"
            description="Receive notifications when you get personal chat or group collaboration messages."
            checked={localPrefs.newMessages}
            onChange={(val) => handleLocalChange('newMessages', val)}
            disabled={isSubmitting}
          />
          <ToggleSwitch
            label="Mentions"
            description="Receive notifications when another scholar mentions your name or citations in comment boards."
            checked={backendPrefs.mention}
            onChange={(val) => handleBackendChange('mention', val)}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="text-[10px] text-slate-400 font-semibold border-t border-slate-100 pt-3">
          <span className="font-extrabold text-amber-500 uppercase mr-1">Note:</span> Message alert toggle is visual. Storing this preference requires adding `messageAlerts` support in the backend.
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 font-bold text-xs text-white bg-primary hover:bg-primary-hover rounded-lg shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          Save Notification Preferences
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
