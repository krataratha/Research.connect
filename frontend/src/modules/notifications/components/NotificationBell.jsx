import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import UnreadBadge from './UnreadBadge';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Outside-click detection lives here, wrapping BOTH the bell button and
  // the dropdown. Previously this lived inside NotificationDropdown and
  // only checked its own ref, so the bell button itself counted as
  // "outside" — clicking it fired the outside-click close first, then the
  // button's own onClick toggled isOpen back to true, reopening the
  // dropdown instantly. A single ref around both elements fixes it.
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-555 transition-all relative cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-slate-500 hover:text-[#2563EB] transition-colors" />
        <UnreadBadge />
      </button>

      {isOpen && (
        <NotificationDropdown onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default NotificationBell;