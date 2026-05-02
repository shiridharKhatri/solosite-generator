'use client';

import React, { useState, useCallback } from 'react';
import { useStore } from '@/lib/store';

interface AddSectionButtonProps {
  afterSection: string;
}

export const AddSectionButton: React.FC<AddSectionButtonProps> = React.memo(({ afterSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const primary = useStore((s) => s.projectData?.theme?.primary) || '#2C0D67';

  const handleAdd = useCallback((type: 'text' | 'image-text' | 'text-image' | 'cards') => {
    useStore.getState().addCustomSection(afterSection);
    const sections = useStore.getState().projectData?.customSections || [];
    const lastSection = sections[sections.length - 1];
    if (lastSection) {
      useStore.getState().updateCustomSection(lastSection.id, { type });
    }
    setIsOpen(false);
  }, [afterSection]);

  const toggleOpen = useCallback(() => setIsOpen(p => !p), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <div className="relative group/addsection w-full flex justify-center" style={{ zIndex: 40 }}>
      <div className="w-full flex items-center justify-center py-1 opacity-0 group-hover/addsection:opacity-100 hover:!opacity-100 transition-all duration-300" style={{ minHeight: '36px' }}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        <button
          onClick={toggleOpen}
          className="mx-3 flex items-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded-full border-2 border-dashed transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            borderColor: primary,
            color: primary,
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
          }}
        >
          <i className="fa-solid fa-plus text-[10px]"></i>
          Add Section
        </button>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={close}></div>
          <div
            className="absolute top-full mt-1 z-[9999] bg-white rounded-xl shadow-2xl border border-gray-100 p-3 w-80 animate-in fade-in zoom-in-95 duration-200"
            style={{ left: '50%', transform: 'translateX(-50%)' }}
          >
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Choose Section Type</div>
            <div className="grid grid-cols-2 gap-2">
              {([
                { type: 'text' as const, icon: 'fa-align-left', label: 'Text Only' },
                { type: 'image-text' as const, icon: 'fa-image', label: 'Image + Text' },
                { type: 'text-image' as const, icon: 'fa-columns', label: 'Text + Image' },
                { type: 'cards' as const, icon: 'fa-th-large', label: 'Cards Grid' },
              ]).map(({ type, icon, label }) => (
                <button
                  key={type}
                  onClick={() => handleAdd(type)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all group/item"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: `${primary}15` }}>
                    <i className={`fa-solid ${icon} text-lg`} style={{ color: primary }}></i>
                  </div>
                  <span className="text-[10px] font-bold text-gray-700 group-hover/item:text-gray-900">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
});
AddSectionButton.displayName = 'AddSectionButton';
