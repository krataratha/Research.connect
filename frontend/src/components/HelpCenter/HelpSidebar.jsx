import React from 'react';
import { Mail, ShieldAlert, Heart, Info } from 'lucide-react';

const HelpSidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    {
      id: 'contact',
      label: 'Contact Support',
      icon: Mail,
      description: 'Submit a technical or account support ticket'
    },
    {
      id: 'grievance',
      label: 'Report a Problem / Grievance',
      icon: ShieldAlert,
      description: 'Submit Plagiarism, DMCA, or DMCA complaints'
    },
    {
      id: 'feedback',
      label: 'Share Feedback',
      icon: Heart,
      description: 'Help us improve Research Connect'
    },
    {
      id: 'info',
      label: 'Contact Information',
      icon: Info,
      description: 'Support emails, working hours, and response time'
    }
  ];

  return (
    <aside className="w-full md:w-80 bg-bg-card rounded-2xl border border-border p-4 shadow-sm h-fit">
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full text-left flex items-start gap-4 p-3.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'hover:bg-bg-page text-text-primary'
              }`}
            >
              <Icon className={`w-5 h-5 mt-0.5 ${isActive ? 'text-white' : 'text-text-secondary'}`} />
              <div className="flex-1">
                <span className="block text-sm font-semibold tracking-tight">{item.label}</span>
                <span
                  className={`block text-xs mt-0.5 ${
                    isActive ? 'text-white/80' : 'text-text-secondary'
                  }`}
                >
                  {item.description}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default HelpSidebar;
