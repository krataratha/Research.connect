import React from 'react';

const Loading = ({ fullScreen = false, message = 'Loading connection...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      {/* Outer Glow Ring */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-indigo-500 border-r-indigo-400 rounded-full animate-spin"></div>
        {/* Inner pulsing pulse */}
        <div className="w-6 h-6 bg-sky-500/20 rounded-full animate-pulse"></div>
      </div>
      
      {message && (
        <p className="mt-4 text-sm font-medium text-slate-400 font-sans tracking-wide">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        <div className="glass-card p-8 rounded-2xl border border-white/5">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default Loading;
