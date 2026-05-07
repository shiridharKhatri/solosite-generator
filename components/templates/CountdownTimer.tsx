'use client';

import React, { useState, useEffect } from 'react';
import { EditableText } from '../editor/EditableText';

interface CountdownTimerProps {
  minutes: number;
  text: string;
  onUpdate: (timer: { enabled?: boolean; minutes?: number; text?: string; title?: string }) => void;
  className?: string;
  title?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ minutes, text, onUpdate, className = "", title = "LIMITED TIME OFFER" }) => {
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
    <div className={`relative group/timer flex items-center justify-between bg-[#cc1d1d] text-white rounded-[2rem] px-8 py-2.5 w-full max-w-lg shadow-2xl animate-pulse transition-all hover:scale-[1.01] cursor-default ${className}`}>
      <button
        onClick={(e) => { e.stopPropagation(); onUpdate({ enabled: false }); }}
        className="absolute -top-2 -right-2 bg-gray-800 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/timer:opacity-100 transition-all z-20 hover:bg-red-500 border-none shadow-lg"
      >
        <i className="fa-solid fa-xmark text-[11px]"></i>
      </button>

      <div className="flex flex-col items-start gap-0.5">
        <EditableText
          className="text-[15px] font-black uppercase leading-tight tracking-wider font-serif"
          value={title}
          onChange={(val) => onUpdate({ title: val })}
        />
        <EditableText
          className="text-[11px] font-medium opacity-90 italic"
          value={text || 'Hurry, Stock Running Low!'}
          onChange={(val) => onUpdate({ text: val })}
        />
      </div>

      <div
        className="bg-white text-black rounded-full px-5 py-1.5 min-w-[90px] flex items-center justify-center shadow-xl cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          const newMins = prompt('Enter timer minutes:', minutes.toString());
          if (newMins !== null && !isNaN(parseInt(newMins))) {
            onUpdate({ minutes: parseInt(newMins) });
          }
        }}
        title="Click to edit timer duration"
      >
        <div className="text-[22px] font-black tabular-nums tracking-tighter">
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  );
};
