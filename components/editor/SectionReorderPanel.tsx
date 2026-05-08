'use client';

import React, { useState, useCallback } from 'react';
import { useStore } from '@/lib/store';

const SECTION_LABELS: Record<string, { label: string; icon: string }> = {
  features: { label: 'Features', icon: 'fa-list-check' },
  about: { label: 'About', icon: 'fa-circle-info' },
  research: { label: 'Research & Science', icon: 'fa-flask' },
  benefits: { label: 'Benefits', icon: 'fa-star' },
  guarantee: { label: 'Guarantee', icon: 'fa-shield-halved' },
  ingredients: { label: 'Ingredients', icon: 'fa-leaf' },
  testimonials: { label: 'Testimonials', icon: 'fa-comments' },
  pricing: { label: 'Pricing', icon: 'fa-tags' },
  faq: { label: 'FAQ', icon: 'fa-circle-question' },
  sources: { label: 'Sources', icon: 'fa-book-open' },
};

const DEFAULT_ORDER = ['features', 'about', 'research', 'benefits', 'guarantee', 'ingredients', 'testimonials', 'pricing', 'faq', 'sources'];

export const SectionReorderPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const projectData = useStore((s) => s.projectData);
  const reorderSections = useStore((s) => s.reorderSections);
  const updateSectionVisibility = useStore((s) => s.updateSectionVisibility);

  const [order, setOrder] = useState<string[]>(
    projectData?.sectionOrder || DEFAULT_ORDER
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const sections = projectData?.sections;
  const visibleCount = order.filter(key => sections ? sections[key as keyof typeof sections] !== false : true).length;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Create a ghost image if needed, but browser default is okay for now
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newOrder = [...order];
    const [moved] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, moved);
    setOrder(newOrder);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...order];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === order.length - 1) return;
    const newOrder = [...order];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setOrder(newOrder);
  };

  const handleApply = () => {
    reorderSections(order);
    onClose();
  };

  const handleReset = () => {
    setOrder(DEFAULT_ORDER);
  };

  // Icon color mapping for a premium, varied look
  const getIconColor = (key: string) => {
    const colors: Record<string, string> = {
      features: 'bg-blue-50 text-blue-500',
      about: 'bg-indigo-50 text-indigo-500',
      research: 'bg-purple-50 text-purple-500',
      benefits: 'bg-amber-50 text-amber-500',
      guarantee: 'bg-emerald-50 text-emerald-500',
      ingredients: 'bg-green-50 text-green-500',
      testimonials: 'bg-rose-50 text-rose-500',
      pricing: 'bg-violet-50 text-violet-500',
      faq: 'bg-slate-50 text-slate-500',
      sources: 'bg-cyan-50 text-cyan-500',
    };
    return colors[key] || 'bg-gray-50 text-gray-500';
  };

  return (
    <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4 overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity animate-in fade-in duration-300" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-sm rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        {/* Premium Header */}
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-sm">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>Section Order</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[8px] text-slate-400 uppercase tracking-[0.2em] font-black">Architecture</span>
              <div className="w-1 h-1 rounded-full bg-slate-200"></div>
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{visibleCount} Active</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-all active:scale-95 group">
            <i className="fa-solid fa-xmark text-slate-400 group-hover:text-slate-800 text-xs transition-colors"></i>
          </button>
        </div>

        {/* Section List */}
        <div className="px-3 py-3 space-y-1.5 overflow-y-auto max-h-[50vh] custom-scrollbar bg-slate-50/30">
          {order.map((key, index) => {
            const meta = SECTION_LABELS[key];
            if (!meta) return null;
            const isVisible = sections ? sections[key as keyof typeof sections] !== false : true;
            const isDraggingThis = dragIndex === index;
            const isDragTarget = dragOverIndex === index && dragIndex !== index;

            return (
              <div
                key={key}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`group flex items-center gap-3 p-2.5 rounded-[20px] border transition-all duration-300 select-none cursor-grab active:cursor-grabbing ${
                  isDraggingThis ? 'opacity-30 scale-95 border-indigo-200 bg-indigo-50/50 rotate-1' :
                  isDragTarget ? 'border-indigo-400 bg-white scale-[1.02] shadow-lg ring-2 ring-indigo-50 z-10' :
                  isVisible ? 'border-white bg-white shadow-[0_1px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]' :
                  'border-dashed border-gray-200 bg-gray-50/50 opacity-60'
                }`}
              >
                {/* Drag Handle */}
                <div className="flex flex-col gap-0.5 text-[5px] text-slate-300 group-hover:text-slate-400 transition-colors ml-1">
                  <div className="flex gap-0.5"><span>●</span><span>●</span></div>
                  <div className="flex gap-0.5"><span>●</span><span>●</span></div>
                  <div className="flex gap-0.5"><span>●</span><span>●</span></div>
                </div>

                {/* Icon + Label */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-300 shadow-sm ${isVisible ? getIconColor(key) : 'bg-gray-200 text-gray-500'}`}>
                  <i className={`fa-solid ${meta.icon} text-[10px]`}></i>
                </div>
                
                <div className="flex-1 min-w-0">
                  <span className={`block text-[10px] font-black uppercase tracking-widest ${isVisible ? 'text-slate-800' : 'text-slate-400'}`}>
                    {meta.label}
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveUp(index); }}
                      disabled={index === 0}
                      className="w-4 h-4 flex items-center justify-center rounded-md bg-gray-50 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-0 transition-all active:scale-90"
                    >
                      <i className="fa-solid fa-chevron-up text-[6px]"></i>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveDown(index); }}
                      disabled={index === order.length - 1}
                      className="w-4 h-4 flex items-center justify-center rounded-md bg-gray-50 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-0 transition-all active:scale-90"
                    >
                      <i className="fa-solid fa-chevron-down text-[6px]"></i>
                    </button>
                  </div>

                  <div className="w-[1px] h-5 bg-gray-100 mx-0.5"></div>

                  <button
                    onClick={(e) => { e.stopPropagation(); updateSectionVisibility(key as any, !isVisible); }}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all active:scale-95 shadow-sm ${
                      isVisible 
                        ? 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white' 
                        : 'bg-rose-50 text-rose-400 hover:bg-rose-500 hover:text-white'
                    }`}
                  >
                    <i className={`fa-solid ${isVisible ? 'fa-eye' : 'fa-eye-slash'} text-[9px]`}></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Premium Footer */}
        <div className="p-5 bg-white border-t border-gray-50 flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors bg-gray-50 rounded-xl"
          >
            Revert
          </button>
          <button
            onClick={handleApply}
            className="flex-[2] py-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-white bg-slate-900 hover:bg-indigo-600 rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-check-double text-[8px] opacity-70"></i>
            Commit Order
          </button>
        </div>
      </div>
    </div>
  );
};

