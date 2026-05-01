'use client';

import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  minutes: number;
  text: string;
  onUpdate: (timer: { enabled?: boolean; minutes?: number; text?: string }) => void;
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ minutes, text, onUpdate, className = "" }) => {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);

  useEffect(() => {
    // Reset timer if minutes prop changes
    setTimeLeft(minutes * 60);
  }, [minutes]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return minutes * 60;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [minutes]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative group/timer flex items-center justify-between bg-[#cc1d1d] text-white rounded-xl px-5 py-3 w-full max-w-lg shadow-xl animate-pulse transition-all hover:scale-[1.01] cursor-default ${className}`}>
      <button
        onClick={(e) => { e.stopPropagation(); onUpdate({ enabled: false }); }}
        className="absolute -top-2 -right-2 bg-gray-800 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover/timer:opacity-100 transition-all z-20 hover:bg-red-500 border-none shadow-lg"
      >
        <i className="fa-solid fa-xmark text-[10px]"></i>
      </button>

      <div className="flex flex-col items-start gap-0.5">
        <div className="text-[14px] font-black uppercase leading-tight tracking-wider font-serif">
          LIMITED TIME OFFER
        </div>
        <div className="text-[11px] font-medium opacity-90 italic">
          {text || 'Hurry, Stock Running Low!'}
        </div>
      </div>

      <div className="bg-white text-black rounded-lg px-3 py-1.5 min-w-[85px] flex items-center justify-center shadow-inner">
        <div className="text-[22px] font-black tabular-nums tracking-tighter">
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  );
};
