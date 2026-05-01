'use client';

import React, { useEffect, useState } from 'react';
import { EditableText } from '../editor/EditableText';
import { EditableImage } from '../editor/EditableImage';
import { useStore, type ProjectData } from '@/lib/store';
import { CountdownTimer } from './CountdownTimer';

// Reusable helpers
const RemoveButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="absolute -top-3 -right-3 bg-red-500 text-white w-5 h-5 rounded-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110 border-none shadow-lg">
    <i className="fa-solid fa-xmark text-[10px]"></i>
  </button>
);

const IconEditor = ({ value, onChange, className = "" }: { value: string; onChange: (val: string) => void, className?: string }) => {
  const icons = ["fa-solid fa-leaf", "fa-solid fa-seedling", "fa-solid fa-tree", "fa-solid fa-sun", "fa-solid fa-droplet", "fa-solid fa-flask"];
  const cycleIcon = () => { const idx = icons.indexOf(value || icons[0]); onChange(icons[(idx + 1) % icons.length]); };
  return <i className={`${value || icons[0]} cursor-pointer hover:scale-110 transition-transform text-current ${className}`} onClick={(e) => { e.stopPropagation(); cycleIcon(); }} title="Click to toggle icon" />;
};

const LinkSettings = ({ link, onChange, onClose, x, y }: { link: string; onChange: (val: string) => void, onClose: () => void, x: number, y: number }) => (
  <div className="fixed bg-white rounded-none shadow-xl border border-stone-100 p-4 z-[99999] w-64 animate-in fade-in" style={{ left: x, top: y }} onClick={(e) => e.stopPropagation()}>
    <div className="flex justify-between items-center mb-3 border-b border-stone-50 pb-2">
      <span className="text-[10px] font-bold uppercase text-stone-600">Path Configuration</span>
      <button onClick={onClose} className="text-stone-300 hover:text-stone-600"><i className="fa-solid fa-xmark"></i></button>
    </div>
    <input type="text" placeholder="e.g. #pricing" className="w-full text-xs p-2 bg-stone-50 border border-stone-100 rounded-none focus:outline-none focus:ring-1 focus:ring-green-800" value={link || ''} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const SchemaEditor = ({ plan, onChange, onClose, x, y }: { plan: any; onChange: (val: any) => void, onClose: () => void, x: number, y: number }) => (
  <div className="fixed bg-white rounded-none shadow-2xl border border-stone-200 p-4 z-[99999] w-80 animate-in zoom-in-95 duration-200 text-left" style={{ left: Math.min(x, typeof window !== 'undefined' ? window.innerWidth - 340 : x), top: Math.min(y, typeof window !== 'undefined' ? window.innerHeight - 400 : y) }} onClick={(e) => e.stopPropagation()}>
    <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-2">
      <span className="text-xs font-bold text-stone-800 uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-barcode text-green-700"></i> Product Metadata</span>
      <button onClick={onClose} className="text-stone-600 hover:text-stone-900 transition-colors"><i className="fa-solid fa-times"></i></button>
    </div>
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-bold text-stone-700 uppercase mb-1 block">GTIN / Barcode</label>
        <input type="text" className="w-full text-sm p-2 bg-stone-50 border border-stone-200 rounded-none focus:ring-2 focus:ring-green-500/20 outline-none font-mono" value={plan.gtin || ''} onChange={(e) => onChange({ gtin: e.target.value })} placeholder="e.g. 5901234123457" />
      </div>
      <div>
        <label className="text-[10px] font-bold text-stone-700 uppercase mb-1 block">Category</label>
        <input type="text" className="w-full text-sm p-2 bg-stone-50 border border-stone-200 rounded-none focus:ring-2 focus:ring-green-500/20 outline-none" value={plan.category || ''} onChange={(e) => onChange({ category: e.target.value })} placeholder="e.g. Organic Supplement" />
      </div>
      <div>
        <label className="text-[10px] font-bold text-stone-700 uppercase mb-1 block">SKU</label>
        <input type="text" className="w-full text-sm p-2 bg-stone-50 border border-stone-200 rounded-none focus:ring-2 focus:ring-green-500/20 outline-none font-mono" value={plan.sku || ''} onChange={(e) => onChange({ sku: e.target.value })} placeholder="e.g. ORG-HERB-001" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-stone-700 uppercase mb-1 block">UNCL Code</label>
          <input type="text" className="w-full text-sm p-2 bg-stone-50 border border-stone-200 rounded-none focus:ring-2 focus:ring-green-500/20 outline-none font-mono" value={plan.unclCode || ''} onChange={(e) => onChange({ unclCode: e.target.value })} placeholder="e.g. 711" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-stone-700 uppercase mb-1 block">Role</label>
          <input type="text" className="w-full text-sm p-2 bg-stone-50 border border-stone-200 rounded-none focus:ring-2 focus:ring-green-500/20 outline-none" value={plan.productRole || ''} onChange={(e) => onChange({ productRole: e.target.value })} placeholder="e.g. Consumable" />
        </div>
      </div>
    </div>
    <p className="mt-4 text-[9px] text-stone-600 italic">Structural data for search engine optimization.</p>
  </div>
);

const Linkable = ({ children, link, onLinkChange, className = "", onContextMenu }: { children: React.ReactNode, link: string, onLinkChange: (val: string) => void, className?: string, onContextMenu?: (e: React.MouseEvent) => void }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div onContextMenu={(e) => {
      if (onContextMenu) { onContextMenu(e); }
      else { e.preventDefault(); setPos({ x: e.clientX, y: e.clientY }); setShowSettings(true); }
    }} className={`relative group/link ${className}`}>
      {children}
      {showSettings && (<><div className="fixed inset-0 z-[99998]" onClick={() => setShowSettings(false)} /><LinkSettings link={link} onChange={onLinkChange} onClose={() => setShowSettings(false)} x={pos.x} y={pos.y} /></>)}
      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPos({ x: e.clientX, y: e.clientY }); setShowSettings(true); }} className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/link:opacity-100 transition-all bg-green-800 text-white px-2 py-1 rounded-none shadow-xl z-50 flex items-center gap-1 border-none hover:bg-green-900 hover:scale-105" title="Edit Link Settings">
        <i className="fa-solid fa-link text-[10px]"></i>
        <span className="text-[8px] font-bold uppercase tracking-widest">Link</span>
      </button>
      {link && <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-stone-900/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/link:opacity-100 transition-opacity whitespace-nowrap z-50 backdrop-blur-sm">URL: {link}</div>}
    </div>
  );
};

const getBottleStyle = (idx: number, total: number) => {
  const isMain = idx === total - 1;
  // Main bottle is prominent, centered, and slightly larger
  if (isMain) return { transform: 'translate(-50%, -50%) scale(1.15)', zIndex: 100 };

  const bgIdx = total - 2 - idx;
  const side = bgIdx % 2 === 0 ? -1 : 1;
  const pairIndex = Math.floor(bgIdx / 2) + 1;

  // Slightly wider horizontal alignment for a cleaner, less attached look
  const x = side * (pairIndex * 44) - 50; 
  const y = -50; 
  const rotate = 0; 
  const scale = 0.95;
  const zIndex = 50 - pairIndex;

  return {
    transform: `translate(${x}%, ${y}%) rotate(${rotate}deg) scale(${scale})`,
    zIndex,
    filter: `drop-shadow(0 15px 30px rgba(0,0,0,0.12))`
  };
};

const BottleStack = ({ src, alt, multiplier, onChange, onAltChange }: {
  src: string;
  alt: string;
  multiplier: string;
  onChange: (val: string) => void;
  onAltChange: (val: string) => void;
}) => {
  const count = parseInt(multiplier.replace(/[^0-9]/g, '')) || 1;
  const safeCount = Math.min(Math.max(count, 1), 10);
  const indices = Array.from({ length: safeCount }, (_, i) => i);

  return (
    <div className="relative h-[200px] w-full overflow-visible perspective-[1200px]">
      {indices.map((idx) => {
        const isMain = idx === indices.length - 1;
        const style = getBottleStyle(idx, indices.length);

        if (isMain) {
          return (
            <div key={idx} className="absolute left-1/2 top-1/2 w-full flex items-center justify-center transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)" style={{ transform: style.transform, zIndex: style.zIndex }}>
              <EditableImage
                src={src}
                alt={alt}
                onChange={onChange}
                onAltChange={onAltChange}
                className="img-fluid mx-auto transition-all duration-1000"
                style={{ height: '180px', objectFit: 'contain' }}
              />
            </div>
          );
        }

        return (
          <img
            key={idx}
            src={src}
            alt={alt}
            className="absolute left-1/2 top-1/2 h-[180px] object-contain transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) pointer-events-none"
            style={{
              transform: style.transform,
              zIndex: style.zIndex,
              filter: style.filter
            }}
          />
        );
      })}
    </div>
  );
};

export const OrganicTemplate: React.FC = () => {
  const {
    projectData, updateHero, updateAbout, updateFeature, addFeature, removeFeature,
    updateIngredient, addIngredient, removeIngredient, updateBenefit, addBenefit, removeBenefit,
    updatePricing, addPricing, removePricing, updateFAQ, addFAQ, removeFAQ,
    updateFooter, updateTestimonials, addTestimonial, removeTestimonial,
    updateResearch, updateNavbar,
    updateSocialProof, updateSectionVisibility, updateLegalPage, updateProjectData,
    showLegalModal, setShowLegalModal, updateTimer
  } = useStore();

  const SectionSettings = ({ sectionKey }: { sectionKey: keyof NonNullable<ProjectData['sections']> }) => (
    <div className="absolute top-4 left-4 z-50 flex gap-2 opacity-0 group-hover/section:opacity-100 transition-opacity">
      <button
        onClick={() => updateSectionVisibility(sectionKey, false)}
        className="bg-red-500/80 hover:bg-red-500 text-white px-2 py-1 text-[10px] font-bold rounded uppercase flex items-center gap-1 shadow-lg border-none backdrop-blur-sm transition-all"
      >
        <i className="fa-solid fa-eye-slash"></i> Hide Section
      </button>
    </div>
  );

  const AddButton = ({ onClick, label }: { onClick: () => void, label: string }) => (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="text-green-800 bg-green-50 hover:bg-green-100 text-[10px] font-bold py-2 px-6 rounded-none transition-all flex items-center gap-2 mx-auto my-8 uppercase tracking-[0.2em] border border-green-200">
      <i className="fa-solid fa-plus"></i> Add {label}
    </button>
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [schemaEditor, setSchemaEditor] = useState<{ i: number, x: number, y: number } | null>(null);
  const [proofIndex, setProofIndex] = useState(0);
  const [showProof, setShowProof] = useState(false);
  const [showProofSettings, setShowProofSettings] = useState(false);

  useEffect(() => {
    const sp = projectData?.socialProof;
    if (!sp || !sp.enabled || !sp.items?.length) return;
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.innerWidth >= 500) {
        setProofIndex((prev) => (prev + 1) % sp.items.length);
        setShowProof(true);
        setTimeout(() => setShowProof(false), sp.displayTime || 5000);
      }
    }, sp.interval || 8000);
    return () => clearInterval(interval);
  }, [projectData?.socialProof]);

  if (!projectData) return null;

  const primary = projectData.theme?.primary || '#1e3932';
  const secondary = projectData.theme?.secondary || '#8fb0a1';
  const bgLight = '#F9F7F2';
  const bgAccent = '#F1EDE4';

  return (
    <div className="organic-template relative bg-[#F9F7F2] text-[#3D3A35]">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" />

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        :root {
          --org-primary: ${primary};
          --org-secondary: ${secondary};
          --org-bg: #F9F7F2;
          --org-accent: #F1EDE4;
          --org-text: #3D3A35;
          --org-border: #E6D5C3;
        }

        .organic-template { 
          font-family: 'Outfit', sans-serif; 
          color: var(--org-text);
          background-color: var(--org-bg);
          line-height: 1.6;
          scroll-behavior: smooth;
        }

        .organic-template * {
          transition: border-color 0.3s ease, background-color 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
        }

        .organic-template h1, 
        .organic-template h2, 
        .organic-template h3, 
        .organic-template h4, 
        .organic-template .logo, 
        .organic-template .font-serif { 
          font-family: 'Fraunces', serif !important; 
          letter-spacing: -0.01em;
          font-weight: 700;
        }

        .organic-card {
          background: #ffffff;
          border: 1px solid var(--org-border);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 0;
        }

        .organic-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 40px 80px -15px rgba(61, 58, 53, 0.08);
          border-color: var(--org-primary);
        }

        .organic-btn {
          padding: 1.25rem 3rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-size: 0.7rem;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
        }

        .organic-btn-primary { background: var(--org-primary); color: #ffffff; }
        .organic-btn-primary:hover { background: #0d1a17; transform: scale(1.03); color: white; }
        .organic-btn-outline { background: transparent; border: 1.5px solid var(--org-primary); color: var(--org-primary); }
        .organic-btn-outline:hover { background: var(--org-primary); color: #ffffff; }

        .organic-blob { 
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; 
          animation: blobby 20s infinite alternate cubic-bezier(0.45, 0, 0.55, 1);
        }

        @keyframes blobby {
          0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }

        .section-reveal {
          animation: reveal 1s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes reveal {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .purchase-proof {
          position: fixed; bottom: 40px; left: 40px; background: rgba(255, 255, 255, 0.98);
          padding: 20px; border: 1px solid var(--org-border); z-index: 9999;
          transform: translateX(-150%); transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex; align-items: center; gap: 20px; min-width: 340px;
          backdrop-filter: blur(10px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05);
        }
        .purchase-proof.active { transform: translateX(0); }

        @media (max-width: 768px) {
          .organic-template h1 { font-size: 2.2rem !important; line-height: 1.2 !important; }
          .purchase-proof { left: 20px; bottom: 20px; min-width: calc(100% - 40px); }
        }
      `}} />

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg sticky-top bg-[#F9F7F2]/90 backdrop-blur-md border-b border-[#E6D5C3] py-4 z-[1000]">
        <div className="container px-3 d-flex justify-content-between align-items-center">
          <a className="navbar-brand d-flex align-items-center gap-3 no-underline" href="#">
            <div style={{ width: '45px', height: '45px', flexShrink: 0 }}>
              <EditableImage
                src={projectData.hero.logoImage || "https://placehold.co/100x100?text=Logo"}
                alt={projectData.hero.logoImageAlt}
                onChange={(val) => updateHero({ logoImage: val })}
                onAltChange={(val) => updateHero({ logoImageAlt: val })}
                className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all"
                style={{ objectFit: 'contain' }}
              />
            </div>
            <EditableText tagName="span" className="fs-3 fw-bold logo" style={{ color: primary }} value={projectData.productName} onChange={() => { }} />
          </a>
          <div className="d-none d-lg-flex align-items-center gap-5">
            {projectData.navbar?.links.map((link, i) => (
              <Linkable
                key={i}
                link={link.href}
                onLinkChange={(val) => {
                  const nl = [...projectData.navbar.links];
                  nl[i] = { ...nl[i], href: val };
                  updateNavbar({ links: nl });
                }}
              >
                <RemoveButton onClick={() => {
                  const nl = projectData.navbar.links.filter((_, idx) => idx !== i);
                  updateNavbar({ links: nl });
                }} />
                <EditableText
                  tagName="span"
                  className="nav-link fw-medium cursor-pointer p-0 text-stone-700 hover:text-green-900 text-xs uppercase tracking-widest no-underline"
                  value={link.label}
                  onChange={(val) => {
                    const nl = [...projectData.navbar.links];
                    nl[i] = { ...nl[i], label: val };
                    updateNavbar({ links: nl });
                  }}
                />
              </Linkable>
            ))}
            <AddButton onClick={() => {
              const nl = [...(projectData.navbar?.links || []), { label: "New Link", href: "#" }];
              updateNavbar({ links: nl });
            }} label="Link" />
            <Linkable link={projectData.hero.buttonHref} onLinkChange={(val) => updateHero({ buttonHref: val })}>
              <button className="organic-btn organic-btn-primary py-2 px-4">
                <EditableText tagName="span" value="Shop Collection" onChange={() => { }} />
              </button>
            </Linkable>
          </div>
          <div className="d-flex align-items-center gap-3 d-lg-none">
            <Linkable link={projectData.hero.buttonHref} onLinkChange={(val) => updateHero({ buttonHref: val })}>
              <button className="organic-btn organic-btn-primary py-2 px-3 text-nowrap" style={{ fontSize: '0.65rem', width: 'auto' }}>
                <EditableText tagName="span" value="Shop Now" onChange={() => { }} />
              </button>
            </Linkable>
            <button className="border-none bg-transparent p-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <div className="d-flex flex-column gap-1.5">
                <div style={{ width: '22px', height: '1px', background: primary }}></div>
                <div style={{ width: '22px', height: '1px', background: primary }}></div>
              </div>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="d-lg-none absolute top-full left-0 w-full bg-[#F9F7F2] border-b border-[#E6D5C3] p-5 d-flex flex-column gap-4 z-[999] animate-in slide-in-from-top duration-300">
            {projectData.navbar?.links.map((link, i) => (
              <a key={i} href={link.href} className="fs-5 font-serif no-underline text-stone-800" onClick={() => setIsMenuOpen(false)}>{link.label}</a>
            ))}
            <button className="organic-btn organic-btn-primary w-100 justify-content-center">Shop Now</button>
          </div>
        )}
      </nav>

      {/* Hero - Elegant Serenity Layout */}
      <section className="py-5 overflow-hidden section-reveal">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-7 text-center text-lg-start pe-lg-5">
              <EditableText tagName="h1" value={projectData.hero.title} onChange={(val) => updateHero({ title: val })} className="display-3 fw-bold mb-3" style={{ color: primary, lineHeight: 0.9 }} />
              <EditableText tagName="p" value={projectData.hero.subtitle} onChange={(val) => updateHero({ subtitle: val })} className="fs-6 text-stone-700 mb-4 italic font-serif w-100" style={{ lineHeight: 1.6 }} />
              <div className="d-flex flex-wrap gap-4 justify-content-center justify-content-lg-start">
                <Linkable link={projectData.hero.buttonHref} onLinkChange={(val) => updateHero({ buttonHref: val })}>
                  <button className="organic-btn organic-btn-primary">
                    <EditableText tagName="span" value={projectData.hero.buttonText} onChange={(val) => updateHero({ buttonText: val })} />
                    <IconEditor value={projectData.hero.icon || "fa-solid fa-seedling"} onChange={(val) => updateHero({ icon: val })} />
                  </button>
                </Linkable>
                <Linkable link={projectData.hero.secondaryButtonHref || ''} onLinkChange={(val) => updateHero({ secondaryButtonHref: val })}>
                  <button className="organic-btn organic-btn-outline">
                    <EditableText tagName="span" value={projectData.hero.secondaryButtonText || 'Discover More'} onChange={(val) => updateHero({ secondaryButtonText: val })} />
                  </button>
                </Linkable>
              </div>
            </div>
            <div className="col-12 col-lg-5">
              <div className="position-relative">
                <div className="absolute inset-0 organic-blob bg-stone-100 rotate-12 -z-10 translate-x-4"></div>
                <div className="p-4 organic-blob bg-white border border-[#E6D5C3]">
                  <EditableImage
                    src={projectData.hero.image || '/image/index-img.webp'}
                    alt={projectData.hero.imageAlt}
                    onChange={(val) => updateHero({ image: val })}
                    onAltChange={(val) => updateHero({ imageAlt: val })}
                    className="img-fluid mx-auto d-block"
                    style={{ maxHeight: '450px', objectFit: 'contain' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Logos */}
      <section className="py-4 border-y border-[#E6D5C3]" style={{ backgroundColor: 'white' }}>
        <div className="container">
          <div className="d-flex justify-content-center flex-wrap gap-4 gap-md-5 align-items-center">
            {(projectData.logos || []).map((logo, i) => (
              <div key={i} className="relative group" style={{ width: '80px' }}>
                <EditableImage
                  src={logo.src}
                  alt={logo.alt}
                  onChange={(val) => { const nl = [...(projectData.logos || [])]; nl[i] = { ...nl[i], src: val }; updateProjectData({ logos: nl }); }}
                  onAltChange={(val) => { const nl = [...(projectData.logos || [])]; nl[i] = { ...nl[i], alt: val }; updateProjectData({ logos: nl }); }}
                  onRemove={() => {
                    const nl = projectData.logos.filter((_, idx) => idx !== i);
                    updateProjectData({ logos: nl });
                  }}
                  className="img-fluid grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all"
                />
              </div>
            ))}
            <button
              onClick={() => updateProjectData({ logos: [...(projectData.logos || []), { src: "", alt: "" }] })}
              className="w-[60px] h-[60px] border border-dashed border-[#E6D5C3] flex items-center justify-center text-[#E6D5C3] hover:border-blue-500 hover:text-blue-500 transition-all"
            >
              <i className="fa-solid fa-plus text-xs"></i>
            </button>
          </div>

          {projectData.timer?.enabled && (
            <div className="mt-10 mb-4 flex justify-center w-full px-4">
              <CountdownTimer
                minutes={projectData.timer.minutes}
                text={projectData.timer.text}
                onUpdate={updateTimer}
              />
            </div>
          )}
          {!projectData.timer?.enabled && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => updateTimer({ enabled: true })}
                className="px-6 py-2 border border-dashed border-red-200 flex items-center gap-2 text-red-500 hover:border-red-500 hover:text-red-500 transition-all bg-red-50 text-xs font-bold uppercase tracking-wider rounded-none"
              >
                <i className="fa-solid fa-leaf"></i>
                Nurture Urgency Timer
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Ingredients Grid */}
      {projectData.sections?.ingredients && (
        <section id="ingredients" className="py-5 group/section relative section-reveal" style={{ backgroundColor: bgAccent }}>
          <SectionSettings sectionKey="ingredients" />
          <div className="container py-lg-5">
            <div className="text-center mb-4 w-100 mx-auto">
              <i className="fa-solid fa-leaf mb-3 text-2xl" style={{ color: secondary }}></i>
              <EditableText tagName="h2" className="fw-bold mb-3" style={{ color: primary, fontSize: '2.5rem' }} value={projectData.ingredients.title || "From the Earth"} onChange={(val) => updateIngredient(-1, { title: val })} />
              {projectData.ingredients.subtitle && (
                <p className="text-[#4A3B2E] font-serif text-lg w-100">{projectData.ingredients.subtitle}</p>
              )}
            </div>

            <div className="row g-4 component-grid">
              {projectData.ingredients?.items?.map((item, i) => (
                <div key={i} className="col-12 col-md-6 col-lg-4">
                  <div className="organic-card p-4 h-100 text-center relative bg-white">
                    <RemoveButton onClick={() => removeIngredient(i)} />
                    <div className="mx-auto mb-4 organic-blob overflow-hidden" style={{ width: '130px', height: '130px', border: `4px solid ${bgLight}` }}>
                      <EditableImage
                        src={item.image || '/image/ingredient-schisandra.png'}
                        alt={item.imageAlt}
                        onChange={(val) => updateIngredient(i, { image: val })}
                        onAltChange={(val) => updateIngredient(i, { imageAlt: val })}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <EditableText tagName="h4" className="fw-bold mb-2 font-serif" style={{ color: primary, fontSize: '1.25rem' }} value={item.title} onChange={(val) => updateIngredient(i, { title: val })} />
                    <EditableText tagName="p" className="mb-0 text-[#4A3B2E]" style={{ fontSize: '0.95rem', lineHeight: 1.6 }} value={item.description} onChange={(val) => updateIngredient(i, { description: val })} />
                  </div>
                </div>
              ))}
            </div>
            <AddButton onClick={addIngredient} label="Botanical" />
          </div>
        </section>
      )}

      {/* Core Philosophies (Features) */}
      {projectData.sections?.features && (
        <section id="features" className="py-5 bg-white group/section relative section-reveal">
          <SectionSettings sectionKey="features" />
          <div className="container py-lg-4">
            <div className="text-center mb-5">
              <EditableText tagName="h2" className="fw-bold mb-2" style={{ color: primary, fontSize: '2.2rem' }} value={projectData.featuresTitle || "Our Philosophy"} onChange={(val) => updateProjectData({ featuresTitle: val })} />
              <div className="w-12 h-0.5 bg-green-800 mx-auto mt-3"></div>
            </div>
            <div className="row g-0 border border-[#E6D5C3]">
              {projectData.features?.map((feature, i) => (
                <div key={i} className="col-12 col-md-3 border-end border-bottom border-[#E6D5C3] p-5 text-center relative group/feat hover:bg-stone-50 transition-colors">
                  <RemoveButton onClick={() => removeFeature(i)} />
                  <EditableImage
                    src={feature.image || '/image/gmo.webp'}
                    alt={feature.imageAlt}
                    onChange={(val) => updateFeature(i, { image: val })}
                    onAltChange={(val) => updateFeature(i, { imageAlt: val })}
                    className="w-12 h-12 mx-auto mb-4 grayscale group-hover/feat:grayscale-0 transition-all"
                  />
                  <EditableText tagName="h4" className="fw-bold mb-3 text-[0.85rem] uppercase tracking-widest" value={feature.title} onChange={(val) => updateFeature(i, { title: val })} />
                  <EditableText tagName="p" className="mb-0 text-stone-700 text-xs" style={{ lineHeight: 1.8 }} value={feature.description} onChange={(val) => updateFeature(i, { description: val })} />
                </div>
              ))}
              <div className="col-12 col-md-3 p-5 flex items-center justify-center">
                <AddButton onClick={addFeature} label="Principle" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Research */}
      {projectData.research && projectData.sections?.research !== false && (
        <section id="research" className="py-5 bg-[#F9F7F2] group/section relative section-reveal">
          <SectionSettings sectionKey="research" />
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <span className="text-[10px] fw-bold text-stone-600 uppercase tracking-widest mb-3 d-block">Scientific Verification</span>
                <EditableText tagName="h2" className="fw-bold mb-4 font-serif" style={{ color: primary, fontSize: '2.5rem' }} value={projectData.research?.title || ""} onChange={(val) => updateResearch({ title: val })} />
                <EditableText tagName="p" className="fs-5 text-stone-700 mb-4 italic" value={projectData.research?.subtitle || ""} onChange={(val) => updateResearch({ subtitle: val })} />
                <EditableText tagName="div" className="text-stone-700 mb-5" style={{ lineHeight: 1.9, fontSize: '0.95rem' }} value={projectData.research?.description || ""} onChange={(val) => updateResearch({ description: val })} />
                <div className="row g-4 pt-4 border-top border-[#E6D5C3]">
                  {(projectData.research?.stats || []).map((stat, i) => (
                    <div key={i} className="col-4">
                      <EditableText tagName="div" className="fw-bold fs-3 text-stone-800" value={stat.value} onChange={(val) => {
                        const ns = [...projectData.research!.stats];
                        ns[i] = { ...stat, value: val };
                        updateResearch({ stats: ns });
                      }} />
                      <EditableText tagName="div" className="text-stone-600 small uppercase tracking-tighter" style={{ fontSize: '10px' }} value={stat.label} onChange={(val) => {
                        const ns = [...projectData.research!.stats];
                        ns[i] = { ...stat, label: val };
                        updateResearch({ stats: ns });
                      }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-6">
                <div className="position-relative">
                  <div className="absolute inset-0 organic-blob bg-stone-100 -rotate-6 -z-10 translate-x-4"></div>
                  <div className="p-4 organic-blob bg-white border border-[#E6D5C3]">
                    <EditableImage
                      src={projectData.research?.image || '/image/banner-img.webp'}
                      alt={projectData.research?.imageAlt}
                      onChange={(val) => updateResearch({ image: val })}
                      onAltChange={(val) => updateResearch({ imageAlt: val })}
                      className="img-fluid mx-auto d-block"
                      style={{ maxHeight: '450px', objectFit: 'contain' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About Section - Journal Style */}
      {projectData.sections?.about && (
        <section id="about" className="py-5 bg-white group/section relative section-reveal">
          <SectionSettings sectionKey="about" />
          <div className="container w-100 mx-auto">
            <div className="text-center mb-5">
              <EditableText tagName="h2" className="display-5 fw-bold mb-4" style={{ color: primary }} value={projectData.about.title || "The Botanical Journal"} onChange={(val) => updateAbout({ title: val })} />
            </div>

            <div className="row g-5 align-items-center">
              <div className="col-lg-5 text-center">
                <div className="p-3 border border-stone-100 bg-stone-50 inline-block shadow-sm">
                  <EditableImage
                    src={projectData.about.image || '/image/banner-img.webp'}
                    alt={projectData.about.imageAlt}
                    onChange={(val) => updateAbout({ image: val })}
                    onAltChange={(val) => updateAbout({ imageAlt: val })}
                    className="img-fluid grayscale hover:grayscale-0 transition-all duration-700"
                    style={{ maxHeight: '400px', objectFit: 'contain' }}
                  />
                </div>
              </div>
              <div className="col-lg-7">
                <div className="ps-lg-4 border-l-4 border-green-800/20">
                  <EditableText tagName="div" value={projectData.about.description} onChange={(val) => updateAbout({ description: val })} className="text-stone-600 font-serif" style={{ lineHeight: 1.9, fontSize: '1.1rem', whiteSpace: 'pre-line' }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Benefits - List Format */}
      {projectData.sections?.benefits && (
        <section id="benefits" className="py-5 bg-accent group/section relative section-reveal" style={{ backgroundColor: bgAccent }}>
          <SectionSettings sectionKey="benefits" />
          <div className="container py-lg-4">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="bg-white p-5 border border-[#E6D5C3]">
                  <div className="text-center mb-5">
                    <EditableText tagName="h2" className="fw-bold mb-3" style={{ color: primary, fontSize: '2rem' }} value={projectData.benefits.title || "Holistic Rewards"} onChange={(val) => updateBenefit(-1, { title: val })} />
                    <EditableText tagName="p" className="text-stone-700 italic mx-auto font-serif w-100" value={projectData.benefits.description} onChange={(val) => updateBenefit(-1, { description: val })} />
                  </div>
                  <div className="row g-4">
                    {projectData.benefits.items.map((benefit, i) => (
                      <div key={i} className="col-md-6 relative group/ben">
                        <RemoveButton onClick={() => removeBenefit(i)} />
                        <div className="d-flex align-items-start gap-4 p-3 hover:bg-stone-50 transition-colors">
                          <div className="text-green-800 pt-1"><i className="fa-solid fa-leaf text-xs"></i></div>
                          <div>
                            <EditableText tagName="h4" className="fw-bold mb-1 text-sm uppercase tracking-wider" value={benefit.title} onChange={(val) => updateBenefit(i, { title: val })} />
                            <EditableText tagName="p" className="mb-0 text-stone-700 text-xs" style={{ lineHeight: 1.6 }} value={benefit.description} onChange={(val) => updateBenefit(i, { description: val })} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <AddButton onClick={addBenefit} label="Benefit" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing - Collection Gallery */}
      <section className="py-5 bg-white section-reveal" id="pricing">
        <div className="container py-lg-5">
          <div className="text-center mb-5">
            <EditableText tagName="h2" className="fw-bold mb-2 font-serif" style={{ color: primary, fontSize: '2.8rem' }} value={projectData.pricingTitle || "Select Your Batch"} onChange={(val) => useStore.getState().updateProjectData({ pricingTitle: val })} />
            <div className="w-16 h-px bg-stone-200 mx-auto mt-4"></div>
          </div>
          <div className="row g-4 justify-content-center w-100 mx-auto">
            {projectData.pricing?.map((plan, i) => (
              <div key={i} className="col-12 col-md-4 relative">
                <RemoveButton onClick={() => removePricing(i)} />
                <div className={`organic-card h-100 flex flex-column bg-white ${plan.isPrimary ? 'border-green-800' : ''}`}
                  onContextMenu={(e) => { e.preventDefault(); setSchemaEditor({ i, x: e.clientX, y: e.clientY }); }}
                  title="Right-click to edit Metadata"
                >
                  {schemaEditor?.i === i && (
                    <>
                      <div className="fixed inset-0 z-[99998]" onClick={() => setSchemaEditor(null)} />
                      <SchemaEditor plan={plan} onClose={() => setSchemaEditor(null)} onChange={(val) => updatePricing(i, val)} x={schemaEditor.x} y={schemaEditor.y} />
                    </>
                  )}
                  {plan.isPrimary && <div className="bg-green-800 text-white text-[9px] fw-bold py-1 text-center uppercase tracking-widest">Recommended Choice</div>}
                  <div className="p-5 flex-grow text-center">
                    <EditableText tagName="h4" className="fw-bold mb-4 text-xs uppercase tracking-[0.2em] text-stone-600" value={plan.title} onChange={(val) => updatePricing(i, { title: val })} />
                    <div className="relative mb-5 group/img">
                      {/* Signature Leaf Multiplier Badge */}
                      <div className="absolute -top-2 -right-2 z-10 pointer-events-auto">
                        <div className="relative">
                          <div className="absolute inset-0 bg-green-900/5 rotate-6" />
                          <EditableText
                            className="relative bg-[#1e3932] text-white px-3 py-1.5 rounded-none flex items-center justify-center font-serif italic text-xs border border-[#1e3932] shadow-sm min-w-[45px]"
                            value={plan.multiplier || "X1"}
                            onChange={(val) => updatePricing(i, { multiplier: val })}
                          />
                        </div>
                      </div>
                      <BottleStack
                        src={plan.image || '/image/bottle-snap.webp'}
                        alt={plan.imageAlt}
                        multiplier={plan.multiplier || "X1"}
                        onChange={(val) => updatePricing(i, { image: val })}
                        onAltChange={(val) => updatePricing(i, { imageAlt: val })}
                      />
                    </div>
                    <EditableText tagName="div" className="fw-bold mb-4 font-serif text-3xl" value={plan.price} onChange={(val) => updatePricing(i, { price: val })} />
                    <div className="mb-5 text-start ps-4 border-start border-stone-100">
                      {plan.features.map((f, fi) => (
                        <div key={fi} className="mb-2 d-flex align-items-center gap-2 text-stone-700 text-xs">
                          <i className="fa-solid fa-check text-green-700"></i>
                          <EditableText tagName="span" value={f} onChange={(val) => { const nf = [...plan.features]; nf[fi] = val; updatePricing(i, { features: nf }); }} />
                        </div>
                      ))}
                    </div>
                    <Linkable link={plan.buttonHref} onLinkChange={() => { }}>
                      <button className={`organic-btn w-100 justify-content-center ${plan.isPrimary ? 'organic-btn-primary' : 'organic-btn-outline'}`}>
                        <EditableText tagName="span" value={plan.buttonText} onChange={(val) => updatePricing(i, { buttonText: val })} />
                      </button>
                    </Linkable>
                    <div className="mt-4 flex items-center justify-center gap-2 text-stone-300 font-bold text-[9px] tracking-widest uppercase">
                      <IconEditor className="text-xs" value={plan.guaranteeBadge?.icon || projectData.guaranteeBadge?.icon || "fa-solid fa-shield-halved"} onChange={(val) => updatePricing(i, { guaranteeBadge: { ...(plan.guaranteeBadge || projectData.guaranteeBadge || { text: '60-DAY PROMISE', icon: 'fa-solid fa-shield-halved' }), icon: val } })} />
                      <EditableText tagName="span" value={plan.guaranteeBadge?.text || projectData.guaranteeBadge?.text || "60-DAY PROMISE"} onChange={(val) => updatePricing(i, { guaranteeBadge: { ...(plan.guaranteeBadge || projectData.guaranteeBadge || { text: '60-DAY PROMISE', icon: 'fa-solid fa-shield-halved' }), text: val } })} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <AddButton onClick={addPricing} label="Plan" />
          </div>
        </div>
      </section>

      {/* Testimonials - Narrative Style */}
      {projectData.sections?.testimonials && (
        <section id="testimonials" className="py-5 bg-[#F9F7F2] group/section relative section-reveal">
          <SectionSettings sectionKey="testimonials" />
          <div className="container py-lg-4">
            <div className="text-center mb-5">
              <span className="text-[10px] fw-bold text-stone-600 uppercase tracking-widest mb-2 d-block">The Community Voice</span>
              <EditableText tagName="h2" className="fw-bold font-serif mb-4" style={{ color: primary, fontSize: '2.5rem' }} value={projectData.testimonials?.title || "Community Stories"} onChange={(val) => updateTestimonials(-1, { title: val })} />
            </div>
            <div className="row g-4">
              {projectData.testimonials?.items.map((item, i) => (
                <div key={i} className="col-md-4 relative group/test">
                  <div className="p-4 bg-white border border-[#E6D5C3] h-100 text-center flex flex-column align-items-center">
                    <RemoveButton onClick={() => removeTestimonial(i)} />
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-stone-50">
                      <EditableImage
                        src={item.image || "https://i.pravatar.cc/150"}
                        alt={item.imageAlt}
                        onChange={(val) => updateTestimonials(i, { image: val })}
                        onAltChange={(val) => updateTestimonials(i, { imageAlt: val })}
                        className="w-100 h-100 object-cover grayscale hover:grayscale-0 transition-all"
                      />
                    </div>
                    <EditableText tagName="h5" className="fw-bold mb-1 text-sm font-serif" value={item.name} onChange={(val) => updateTestimonials(i, { name: val })} />
                    <EditableText tagName="p" className="mb-3 text-[10px] text-stone-600 uppercase tracking-widest" value={item.role || ""} onChange={(val) => updateTestimonials(i, { role: val })} />
                    <div className="mb-3 d-flex gap-1 text-stone-200 text-[10px]">
                      {[...Array(5)].map((_, si) => <i key={si} className="fa-solid fa-star text-[#D4C3B2]"></i>)}
                    </div>
                    <EditableText tagName="p" className="mb-0 text-stone-600 italic text-sm" style={{ lineHeight: 1.8 }} value={item.content} onChange={(val) => updateTestimonials(i, { content: val })} />
                  </div>
                </div>
              ))}
            </div>
            <AddButton onClick={addTestimonial} label="Story" />
          </div>
        </section>
      )}

      {/* Satisfaction Promise */}
      <section className="py-5 bg-white border-t border-[#E6D5C3]">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-4 text-center">
              <EditableImage
                src={projectData.footer.trustImage || '/image/money-back-guarantee-..webp'}
                alt={projectData.footer.trustImageAlt}
                onChange={(val) => updateFooter({ trustImage: val })}
                onAltChange={(val) => updateFooter({ trustImageAlt: val })}
                className="img-fluid mb-3 mx-auto"
                style={{ maxWidth: '220px' }}
              />
            </div>
            <div className="col-lg-8">
              <span className="text-[10px] fw-bold text-stone-600 uppercase tracking-widest mb-2 d-block">Our Pure Promise</span>
              <EditableText tagName="h3" className="fw-bold mb-3 font-serif" style={{ color: primary, fontSize: '2rem' }} value={projectData.guaranteeHeadline || "60-Day Botanical Promise"} onChange={(val) => useStore.getState().updateProjectData({ guaranteeHeadline: val })} />
              <EditableText tagName="p" className="text-stone-700" style={{ lineHeight: 1.8, fontSize: '0.95rem' }} value={projectData.guaranteeDescription || `Your path to wellness is protected. Every bottle of ${projectData.productName} is covered by our 60-day satisfaction protocol. If you don't feel the difference, we will honor a full refund.`} onChange={(val) => useStore.getState().updateProjectData({ guaranteeDescription: val })} />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ - Accordion Style */}
      {projectData.sections?.faq && (
        <section id="faq" className="py-5 bg-[#F9F7F2] group/section relative section-reveal">
          <SectionSettings sectionKey="faq" />
          <div className="container py-lg-4 w-100">
            <div className="text-center mb-5">
              <EditableText tagName="h2" className="fw-bold font-serif mb-3" style={{ color: primary, fontSize: '2.3rem' }} value={projectData.faqTitle || "Inquiries \u0026 Insights"} onChange={(val) => useStore.getState().updateProjectData({ faqTitle: val })} />
            </div>
            <div className="space-y-3">
              {projectData.faq.map((item, i) => (
                <div key={i} className="bg-white border border-[#E6D5C3] relative">
                  <RemoveButton onClick={() => removeFAQ(i)} />
                  <div className="p-4 cursor-pointer d-flex justify-content-between align-items-center" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <EditableText tagName="span" className="fw-bold text-stone-800 text-sm font-serif" value={item.question} onChange={(val) => updateFAQ(i, { question: val })} />
                    <i className={`fa-solid fa-plus text-[10px] text-stone-300 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}></i>
                  </div>
                  {openFaq === i && (
                    <div className="px-4 pb-4">
                      <EditableText tagName="p" className="mb-0 text-stone-700 text-xs" style={{ lineHeight: 1.8 }} value={item.answer} onChange={(val) => updateFAQ(i, { answer: val })} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <AddButton onClick={addFAQ} label="Question" />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[#1e3932] text-[#F9F7F2]/60 py-5 font-serif">
        <div className="container text-center">
          <EditableText tagName="h2" className="fw-bold mb-2 text-white" style={{ fontSize: '1.4rem' }} value={projectData.footerHeadline || "Botanical Wisdom"} onChange={(val) => useStore.getState().updateProjectData({ footerHeadline: val })} />
          <EditableText tagName="p" className="mx-auto mb-4 text-xs italic w-100" value={projectData.footer.companyInfo} onChange={(val) => updateFooter({ companyInfo: val })} />

          <div className="d-flex flex-wrap justify-content-center gap-5 my-5 border-y border-white/5 py-4">
            {projectData.footer.links.map((link, i) => (
              <div key={i} className="relative group/linkitem">
                <RemoveButton onClick={() => {
                  const nl = [...projectData.footer.links];
                  nl.splice(i, 1);
                  updateFooter({ links: nl });
                }} />
                <Linkable link={link.href} onLinkChange={(val) => { const nl = [...projectData.footer.links]; nl[i] = { ...nl[i], href: val }; updateFooter({ links: nl }); }}>
                  <EditableText tagName="span" className="hover:text-white transition-colors cursor-pointer text-[10px] uppercase tracking-widest" value={link.label} onChange={(val) => { const nl = [...projectData.footer.links]; nl[i] = { ...nl[i], label: val }; updateFooter({ links: nl }); }} />
                </Linkable>
              </div>
            ))}
          </div>
          <AddButton onClick={() => updateFooter({ links: [...projectData.footer.links, { label: 'New Link', href: '#' }] })} label="Footer Link" />
          <p className="text-[9px] uppercase tracking-widest">© {new Date().getFullYear()} {projectData.productName}. Heritage Botanical.</p>
        </div>
      </footer>

      {/* Purchase Proof Popup */}
      {projectData.socialProof?.enabled && (
        <div
          className={`purchase-proof ${showProof ? 'active' : ''} group/proof cursor-pointer hover:border-stone-400 transition-colors bg-white shadow-sm`}
          onClick={() => setShowProofSettings(true)}
        >
          <div className="absolute -top-10 left-0 bg-stone-800 text-white text-[9px] font-bold px-2 py-1.5 rounded-sm opacity-0 group-hover/proof:opacity-100 transition-all shadow-xl pointer-events-none">
            <i className="fa-solid fa-gear mr-1"></i> Edit Popup Settings
          </div>
          <div className="flex-shrink-0 w-16 h-16 bg-stone-50 border border-stone-100 p-1 flex items-center justify-center">
            <img
              src={projectData.socialProof?.items[proofIndex]?.image || projectData.hero.image || '/image/bottle-snap.webp'}
              className="w-full h-full object-contain grayscale"
              alt={projectData.socialProof?.items[proofIndex]?.imageAlt || "Botanical Batch"}
              onError={(e) => { (e.target as HTMLImageElement).src = '/image/bottle-snap.webp'; }}
            />
          </div>
          <div className="flex flex-col">
            <div className="text-[#D4C3B2] text-[8px] mb-1">
              {[...Array(5)].map((_, si) => <i key={si} className="fa-solid fa-star"></i>)}
            </div>
            <div className="text-stone-800 text-xs leading-tight font-serif">
              <strong className="text-green-800">{projectData.socialProof?.items[proofIndex]?.name}</strong> in <strong className="text-green-800">{projectData.socialProof?.items[proofIndex]?.location}</strong> <br />
              {projectData.socialProof?.items[proofIndex]?.content}
            </div>
            <small className="text-stone-600 text-[9px] mt-1 font-bold uppercase tracking-widest">{projectData.socialProof?.items[proofIndex]?.timeAgo} • Verified Sourcing</small>
          </div>
        </div>
      )}

      {/* Social Proof Settings Modal */}
      {showProofSettings && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setShowProofSettings(false)}></div>
          <div className="bg-white w-full max-w-xl rounded-none shadow-2xl z-10 overflow-hidden border border-stone-200">
            <div className="p-4 border-b border-stone-50 d-flex justify-content-between align-items-center">
              <h3 className="m-0 fs-6 fw-bold text-stone-800 uppercase tracking-widest">Popup Configuration</h3>
              <button onClick={() => setShowProofSettings(false)} className="border-none bg-transparent text-stone-600 hover:text-stone-600">
                <i className="fa-solid fa-times fs-5"></i>
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-100">
                <span className="text-xs font-bold text-stone-600 uppercase">Widget Visibility</span>
                <button
                  onClick={() => updateSocialProof({ enabled: !projectData.socialProof?.enabled })}
                  className={`px-4 py-1.5 rounded-none text-[10px] font-bold transition-all border-none ${projectData.socialProof?.enabled ? 'bg-green-800 text-white' : 'bg-stone-200 text-stone-700'}`}
                >
                  {projectData.socialProof?.enabled ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <label className="text-[10px] font-bold text-stone-600 uppercase mb-1 block">Display Duration (ms)</label>
                  <input type="number" className="w-full text-xs p-2 border border-stone-100 bg-stone-50 outline-none focus:ring-1 focus:ring-green-800" value={projectData.socialProof?.displayTime || 5000} onChange={(e) => updateSocialProof({ displayTime: Number(e.target.value) })} />
                </div>
                <div className="col-6">
                  <label className="text-[10px] font-bold text-stone-600 uppercase mb-1 block">Interval (ms)</label>
                  <input type="number" className="w-full text-xs p-2 border border-stone-100 bg-stone-50 outline-none focus:ring-1 focus:ring-green-800" value={projectData.socialProof?.interval || 8000} onChange={(e) => updateSocialProof({ interval: Number(e.target.value) })} />
                </div>
              </div>

              <div className="pt-4 border-top border-stone-50">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="m-0 text-xs font-bold text-stone-800 uppercase tracking-widest">Entry Catalog</h4>
                  <button onClick={() => updateSocialProof({ items: [...(projectData.socialProof?.items || []), { name: 'New Buyer', location: 'USA', content: 'Purchased Glyco', timeAgo: 'Just now', image: '' }] })} className="organic-btn organic-btn-primary py-1.5 px-3 text-[9px]">Add Entry</button>
                </div>
                <div className="space-y-4">
                  {projectData.socialProof?.items?.map((item, i) => (
                    <div key={i} className="p-3 border border-stone-100 bg-stone-50/50 relative group/item">
                      <button onClick={() => { const ni = projectData.socialProof?.items.filter((_, idx) => idx !== i); updateSocialProof({ items: ni }); }} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-none flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all border-none"><i className="fa-solid fa-times text-[10px]"></i></button>
                      <div className="row g-2">
                        <div className="col-6"><input className="w-full text-xs p-2 bg-white border border-stone-100 outline-none" value={item.name} onChange={(e) => { const ni = [...projectData.socialProof!.items]; ni[i].name = e.target.value; updateSocialProof({ items: ni }); }} placeholder="Name" /></div>
                        <div className="col-6"><input className="w-full text-xs p-2 bg-white border border-stone-100 outline-none" value={item.location} onChange={(e) => { const ni = [...projectData.socialProof!.items]; ni[i].location = e.target.value; updateSocialProof({ items: ni }); }} placeholder="Location" /></div>
                        <div className="col-12"><input className="w-full text-xs p-2 bg-white border border-stone-100 outline-none" value={item.content} onChange={(e) => { const ni = [...projectData.socialProof!.items]; ni[i].content = e.target.value; updateSocialProof({ items: ni }); }} placeholder="Notification Content" /></div>
                        <div className="col-12">
                          <EditableImage
                            src={item.image || ''}
                            alt={item.imageAlt}
                            onChange={(val) => { const ni = [...projectData.socialProof!.items]; ni[i].image = val; updateSocialProof({ items: ni }); }}
                            onAltChange={(val) => { const ni = [...projectData.socialProof!.items]; ni[i].imageAlt = val; updateSocialProof({ items: ni }); }}
                            className="w-full h-24 object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Section Visibility Manager */}
      <div className="p-8 border-t border-dashed border-[#E6D5C3] text-center bg-[#F1EDE4]">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-600 mb-6">Template Structure Manager</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {Object.entries(projectData.sections || {}).map(([key, visible]) => (
            <button
              key={key}
              onClick={() => updateSectionVisibility(key as any, !visible)}
              className={`px-5 py-2.5 text-[9px] font-bold rounded-none uppercase transition-all flex items-center gap-2 border-none shadow-sm ${visible ? 'bg-stone-200 text-stone-700' : 'bg-green-800 text-white hover:scale-105'}`}
            >
              <i className={`fa-solid ${visible ? 'fa-eye-slash' : 'fa-plus'}`}></i>
              {visible ? 'Hide' : 'Add'} {key}
            </button>
          ))}
          <button
            onClick={() => setShowLegalModal(true)}
            className="px-5 py-2.5 text-[9px] font-bold rounded-none uppercase transition-all flex items-center gap-2 bg-green-800 text-white hover:scale-105 border-none shadow-sm"
          >
            <i className="fa-solid fa-file-contract"></i> Edit Legal Documents
          </button>
        </div>
      </div>
    </div>
  );
};
