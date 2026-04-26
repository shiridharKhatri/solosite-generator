'use client';

import React, { useEffect, useState } from 'react';
import { EditableText } from '../editor/EditableText';
import { EditableImage } from '../editor/EditableImage';
import { useStore, type ProjectData } from '@/lib/store';

// Reusable helpers
const RemoveButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="absolute -top-3 -right-3 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white w-8 h-8 rounded-none flex items-center justify-center transition-all z-20 shadow-sm border border-red-200">
    <i className="fa-solid fa-xmark text-sm"></i>
  </button>
);

const IconEditor = ({ value, onChange, className = "" }: { value: string; onChange: (val: string) => void, className?: string }) => {
  const icons = ["fa-solid fa-stethoscope", "fa-solid fa-heart-pulse", "fa-solid fa-shield-halved", "fa-solid fa-pills", "fa-solid fa-flask", "fa-solid fa-notes-medical"];
  const cycleIcon = () => { const idx = icons.indexOf(value || icons[0]); onChange(icons[(idx + 1) % icons.length]); };
  return <i className={`${value || icons[1]} cursor-pointer hover:scale-110 transition-transform text-current ${className}`} onClick={(e) => { e.stopPropagation(); cycleIcon(); }} title="Click to toggle icon" />;
};

const LinkSettings = ({ link, onChange, onClose, x, y }: { link: string; onChange: (val: string) => void, onClose: () => void, x: number, y: number }) => (
  <div className="fixed bg-white rounded-none shadow-xl border border-blue-100 p-4 z-[99999] w-72 animate-in fade-in" style={{ left: x, top: y }} onClick={(e) => e.stopPropagation()}>
    <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
      <span className="text-xs font-bold text-blue-900"><i className="fa-solid fa-link mr-2"></i>Configure Path</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><i className="fa-solid fa-times"></i></button>
    </div>
    <input type="text" placeholder="Destination URI..." className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500 font-mono" value={link || ''} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const SchemaEditor = ({ plan, onChange, onClose, x, y }: { plan: any; onChange: (val: any) => void, onClose: () => void, x: number, y: number }) => (
  <div className="fixed bg-white rounded-none shadow-2xl border border-blue-200 p-4 z-[99999] w-80 animate-in zoom-in-95 duration-200 text-left" style={{ left: Math.min(x, typeof window !== 'undefined' ? window.innerWidth - 340 : x), top: Math.min(y, typeof window !== 'undefined' ? window.innerHeight - 400 : y) }} onClick={(e) => e.stopPropagation()}>
    <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
      <span className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-barcode text-blue-600"></i> Product Schema</span>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors"><i className="fa-solid fa-times"></i></button>
    </div>
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">GTIN / Barcode</label>
        <input type="text" className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500/20 outline-none font-mono" value={plan.gtin || ''} onChange={(e) => onChange({ gtin: e.target.value })} placeholder="e.g. 5901234123457" />
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Category</label>
        <input type="text" className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500/20 outline-none" value={plan.category || ''} onChange={(e) => onChange({ category: e.target.value })} placeholder="e.g. Consumable" />
      </div>
      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">SKU</label>
        <input type="text" className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500/20 outline-none font-mono" value={plan.sku || ''} onChange={(e) => onChange({ sku: e.target.value })} placeholder="e.g. BATT-X001" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">UNCL Code</label>
          <input type="text" className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500/20 outline-none font-mono" value={plan.unclCode || ''} onChange={(e) => onChange({ unclCode: e.target.value })} placeholder="e.g. 711" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Role</label>
          <input type="text" className="w-full text-sm p-2 bg-slate-50 border border-slate-200 rounded focus:ring-2 focus:ring-blue-500/20 outline-none" value={plan.productRole || ''} onChange={(e) => onChange({ productRole: e.target.value })} placeholder="e.g. Consumable" />
        </div>
      </div>
    </div>
    <p className="mt-4 text-[9px] text-slate-400 italic">Details used for automatic SEO JSON-LD generation.</p>
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
    }} className={`relative group/link ${className}`} title={onContextMenu ? "Right-click for options" : "Right-click to modify destination"}>
      {children}
      {showSettings && (<><div className="fixed inset-0 z-[99998]" onClick={() => setShowSettings(false)} /><LinkSettings link={link} onChange={onLinkChange} onClose={() => setShowSettings(false)} x={pos.x} y={pos.y} /></>)}
      <div className="absolute -top-3 -right-3 opacity-0 group-hover/link:opacity-100 transition-opacity bg-blue-600 text-white w-5 h-5 rounded-none flex items-center justify-center shadow-lg z-50 pointer-events-none">
        <i className="fa-solid fa-link text-[8px]"></i>
      </div>
      {link && <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/link:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none font-mono">↗ {link}</div>}
    </div>
  );
};

export const ClinicalTemplate: React.FC = () => {
  const {
    projectData, updateHero, updateAbout, updateFeature, addFeature, removeFeature,
    updateIngredient, addIngredient, removeIngredient, updateBenefit, addBenefit, removeBenefit,
    updatePricing, addPricing, removePricing, updateFAQ, addFAQ, removeFAQ,
    updateFooter, updateTestimonials, addTestimonial, removeTestimonial,
    updateResearch, updateGallery, updateNavbar,
    updateSocialProof, updateSectionVisibility, updateLegalPage, updateProjectData,
    showLegalModal, setShowLegalModal
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
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="text-blue-900 bg-blue-50 hover:bg-blue-100 text-sm font-semibold py-2 px-6 rounded transition-colors flex items-center gap-2 mx-auto my-8 border border-blue-200">
      <i className="fa-solid fa-plus-circle"></i> Add {label} Section
    </button>
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const primary = projectData.theme?.primary || '#0a2540';
  const secondary = projectData.theme?.secondary || '#0070f3';

  return (
    <div className="clinical-template relative bg-slate-50 text-slate-800 font-sans">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" />

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        .clinical-template { font-family: 'Roboto', sans-serif; }
        .clinical-template h1, .clinical-template h2, .clinical-template h3, .clinical-template h4, .clinical-template .logo { font-family: 'IBM Plex Sans', sans-serif !important; }

        .clinical-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .purchase-proof {
          position: fixed;
          bottom: 30px;
          left: 30px;
          background: #ffffff;
          border-radius: 8px;
          padding: 12px 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          font-size: 13px;
          max-width: 320px;
          z-index: 9999;
          transform: translateX(-150%);
          transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          display: flex;
          align-items: center;
          gap: 12px;
          border-left: 4px solid ${secondary};
        }
        .purchase-proof.active {
          transform: translateX(0);
        }
        .clinical-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .clinical-btn {
          padding: 0.75rem 2rem;
          border-radius: 6px;
          font-weight: 500;
          font-size: 1rem;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          cursor: pointer;
        }
        .clinical-btn-primary { background: ${secondary}; color: #ffffff; border: 1px solid ${secondary}; }
        .clinical-btn-primary:hover { background: #0056b3; border-color: #0056b3; color: white; }
        .clinical-btn-outline { background: white; border: 1px solid #cbd5e1; color: #475569; }
        .clinical-btn-outline:hover { background: #f8fafc; border-color: ${secondary}; color: ${secondary}; }

        .clinical-header {
          position: relative;
          padding-left: 1rem;
          border-left: 4px solid ${secondary};
        }

        .data-label {
          font-family: 'IBM Plex Sans', monospace;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          margin-bottom: 0.5rem;
          display: block;
        }

        /* Override mobile preview sizing to match classic template logic */
        .mobile-preview .clinical-template .col-lg-5,
        .mobile-preview .clinical-template .col-lg-7,
        .mobile-preview .clinical-template .col-lg-4,
        .mobile-preview .clinical-template .col-lg-6,
        .mobile-preview .clinical-template .col-md-6 {
          width: 100% !important; flex: 0 0 100% !important; max-width: 100% !important;
        }

        @media (max-width: 768px) {
          .clinical-template h1 { font-size: 1.8rem !important; }
          .clinical-template .navbar .d-lg-flex, .clinical-template .navbar a.clinical-btn-primary { display: none !important; }
        }

        .mobile-preview .clinical-template h1 { font-size: 1.8rem !important; }
        .mobile-preview .clinical-template .navbar .d-lg-flex, .mobile-preview .clinical-template .navbar a.clinical-btn-primary { display: none !important; }
        .mobile-preview .clinical-template .clinical-card { padding: 1rem !important; }
      `}} />

      {/* Navbar - Strict Medical Aesthetic */}
      <nav className="navbar navbar-expand-lg sticky-top bg-white border-b border-slate-200 py-3 z-[1000]">
        <div className="container px-4 d-flex justify-content-between align-items-center">
          <a className="navbar-brand d-flex align-items-center gap-3 no-underline" href="#">
            <div style={{ width: '40px', height: '40px', flexShrink: 0 }}>
              <EditableImage
                src={projectData.hero.logoImage || "https://placehold.co/100x100?text=Logo"}
                onChange={(val) => updateHero({ logoImage: val })}
                className="w-full h-full rounded border border-dashed border-slate-200 bg-slate-50"
                style={{ objectFit: 'contain' }}
                alt="Brand Logo"
              />
            </div>
            <EditableText tagName="span" className="fs-5 fw-bold logo" style={{ color: primary }} value={projectData.productName} onChange={() => { }} />
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
                  className="nav-link fw-medium cursor-pointer p-0 text-slate-500 hover:text-slate-800 text-sm no-underline" 
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
            <div className="h-6 w-px bg-slate-200"></div>
            <Linkable link={projectData.hero.buttonHref} onLinkChange={(val) => updateHero({ buttonHref: val })}>
              <button className="clinical-btn clinical-btn-primary py-2 px-4 text-sm rounded-none shadow-sm">
                <IconEditor value={projectData.hero.icon || "fa-solid fa-shield-halved"} onChange={(val) => updateHero({ icon: val })} />
                <EditableText tagName="span" value="Patient Access" onChange={() => { }} />
              </button>
            </Linkable>
          </div>
          <div className="d-flex align-items-center gap-2 d-lg-none">
            <Linkable link={projectData.hero.buttonHref} onLinkChange={(val) => updateHero({ buttonHref: val })}>
              <button className="clinical-btn clinical-btn-primary py-2 px-3 text-sm rounded-none shadow-sm text-nowrap" style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                <EditableText tagName="span" value="Patient Access" onChange={() => { }} />
              </button>
            </Linkable>
            <button className="border-none bg-transparent p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} fs-2`} style={{ color: primary }}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="d-lg-none absolute top-full left-0 w-full p-4 d-flex flex-column align-items-center gap-3 z-[999] shadow-sm animate-in slide-in-from-top duration-300 border-top bg-white">
            {projectData.navbar?.links.map((link, i) => (
              <a key={i} href={link.href} className="fs-5 fw-bold no-underline text-slate-600" onClick={() => setIsMenuOpen(false)}>{link.label}</a>
            ))}
            <Linkable link={projectData.hero.buttonHref} onLinkChange={() => { }}>
              <button className="clinical-btn clinical-btn-primary w-100 mt-2 rounded-none">
                <EditableText tagName="span" value="Patient Access" onChange={() => { }} />
              </button>
            </Linkable>
          </div>
        )}
      </nav>

      {/* Hero - Data-Driven Split Layout */}
      <section className="bg-white border-b border-slate-200 py-5">
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6 text-center text-lg-start pe-lg-5">
              <span className="data-label text-blue-600 mb-3">CLINICAL PROFILE • VERIFIED</span>
              <EditableText tagName="h1" value={projectData.hero.title} onChange={(val) => updateHero({ title: val })} className="fw-bold mb-4" style={{ color: primary, fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.2, letterSpacing: '-0.02em' }} />
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-none mb-5">
                <EditableText tagName="p" value={projectData.hero.subtitle} onChange={(val) => updateHero({ subtitle: val })} className="mb-0 text-slate-600" style={{ lineHeight: 1.6, fontSize: '0.95rem' }} />
              </div>
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                <Linkable link={projectData.hero.buttonHref} onLinkChange={(val) => updateHero({ buttonHref: val })}>
                  <button className="clinical-btn clinical-btn-primary">
                    <EditableText tagName="span" value={projectData.hero.buttonText} onChange={(val) => updateHero({ buttonText: val })} />
                    <IconEditor value={projectData.hero.icon || "fa-solid fa-arrow-right"} onChange={(val) => updateHero({ icon: val })} />
                  </button>
                </Linkable>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="position-relative p-5 bg-slate-50 border border-slate-200 rounded-none text-center h-100 flex items-center justify-center min-h-[400px]">
                <EditableImage src={projectData.hero.image || '/image/index-img.webp'} onChange={(val) => updateHero({ image: val })} className="img-fluid position-relative z-10" style={{ maxHeight: '350px', objectFit: 'contain' }} alt="Formula" />
              </div>
            </div>
          </div>
          {/* Trust Indicators */}
          <div className="row mt-5 border-t border-slate-200 pt-4">
            <div className="col-12">
              <span className="data-label text-center mb-4">REGULATORY / SAFETY COMPLIANCE</span>
              <div className="d-flex justify-content-center flex-wrap gap-4 gap-md-5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" style={{ width: '60px' }}>
                    <EditableImage src={projectData.logos?.[i] || `/image/logo-${i + 1}.webp`} onChange={(val) => { const nl = [...(projectData.logos || [])]; nl[i] = val; updateProjectData({ logos: nl }); }} className="img-fluid" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Features Grid */}
      {projectData.sections?.features && (
        <section className="py-5 bg-slate-50 border-b border-slate-200 group/section relative">
          <SectionSettings sectionKey="features" />
          <div className="container py-lg-4">
          <span className="data-label text-center mb-2">EFFICACY METRICS</span>
          <EditableText tagName="h2" className="text-center fw-bold mb-5 clinical-header d-inline-block mx-auto border-0 px-0" style={{ color: primary }} value={projectData.featuresTitle || "Core Tolerances"} onChange={(val) => updateProjectData({ featuresTitle: val })} />

          <div className="row g-4">
            {projectData.features?.map((feature, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-3">
                <div className="clinical-card p-4 h-100 relative">
                  <RemoveButton onClick={() => removeFeature(i)} />
                  <div className="d-flex flex-column h-100">
                    <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                      <EditableText tagName="h4" className="fw-semibold mb-0" style={{ color: primary, fontSize: '1rem' }} value={feature.title} onChange={(val) => updateFeature(i, { title: val })} />
                      <EditableImage src={feature.image || '/image/gmo.webp'} onChange={(val) => updateFeature(i, { image: val })} className="h-8 w-8 object-contain opacity-50 grayscale" />
                    </div>
                    <EditableText tagName="p" className="mb-0 text-slate-600" style={{ fontSize: '0.85rem', lineHeight: 1.6 }} value={feature.description} onChange={(val) => updateFeature(i, { description: val })} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <AddButton onClick={addFeature} label="Metric" />
        </div>
      </section>
      )}

      {projectData.sections?.about && (
        <section className="bg-white py-4 border-b border-slate-200 group/section relative">
          <SectionSettings sectionKey="about" />
          <div className="container max-w-[1100px] mx-auto">
          <div className="clinical-header mb-4">
            <span className="data-label">PROTOCOL SUMMARY</span>
            <EditableText tagName="h2" className="fw-bold mb-0" style={{ color: primary, fontSize: '2.3rem' }} value={projectData.about.title || "The Formula"} onChange={(val) => updateAbout({ title: val })} />
          </div>

          <div className="clearfix">
            {/* Image Section - Floated Left for Newspaper/Journal Style */}
            <div className="float-lg-start me-lg-5 mb-4 col-12 col-lg-5 px-0">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded shadow-sm">
                <EditableImage src={projectData.about.image || '/image/banner-img.webp'} onChange={(val) => updateAbout({ image: val })} className="img-fluid rounded border border-slate-100 mx-auto" style={{ maxHeight: '380px', objectFit: 'contain' }} />
                <div className="text-center mt-2 pb-1">
                  <span className="data-label" style={{ fontSize: '10px' }}>FIG 1.1: SYSTEMIC DISPERSION PROFILE</span>
                </div>
              </div>
            </div>

            {/* Text Section - Wrapped around image */}
            <div className="protocol-text">
              <div className="p-3 bg-slate-50 border-l-2 border-slate-300 mb-3 d-flex gap-3 align-items-center">
                <i className="fa-solid fa-circle-info text-slate-400"></i>
                <p className="mb-0 text-[11px] font-mono text-slate-500 uppercase tracking-tight">Clinical Note: Data suggests 60-day adherence for optimal metabolic synchronization.</p>
              </div>
              <EditableText tagName="div" value={projectData.about.description} onChange={(val) => updateAbout({ description: val })} className="text-slate-700 font-serif" style={{ lineHeight: '1.7', fontSize: '1.05rem', whiteSpace: 'pre-line', textAlign: 'justify' }} />
            </div>
          </div>
          </div>
        </section>
      )}

      {/* Research */}
      {projectData.sections?.research && projectData.research && (
        <section className="py-5 bg-slate-50 border-b border-slate-200 group/section relative">
          <SectionSettings sectionKey="research" />
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-7">
                <div className="p-3 mb-2 d-inline-block rounded-none bg-blue-900 text-white px-4 small fw-bold uppercase tracking-wider">Clinical Research Profile</div>
                <EditableText tagName="h2" className="fw-bold fs-1 mb-4" style={{ color: primary }} value={projectData.research.title} onChange={(val) => updateResearch({ title: val })} />
                <EditableText tagName="p" className="fs-5 text-slate-800 mb-4 fw-medium" value={projectData.research.subtitle} onChange={(val) => updateResearch({ subtitle: val })} />
                <EditableText tagName="div" className="text-slate-500 mb-5" style={{ lineHeight: 1.8, fontSize: '1rem' }} value={projectData.research.description} onChange={(val) => updateResearch({ description: val })} />
                <div className="row g-4 pt-3 border-t">
                  {projectData.research.stats.map((stat, i) => (
                    <div key={i} className="col-4 text-center">
                      <EditableText tagName="div" className="fw-bold fs-2 text-slate-900" value={stat.value} onChange={(val) => {
                        const ns = [...projectData.research!.stats];
                        ns[i] = { ...stat, value: val };
                        updateResearch({ stats: ns });
                      }} />
                      <EditableText tagName="div" className="text-slate-500 small uppercase font-bold" style={{ fontSize: '11px' }} value={stat.label} onChange={(val) => {
                        const ns = [...projectData.research!.stats];
                        ns[i] = { ...stat, label: val };
                        updateResearch({ stats: ns });
                      }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-5 text-center">
                <div className="p-2 bg-white border rounded shadow-lg d-inline-block">
                  <EditableImage src={projectData.research.image} onChange={(val) => updateResearch({ image: val })} className="img-fluid rounded" style={{ maxHeight: '400px', width: 'auto', objectFit: 'contain' }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Ingredients - Lab Report Style */}
      {projectData.sections?.ingredients && (
        <section className="py-5 bg-slate-50 border-b border-slate-200 group/section relative">
          <SectionSettings sectionKey="ingredients" />
          <div className="container py-lg-4">
          <div className="text-center mb-5">
            <span className="data-label">COMPOUND ANALYSIS</span>
            <EditableText tagName="h2" className="fw-bold clinical-header border-0 px-0 d-inline-block" style={{ color: primary }} value={projectData.ingredients.title || "Active Constituents"} onChange={(val) => updateIngredient(-1, { title: val })} />
          </div>

          <div className="row g-3 justify-content-center">
            {projectData.ingredients?.items?.map((item, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4">
                <div className="clinical-card p-0 h-100 relative overflow-hidden flex">
                  <RemoveButton onClick={() => removeIngredient(i)} />
                  <div className="w-1/3 bg-slate-100 flex items-center justify-center border-r border-slate-200 p-3">
                    <EditableImage src={item.image || '/image/ingredient-schisandra.png'} onChange={(val) => updateIngredient(i, { image: val })} className="w-full h-auto object-cover rounded-none border-2 border-white shadow-sm" />
                  </div>
                  <div className="w-2/3 p-4 flex flex-col justify-center">
                    <EditableText tagName="h4" className="fw-bold mb-1 text-sm font-mono text-blue-700" value={item.title} onChange={(val) => updateIngredient(i, { title: val })} />
                    <EditableText tagName="p" className="mb-0 text-slate-600 text-xs" style={{ lineHeight: 1.5 }} value={item.description} onChange={(val) => updateIngredient(i, { description: val })} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <AddButton onClick={addIngredient} label="Constituent" />
        </div>
      </section>
      )}

      {/* Pricing - Tiered Authorization Plans */}
      <section className="bg-white py-5 border-b border-slate-200" id="pricing">
        <div className="container py-lg-5">
          <div className="text-center mb-5">
            <span className="data-label">DISTRIBUTION TIERS</span>
            <EditableText tagName="h2" className="fw-bold clinical-header border-0 px-0 d-inline-block" style={{ color: primary }} value={projectData.pricingTitle || "Select Supply"} onChange={(val) => updateProjectData({ pricingTitle: val })} />
          </div>

          <div className="row g-4 justify-content-center max-w-[1000px] mx-auto">
            {projectData.pricing?.map((plan, i) => (
              <div key={i} className="col-12 col-md-4 relative">
                <RemoveButton onClick={() => removePricing(i)} />
                  <div className={`clinical-card p-0 h-100 text-center flex flex-col ${plan.isPrimary ? 'border-blue-500 shadow-md transform-none' : ''}`}
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
                    <div className={`p-3 border-b ${plan.isPrimary ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                    {plan.isPrimary && <span className="data-label text-white opacity-80 mb-1">OPTIMAL DURATION</span>}
                    <EditableText tagName="h4" className="fw-bold mb-0 text-sm uppercase tracking-wide" value={plan.title} onChange={(val) => updatePricing(i, { title: val })} />
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <div className="relative mb-4">
                      {/* Premium Clinical Quantity Badge */}
                      <div className="absolute -top-1 -right-1 z-10 pointer-events-auto">
                        <div className="relative">
                          <div className="absolute inset-0 bg-blue-900/10 translate-x-0.5 translate-y-0.5" />
                          <EditableText
                            className="relative bg-slate-900 text-white px-2 py-1 rounded-none flex items-center justify-center font-mono font-black text-[10px] border border-slate-700 shadow-sm min-w-[32px]"
                            value={plan.multiplier || "X1"}
                            onChange={(val) => updatePricing(i, { multiplier: val })}
                          />
                        </div>
                      </div>
                      <EditableImage src={plan.image || '/image/bottle-snap.webp'} onChange={(val) => updatePricing(i, { image: val })} className="img-fluid mx-auto transition-transform duration-500 hover:scale-105" style={{ height: '120px', objectFit: 'contain' }} />
                    </div>
                    <EditableText tagName="div" className="fw-bold mb-4 font-mono text-3xl text-slate-800" value={plan.price} onChange={(val) => updatePricing(i, { price: val })} />

                    <div className="flex-grow mb-4 text-left border-l-2 pl-3 border-slate-200">
                      {plan.features.map((f, fi) => (
                        <div key={fi} className="mb-2 flex items-start gap-2 text-slate-600 text-xs">
                          <i className="fa-solid fa-check text-green-500 mt-1"></i>
                          <EditableText tagName="span" value={f} onChange={(val) => { const nf = [...plan.features]; nf[fi] = val; updatePricing(i, { features: nf }); }} />
                        </div>
                      ))}
                    </div>

                    <Linkable link={plan.buttonHref} onLinkChange={() => { }}>
                      <button className={`w-full py-2 rounded font-bold text-sm transition-colors ${plan.isPrimary ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                        <EditableText tagName="span" value={plan.buttonText} onChange={(val) => updatePricing(i, { buttonText: val })} />
                      </button>
                    </Linkable>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <AddButton onClick={addPricing} label="Tier" />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      {projectData.sections?.benefits && (
        <section className="py-5 bg-white border-b border-slate-200 group/section relative">
          <SectionSettings sectionKey="benefits" />
          <div className="container py-lg-4">
          <div className="text-center mb-5">
            <span className="data-label">OUTCOME ANALYSIS</span>
            <EditableText tagName="h2" className="fw-bold clinical-header border-0 px-0 d-inline-block" style={{ color: primary }} value={projectData.benefits.title || "Expected Results"} onChange={(val) => updateBenefit(-1, { title: val })} />
            <EditableText tagName="p" className="text-slate-500 mt-2 max-w-[700px] mx-auto text-sm" value={projectData.benefits.description} onChange={(val) => updateBenefit(-1, { description: val })} />
          </div>
          <div className="row g-4">
            {projectData.benefits.items.map((benefit, i) => (
              <div key={i} className="col-md-6 relative">
                <div className="clinical-card p-4 h-100 flex gap-4">
                  <RemoveButton onClick={() => removeBenefit(i)} />
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100">
                    {i + 1}
                  </div>
                  <div>
                    <EditableText tagName="h4" className="fw-bold mb-1 text-sm" value={benefit.title} onChange={(val) => updateBenefit(i, { title: val })} />
                    <EditableText tagName="p" className="mb-0 text-slate-500 text-xs" style={{ lineHeight: 1.6 }} value={benefit.description} onChange={(val) => updateBenefit(i, { description: val })} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <AddButton onClick={addBenefit} label="Benefit" />
        </div>
      </section>
      )}

      {/* Testimonials Section */}
      {projectData.sections?.testimonials && (
        <section className="py-5 bg-slate-50 border-b border-slate-200 group/section relative">
          <SectionSettings sectionKey="testimonials" />
          <div className="container py-lg-4">
          <div className="text-center mb-5">
            <span className="data-label">PATIENT CASE STUDIES</span>
            <EditableText tagName="h2" className="fw-bold clinical-header border-0 px-0 d-inline-block" style={{ color: primary }} value={projectData.testimonials?.title || "Verification Records"} onChange={(val) => updateTestimonials(-1, { title: val })} />
          </div>
          <div className="row g-4 justify-content-center">
            {projectData.testimonials?.items.map((item, i) => (
              <div key={i} className="col-md-6 col-lg-4 relative">
                <div className="clinical-card p-4 h-100 bg-white">
                  <RemoveButton onClick={() => removeTestimonial(i)} />
                  <div className="d-flex align-items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                    <EditableImage src={item.image || "https://i.pravatar.cc/150"} onChange={(val) => updateTestimonials(i, { image: val })} className="w-12 h-12 object-cover grayscale" />
                    <div>
                      <EditableText tagName="h5" className="fw-bold mb-0 text-xs" value={item.name} onChange={(val) => updateTestimonials(i, { name: val })} />
                      <EditableText tagName="p" className="mb-0 text-[10px] text-slate-400 font-mono" value={item.role || ""} onChange={(val) => updateTestimonials(i, { role: val })} />
                    </div>
                  </div>
                  <EditableText tagName="p" className="mb-0 text-slate-600 italic text-xs" style={{ lineHeight: 1.6 }} value={item.content} onChange={(val) => updateTestimonials(i, { content: val })} />
                </div>
              </div>
            ))}
          </div>
          <AddButton onClick={addTestimonial} label="Case Study" />
        </div>
      </section>
      )}

      {/* Gallery */}
      {projectData.sections?.gallery && projectData.gallery && (
        <section className="py-5 bg-white border-b border-slate-200 group/section relative">
          <SectionSettings sectionKey="gallery" />
          <div className="container">
            <div className="clinical-header mb-5 text-center">
              <span className="data-label">VERIFIED RESULTS GALLERY</span>
              <EditableText tagName="h2" className="fw-bold mb-0" style={{ color: primary }} value={projectData.gallery.title} onChange={(val) => updateGallery({ title: val })} />
            </div>
            <div className="row g-3">
              {projectData.gallery.images.map((img, i) => (
                <div key={i} className="col-6 col-md-4">
                  <div className="clinical-card p-1 shadow-sm overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    <EditableImage src={img} onChange={(val) => {
                      const ni = [...projectData.gallery!.images];
                      ni[i] = val;
                      updateGallery({ images: ni });
                    }} className="w-100 h-100 rounded" style={{ objectFit: 'cover', maxHeight: '200px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Satisfaction Guarantee */}
      <section className="py-5 bg-white border-b border-slate-200">
        <div className="container py-lg-4">
          <div className="p-5 bg-slate-50 border border-slate-200 rounded shadow-sm">
            <div className="row align-items-center g-5">
              <div className="col-lg-4 text-center">
                <EditableImage src={projectData.footer.trustImage || '/image/money-back-guarantee-..webp'} onChange={(val) => updateFooter({ trustImage: val })} className="img-fluid mb-3 mx-auto" style={{ maxWidth: '250px' }} />
                <EditableText tagName="p" className="data-label mb-0" style={{ color: secondary }} value={projectData.guaranteeSubtitle || "Security Protocol"} onChange={(val) => updateProjectData({ guaranteeSubtitle: val })} />
              </div>
              <div className="col-lg-8">
                <EditableText tagName="h3" className="fw-bold mb-3" style={{ color: primary, fontSize: '1.8rem' }} value={projectData.guaranteeHeadline || "60-Day Satisfaction Protocol"} onChange={(val) => updateProjectData({ guaranteeHeadline: val })} />
                <EditableText tagName="p" className="text-slate-500" style={{ lineHeight: 1.8, fontSize: '0.95rem' }} value={projectData.guaranteeDescription || `Your happiness is our highest priority. Every order of ${projectData.productName} comes protected by a comprehensive 60-day satisfaction promise. If you are not completely satisfied with the results, simply contact our support team for a full refund.`} onChange={(val) => updateProjectData({ guaranteeDescription: val })} />
                <Linkable link={projectData.hero.buttonHref} onLinkChange={() => { }}>
                  <button className="clinical-btn-primary mt-3">Order Now <i className="fa-solid fa-arrow-right"></i></button>
                </Linkable>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {projectData.sections?.faq && (
        <section className="py-5 bg-white border-b border-slate-200 group/section relative">
          <SectionSettings sectionKey="faq" />
          <div className="container py-lg-4 max-w-[800px]">
          <div className="text-center mb-5">
            <span className="data-label">TECHNICAL INQUIRIES</span>
            <EditableText tagName="h2" className="fw-bold clinical-header border-0 px-0 d-inline-block" style={{ color: primary }} value={projectData.faqTitle || "Protocol FAQ"} onChange={(val) => updateProjectData({ faqTitle: val })} />
          </div>
          <div className="space-y-4">
            {projectData.faq.map((item, i) => (
              <div key={i} className="border border-slate-200 p-4 relative">
                <RemoveButton onClick={() => removeFAQ(i)} />
                <EditableText tagName="h5" className="fw-bold text-sm mb-2 text-slate-800" value={item.question} onChange={(val) => updateFAQ(i, { question: val })} />
                <EditableText tagName="p" className="mb-0 text-slate-500 text-xs" style={{ lineHeight: 1.6 }} value={item.answer} onChange={(val) => updateFAQ(i, { answer: val })} />
              </div>
            ))}
          </div>
          <AddButton onClick={addFAQ} label="Question" />
        </div>
      </section>
      )}

      {/* Footer - Minimal Info */}
      <footer className="bg-slate-900 text-slate-300 py-5 font-mono text-sm">
        <div className="container text-center">
          <EditableText tagName="h2" className="fw-bold mb-2 text-white font-sans" style={{ fontSize: '1.2rem' }} value={projectData.footerHeadline || "End of Document"} onChange={(val) => updateProjectData({ footerHeadline: val })} />
          <EditableText tagName="p" className="mx-auto mb-4 opacity-60 text-xs" style={{ maxWidth: '600px' }} value={projectData.footer.companyInfo} onChange={(val) => updateFooter({ companyInfo: val })} />

          <div className="d-flex flex-wrap justify-content-center gap-4 mb-4 border-y border-slate-800 py-3">
            {projectData.footer.links.map((link, i) => (
              <div key={i} className="relative group/linkitem">
                <RemoveButton onClick={() => {
                  const nl = [...projectData.footer.links];
                  nl.splice(i, 1);
                  updateFooter({ links: nl });
                }} />
                <Linkable link={link.href} onLinkChange={(val) => { const nl = [...projectData.footer.links]; nl[i] = { ...nl[i], href: val }; updateFooter({ links: nl }); }}>
                  <EditableText tagName="span" className="hover:text-white cursor-pointer" value={link.label} onChange={(val) => { const nl = [...projectData.footer.links]; nl[i] = { ...nl[i], label: val }; updateFooter({ links: nl }); }} />
                </Linkable>
              </div>
            ))}
          </div>
          <div className="mb-4">
             <AddButton onClick={() => updateFooter({ links: [...projectData.footer.links, { label: 'New Link', href: '#' }] })} label="Footer Link" />
          </div>
          <p className="opacity-40 text-[10px]">© {new Date().getFullYear()} {projectData.productName}. DOC_REV_A.</p>
        </div>
      </footer>

      {/* Purchase Proof Popup */}
      {projectData.socialProof?.enabled && (
        <div
          className={`purchase-proof ${showProof ? 'active' : ''} group/proof cursor-pointer hover:border-blue-500/50 transition-all`}
          onClick={() => setShowProofSettings(true)}
        >
          <div className="absolute -top-10 left-0 bg-blue-600 text-white text-[9px] font-bold px-2 py-1.5 rounded-sm opacity-0 group-hover/proof:opacity-100 transition-all shadow-xl pointer-events-none">
            <i className="fa-solid fa-gear mr-1"></i> Edit Popup Settings
          </div>
          <div className="flex-shrink-0 w-12 h-12 rounded bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
            <img
              src={projectData.socialProof?.items[proofIndex]?.image || projectData.hero.image || '/image/bottle-snap.webp'}
              className="w-full h-full object-contain"
              alt="Purchased Product"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/image/bottle-snap.webp';
              }}
            />
          </div>
          <div className="flex flex-col">
            <div className="text-yellow-500 text-[8px] mb-1">
              {[...Array(5)].map((_, si) => <i key={si} className="fa-solid fa-star"></i>)}
            </div>
            <div className="text-slate-800 text-xs leading-tight">
              <strong className="text-green-600">{projectData.socialProof?.items[proofIndex]?.name}</strong> from <strong className="text-green-600">{projectData.socialProof?.items[proofIndex]?.location}</strong> <br />
              <span className="text-slate-500">{projectData.socialProof?.items[proofIndex]?.content}</span>
            </div>
            <small className="text-slate-400 text-[9px] mt-1 uppercase tracking-wider font-bold">{projectData.socialProof?.items[proofIndex]?.timeAgo} • Verified Protocol</small>
          </div>
        </div>
      )}

      {/* Social Proof Settings Modal */}
      {showProofSettings && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowProofSettings(false)}></div>
          <div className="bg-white w-full max-w-xl rounded shadow-2xl z-10 overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-100 d-flex justify-content-between align-items-center bg-slate-50">
              <h3 className="m-0 fs-6 fw-bold text-slate-800 uppercase tracking-widest">Popup Configuration</h3>
              <button onClick={() => setShowProofSettings(false)} className="border-none bg-transparent text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-times fs-5"></i>
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase">Display Widget</span>
                <button
                  onClick={() => updateSocialProof({ enabled: !projectData.socialProof?.enabled })}
                  className={`px-4 py-1.5 rounded text-[10px] font-bold transition-all border-none ${projectData.socialProof?.enabled ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                >
                  {projectData.socialProof?.enabled ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Display Duration (ms)</label>
                  <input type="number" className="w-full p-2 bg-white border border-slate-200 text-slate-800 text-sm outline-none focus:border-blue-500" value={projectData.socialProof?.displayTime} onChange={(e) => updateSocialProof({ displayTime: parseInt(e.target.value) })} />
                </div>
                <div className="col-md-6">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Interval (ms)</label>
                  <input type="number" className="w-full p-2 bg-white border border-slate-200 text-slate-800 text-sm outline-none focus:border-blue-500" value={projectData.socialProof?.interval} onChange={(e) => updateSocialProof({ interval: parseInt(e.target.value) })} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Items to Cycle</label>
                {(projectData.socialProof?.items || []).map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 relative group/item">
                    <button 
                      onClick={() => {
                        const ni = [...(projectData.socialProof?.items || [])];
                        ni.splice(idx, 1);
                        updateSocialProof({ items: ni });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity border-none"
                    >
                      <i className="fa-solid fa-times text-[10px]"></i>
                    </button>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Name</label>
                        <input type="text" className="w-full p-1.5 bg-white border border-slate-200 text-slate-800 text-[11px] outline-none" value={item.name} onChange={(e) => {
                          const ni = [...(projectData.socialProof?.items || [])];
                          ni[idx] = { ...ni[idx], name: e.target.value };
                          updateSocialProof({ items: ni });
                        }} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Location</label>
                        <input type="text" className="w-full p-1.5 bg-white border border-slate-200 text-slate-800 text-[11px] outline-none" value={item.location} onChange={(e) => {
                          const ni = [...(projectData.socialProof?.items || [])];
                          ni[idx] = { ...ni[idx], location: e.target.value };
                          updateSocialProof({ items: ni });
                        }} />
                      </div>
                      <div className="col-md-12">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Content</label>
                        <input type="text" className="w-full p-1.5 bg-white border border-slate-200 text-slate-800 text-[11px] outline-none" value={item.content} onChange={(e) => {
                          const ni = [...(projectData.socialProof?.items || [])];
                          ni[idx] = { ...ni[idx], content: e.target.value };
                          updateSocialProof({ items: ni });
                        }} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Time</label>
                        <input type="text" className="w-full p-1.5 bg-white border border-slate-200 text-slate-800 text-[11px] outline-none" value={item.timeAgo} onChange={(e) => {
                          const ni = [...(projectData.socialProof?.items || [])];
                          ni[idx] = { ...ni[idx], timeAgo: e.target.value };
                          updateSocialProof({ items: ni });
                        }} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Image</label>
                        <input type="text" className="w-full p-1.5 bg-white border border-slate-200 text-slate-800 text-[11px] outline-none" value={item.image} onChange={(e) => {
                          const ni = [...(projectData.socialProof?.items || [])];
                          ni[idx] = { ...ni[idx], image: e.target.value };
                          updateSocialProof({ items: ni });
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const ni = [...(projectData.socialProof?.items || []), { name: "New Client", location: "New York", content: "purchased 3 bottles", timeAgo: "2 minutes ago", image: projectData.hero.image || "/image/bottle-snap.webp" }];
                    updateSocialProof({ items: ni });
                  }}
                  className="w-full py-2 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase border border-blue-200 hover:bg-blue-100 transition-all mt-2"
                >
                  <i className="fa-solid fa-plus mr-1"></i> Add Entry
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 text-right bg-slate-50">
              <button onClick={() => setShowProofSettings(false)} className="bg-slate-900 text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest border-none hover:bg-slate-800 transition-all">Apply Settings</button>
            </div>
          </div>
        </div>
      )}
      {/* Scroll Button */}
      <button
        className="position-fixed bottom-8 right-8 w-14 h-14 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center text-black z-50 border-none transition-all hover:-translate-y-2 shadow-xl border-2 border-black"
        style={{ boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <i className="fa-solid fa-arrow-up fs-4"></i>
      </button>
    </div>
  );
};
