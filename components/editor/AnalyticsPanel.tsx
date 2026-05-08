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
  alt: string;
  onUpdate: (url: string) => void;
  onUpdateAlt: (alt: string) => void;
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
    updateLogos,
    updateSEO,
    updateFooter,
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

      const addImage = async (
        url: string | undefined,
        location: string,
        alt: string | undefined,
        onUpdate: (u: string) => void,
        onUpdateAlt: (a: string) => void
      ) => {
        if (!url) return;

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
          alt: alt || '',
          isExternal: isExternal || isSystem,
          isLarge: size > 500 * 1024,
          dimensions,
          format: format === 'SVG+XML' ? 'SVG' : format,
          onUpdate,
          onUpdateAlt
        });
      };

      // Hero
      if (projectData.hero) {
        await addImage(projectData.hero.image, 'Hero Image', projectData.hero.imageAlt, (u) => updateHero({ image: u }), (a) => updateHero({ imageAlt: a }));
        await addImage(projectData.hero.logoImage, 'Navbar Logo', projectData.hero.logoImageAlt, (u) => updateHero({ logoImage: u }), (a) => updateHero({ logoImageAlt: a }));
        if (projectData.hero.badge) {
          await addImage(projectData.hero.badge.image, 'Hero Badge', projectData.hero.badge.imageAlt, (u) => updateHero({ badge: { ...projectData.hero.badge!, image: u } }), (a) => updateHero({ badge: { ...projectData.hero.badge!, imageAlt: a } }));
        }
      }

      // Brand Logos
      if (projectData.logos) {
        for (let i = 0; i < projectData.logos.length; i++) {
          await addImage(
            projectData.logos[i].src,
            `Trust Logo ${i + 1}`,
            projectData.logos[i].alt,
            (u) => updateLogos(i, { src: u }),
            (a) => updateLogos(i, { alt: a })
          );
        }
      }

      // Sections
      if (projectData.features) {
        for (let i = 0; i < projectData.features.length; i++) {
          await addImage(projectData.features[i].image, `Feature ${i + 1}`, projectData.features[i].imageAlt, (u) => updateFeature(i, { image: u }), (a) => updateFeature(i, { imageAlt: a }));
        }
      }

      if (projectData.ingredients?.items) {
        for (let i = 0; i < projectData.ingredients.items.length; i++) {
          await addImage(projectData.ingredients.items[i].image, `Ingredient ${i + 1}`, projectData.ingredients.items[i].imageAlt, (u) => updateIngredient(i, { image: u }), (a) => updateIngredient(i, { imageAlt: a }));
        }
      }

      if (projectData.pricing) {
        for (let i = 0; i < projectData.pricing.length; i++) {
          await addImage(projectData.pricing[i].image, `Pricing ${i + 1}`, projectData.pricing[i].imageAlt, (u) => updatePricing(i, { image: u }), (a) => updatePricing(i, { imageAlt: a }));
        }
      }

      if (projectData.testimonials?.items) {
        for (let i = 0; i < projectData.testimonials.items.length; i++) {
          await addImage(projectData.testimonials.items[i].image, `Testimonial ${i + 1}`, projectData.testimonials.items[i].imageAlt, (u) => updateTestimonials(i, { image: u }), (a) => updateTestimonials(i, { imageAlt: a }));
        }
      }

      if (projectData.about?.image) await addImage(projectData.about.image, 'About', projectData.about.imageAlt, (u) => updateAbout({ image: u }), (a) => updateAbout({ imageAlt: a }));
      if (projectData.research?.image) await addImage(projectData.research.image, 'Research', projectData.research.imageAlt, (u) => updateResearch({ image: u }), (a) => updateResearch({ imageAlt: a }));

      if (projectData.customSections) {
        for (const s of projectData.customSections) {
          if (s.image) await addImage(s.image, `Custom: ${s.title}`, s.imageAlt, (u) => updateCustomSection(s.id, { image: u }), (a) => updateCustomSection(s.id, { imageAlt: a }));
          if (s.cards) {
            for (let i = 0; i < s.cards.length; i++) {
              await addImage(s.cards[i].image, `Card: ${s.cards[i].title || 'Item'}`, s.cards[i].imageAlt, (u) => {
                const newCards = [...(s.cards || [])];
                newCards[i] = { ...newCards[i], image: u };
                updateCustomSection(s.id, { cards: newCards });
              }, (a) => {
                const newCards = [...(s.cards || [])];
                newCards[i] = { ...newCards[i], imageAlt: a };
                updateCustomSection(s.id, { cards: newCards });
              });
            }
          }
        }
      }

      // Footer & SEO
      if (projectData.footer?.trustImage) {
        await addImage(projectData.footer.trustImage, 'Footer Trust Badge', projectData.footer.trustImageAlt, (u) => updateFooter({ trustImage: u }), (a) => updateFooter({ trustImageAlt: a }));
      }

      if (projectData.seo) {
        if (projectData.seo.favicon) await addImage(projectData.seo.favicon, 'Favicon', 'Site Favicon', (u) => updateSEO({ favicon: u }), () => { });
        if (projectData.seo.ogImage) await addImage(projectData.seo.ogImage, 'Social Sharing (OG)', 'Social Preview', (u) => updateSEO({ ogImage: u }), () => { });
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

  const missingAltCount = auditItems.filter(img => !img.alt).length;

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
        className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-gray-100 hover:border-gray-200 transition-all shadow-sm group hover:shadow-md h-[46px] rounded-xl"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${missingAltCount > 0 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
            <i className={`fa-solid ${missingAltCount > 0 ? 'fa-images' : 'fa-check-double'} text-[11px]`}></i>
          </div>
          {missingAltCount > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce shadow-sm">
              {missingAltCount}
            </div>
          )}
        </div>
        <div className="flex flex-col items-start leading-none pr-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-600">Image</span>
          <span className="text-[8px] font-bold text-gray-500">Audit</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[520px] bg-white border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.12)] z-[10002] animate-in fade-in slide-in-from-top-3 duration-250 overflow-hidden rounded-xl" style={{ fontFamily: "'Outfit', sans-serif" }}>
          {/* Compact Header */}
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-white">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Project Assets</h3>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Inventory & Health · {auditItems.length} Items</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 rounded-md border border-rose-100">
                <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse"></div>
                <span className="text-[8px] font-black text-rose-600 uppercase tracking-tight">Health Scan Active</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-50 text-gray-400 hover:text-slate-800 transition-all">
                <i className="fa-solid fa-times text-xs"></i>
              </button>
            </div>
          </div>

          <div className="p-2 max-h-[500px] overflow-y-auto custom-scrollbar space-y-4 bg-gray-50/50">
            {(() => {
              const groups: { [key: string]: ImageAuditItem[] } = {};
              auditItems.forEach(item => {
                let group = 'Content Sections';
                const loc = item.location.toLowerCase();
                if (loc.includes('hero') || loc.includes('logo')) group = 'Core Branding';
                else if (loc.includes('trust') || loc.includes('badge')) group = 'Trust & Social Proof';
                else if (loc.includes('seo') || loc.includes('favicon')) group = 'Search & SEO';

                if (!groups[group]) groups[group] = [];
                groups[group].push(item);
              });

              const sortedGroups = ['Core Branding', 'Content Sections', 'Trust & Social Proof', 'Search & SEO'].filter(n => groups[n]);

              return sortedGroups.map((name) => (
                <div key={name} className="space-y-2">
                  <div className="px-2 pt-2 flex items-center gap-2">
                    <div className="w-1 h-3 bg-purple-400 rounded-full"></div>
                    <h4 className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">{name}</h4>
                    <div className="flex-1 h-[1px] bg-gray-100"></div>
                  </div>

                  {groups[name].map((img) => (
                    <div
                      key={img.id}
                      className={`flex flex-col gap-2.5 p-3 rounded-xl transition-all duration-200 ${!img.alt ? 'bg-white border border-rose-100 shadow-sm' : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative group shrink-0">
                          <div className="w-12 h-12 rounded-md bg-gray-50 border border-gray-100 overflow-hidden shadow-inner p-0.5">
                            <img src={img.source} alt="" className="w-full h-full object-cover rounded-sm" />
                          </div>
                          <button
                            onClick={() => triggerChange(img.onUpdate)}
                            className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-lg backdrop-blur-[1px]"
                          >
                            <i className="fa-solid fa-camera text-white text-[10px]"></i>
                          </button>
                        </div>

                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest truncate">{img.location}</span>
                            <div className="flex flex-col items-end leading-none">
                              <span className={`text-[9px] font-black ${img.isLarge ? 'text-rose-500' : 'text-slate-800'}`}>
                                {img.size > 0 ? formatFileSize(img.size) : img.source.startsWith('http') ? 'Remote' : 'System'}
                              </span>
                              <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Size</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100">
                              <span className="text-[8px] font-black text-slate-500">{img.format}</span>
                            </div>
                            <div className="px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100">
                              <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{img.dimensions?.width}×{img.dimensions?.height} px</span>
                            </div>
                            {!img.alt && (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-50 rounded border border-rose-100">
                                <i className="fa-solid fa-triangle-exclamation text-rose-500 text-[7px]"></i>
                                <span className="text-[7px] font-black text-rose-600 uppercase tracking-tighter">Missing Alt</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => triggerCompression(img.source, img.onUpdate)}
                            className="w-7 h-7 flex items-center justify-center bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all"
                            title="Compress"
                          >
                            <i className="fa-solid fa-compress text-[9px]"></i>
                          </button>
                          <button
                            onClick={() => triggerChange(img.onUpdate)}
                            className="w-7 h-7 flex items-center justify-center bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-800 hover:text-white transition-all"
                            title="Replace"
                          >
                            <i className="fa-solid fa-rotate text-[9px]"></i>
                          </button>
                        </div>
                      </div>

                      <div className="relative group/input">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-300 group-focus-within/input:text-purple-400 transition-colors">
                          <i className="fa-solid fa-tag text-[9px]"></i>
                          <div className="w-[1px] h-2.5 bg-gray-100 group-focus-within/input:bg-purple-100"></div>
                        </div>
                        <input
                          type="text"
                          defaultValue={img.alt}
                          placeholder="Describe image for SEO..."
                          onBlur={(e) => img.onUpdateAlt(e.target.value)}
                          className={`w-full pl-8 pr-8 py-2 text-[10px] font-medium rounded-lg border focus:ring-2 focus:outline-none transition-all ${!img.alt ? 'bg-rose-50/20 border-rose-100 focus:border-rose-300 focus:ring-rose-50 text-rose-900 placeholder:text-rose-300' : 'bg-gray-50/50 border-gray-100 focus:border-purple-200 focus:ring-purple-50 text-slate-600 placeholder:text-slate-300'}`}
                        />
                        {!img.alt && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <i className="fa-solid fa-sparkles text-rose-400 text-[9px] animate-pulse"></i>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ));
            })()}

            {auditItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-200">
                <i className="fa-solid fa-circle-notch fa-spin text-xl mb-3"></i>
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Scanning...</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
