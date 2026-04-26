'use client';

import React, { useEffect, useState } from 'react';
import { EditableText } from '../editor/EditableText';
import { EditableImage } from '../editor/EditableImage';
import { useStore } from '@/lib/store';

// Reusable helpers
const RemoveButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="absolute top-2 right-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white w-6 h-6 rounded-none flex items-center justify-center transition-all z-20 hover:scale-110 border-none">
    <i className="fa-solid fa-trash-can text-[10px]"></i>
  </button>
);

const IconEditor = ({ value, onChange, className = "" }: { value: string; onChange: (val: string) => void, className?: string }) => {
  const icons = ["fa-solid fa-cart-shopping", "fa-solid fa-arrow-right", "fa-solid fa-check", "fa-solid fa-bolt", "fa-solid fa-star", "fa-solid fa-circle-play", "fa-solid fa-cart-arrow-down"];
  const cycleIcon = () => { const idx = icons.indexOf(value || icons[0]); onChange(icons[(idx + 1) % icons.length]); };
  return <i className={`${value || icons[1]} cursor-pointer hover:scale-125 transition-transform text-current ${className}`} onClick={(e) => { e.stopPropagation(); cycleIcon(); }} title="Click to toggle icon" />;
};

const LinkSettings = ({ link, onChange, onClose, x, y }: { link: string; onChange: (val: string) => void, onClose: () => void, x: number, y: number }) => (
  <div className="fixed bg-white rounded-none border border-gray-100 p-4 z-[99999] w-64 animate-in fade-in zoom-in duration-200" style={{ left: x, top: y }} onClick={(e) => e.stopPropagation()}>
    <div className="flex justify-between items-center mb-3">
      <span className="text-[10px] font-bold uppercase text-gray-400">Link Settings</span>
      <button onClick={onClose} className="text-gray-300 hover:text-gray-600"><i className="fa-solid fa-xmark"></i></button>
    </div>
    <input type="text" placeholder="e.g. #pricing or https://..." className="w-full text-xs p-2 bg-gray-50 border border-gray-100 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500" value={link || ''} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const SchemaEditor = ({ plan, onChange, onClose, x, y }: { plan: any; onChange: (val: any) => void, onClose: () => void, x: number, y: number }) => (
  <div className="fixed bg-[#111] rounded-none shadow-2xl border border-white/10 p-5 z-[99999] w-80 animate-in zoom-in-95 duration-200 text-left" style={{ left: Math.min(x, typeof window !== 'undefined' ? window.innerWidth - 340 : x), top: Math.min(y, typeof window !== 'undefined' ? window.innerHeight - 400 : y) }} onClick={(e) => e.stopPropagation()}>
    <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
      <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-bolt text-blue-400"></i> Product Schema</span>
      <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><i className="fa-solid fa-times"></i></button>
    </div>
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-bold text-white/40 uppercase mb-1 block">GTIN / Barcode</label>
        <input type="text" className="w-full text-sm p-2 bg-white/5 border border-white/10 rounded-none focus:ring-2 focus:ring-blue-500/40 outline-none font-mono text-white" value={plan.gtin || ''} onChange={(e) => onChange({ gtin: e.target.value })} placeholder="e.g. 5901234123457" />
      </div>
      <div>
        <label className="text-[10px] font-bold text-white/40 uppercase mb-1 block">Category</label>
        <input type="text" className="w-full text-sm p-2 bg-white/5 border border-white/10 rounded-none focus:ring-2 focus:ring-blue-500/40 outline-none text-white" value={plan.category || ''} onChange={(e) => onChange({ category: e.target.value })} placeholder="e.g. Software" />
      </div>
      <div>
        <label className="text-[10px] font-bold text-white/40 uppercase mb-1 block">SKU</label>
        <input type="text" className="w-full text-sm p-2 bg-white/5 border border-white/10 rounded-none focus:ring-2 focus:ring-blue-500/40 outline-none font-mono text-white" value={plan.sku || ''} onChange={(e) => onChange({ sku: e.target.value })} placeholder="e.g. MOD-001" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-white/40 uppercase mb-1 block">UNCL Code</label>
          <input type="text" className="w-full text-sm p-2 bg-white/5 border border-white/10 rounded-none focus:ring-2 focus:ring-blue-500/40 outline-none font-mono text-white" value={plan.unclCode || ''} onChange={(e) => onChange({ unclCode: e.target.value })} placeholder="e.g. 711" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-white/40 uppercase mb-1 block">Role</label>
          <input type="text" className="w-full text-sm p-2 bg-white/5 border border-white/10 rounded-none focus:ring-2 focus:ring-blue-500/40 outline-none text-white" value={plan.productRole || ''} onChange={(e) => onChange({ productRole: e.target.value })} placeholder="e.g. Consumable" />
        </div>
      </div>
    </div>
    <p className="mt-4 text-[9px] text-white/30 italic">Details used for automatic SEO JSON-LD generation.</p>
  </div>
);

const Linkable = ({ children, link, onLinkChange, className = "", onContextMenu }: { children: React.ReactNode, link: string, onLinkChange: (val: string) => void, className?: string, onContextMenu?: (e: React.MouseEvent) => void }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div onContextMenu={(e) => {
      if (onContextMenu) {
        onContextMenu(e);
      } else {
        e.preventDefault();
        setPos({ x: e.clientX, y: e.clientY });
        setShowSettings(true);
      }
    }} className={`relative group/link ${className}`} title={onContextMenu ? "Right-click for options" : "Right-click to set link"}>
      {children}
      {showSettings && (<><div className="fixed inset-0 z-[99998]" onClick={() => setShowSettings(false)} /><LinkSettings link={link} onChange={onLinkChange} onClose={() => setShowSettings(false)} x={pos.x} y={pos.y} /></>)}
      <div className="absolute -top-3 -right-3 opacity-0 group-hover/link:opacity-100 transition-opacity bg-blue-500 text-white w-5 h-5 rounded-none flex items-center justify-center shadow-lg z-50 pointer-events-none">
        <i className="fa-solid fa-link text-[8px]"></i>
      </div>
      {link && <div className="absolute -top-6 left-0 bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/link:opacity-100 transition-opacity whitespace-nowrap z-50">LINK: {link}</div>}
    </div>
  );
};

export const ModernTemplate: React.FC = () => {
  const {
    projectData, updateHero, updateAbout,
    updateFeature, addFeature, removeFeature,
    updateIngredient, addIngredient, removeIngredient,
    updateBenefit, addBenefit, removeBenefit,
    updateFAQ, addFAQ, removeFAQ,
    updatePricing, addPricing, removePricing,
    updateFooter, updateProductName, updateTestimonials, addTestimonial, removeTestimonial,
    updateResearch, updateGallery, updateNavbar,
    updateSocialProof, updateSectionVisibility
  } = useStore();

  const SectionSettings = ({ sectionKey }: { sectionKey: keyof ProjectData['sections'] }) => (
    <div className="absolute top-4 left-4 z-50 flex gap-2 opacity-0 group-hover/section:opacity-100 transition-opacity">
      <button
        onClick={() => updateSectionVisibility(sectionKey, false)}
        className="bg-red-500/80 hover:bg-red-500 text-white px-2 py-1 text-[10px] font-bold rounded-none uppercase flex items-center gap-1 shadow-lg border-none backdrop-blur-sm transition-all"
      >
        <i className="fa-solid fa-eye-slash"></i> Hide Section
      </button>
    </div>
  );

  const AddButton = ({ onClick, label }: { onClick: () => void, label: string }) => (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="text-white text-[12px] font-bold py-2 px-5 rounded-none transition-all flex items-center gap-2 mx-auto my-8 uppercase tracking-widest border-none" style={{ backgroundColor: projectData?.theme?.primary || '#1e3932' }}>
      <i className="fa-solid fa-plus"></i> Add {label}
    </button>
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [schemaEditor, setSchemaEditor] = useState<{ i: number, x: number, y: number } | null>(null);
  const [proof, setProof] = useState<{ name: string; state: string; bottleCount: string; timeAgo: number } | null>(null);
  const [showProof, setShowProof] = useState(false);
  const [showProofSettings, setShowProofSettings] = useState(false);

  useEffect(() => {
    const sp = projectData?.socialProof;
    if (!sp || !sp.enabled) return;

    const names = sp.names.length > 0 ? sp.names : ["James", "Michael", "Chris"];
    const locations = sp.locations.length > 0 ? sp.locations : ["California", "Texas", "Austin"];
    const bottles = sp.products.length > 0 ? sp.products : ["2 bottles", "3 bottles"];

    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.innerWidth >= 500) {
        setProof({
          name: names[Math.floor(Math.random() * names.length)],
          state: locations[Math.floor(Math.random() * locations.length)],
          bottleCount: bottles[Math.floor(Math.random() * bottles.length)],
          timeAgo: Math.floor(Math.random() * 10) + 1
        });
        setShowProof(true);
        setTimeout(() => setShowProof(false), sp.displayTime || 5000);
      }
    }, sp.interval || 8000);

    return () => clearInterval(interval);
  }, [projectData?.socialProof]);

  if (!projectData) return null;

  const primary = projectData.theme?.primary || '#1e3932';
  const secondary = projectData.theme?.secondary || '#f1f8f5';

  return (
    <div className="modern-template relative overflow-x-hidden" style={{ backgroundColor: '#0a0a0a', color: '#e0e0e0' }}>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" />

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        .modern-template { font-family: 'Inter', sans-serif; }
        .modern-template h1, .modern-template h2, .modern-template h3, .modern-template h4, .modern-template .logo { font-family: 'Space Grotesk', sans-serif !important; }

        .glass-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          backdrop-filter: blur(12px);
          transition: all 0.4s ease;
        }
        .glass-card:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15);
          transform: translateY(-4px);
        }

        .gradient-text {
          background: linear-gradient(135deg, ${secondary}, #fff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .modern-btn {
          padding: 0.85rem 2.5rem;
          border-radius: 999px;
          font-weight: 700;
          font-size: 0.9rem;
          border: none;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          cursor: pointer;
        }
        .modern-btn-primary { background: ${secondary}; color: ${primary}; }
        .modern-btn-primary:hover { opacity: 0.85; transform: translateY(-2px); color: ${primary}; }
        .modern-btn-outline { background: transparent; border: 2px solid rgba(255,255,255,0.2); color: #fff; }
        .modern-btn-outline:hover { border-color: ${secondary}; color: ${secondary}; }

        .section-dark { background: #0a0a0a; }
        .section-darker { background: #050505; }
        .section-accent { background: linear-gradient(135deg, ${primary}, ${primary}dd); }

        .modern-template .accordion-button { background: transparent !important; color: #fff !important; box-shadow: none !important; }
        .modern-template .accordion-button::after { filter: invert(1); }
        .modern-template .accordion-body { color: #aaa; }
        .modern-template .accordion-item { border-color: rgba(255,255,255,0.08) !important; background: transparent; }

        @media (max-width: 768px) {
          .modern-template h1 { font-size: 1.8rem !important; }
          .modern-template .hero-subtitle { font-size: 0.9rem !important; }
          .modern-btn { padding: 0.6rem 1.5rem !important; font-size: 0.8rem !important; }
        }

        .mobile-preview .modern-template .col-lg-5,
        .mobile-preview .modern-template .col-lg-7,
        .mobile-preview .modern-template .col-lg-4,
        .mobile-preview .modern-template .col-lg-10,
        .mobile-preview .modern-template .col-md-6,
        .mobile-preview .modern-template .col-md-4 {
          width: 100% !important; flex: 0 0 100% !important; max-width: 100% !important;
        }

        .mobile-preview .modern-template h1 { font-size: 1.8rem !important; }
        .mobile-preview .modern-template .navbar .d-lg-flex { display: none !important; }
        .mobile-preview .modern-template .modern-btn { width: 100%; justify-content: center; }
        .mobile-preview .modern-template .glass-card { padding: 1.5rem !important; }
        .mobile-preview .modern-template section[style*="min-height: 80vh"] { min-height: auto !important; }
      `}} />

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg sticky-top py-3 z-[1000]" style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container px-3 d-flex justify-content-between align-items-center">
          <a className="navbar-brand d-flex align-items-center gap-2 no-underline" href="#">
            <div style={{ width: '40px', height: '40px', flexShrink: 0 }}>
              <EditableImage
                src={projectData.hero.logoImage || "https://placehold.co/100x100?text=Logo"}
                onChange={(val) => updateHero({ logoImage: val })}
                className="w-full h-full rounded-none bg-white/5 border border-dashed border-white/10"
                style={{ objectFit: 'contain' }}
                alt="Brand Logo"
              />
            </div>
            <EditableText tagName="span" className="fs-4 fw-bold logo gradient-text" value={projectData.productName} onChange={() => { }} />
          </a>
          <div className="d-none d-lg-flex align-items-center gap-4">
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
                  className="nav-link fw-medium cursor-pointer p-0 no-underline"
                  style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}
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
              <button className="modern-btn modern-btn-primary">
                <EditableText tagName="span" value="Order Now" onChange={() => { }} />
                <IconEditor value={projectData.hero.icon || "fa-solid fa-arrow-right"} onChange={(val) => updateHero({ icon: val })} />
              </button>
            </Linkable>
          </div>
          <div className="d-flex align-items-center gap-2 d-lg-none">
            <Linkable link={projectData.hero.buttonHref} onLinkChange={(val) => updateHero({ buttonHref: val })}>
              <button className="modern-btn modern-btn-primary py-2 px-3 text-nowrap" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', width: 'auto', whiteSpace: 'nowrap' }}>
                <EditableText tagName="span" value={projectData.hero.buttonText} onChange={() => { }} />
              </button>
            </Linkable>
            <button className="border-none bg-transparent p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <div className="d-flex flex-column gap-1">
                <div className="rounded" style={{ width: '24px', height: '3px', background: secondary }}></div>
                <div className="rounded" style={{ width: '24px', height: '3px', background: secondary }}></div>
                <div className="rounded" style={{ width: '24px', height: '3px', background: secondary }}></div>
              </div>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="d-lg-none w-100 p-4 d-flex flex-column align-items-center gap-3" style={{ background: 'rgba(10,10,10,0.95)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {projectData.navbar?.links.map((link, i) => (
              <a key={i} href={link.href} className="fs-6 fw-bold no-underline" style={{ color: 'rgba(255,255,255,0.7)' }} onClick={() => setIsMenuOpen(false)}>{link.label}</a>
            ))}
            <button className="modern-btn modern-btn-primary w-100">
              <EditableText tagName="span" value="Order Now" onChange={() => { }} />
            </button>
          </div>
        )}
      </nav>

      {/* Hero - Full Width Dark with Gradient Accents */}
      <section className="section-dark py-5" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-7 text-center text-lg-start">
              <div className="mb-3">
                <span className="px-4 py-1.5 rounded-none text-[11px] fw-bold uppercase tracking-widest" style={{ background: `${secondary}20`, color: secondary, border: `1px solid ${secondary}40` }}>
                  ✦ Premium Blood Support Formula
                </span>
              </div>
              <EditableText tagName="h1" value={projectData.hero.title} onChange={(val) => updateHero({ title: val })} className="fw-bold mb-4 gradient-text" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1 }} />
              <EditableText tagName="p" value={projectData.hero.subtitle} onChange={(val) => updateHero({ subtitle: val })} className="hero-subtitle mb-5 mx-auto mx-lg-0" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, maxWidth: '550px', fontSize: '0.95rem' }} />
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                <Linkable link={projectData.hero.buttonHref} onLinkChange={(val) => updateHero({ buttonHref: val })}>
                  <button className="modern-btn modern-btn-primary">
                    <EditableText tagName="span" value={projectData.hero.buttonText} onChange={(val) => updateHero({ buttonText: val })} />
                    <IconEditor value={projectData.hero.icon || "fa-solid fa-cart-shopping"} onChange={(val) => updateHero({ icon: val })} />
                  </button>
                </Linkable>
                <Linkable link={projectData.hero.secondaryButtonHref || ''} onLinkChange={(val) => updateHero({ secondaryButtonHref: val })}>
                  <button className="modern-btn modern-btn-outline">
                    <EditableText tagName="span" value={projectData.hero.secondaryButtonText || 'Learn More'} onChange={(val) => updateHero({ secondaryButtonText: val })} />
                  </button>
                </Linkable>
              </div>
              {/* Logos */}
              <div className="d-flex flex-wrap gap-3 mt-5 justify-content-center justify-content-lg-start" style={{ opacity: 0.4 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ width: '50px', height: '50px', filter: 'brightness(0) invert(1)' }}>
                    <EditableImage src={projectData.logos?.[i] || `/image/logo-${i + 1}.webp`} onChange={(val) => { const nl = [...(projectData.logos || [])]; nl[i] = val; useStore.getState().updateProjectData({ logos: nl }); }} className="img-fluid" />
                  </div>
                ))}
              </div>
            </div>
            <div className="col-12 col-lg-5 text-center">
              <div className="p-4 rounded-[2rem]" style={{ background: `linear-gradient(135deg, ${primary}40, transparent)` }}>
                <EditableImage src={projectData.hero.image || '/image/index-img.webp'} onChange={(val) => updateHero({ image: val })} className="img-fluid mx-auto d-block" style={{ maxHeight: '450px', objectFit: 'contain' }} alt="Product" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      {projectData.sections?.features !== false && (
        <section className="section-darker py-5 relative group/section">
          <SectionSettings sectionKey="features" />
          <div className="container">
            <EditableText tagName="h2" className="text-center fw-bold mb-2 gradient-text" style={{ fontSize: '2rem' }} value={projectData.featuresTitle || "What Sets Us Apart"} onChange={(val) => useStore.getState().updateProjectData({ featuresTitle: val })} />
            <p className="text-center mb-5" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem' }}>Science-backed ingredients. Zero compromises.</p>
            <div className="row g-4 justify-content-center">
              {projectData.features?.map((feature, i) => (
                <div key={i} className="col-12 col-sm-6 col-lg-3">
                  <div className="glass-card p-4 h-100 text-center relative">
                    <RemoveButton onClick={() => removeFeature(i)} />
                    <EditableImage src={feature.image || '/image/gmo.webp'} onChange={(val) => updateFeature(i, { image: val })} className="img-fluid mx-auto mb-3" style={{ height: '80px', objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.7 }} />
                    <EditableText tagName="h4" className="fw-bold mb-2" style={{ color: '#fff', fontSize: '1rem' }} value={feature.title} onChange={(val) => updateFeature(i, { title: val })} />
                    <EditableText tagName="p" className="mb-0" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.6 }} value={feature.description} onChange={(val) => updateFeature(i, { description: val })} />
                  </div>
                </div>
              ))}
            </div>
            <AddButton onClick={addFeature} label="Feature" />
          </div>
        </section>
      )}

      {/* About */}
      {projectData.sections?.about !== false && (
        <section className="section-dark py-5 relative group/section">
          <SectionSettings sectionKey="about" />
          <div className="container">
            <EditableText tagName="h2" className="text-center fw-bold mb-5 gradient-text" style={{ fontSize: '2rem' }} value={projectData.about.title || "The Formula"} onChange={(val) => updateAbout({ title: val })} />
            <div className="row align-items-center g-5">
              <div className="col-12 col-lg-5 text-center">
                <div className="glass-card p-4">
                  <EditableImage src={projectData.about.image || '/image/banner-img.webp'} onChange={(val) => updateAbout({ image: val })} className="img-fluid rounded-3" style={{ maxHeight: '400px', objectFit: 'contain' }} />
                </div>
              </div>
              <div className="col-12 col-lg-7">
                <EditableText tagName="div" value={projectData.about.description} onChange={(val) => updateAbout({ description: val })} style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, fontSize: '0.95rem', whiteSpace: 'pre-line' }} />
              </div>
            </div>
          </div>
        </section>
      )}
      {/* Research */}
      {projectData.research && projectData.sections?.research !== false && (
        <section className="section-darker py-5 border-t border-white/5 relative group/section">
          <SectionSettings sectionKey="research" />
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <EditableText tagName="h2" className="fw-bold fs-1 mb-4 gradient-text" style={{ fontSize: '2.5rem' }} value={projectData.research.title} onChange={(val) => updateResearch({ title: val })} />
                <EditableText tagName="p" className="fs-5 text-white mb-4 opacity-75" value={projectData.research.subtitle} onChange={(val) => updateResearch({ subtitle: val })} />
                <EditableText tagName="div" className="text-white-50 mb-5" style={{ lineHeight: 1.9, fontSize: '0.95rem' }} value={projectData.research.description} onChange={(val) => updateResearch({ description: val })} />
                <div className="row g-4">
                  {projectData.research.stats.map((stat, i) => (
                    <div key={i} className="col-4">
                      <EditableText tagName="div" className="fw-bold fs-2" style={{ color: secondary }} value={stat.value} onChange={(val) => {
                        const ns = [...projectData.research!.stats];
                        ns[i] = { ...stat, value: val };
                        updateResearch({ stats: ns });
                      }} />
                      <EditableText tagName="div" className="text-white-50 small uppercase font-black tracking-widest" style={{ fontSize: '10px' }} value={stat.label} onChange={(val) => {
                        const ns = [...projectData.research!.stats];
                        ns[i] = { ...stat, label: val };
                        updateResearch({ stats: ns });
                      }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-6">
                <div className="glass-card p-2 text-center">
                  <EditableImage src={projectData.research.image} onChange={(val) => updateResearch({ image: val })} className="img-fluid rounded-3" style={{ maxHeight: '450px', width: 'auto', objectFit: 'contain' }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {projectData.sections?.testimonials !== false && (
        <section className="section-dark py-5 relative group/section">
          <SectionSettings sectionKey="testimonials" />
          <div className="container">
            <div className="text-center mb-5">
              <span className="px-4 py-1.5 rounded-none text-[10px] fw-bold uppercase tracking-[0.3em] mb-3 d-inline-block" style={{ background: `${secondary}10`, color: secondary, border: `1px solid ${secondary}30` }}>Proof of Concept</span>
              <EditableText tagName="h2" className="fw-bold gradient-text" style={{ fontSize: '2.5rem' }} value={projectData.testimonials?.title || "Community Feedback"} onChange={(val) => updateTestimonials(-1, { title: val })} />
            </div>
            <div className="row g-4">
              {projectData.testimonials?.items.map((item, i) => (
                <div key={i} className="col-12 col-md-4">
                  <div className="glass-card p-5 h-100 relative group/card">
                    <RemoveButton onClick={() => removeTestimonial(i)} />
                    <div className="mb-4 d-flex align-items-center gap-3">
                      <div className="w-12 h-12 rounded-none overflow-hidden border border-white/10 p-0.5">
                        <EditableImage src={item.image || "https://i.pravatar.cc/150"} onChange={(val) => updateTestimonials(i, { image: val })} className="w-100 h-100 object-cover grayscale group-hover/card:grayscale-0 transition-all duration-500" />
                      </div>
                      <div>
                        <EditableText tagName="h5" className="fw-bold mb-0 text-white text-sm" value={item.name} onChange={(val) => updateTestimonials(i, { name: val })} />
                        <EditableText tagName="p" className="mb-0 text-[10px] text-white/40 uppercase tracking-widest font-mono" value={item.role || ""} onChange={(val) => updateTestimonials(i, { role: val })} />
                      </div>
                    </div>
                    <div className="mb-4 d-flex gap-1 text-yellow-500 text-[10px]">
                      {[...Array(5)].map((_, si) => <i key={si} className="fa-solid fa-star"></i>)}
                    </div>
                    <EditableText tagName="p" className="mb-0 text-white/60 italic text-sm" style={{ lineHeight: 1.8 }} value={item.content} onChange={(val) => updateTestimonials(i, { content: val })} />
                  </div>
                </div>
              ))}
            </div>
            <AddButton onClick={addTestimonial} label="Testimonial" />
          </div>
        </section>
      )}

      {/* Gallery */}
      {projectData.gallery && projectData.sections?.gallery !== false && (
        <section className="section-darker py-5 border-t border-white/5 relative group/section">
          <SectionSettings sectionKey="gallery" />
          <div className="container">
            <EditableText tagName="h2" className="text-center fw-bold mb-2 gradient-text" style={{ fontSize: '2.5rem' }} value={projectData.gallery.title} onChange={(val) => updateGallery({ title: val })} />
            <EditableText tagName="p" className="text-center mb-5 text-white/50" style={{ fontSize: '1rem' }} value={projectData.gallery.subtitle} onChange={(val) => updateGallery({ subtitle: val })} />
            <div className="row g-3">
              {projectData.gallery.images.map((img, i) => (
                <div key={i} className="col-12 col-md-4">
                  <div className="glass-card p-1 overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <EditableImage src={img} onChange={(val) => {
                      const ni = [...projectData.gallery!.images];
                      ni[i] = val;
                      updateGallery({ images: ni });
                    }} className="w-100 h-100 rounded-3" style={{ objectFit: 'cover', maxHeight: '250px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      {projectData.sections?.benefits !== false && (
        <section className="section-darker py-5 relative group/section">
          <SectionSettings sectionKey="benefits" />
          <div className="container">
            <EditableText tagName="h2" className="text-center fw-bold mb-2 gradient-text" style={{ fontSize: '2rem' }} value={projectData.benefits.title || "Benefits"} onChange={(val) => updateBenefit(-1, { title: val })} />
            <EditableText tagName="p" className="text-center mb-5 mx-auto" style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '700px', fontSize: '0.9rem' }} value={projectData.benefits.description} onChange={(val) => updateBenefit(-1, { description: val })} />
            <div className="row g-4">
              {projectData.benefits?.items?.map((benefit, i) => (
                <div key={i} className="col-12 col-md-6 relative">
                  <div className="glass-card p-4 h-100">
                    <RemoveButton onClick={() => removeBenefit(i)} />
                    <div className="d-flex align-items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-none d-flex align-items-center justify-content-center" style={{ background: `${secondary}15` }}>
                        <i className="fa-solid fa-check" style={{ color: secondary, fontSize: '0.8rem' }}></i>
                      </div>
                      <div>
                        <EditableText tagName="h4" className="fw-bold mb-1" style={{ color: '#fff', fontSize: '1rem' }} value={benefit.title} onChange={(val) => updateBenefit(i, { title: val })} />
                        <EditableText tagName="p" className="mb-0" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.6 }} value={benefit.description} onChange={(val) => updateBenefit(i, { description: val })} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <AddButton onClick={addBenefit} label="Benefit" />
          </div>
        </section>
      )}

      {/* Guarantee */}
      {projectData.sections?.guarantee !== false && (
        <section className="py-5 relative group/section" style={{ background: `linear-gradient(135deg, ${primary}30, #0a0a0a)` }}>
          <SectionSettings sectionKey="guarantee" />
          <div className="container">
            <div className="glass-card p-5">
              <div className="row align-items-center g-5">
                <div className="col-lg-4 text-center">
                  <EditableImage src={projectData.footer.trustImage || '/image/money-back-guarantee-..webp'} onChange={(val) => updateFooter({ trustImage: val })} className="img-fluid mb-3" style={{ maxWidth: '200px' }} />
                  <EditableText tagName="p" className="fw-semibold mb-0" style={{ color: secondary, fontSize: '0.9rem' }} value={projectData.guaranteeSubtitle || "Zero Risk"} onChange={(val) => useStore.getState().updateProjectData({ guaranteeSubtitle: val })} />
                </div>
                <div className="col-lg-8">
                  <EditableText tagName="h3" className="fw-bold mb-3" style={{ color: '#fff', fontSize: '1.6rem' }} value={projectData.guaranteeHeadline || "60-Day Money Back"} onChange={(val) => useStore.getState().updateProjectData({ guaranteeHeadline: val })} />
                  <EditableText tagName="p" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, fontSize: '0.95rem' }} value={projectData.guaranteeDescription || `Your happiness is our highest priority. Every order of ${projectData.productName} comes protected by a comprehensive 60-day satisfaction promise. If you are not completely satisfied with the results, simply contact our support team for a full refund.`} onChange={(val) => useStore.getState().updateProjectData({ guaranteeDescription: val })} />
                  <Linkable link={projectData.hero.buttonHref} onLinkChange={() => { }}>
                    <button className="modern-btn modern-btn-primary mt-3">Claim Your Package <i className="fa-solid fa-arrow-right"></i></button>
                  </Linkable>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Ingredients */}
      {projectData.sections?.ingredients !== false && (
        <section className="section-dark py-5 relative group/section">
          <SectionSettings sectionKey="ingredients" />
          <div className="container">
            <EditableText tagName="h2" className="text-center fw-bold mb-5 gradient-text" style={{ fontSize: '2rem' }} value={projectData.ingredients.title || "Natural Ingredients"} onChange={(val) => updateIngredient(-1, { title: val })} />
            <div className="row g-4 justify-content-center">
              {projectData.ingredients?.items?.map((item, i) => (
                <div key={i} className="col-12 col-md-6 col-lg-4">
                  <div className="glass-card p-4 h-100 text-center relative">
                    <RemoveButton onClick={() => removeIngredient(i)} />
                    <div className="mx-auto mb-3 rounded-none overflow-hidden" style={{ width: '120px', height: '120px', border: `3px solid ${secondary}30` }}>
                      <EditableImage src={item.image || '/image/ingredient-schisandra.png'} onChange={(val) => updateIngredient(i, { image: val })} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                    </div>
                    <EditableText tagName="h4" className="fw-bold mb-2" style={{ color: '#fff', fontSize: '1rem' }} value={item.title} onChange={(val) => updateIngredient(i, { title: val })} />
                    <EditableText tagName="p" className="mb-0" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.6 }} value={item.description} onChange={(val) => updateIngredient(i, { description: val })} />
                  </div>
                </div>
              ))}
            </div>
            <AddButton onClick={addIngredient} label="Ingredient" />
          </div>
        </section>
      )}

      {/* Pricing - Always Visible for Conversion */}
      <section className="section-darker py-5" id="pricing">
        <div className="container">
          <EditableText tagName="h2" className="text-center fw-bold mb-5 gradient-text" style={{ fontSize: '2rem' }} value={projectData.pricingTitle || "Choose Your Plan"} onChange={(val) => useStore.getState().updateProjectData({ pricingTitle: val })} />
          <div className="row g-4 justify-content-center">
            {projectData.pricing?.map((plan, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4 relative">
                <RemoveButton onClick={() => removePricing(i)} />
                <div className="glass-card p-4 h-100 text-center"
                  style={{ border: plan.isPrimary ? `2px solid ${secondary}` : undefined, transform: plan.isPrimary ? 'scale(1.03)' : undefined }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSchemaEditor({ i, x: e.clientX, y: e.clientY });
                  }}
                  title="Right-click to edit Product Schema (GTIN, SKU, etc.)"
                >
                  {schemaEditor?.i === i && (
                    <>
                      <div className="fixed inset-0 z-[99998]" onClick={() => setSchemaEditor(null)} />
                      <SchemaEditor
                        plan={plan}
                        onClose={() => setSchemaEditor(null)}
                        onChange={(val) => updatePricing(i, val)}
                        x={schemaEditor.x}
                        y={schemaEditor.y}
                      />
                    </>
                  )}
                  {plan.isPrimary && <div className="mb-3"><span className="px-3 py-1 rounded-none text-[10px] fw-bold" style={{ background: secondary, color: primary }}>BEST VALUE</span></div>}
                  <EditableText tagName="h4" className="fw-bold mb-2 text-uppercase" style={{ color: '#fff', fontSize: '0.95rem', letterSpacing: '2px' }} value={plan.title} onChange={(val) => updatePricing(i, { title: val })} />
                  <div className="relative my-3 group/img">
                    {/* Futuristic Multiplier Badge */}
                    <div className="absolute -top-1 -right-1 z-10 pointer-events-auto">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/20 translate-x-1 translate-y-1" />
                        <EditableText
                          className="relative bg-white text-black px-3 py-1 rounded-none flex items-center justify-center font-black text-xs border border-black shadow-[0_0_15px_rgba(255,255,255,0.3)] min-w-[40px]"
                          value={plan.multiplier || "X1"}
                          onChange={(val) => updatePricing(i, { multiplier: val })}
                        />
                      </div>
                    </div>
                    <EditableImage src={plan.image || '/image/bottle-snap.webp'} onChange={(val) => updatePricing(i, { image: val })} className="img-fluid mx-auto transition-all duration-700 group-hover/img:scale-110 group-hover/img:rotate-2" style={{ height: '140px', objectFit: 'contain' }} />
                  </div>
                  <div className="flex justify-center items-baseline gap-1 mb-3">
                    <EditableText tagName="span" className="fw-bold" style={{ color: secondary, fontSize: '2rem' }} value={plan.price} onChange={(val) => updatePricing(i, { price: val })} />
                  </div>
                  <div className="mb-4">
                    {plan.features.map((f, fi) => (
                      <div key={fi} className="mb-2 d-flex align-items-center gap-2 justify-content-center" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                        <i className="fa-solid fa-check-circle" style={{ color: secondary, fontSize: '0.7rem' }}></i>
                        <EditableText tagName="span" value={f} onChange={(val) => { const nf = [...plan.features]; nf[fi] = val; updatePricing(i, { features: nf }); }} />
                      </div>
                    ))}
                  </div>
                  <Linkable link={plan.buttonHref} onLinkChange={() => { }}>
                    <button className={`modern-btn w-100 ${plan.isPrimary ? 'modern-btn-primary' : 'modern-btn-outline'}`} style={{ justifyContent: 'center' }}>
                      <EditableText tagName="span" value={plan.buttonText} onChange={(val) => updatePricing(i, { buttonText: val })} />
                    </button>
                  </Linkable>
                </div>
              </div>
            ))}
          </div>
          <AddButton onClick={addPricing} label="Plan" />
        </div>
      </section>

      {/* FAQ */}
      {projectData.sections?.faq !== false && (
        <section className="section-dark py-5 relative group/section">
          <SectionSettings sectionKey="faq" />
          <div className="container" style={{ maxWidth: '800px' }}>
            <EditableText tagName="h2" className="text-center fw-bold mb-5 gradient-text" style={{ fontSize: '2rem' }} value={projectData.faqTitle || "FAQ"} onChange={(val) => useStore.getState().updateProjectData({ faqTitle: val })} />
            {projectData.faq?.map((item, i) => (
              <div key={i} className="glass-card mb-3 relative">
                <RemoveButton onClick={() => removeFAQ(i)} />
                <div className="p-4 cursor-pointer d-flex justify-content-between align-items-center" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <EditableText tagName="span" className="fw-bold" style={{ color: '#fff', fontSize: '0.95rem' }} value={item.question} onChange={(val) => updateFAQ(i, { question: val })} />
                  <i className={`fa-solid fa-chevron-down transition-transform ${openFaq === i ? 'rotate-180' : ''}`} style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}></i>
                </div>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <EditableText tagName="p" className="mb-0" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', lineHeight: 1.7 }} value={item.answer} onChange={(val) => updateFAQ(i, { answer: val })} />
                  </div>
                )}
              </div>
            ))}
            <AddButton onClick={addFAQ} label="FAQ" />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-5 text-center" style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container">
          <EditableText tagName="h2" className="fw-bold gradient-text mb-3" style={{ fontSize: '1.5rem' }} value={projectData.footerHeadline || "Final Thoughts"} onChange={(val) => useStore.getState().updateProjectData({ footerHeadline: val })} />
          <EditableText tagName="p" className="mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.35)', maxWidth: '700px', fontSize: '0.9rem', lineHeight: 1.7 }} value={projectData.footer.companyInfo} onChange={(val) => updateFooter({ companyInfo: val })} />
          <hr style={{ borderColor: 'rgba(255,255,255,0.05)' }} className="my-4" />
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {projectData.footer.links.map((link, i) => (
              <div key={i} className="relative group/linkitem">
                <RemoveButton onClick={() => {
                  const nl = [...projectData.footer.links];
                  nl.splice(i, 1);
                  updateFooter({ links: nl });
                }} />
                <Linkable link={link.href} onLinkChange={(val) => { const nl = [...projectData.footer.links]; nl[i] = { ...nl[i], href: val }; updateFooter({ links: nl }); }}>
                  <EditableText tagName="span" className="text-white/40 hover:text-white transition-colors cursor-pointer text-sm font-mono uppercase tracking-widest" value={link.label} onChange={(val) => { const nl = [...projectData.footer.links]; nl[i] = { ...nl[i], label: val }; updateFooter({ links: nl }); }} />
                </Linkable>
              </div>
            ))}
          </div>
          <AddButton onClick={() => updateFooter({ links: [...projectData.footer.links, { label: 'New Link', href: '#' }] })} label="Footer Link" />
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>© {new Date().getFullYear()} {projectData.productName}. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Section Manager */}
      <div className="p-8 border-t border-dashed border-white/10 text-center" style={{ background: '#080808' }}>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-6">Manage Page Sections</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {Object.entries(projectData.sections || {}).map(([key, visible]) => (
            <button
              key={key}
              onClick={() => updateSectionVisibility(key as any, !visible)}
              className={`px-4 py-2 text-[10px] font-bold rounded-none uppercase transition-all flex items-center gap-2 border-none shadow-sm ${visible ? 'bg-white/5 text-white/40' : 'bg-blue-600 text-white hover:scale-105'}`}
            >
              <i className={`fa-solid ${visible ? 'fa-eye-slash' : 'fa-plus'}`}></i>
              {visible ? 'Hide' : 'Add'} {key}
            </button>
          ))}
        </div>
      </div>

      {/* Purchase Proof Popup */}
      {projectData.socialProof?.enabled && (
        <div 
          className={`purchase-proof ${showProof ? 'active' : ''} group/proof cursor-pointer hover:border-blue-500/50 transition-colors glass-card p-3 d-flex align-items-center gap-3`}
          style={{ width: '320px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}
          onClick={() => setShowProofSettings(true)}
        >
          <div className="absolute -top-10 left-0 bg-blue-600 text-white text-[9px] font-bold px-2 py-1.5 rounded-sm opacity-0 group-hover/proof:opacity-100 transition-all shadow-xl pointer-events-none">
            <i className="fa-solid fa-gear mr-1"></i> Edit Popup Settings
          </div>
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/5">
            <img
              src={projectData.hero.image || '/image/banner-img.webp'}
              className="w-100 h-100 object-contain"
              alt="Product"
            />
          </div>
          <div className="flex flex-col">
            <div className="text-yellow-500 text-[8px] mb-1">
              {[...Array(5)].map((_, si) => <i key={si} className="fa-solid fa-star"></i>)}
            </div>
            <div className="text-white/90 text-xs leading-tight">
              <strong>{proof?.name}</strong> in <strong>{proof?.state}</strong> <br/>
              just bought <strong>{proof?.bottleCount}</strong>
            </div>
            <small className="text-white/30 text-[9px] mt-1">{proof?.timeAgo}m ago • Verified Buyer</small>
          </div>
        </div>
      )}

      {/* Social Proof Settings Modal */}
      {showProofSettings && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowProofSettings(false)}></div>
          <div className="bg-[#111] w-full max-w-xl rounded-none shadow-2xl z-10 overflow-hidden border border-white/10 animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-white/10 d-flex justify-content-between align-items-center">
              <h3 className="m-0 fs-6 fw-bold text-white uppercase tracking-widest">Popup Configuration</h3>
              <button onClick={() => setShowProofSettings(false)} className="border-none bg-transparent text-white/40 hover:text-white">
                <i className="fa-solid fa-times fs-5"></i>
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10">
                <span className="text-xs font-bold text-white/60 uppercase">Display Widget</span>
                <button 
                  onClick={() => updateSocialProof({ enabled: !projectData.socialProof?.enabled })}
                  className={`px-4 py-1.5 rounded-none text-[10px] font-bold transition-all border-none ${projectData.socialProof?.enabled ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/40'}`}
                >
                  {projectData.socialProof?.enabled ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="text-[10px] font-bold text-white/30 uppercase mb-1 block">Display Duration (ms)</label>
                  <input type="number" className="w-full p-2 bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-blue-500" value={projectData.socialProof?.displayTime} onChange={(e) => updateSocialProof({ displayTime: parseInt(e.target.value) })} />
                </div>
                <div className="col-md-6">
                  <label className="text-[10px] font-bold text-white/30 uppercase mb-1 block">Interval (ms)</label>
                  <input type="number" className="w-full p-2 bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-blue-500" value={projectData.socialProof?.interval} onChange={(e) => updateSocialProof({ interval: parseInt(e.target.value) })} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/30 uppercase mb-1 block">Names</label>
                <textarea className="w-full p-2 bg-white/5 border border-white/10 text-white text-sm h-20 outline-none focus:border-blue-500 font-mono" value={projectData.socialProof?.names.join('\n')} onChange={(e) => updateSocialProof({ names: e.target.value.split('\n').filter(s => s.trim()) })} />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/30 uppercase mb-1 block">Locations</label>
                <textarea className="w-full p-2 bg-white/5 border border-white/10 text-white text-sm h-20 outline-none focus:border-blue-500 font-mono" value={projectData.socialProof?.locations.join('\n')} onChange={(e) => updateSocialProof({ locations: e.target.value.split('\n').filter(s => s.trim()) })} />
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/30 uppercase mb-1 block">Products</label>
                <textarea className="w-full p-2 bg-white/5 border border-white/10 text-white text-sm h-20 outline-none focus:border-blue-500 font-mono" value={projectData.socialProof?.products.join('\n')} onChange={(e) => updateSocialProof({ products: e.target.value.split('\n').filter(s => s.trim()) })} />
              </div>
            </div>
            <div className="p-4 border-t border-white/10 text-right">
              <button onClick={() => setShowProofSettings(false)} className="bg-white text-black px-6 py-2 text-[10px] font-bold uppercase tracking-widest border-none hover:bg-gray-200 transition-all">Apply Settings</button>
            </div>
          </div>
        </div>
      )}

      {/* Back to top */}
      <button className="position-fixed bottom-4 right-4 w-12 h-12 rounded-none flex items-center justify-center z-50 border-none transition-all hover:-translate-y-1" style={{ background: secondary, color: primary }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <i className="fa-solid fa-arrow-up"></i>
      </button>
    </div>
  );
};
