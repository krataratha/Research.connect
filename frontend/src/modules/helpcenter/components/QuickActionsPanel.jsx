import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Zap,
  Upload,
  BookOpen,
  Users,
  Settings,
  ChevronRight,
  MessageCircle,
  Mail,
} from 'lucide-react';
import { SYSTEM_SERVICES, UPTIME_BARS } from '../data/helpCenterData';

const QUICK_ACTIONS = [
  {
    id: 'upload',
    label: 'Upload a Paper',
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
    Icon: Upload,
    route: '/publications/create',
  },
  {
    id: 'workspaces',
    label: 'Manage Workspaces',
    iconBg: '#DCFCE7',
    iconColor: '#22C55E',
    Icon: BookOpen,
    route: '/collaborations',
  },
  {
    id: 'collaborators',
    label: 'Find Collaborators',
    iconBg: '#EDE9FE',
    iconColor: '#4F46E5',
    Icon: Users,
    route: '/discover/researchers',
  },
  {
    id: 'settings',
    label: 'Account Settings',
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
    Icon: Settings,
    route: '/research-identity',
  },
];

const statusStyle = (status) => {
  if (status === 'Operational') return { bg: '#DCFCE7', color: '#22C55E' };
  if (status === 'Degraded') return { bg: '#FEF3C7', color: '#F59E0B' };
  return { bg: '#FEE2E2', color: '#EF4444' };
};

const QuickActionsCard = ({ isVisible }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  // Fetch user from Redux to build the proper settings route
  const { user } = useSelector((state) => state.auth) || {};
  const profileSlug = user?.profileSlug || user?.username || 'me';

  const getRoute = (actionId, defaultRoute) => {
    if (actionId === 'settings') {
      return `/profile/${profileSlug}/settings`;
    }
    return defaultRoute;
  };

  return (
    <div
      className="bg-white border border-[#E2E8F0] rounded-2xl p-5"
      style={{
        opacity: isVisible ? 1 : 0,
        animation: isVisible ? 'hc-slide-left 0.5s ease-out 0.1s both' : 'none',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#0F172A] font-bold text-base">Quick Actions</h3>
        <Zap className="w-4 h-4" style={{ color: '#F59E0B' }} />
      </div>
      <div className="space-y-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => navigate(getRoute(action.id, action.route))}
            onMouseEnter={() => setHovered(action.id)}
            onMouseLeave={() => setHovered(null)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-200"
            style={{
              borderColor: hovered === action.id ? '#BFDBFE' : '#F1F5F9',
              background: hovered === action.id ? '#F8FAFC' : 'transparent',
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200"
              style={{
                background: action.iconBg,
                transform: hovered === action.id ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <action.Icon style={{ color: action.iconColor, width: 18, height: 18 }} />
            </div>
            <span
              className="flex-1 text-sm font-medium text-left transition-colors duration-200"
              style={{ color: hovered === action.id ? '#2563EB' : '#0F172A' }}
            >
              {action.label}
            </span>
            <ChevronRight className="w-4 h-4" style={{ color: '#94A3B8' }} />
          </button>
        ))}
      </div>
    </div>
  );
};



const ContactUrgencyCard = ({ isVisible, onOpenChat }) => (
  <div
    className="bg-white border border-[#E2E8F0] rounded-2xl p-5"
    style={{
      opacity: isVisible ? 1 : 0,
      animation: isVisible ? 'hc-slide-left 0.5s ease-out 0.3s both' : 'none',
    }}
  >
    <h3 className="text-[#0F172A] font-bold text-base">Need urgent help?</h3>
    <p className="text-[#475569] text-sm mt-2">
      Our support team responds within 2 hours on business days.
    </p>
    <div className="mt-4 space-y-2">
      <button
        onClick={onOpenChat}
        className="w-full flex items-center justify-center gap-2 text-white font-semibold rounded-xl py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
      >
        <MessageCircle className="w-4 h-4" />
        Chat with Support
      </button>
      <a
        href="mailto:support@researchconnect.io"
        className="w-full flex items-center justify-center gap-2 text-[#475569] font-semibold rounded-xl py-3 border border-[#E2E8F0] transition-all duration-200 hover:border-[#2563EB] hover:text-[#2563EB]"
      >
        <Mail className="w-4 h-4" />
        Send Email
      </a>
    </div>
  </div>
);

const QuickActionsPanel = ({ onOpenChat }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-col gap-5">
      <QuickActionsCard isVisible={isVisible} />
      <ContactUrgencyCard isVisible={isVisible} onOpenChat={onOpenChat} />

      <style>{`
        @keyframes hc-slide-left {
          from { opacity: 0; transform: translateX(28px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes hc-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default QuickActionsPanel;
