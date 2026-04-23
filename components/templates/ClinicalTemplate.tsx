'use client';

import React, { useEffect, useState } from 'react';
import { EditableText } from '../editor/EditableText';
import { EditableImage } from '../editor/EditableImage';
import { useStore } from '@/lib/store';

// Reusable helpers
const RemoveButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="absolute -top-3 -right-3 bg-red-100 hover:bg-red-500 text-red-500 hover:text-white w-8 h-8 rounded-full flex items-center justify-center transition-all z-20 shadow-sm border border-red-200">
    <i className="fa-solid fa-xmark text-sm"></i>
  </button>
);

const IconEditor = ({ value, onChange, className = "" }: { value: string; onChange: (val: string) => void, className?: string }) => {
  const icons = ["fa-solid fa-stethoscope", "fa-solid fa-heart-pulse", "fa-solid fa-shield-halved", "fa-solid fa-pills", "fa-solid fa-flask", "fa-solid fa-notes-medical"];
  const cycleIcon = () => { const idx = icons.indexOf(value || icons[0]); onChange(icons[(idx + 1) % icons.length]); };
  return <i className={`${value || icons[1]} cursor-pointer hover:scale-110 transition-transform text-current ${className}`} onClick={(e) => { e.stopPropagation(); cycleIcon(); }} title="Click to toggle icon" />;
};

const LinkSettings = ({ link, onChange, onClose, x, y }: { link: string; onChange: (val: string) => void, onClose: () => void, x: number, y: number }) => (
  <div className="fixed bg-white rounded-lg shadow-xl border border-blue-100 p-4 z-[99999] w-72 animate-in fade-in" style={{ left: x, top: y }} onClick={(e) => e.stopPropagation()}>
    <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
      <span className="text-xs font-bold text-blue-900"><i className="fa-solid fa-link mr-2"></i>Configure Path</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><i className="fa-solid fa-times"></i></button>
    </div>
    <input type="text" placeholder="Destination URI..." className="w-full text-sm p-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:border-blue-500 font-mono" value={link || ''} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const SchemaEditor = ({ plan, onChange, onClose, x, y }: { plan: any; onChange: (val: any) => void, onClose: () => void, x: number, y: number }) => (
  <div className="fixed bg-white rounded-lg shadow-2xl border border-blue-200 p-4 z-[99999] w-80 animate-in zoom-in-95 duration-200 text-left" style={{ left: Math.min(x, typeof window !== 'undefined' ? window.innerWidth - 340 : x), top: Math.min(y, typeof window !== 'undefined' ? window.innerHeight - 400 : y) }} onClick={(e) => e.stopPropagation()}>
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
      {link && <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/link:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none font-mono">↗ {link}</div>}
    </div>
  );
};

export const ClinicalTemplate: React.FC = () => {
  const {
    projectData, updateHero, updateAbout,
    updateFeature, addFeature, removeFeature,
    updateIngredient, addIngredient, removeIngredient,
    updateBenefit, addBenefit, removeBenefit,
    updateFAQ, addFAQ, removeFAQ,
    updatePricing, addPricing, removePricing,
    updateFooter
  } = useStore();

  const AddButton = ({ onClick, label }: { onClick: () => void, label: string }) => (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="text-blue-900 bg-blue-50 hover:bg-blue-100 text-sm font-semibold py-2 px-6 rounded transition-colors flex items-center gap-2 mx-auto my-8 border border-blue-200">
      <i className="fa-solid fa-plus-circle"></i> Add {label} Section
    </button>
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [schemaEditor, setSchemaEditor] = useState<{ i: number, x: number, y: number } | null>(null);

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
            {projectData.footer.links.slice(0, 3).map((link, i) => (
              <Linkable key={i} link={link.href} onLinkChange={(val) => { const nl = [...projectData.footer.links]; nl[i] = { ...nl[i], href: val }; updateFooter({ links: nl }); }}>
                <EditableText tagName="span" className="nav-link fw-medium cursor-pointer p-0 text-slate-500 hover:text-slate-800 text-sm" value={link.label} onChange={(val) => { const nl = [...projectData.footer.links]; nl[i] = { ...nl[i], label: val }; updateFooter({ links: nl }); }} />
              </Linkable>
            ))}
            <div className="h-6 w-px bg-slate-200"></div>
            <Linkable link={projectData.hero.buttonHref} onLinkChange={(val) => updateHero({ buttonHref: val })}>
              <button className="clinical-btn clinical-btn-primary py-2 px-4 text-sm rounded-md shadow-sm">
                <IconEditor value={projectData.hero.icon || "fa-solid fa-shield-halved"} onChange={(val) => updateHero({ icon: val })} />
                <EditableText tagName="span" value="Patient Access" onChange={() => { }} />
              </button>
            </Linkable>
          </div>
        </div>
      </nav>

      {/* Hero - Data-Driven Split Layout */}
      <section className="bg-white border-b border-slate-200 py-5">
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-6 text-center text-lg-start pe-lg-5">
              <span className="data-label text-blue-600 mb-3">CLINICAL PROFILE • VERIFIED</span>
              <EditableText tagName="h1" value={projectData.hero.title} onChange={(val) => updateHero({ title: val })} className="fw-bold mb-4" style={{ color: primary, fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.2, letterSpacing: '-0.02em' }} />
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-5">
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
              <div className="position-relative p-5 bg-slate-50 border border-slate-200 rounded-lg text-center h-100 flex items-center justify-center min-h-[400px]">
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
                    <EditableImage src={projectData.logos?.[i] || `/image/logo-${i + 1}.webp`} onChange={(val) => { const nl = [...(projectData.logos || [])]; nl[i] = val; useStore.getState().updateProjectData({ logos: nl }); }} className="img-fluid" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Features Grid */}
      <section className="py-5 bg-slate-50 border-b border-slate-200">
        <div className="container py-lg-4">
          <span className="data-label text-center mb-2">EFFICACY METRICS</span>
          <EditableText tagName="h2" className="text-center fw-bold mb-5 clinical-header d-inline-block mx-auto border-0 px-0" style={{ color: primary }} value={projectData.featuresTitle || "Core Tolerances"} onChange={(val) => useStore.getState().updateProjectData({ featuresTitle: val })} />

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

      {/* About - Documentation Style */}
      <section className="bg-white py-5 border-b border-slate-200">
        <div className="container py-lg-5 max-w-[900px] mx-auto">
          <div className="clinical-header mb-5">
            <span className="data-label">PROTOCOL SUMMARY</span>
            <EditableText tagName="h2" className="fw-bold mb-0" style={{ color: primary, fontSize: '2.5rem' }} value={projectData.about.title || "The Formula"} onChange={(val) => updateAbout({ title: val })} />
          </div>

          <div className="row g-5">
            <div className="col-12">
              <div className="p-4 bg-slate-50 border-l-4 border-slate-300 rounded-r-lg mb-5 flex gap-4 items-center">
                <i className="fa-solid fa-circle-info text-slate-400 text-2xl"></i>
                <p className="mb-0 text-sm font-mono text-slate-600">Review full documentation before commencing protocol. Data indicates sustained results require 60+ days compliance.</p>
              </div>
              <EditableText tagName="div" value={projectData.about.description} onChange={(val) => updateAbout({ description: val })} className="text-slate-700 font-serif" style={{ lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-line' }} />
            </div>
            <div className="col-12 text-center mt-5 pt-4 border-t border-slate-100">
              <EditableImage src={projectData.about.image || '/image/banner-img.webp'} onChange={(val) => updateAbout({ image: val })} className="img-fluid rounded border border-slate-200 shadow-sm mx-auto" style={{ maxHeight: '300px', objectFit: 'contain' }} />
              <span className="data-label mt-3">FIG 1. FORMULA PRESENTATION</span>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredients - Lab Report Style */}
      <section className="py-5 bg-slate-50 border-b border-slate-200">
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
                    <EditableImage src={item.image || '/image/ingredient-schisandra.png'} onChange={(val) => updateIngredient(i, { image: val })} className="w-full h-auto object-cover rounded-full border-2 border-white shadow-sm" />
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

      {/* Pricing - Tiered Authorization Plans */}
      <section className="bg-white py-5 border-b border-slate-200" id="pricing">
        <div className="container py-lg-5">
          <div className="text-center mb-5">
            <span className="data-label">DISTRIBUTION TIERS</span>
            <EditableText tagName="h2" className="fw-bold clinical-header border-0 px-0 d-inline-block" style={{ color: primary }} value={projectData.pricingTitle || "Select Supply"} onChange={(val) => useStore.getState().updateProjectData({ pricingTitle: val })} />
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
                    <EditableImage src={plan.image || '/image/bottle-1.webp'} onChange={(val) => updatePricing(i, { image: val })} className="img-fluid mx-auto mb-4" style={{ height: '120px', objectFit: 'contain' }} />
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

      {/* Footer - Minimal Info */}
      <footer className="bg-slate-900 text-slate-300 py-5 font-mono text-sm">
        <div className="container text-center">
          <EditableText tagName="h2" className="fw-bold mb-2 text-white font-sans" style={{ fontSize: '1.2rem' }} value={projectData.footerHeadline || "End of Document"} onChange={(val) => useStore.getState().updateProjectData({ footerHeadline: val })} />
          <EditableText tagName="p" className="mx-auto mb-4 opacity-60 text-xs" style={{ maxWidth: '600px' }} value={projectData.footer.companyInfo} onChange={(val) => updateFooter({ companyInfo: val })} />

          <div className="d-flex justify-content-center gap-4 mb-4 border-y border-slate-800 py-3">
            {projectData.footer.links.map((link, i) => (
              <Linkable key={i} link={link.href} onLinkChange={(val) => { const nl = [...projectData.footer.links]; nl[i] = { ...nl[i], href: val }; updateFooter({ links: nl }); }}>
                <EditableText tagName="span" className="hover:text-white cursor-pointer" value={link.label} onChange={(val) => { const nl = [...projectData.footer.links]; nl[i] = { ...nl[i], label: val }; updateFooter({ links: nl }); }} />
              </Linkable>
            ))}
          </div>
          <p className="opacity-40 text-[10px]">© {new Date().getFullYear()} {projectData.productName}. DOC_REV_A.</p>
        </div>
      </footer>
    </div>
  );
};
