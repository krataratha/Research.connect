import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Mail, Users, Clock } from 'lucide-react';

const CONTACT_OPTIONS = [
  {
    id: 'chat',
    icon: MessageCircle,
    iconBg: 'linear-gradient(135deg, #2563EB, #4F46E5)',
    iconColor: '#fff',
    title: 'Live Chat',
    description: 'Chat with our AI assistant or a human agent instantly. Available 24/7.',
    metricIcon: Clock,
    metric: 'Avg wait: < 1 min',
    metricColor: '#22C55E',
    ctaLabel: 'Start Chat',
    ctaStyle: 'gradient',
    showOnline: true,
    borderHover: '#BFDBFE',
    shadowHover: '0 16px 40px rgba(37,99,235,0.12)',
  },
  {
    id: 'email',
    icon: Mail,
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
    title: 'Email Support',
    description: "Send us a detailed message and we'll respond within 2 business hours.",
    metricIcon: Clock,
    metric: 'Avg response: 2 hours',
    metricColor: '#F59E0B',
    ctaLabel: 'Send Email',
    ctaStyle: 'outline',
    ctaBorderHover: '#F59E0B',
    ctaTextHover: '#F59E0B',
    borderHover: '#FDE68A',
    shadowHover: '0 16px 40px rgba(245,158,11,0.12)',
    mailto: 'mailto:support@researchconnect.io',
  },
  {
    id: 'forum',
    icon: Users,
    iconBg: '#EDE9FE',
    iconColor: '#4F46E5',
    title: 'Community Forum',
    description: 'Ask questions, share knowledge, and connect with 50,000+ researchers.',
    metricIcon: Users,
    metric: '2,847 researchers online',
    metricColor: '#4F46E5',
    ctaLabel: 'Visit Forum',
    ctaStyle: 'outline',
    ctaBorderHover: '#4F46E5',
    ctaTextHover: '#4F46E5',
    borderHover: '#DDD6FE',
    shadowHover: '0 16px 40px rgba(79,70,229,0.12)',
    route: '/network',
  },
];

const ContactCard = ({ option, index, isVisible, onChatClick }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);

  const handleCta = () => {
    if (option.id === 'chat') {
      onChatClick && onChatClick();
    } else if (option.mailto) {
      window.location.href = option.mailto;
    } else if (option.route) {
      navigate(option.route);
    }
  };

  return (
    <div
      className="bg-white border border-[#E2E8F0] rounded-2xl p-7 text-center transition-all duration-250"
      style={{
        opacity: isVisible ? 1 : 0,
        animation: isVisible
          ? `hc-card-rise 0.5s cubic-bezier(0.34,1.2,0.64,1) ${index * 150}ms both`
          : 'none',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        borderColor: hovered ? option.borderHover : '#E2E8F0',
        boxShadow: hovered ? option.shadowHover : '0 1px 3px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon circle */}
      <div className="relative inline-flex mx-auto">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-all duration-300"
          style={{
            background: option.iconBg,
            boxShadow: hovered && option.id === 'chat'
              ? '0 0 0 12px rgba(37,99,235,0.12)'
              : 'none',
          }}
        >
          <option.icon style={{ color: option.iconColor, width: 28, height: 28 }} />
        </div>
        {option.showOnline && (
          <div className="absolute -top-1 -right-1 flex items-center justify-center">
            <span
              className="absolute w-4 h-4 rounded-full bg-[#22C55E] opacity-40"
              style={{ animation: 'hc-pulse-ring 2s ease-out infinite' }}
            />
            <span className="relative block w-2.5 h-2.5 rounded-full bg-[#22C55E] z-10" />
          </div>
        )}
      </div>

      <h3 className="text-[#0F172A] font-bold text-lg mt-5">{option.title}</h3>
      <p className="text-[#475569] text-sm mt-2 leading-relaxed">{option.description}</p>

      <div className="flex items-center justify-center gap-1.5 mt-3" style={{ color: option.metricColor }}>
        <option.metricIcon className="w-3.5 h-3.5" />
        <span className="text-sm font-semibold">{option.metric}</span>
      </div>

      <button
        onClick={handleCta}
        onMouseEnter={() => setCtaHovered(true)}
        onMouseLeave={() => setCtaHovered(false)}
        className="w-full mt-5 rounded-xl py-3 font-semibold text-sm transition-all duration-200 cursor-pointer"
        style={
          option.ctaStyle === 'gradient'
            ? {
                background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
                color: '#fff',
                boxShadow: ctaHovered ? '0 8px 24px rgba(37,99,235,0.3)' : 'none',
                transform: ctaHovered ? 'translateY(-1px)' : 'none',
              }
            : {
                background: 'transparent',
                color: ctaHovered ? option.ctaTextHover : '#0F172A',
                border: `1px solid ${ctaHovered ? option.ctaBorderHover : '#E2E8F0'}`,
              }
        }
      >
        {option.ctaLabel}
      </button>
    </div>
  );
};

const ContactOptionsGrid = ({ onOpenChat }) => {
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
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-[#F8FAFC] py-16 px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center">
          <h2
            className="text-[#0F172A] font-bold text-[28px]"
            style={{
              opacity: isVisible ? 1 : 0,
              animation: isVisible ? 'hc-fade-up 0.5s ease-out 0s both' : 'none',
            }}
          >
            Still need help?
          </h2>
          <p
            className="text-[#475569] text-[15px] mt-2"
            style={{
              opacity: isVisible ? 1 : 0,
              animation: isVisible ? 'hc-fade-up 0.5s ease-out 0.1s both' : 'none',
            }}
          >
            Choose how you'd like to reach us
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {CONTACT_OPTIONS.map((option, i) => (
            <ContactCard
              key={option.id}
              option={option}
              index={i}
              isVisible={isVisible}
              onChatClick={onOpenChat}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes hc-card-rise {
          from { opacity: 0; transform: translateY(32px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hc-fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hc-pulse-ring {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </section>
  );
};

export default ContactOptionsGrid;
