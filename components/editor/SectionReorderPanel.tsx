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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
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

  return (
    <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-900 tracking-tight">Section Order</h3>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">Drag to reorder · toggle visibility</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <i className="fa-solid fa-xmark text-gray-400 text-sm"></i>
          </button>
        </div>

        {/* Section List */}
        <div className="p-4 space-y-1.5 overflow-y-auto max-h-[60vh]">
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
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all select-none cursor-grab active:cursor-grabbing ${isDraggingThis ? 'opacity-40 scale-95 border-purple-300 bg-purple-50' :
                  isDragTarget ? 'border-purple-400 bg-purple-50 scale-[1.01] shadow-md' :
                    isVisible ? 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white hover:shadow-sm' :
                      'border-gray-100 bg-gray-50 opacity-50'
                  }`}
              >
                {/* Drag Handle */}
                <i className="fa-solid fa-grip-vertical text-gray-300 text-xs flex-shrink-0"></i>

                {/* Icon + Label */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isVisible ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                  <i className={`fa-solid ${meta.icon} text-[10px]`}></i>
                </div>
                <span className={`flex-1 text-xs font-bold ${isVisible ? 'text-gray-800' : 'text-gray-400'}`}>{meta.label}</span>

                {/* Controls */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 disabled:opacity-20 transition-all"
                  >
                    <i className="fa-solid fa-chevron-up text-[9px]"></i>
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === order.length - 1}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 disabled:opacity-20 transition-all"
                  >
                    <i className="fa-solid fa-chevron-down text-[9px]"></i>
                  </button>
                  {/* Visibility Toggle */}
                  <button
                    onClick={() => updateSectionVisibility(key as any, !isVisible)}
                    className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all ${isVisible ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    title={isVisible ? 'Hide section' : 'Show section'}
                  >
                    <i className={`fa-solid ${isVisible ? 'fa-eye' : 'fa-eye-slash'} text-[9px]`}></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={handleReset}
            className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
          >
            Reset Order
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all shadow-sm"
          >
            Apply Order
          </button>
        </div>
      </div>
    </div>
  );
};
