import React, { useState, useEffect } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { toast } from 'react-hot-toast';
import profileService from '../../../services/profile.service';

const AppearanceSettings = ({ profile, refetch }) => {
  const [selectedTheme, setSelectedTheme] = useState('light');

  // Load initial theme preference
  useEffect(() => {
    if (profile?.themePreference) {
      setSelectedTheme(profile.themePreference);
    } else {
      const savedTheme = localStorage.getItem('settings_theme_pref') || 'light';
      setSelectedTheme(savedTheme);
    }
  }, [profile]);

  const handleThemeSelect = async (themeId) => {
    setSelectedTheme(themeId);
    localStorage.setItem('settings_theme_pref', themeId);
    try {
      const response = await profileService.updateProfile({
        themePreference: themeId
      });
      if (response && response.success) {
        toast.success(`Theme preference updated to ${themeId}!`);
        if (refetch) await refetch();
      } else {
        throw new Error(response?.message || 'Failed to update theme preference.');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.message || (typeof err === 'string' ? err : err.error || 'An error occurred.');
      toast.error(errMsg);
    }
  };

  const themes = [
    {
      id: 'light',
      title: 'Light Theme',
      description: 'Classic bright workspace appearance.',
      icon: Sun,
    },
    {
      id: 'dark',
      title: 'Dark Theme',
      description: 'Sleek dark design to reduce eye strain.',
      icon: Moon,
    },
    {
      id: 'system',
      title: 'System Theme',
      description: 'Match your computer operating system settings.',
      icon: Laptop,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Card Header */}
      <div>
        <h3 className="text-base font-black text-text-primary font-display">Appearance Settings</h3>
        <p className="text-[11px] font-semibold text-text-secondary mt-1">
          Customize application workspace theme styling.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 -mx-6 md:-mx-8" />

      {/* Grid options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {themes.map((t) => {
          const IconComponent = t.icon;
          const isSelected = selectedTheme === t.id;

          return (
            <button
              key={t.id}
              onClick={() => handleThemeSelect(t.id)}
              className={`flex flex-col items-start text-left p-6 rounded-2xl border transition-all duration-200 relative outline-none focus:ring-2 focus:ring-primary/20 ${
                isSelected
                  ? 'border-primary bg-primary/[0.01] ring-1 ring-primary shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              {/* Top Row: Icon & Radio button indicator */}
              <div className="flex items-center justify-between w-full mb-8">
                <IconComponent className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'border-primary text-primary'
                      : 'border-slate-350'
                  }`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-black text-text-primary uppercase tracking-tight">{t.title}</h4>
                <p className="text-[10px] text-text-secondary font-semibold leading-relaxed">
                  {t.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AppearanceSettings;
