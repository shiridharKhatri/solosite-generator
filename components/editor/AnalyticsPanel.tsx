'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { getBase64Size, formatFileSize } from '@/lib/imageUtils';

interface ImageAuditItem {
  id: string;
  source: string;
  size: number;
  location: string;
  isExternal: boolean;
  isLarge: boolean;
  dimensions?: { width: number; height: number };
  format?: string;
  onUpdate: (url: string) => void;
}

export const AnalyticsPanel: React.FC = () => {
  const {
    projectData,
    updateHero,
    updateFeature,
    updateIngredient,
    updatePricing,
    updateTestimonials,
    updateAbout,
    updateResearch,
    updateCustomSection,
    setCompressionState
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [auditItems, setAuditItems] = useState<ImageAuditItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUpdate, setActiveUpdate] = useState<((url: string) => void) | null>(null);

  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = url;
    });
  };

  useEffect(() => {
    if (!projectData || !isOpen) return;

    const runAudit = async () => {
      const items: ImageAuditItem[] = [];
      const processedUrls = new Set<string>();

      const addImage = async (url: string | undefined, location: string, onUpdate: (u: string) => void) => {
        if (!url || processedUrls.has(url)) return;
        processedUrls.add(url);

        const isBase64 = url.startsWith('data:image/');
        const isExternal = url.startsWith('http');
        const isSystem = !isBase64 && !isExternal;

        const size = isBase64 ? getBase64Size(url) : 0;

        let format = 'Unknown';
        if (isBase64) {
          format = url.split(';')[0].split('/')[1].toUpperCase();
        } else {
          const parts = url.split(/[#?]/)[0].split('.');
          if (parts.length > 1) {
            format = parts.pop()?.toUpperCase() || 'IMG';
          } else if (isExternal) {
            format = 'Remote';
          }
        }

        const dimensions = await getImageDimensions(url);

        items.push({
          id: Math.random().toString(36).substr(2, 9),
          source: url,
          size,
          location,
          isExternal: isExternal || isSystem,
          isLarge: size > 500 * 1024,
          dimensions,
          format: format === 'SVG+XML' ? 'SVG' : format,
          onUpdate
        });
      };

      // Hero
      if (projectData.hero) {
        await addImage(projectData.hero.image, 'Hero Image', (u) => updateHero({ image: u }));
        await addImage(projectData.hero.logoImage, 'Navbar Logo', (u) => updateHero({ logoImage: u }));
        if (projectData.hero.badge) {
          await addImage(projectData.hero.badge.image, 'Hero Badge', (u) => updateHero({ badge: { ...projectData.hero.badge!, image: u } }));
        }
      }

      // Sections
      if (projectData.features) {
        for (let i = 0; i < projectData.features.length; i++) {
          await addImage(projectData.features[i].image, `Feature ${i + 1}`, (u) => updateFeature(i, { image: u }));
        }
      }

      if (projectData.ingredients?.items) {
        for (let i = 0; i < projectData.ingredients.items.length; i++) {
          await addImage(projectData.ingredients.items[i].image, `Ingredient ${i + 1}`, (u) => updateIngredient(i, { image: u }));
        }
      }

      if (projectData.pricing) {
        for (let i = 0; i < projectData.pricing.length; i++) {
          await addImage(projectData.pricing[i].image, `Pricing ${i + 1}`, (u) => updatePricing(i, { image: u }));
        }
      }

      if (projectData.testimonials?.items) {
        for (let i = 0; i < projectData.testimonials.items.length; i++) {
          await addImage(projectData.testimonials.items[i].image, `Testimonial ${i + 1}`, (u) => updateTestimonials(i, { image: u }));
        }
      }

      if (projectData.about?.image) await addImage(projectData.about.image, 'About', (u) => updateAbout({ image: u }));
      if (projectData.research?.image) await addImage(projectData.research.image, 'Research', (u) => updateResearch({ image: u }));

      if (projectData.customSections) {
        for (const s of projectData.customSections) {
          if (s.image) await addImage(s.image, `Custom: ${s.title}`, (u) => updateCustomSection(s.id, { image: u }));
          if (s.cards) {
            for (let i = 0; i < s.cards.length; i++) {
              await addImage(s.cards[i].image, `Card: ${s.cards[i].title || 'Item'}`, (u) => {
                const newCards = [...(s.cards || [])];
                newCards[i] = { ...newCards[i], image: u };
                updateCustomSection(s.id, { cards: newCards });
              });
            }
          }
        }
      }

      setAuditItems(items);
    };

    runAudit();
  }, [projectData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUpdate) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCompressionState({
        isOpen: true,
        file: result,
        onConfirm: (compressedUrl) => {
          activeUpdate(compressedUrl);
          setCompressionState({ isOpen: false });
        },
        onKeepOriginal: () => {
          activeUpdate(result);
          setCompressionState({ isOpen: false });
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const triggerChange = (updateFn: (u: string) => void) => {
    setActiveUpdate(() => updateFn);
    fileInputRef.current?.click();
  };

  const triggerCompression = (source: string, updateFn: (u: string) => void) => {
    setCompressionState({
      isOpen: true,
      file: source,
      onConfirm: (compressedUrl) => {
        updateFn(compressedUrl);
        setCompressionState({ isOpen: false });
      },
      onKeepOriginal: () => setCompressionState({ isOpen: false })
    });
  };

  if (!projectData) return null;

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-gray-100 hover:border-gray-200 transition-all shadow-sm group hover:shadow-md"
      >
        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center transition-colors group-hover:bg-purple-100 shrink-0">
          <i className="fa-solid fa-images text-purple-500 text-[10px]"></i>
        </div>
        <div className="flex flex-col items-start leading-none pr-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-600">Image</span>
          <span className="text-[8px] font-bold text-gray-500">Audit</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[480px] bg-white border border-gray-100 shadow-2xl z-[10002] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden rounded-xl">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-white">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Project Assets ({auditItems.length})</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-gray-900 transition-colors">
              <i className="fa-solid fa-times text-xs"></i>
            </button>
          </div>

          <div className="p-2 max-h-[500px] overflow-y-auto custom-scrollbar space-y-1 bg-gray-50/30">
            {auditItems.map((img) => (
              <div
                key={img.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${img.isLarge ? 'bg-rose-50/50 border-rose-100' : 'bg-white border-transparent hover:border-gray-100 hover:shadow-sm'}`}
              >
                <div className="relative group shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 overflow-hidden shadow-sm">
                    <img src={img.source} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => triggerChange(img.onUpdate)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                  >
                    <i className="fa-solid fa-camera text-white text-[10px]"></i>
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-black text-slate-800 uppercase truncate pr-2">{img.location}</span>
                    <span className={`text-[9px] font-black ${img.isLarge ? 'text-rose-500' : 'text-slate-400'}`}>
                      {img.size > 0 ? formatFileSize(img.size) : img.source.startsWith('http') ? 'External' : 'System Asset'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400 uppercase tracking-tight">
                    <span>{img.format}</span>
                    <span>•</span>
                    <span>{img.dimensions?.width}×{img.dimensions?.height} px</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => triggerCompression(img.source, img.onUpdate)}
                    className="p-2 hover:bg-purple-50 text-purple-400 hover:text-purple-600 rounded-lg transition-colors group/btn relative"
                    title="Compress Image"
                  >
                    <i className="fa-solid fa-compress text-[10px]"></i>
                  </button>
                  <button
                    onClick={() => triggerChange(img.onUpdate)}
                    className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-lg transition-colors"
                    title="Change Image"
                  >
                    <i className="fa-solid fa-rotate text-[10px]"></i>
                  </button>
                </div>
              </div>
            ))}

            {auditItems.length === 0 && (
              <div className="text-center py-10 text-slate-300">
                <p className="text-[10px] font-bold uppercase tracking-widest">Scanning Assets...</p>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-gray-50 flex justify-center">
            <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Manage All Assets in One Place</p>
          </div>
        </div>
      )}
    </div>
  );
};
