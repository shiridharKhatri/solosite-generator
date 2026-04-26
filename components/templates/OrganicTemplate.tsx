'use client';

import React, { useEffect, useState } from 'react';
import { EditableText } from '../editor/EditableText';
import { EditableImage } from '../editor/EditableImage';
import { useStore, type ProjectData } from '@/lib/store';

// Reusable helpers
const RemoveButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="absolute -top-2 -right-2 bg-[#FAF6ED] hover:bg-[#8A7969] text-[#8A7969] hover:text-white w-7 h-7 rounded-none flex items-center justify-center transition-all z-20 shadow-sm border border-[#E6D5C3]">
    <i className="fa-solid fa-times text-xs"></i>
  </button>
);

const IconEditor = ({ value, onChange, className = "" }: { value: string; onChange: (val: string) => void, className?: string }) => {
  const icons = ["fa-solid fa-leaf", "fa-solid fa-seedling", "fa-solid fa-spa", "fa-solid fa-sun", "fa-solid fa-droplet", "fa-solid fa-heart"];
  const cycleIcon = () => { const idx = icons.indexOf(value || icons[0]); onChange(icons[(idx + 1) % icons.length]); };
  return <i className={`${value || icons[1]} cursor-pointer hover:scale-110 transition-transform text-current ${className}`} onClick={(e) => { e.stopPropagation(); cycleIcon(); }} title="Click to toggle icon" />;
};

const LinkSettings = ({ link, onChange, onClose, x, y }: { link: string; onChange: (val: string) => void, onClose: () => void, x: number, y: number }) => (
  <div className="fixed bg-[#FAF6ED] rounded-none shadow-lg border border-[#E6D5C3] p-4 z-[99999] w-64 animate-in fade-in zoom-in" style={{ left: x, top: y }} onClick={(e) => e.stopPropagation()}>
    <div className="flex justify-between items-center mb-3">
      <span className="text-sm font-semibold text-[#4A3320] font-serif">Update Link</span>
      <button onClick={onClose} className="text-[#8A7969] hover:text-[#4A3320]"><i className="fa-solid fa-xmark"></i></button>
    </div>
    <input type="text" placeholder="Where to?" className="w-full text-sm p-2 bg-white border border-[#E6D5C3] rounded-none focus:outline-none focus:border-[#8A7969]" value={link || ''} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const SchemaEditor = ({ plan, onChange, onClose, x, y }: { plan: any; onChange: (val: any) => void, onClose: () => void, x: number, y: number }) => (
  <div className="fixed bg-[#FAF6ED] rounded-none shadow-2xl border border-[#E6D5C3] p-5 z-[99999] w-80 animate-in zoom-in-95 duration-200 text-left" style={{ left: Math.min(x, typeof window !== 'undefined' ? window.innerWidth - 340 : x), top: Math.min(y, typeof window !== 'undefined' ? window.innerHeight - 400 : y) }} onClick={(e) => e.stopPropagation()}>
    <div className="flex justify-between items-center mb-4 border-b border-[#E6D5C3] pb-2">
      <span className="text-sm font-bold text-[#4A3320] font-serif flex items-center gap-2"><i className="fa-solid fa-leaf text-[#8A7969]"></i> Product Schema</span>
      <button onClick={onClose} className="text-[#8A7969] hover:text-[#4A3320] transition-colors"><i className="fa-solid fa-times"></i></button>
    </div>
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-bold text-[#8A7969] uppercase mb-1 block">GTIN / Barcode</label>
        <input type="text" className="w-full text-sm p-2 bg-white border border-[#E6D5C3] rounded-none focus:ring-2 focus:ring-[#8A7969]/20 outline-none font-mono" value={plan.gtin || ''} onChange={(e) => onChange({ gtin: e.target.value })} placeholder="e.g. 5901234123457" />
      </div>
      <div>
        <label className="text-[10px] font-bold text-[#8A7969] uppercase mb-1 block">Category</label>
        <input type="text" className="w-full text-sm p-2 bg-white border border-[#E6D5C3] rounded-none focus:ring-2 focus:ring-[#8A7969]/20 outline-none" value={plan.category || ''} onChange={(e) => onChange({ category: e.target.value })} placeholder="e.g. Consumable" />
      </div>
      <div>
        <label className="text-[10px] font-bold text-[#8A7969] uppercase mb-1 block">SKU</label>
        <input type="text" className="w-full text-sm p-2 bg-white border border-[#E6D5C3] rounded-none focus:ring-2 focus:ring-[#8A7969]/20 outline-none font-mono" value={plan.sku || ''} onChange={(e) => onChange({ sku: e.target.value })} placeholder="e.g. BATT-X001" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-[#8A7969] uppercase mb-1 block">UNCL Code</label>
          <input type="text" className="w-full text-sm p-2 bg-white border border-[#E6D5C3] rounded-none focus:ring-2 focus:ring-[#8A7969]/20 outline-none font-mono" value={plan.unclCode || ''} onChange={(e) => onChange({ unclCode: e.target.value })} placeholder="e.g. 711" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-[#8A7969] uppercase mb-1 block">Role</label>
          <input type="text" className="w-full text-sm p-2 bg-white border border-[#E6D5C3] rounded-none focus:ring-2 focus:ring-[#8A7969]/20 outline-none" value={plan.productRole || ''} onChange={(e) => onChange({ productRole: e.target.value })} placeholder="e.g. Consumable" />
        </div>
      </div>
    </div>
    <p className="mt-4 text-[9px] text-[#8A7969] italic">Metadata used for automatic SEO JSON-LD generation.</p>
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
      <div className="absolute -top-3 -right-3 opacity-0 group-hover/link:opacity-100 transition-opacity bg-[#8A7969] text-white w-5 h-5 rounded-none flex items-center justify-center shadow-lg z-50 pointer-events-none">
        <i className="fa-solid fa-link text-[8px]"></i>
      </div>
      {link && <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#4A3320] text-[#FAF6ED] text-[10px] px-2 py-1 rounded-none opacity-0 group-hover/link:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">→ {link}</div>}
    </div>
  );
};

export const OrganicTemplate: React.FC = () => {
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
        className="bg-red-500/80 hover:bg-red-500 text-white px-2 py-1 text-[10px] font-bold rounded-none uppercase flex items-center gap-1 shadow-lg border-none backdrop-blur-sm transition-all"
      >
        <i className="fa-solid fa-eye-slash"></i> Hide Section
      </button>
    </div>
  );

  const AddButton = ({ onClick, label }: { onClick: () => void, label: string }) => (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="text-[#4A3320] bg-transparent hover:bg-[#E6D5C3] text-sm font-semibold py-2 px-6 rounded-none transition-colors flex items-center gap-2 mx-auto my-8 border border-[#4A3320] border-dashed">
      <i className="fa-solid fa-leaf"></i> Cultivate {label}
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

  const primary = projectData.theme?.primary || '#4A3320';
  const secondary = projectData.theme?.secondary || '#8A7969';
  const bgLight = '#FAF6ED';
  const bgAccent = '#F0EBE1';

  return (
    <div className="organic-template relative font-sans" style={{ backgroundColor: bgLight, color: primary }}>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" />

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Nunito:wght@300;400;600;700&display=swap');
        .organic-template { font-family: 'Nunito', sans-serif; }
        .organic-template h1, .organic-template h2, .organic-template h3, .organic-template h4, .organic-template .logo { font-family: 'Lora', serif !important; }

        .organic-card {
          background: #ffffff;
          border-radius: 30px 30px 30px 0;
          box-shadow: 10px 10px 30px rgba(74, 51, 32, 0.05);
          transition: transform 0.3s ease, border-radius 0.3s ease;
          border: 1px solid rgba(138, 121, 105, 0.1);
        }
        .organic-card:hover {
          transform: translateY(-5px);
          border-radius: 30px;
        }

        .organic-btn {
          padding: 0.8rem 2.2rem;
          border-radius: 30px;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 4px 4px 10px rgba(0,0,0,0.05);
        }
        .organic-btn-primary { background: ${primary}; color: #FAF6ED; border: none; }
        .organic-btn-primary:hover { background: ${secondary}; color: #FAF6ED; box-shadow: 6px 6px 15px rgba(0,0,0,0.1); }
        .organic-btn-outline { background: transparent; border: 2px solid ${primary}; color: ${primary}; }
        .organic-btn-outline:hover { background: ${bgAccent}; }

        .leaf-shape {
          border-radius: 50% 0 50% 50%;
        }
        
        .organic-blob {
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
        }

        /* Override mobile preview sizing to match classic template logic */
        .mobile-preview .organic-template .col-lg-5,
        .mobile-preview .organic-template .col-lg-7,
        .mobile-preview .organic-template .col-lg-4,
        .mobile-preview .organic-template .col-lg-8,
        .mobile-preview .organic-template .col-md-6,
        .mobile-preview .organic-template .col-md-4 {
          width: 100% !important; flex: 0 0 100% !important; max-width: 100% !important;
        }

        @media (max-width: 768px) {
          .organic-template h1 { font-size: 2.2rem !important; }
          .organic-template .navbar .d-lg-flex { display: none !important; }
        }

        .mobile-preview .organic-template h1 { font-size: 2.2rem !important; }
        .mobile-preview .organic-template .navbar .d-lg-flex { display: none !important; }
        .mobile-preview .organic-template .organic-btn { width: 100%; justify-content: center; }
        .mobile-preview .organic-template .organic-blob { width: 150% !important; height: 150% !important; }
      `}} />

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg sticky-top py-4 z-[1000]" style={{ backgroundColor: 'rgba(250, 246, 237, 0.95)', backdropFilter: 'blur(10px)' }}>
        <div className="container px-4 d-flex justify-content-between align-items-center">
          <a className="navbar-brand d-flex align-items-center gap-2 no-underline" href="#">
            <div style={{ width: '40px', height: '40px', flexShrink: 0 }}>
              <EditableImage
                src={projectData.hero.logoImage || "https://placehold.co/100x100?text=Logo"}
                onChange={(val) => updateHero({ logoImage: val })}
                className="w-full h-full rounded-none border border-dashed border-[#8A7969] bg-white"
                style={{ objectFit: 'contain' }}
                alt="Brand Logo"
              />
            </div>
             <EditableText tagName="span" className="fs-4 fw-bold logo" style={{ color: primary }} value={projectData.productName} onChange={() => {}} />
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
                  className="nav-link cursor-pointer p-0 font-serif italic no-underline" 
                  style={{ color: secondary, fontSize: '1.1rem' }} 
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
              <button className="organic-btn organic-btn-primary ms-3">
                <EditableText tagName="span" value="Shop Nature" onChange={() => {}} />
              </button>
            </Linkable>
          </div>
          <div className="d-flex align-items-center gap-2 d-lg-none">
            <Linkable link={projectData.hero.buttonHref} onLinkChange={(val) => updateHero({ buttonHref: val })}>
              <button className="organic-btn organic-btn-primary py-2 px-3 fs-6 text-nowrap" style={{ minWidth: 'auto', width: 'auto', whiteSpace: 'nowrap' }}>
                <EditableText tagName="span" value={projectData.hero.buttonText} onChange={() => {}} />
              </button>
            </Linkable>
            <button className="border-none bg-transparent p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} fs-2`} style={{ color: primary }}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="d-lg-none absolute top-full left-0 w-full p-4 d-flex flex-column align-items-center gap-3 z-[999] shadow-sm animate-in slide-in-from-top duration-300 border-top" style={{ backgroundColor: 'rgba(250, 246, 237, 0.98)' }}>
            {projectData.navbar?.links.map((link, i) => (
              <a key={i} href={link.href} className="fs-5 font-serif italic fw-bold no-underline" style={{ color: secondary }} onClick={() => setIsMenuOpen(false)}>{link.label}</a>
            ))}
            <Linkable link={projectData.hero.buttonHref} onLinkChange={() => { }}>
              <button className="organic-btn organic-btn-primary w-100 mt-2">
                <EditableText tagName="span" value={projectData.hero.buttonText} onChange={() => { }} />
              </button>
            </Linkable>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="py-5 overflow-hidden" style={{ backgroundColor: bgLight }}>
        <div className="container pt-lg-5 pb-lg-3">
          <div className="row align-items-center flex-column-reverse flex-lg-row g-5">
            <div className="col-12 col-lg-6 text-center text-lg-start position-relative z-10">
              <span className="font-serif italic mb-3 d-block" style={{ color: secondary, fontSize: '1.2rem' }}>Pure • Earth-Sourced • Balanced</span>
              <EditableText tagName="h1" value={projectData.hero.title} onChange={(val) => updateHero({ title: val })} className="fw-bold mb-4" style={{ color: primary, fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1.1 }} />
              <EditableText tagName="p" value={projectData.hero.subtitle} onChange={(val) => updateHero({ subtitle: val })} className="mb-5 mx-auto mx-lg-0" style={{ color: '#6A5949', lineHeight: 1.8, maxWidth: '500px', fontSize: '1.05rem' }} />
              
              <div className="d-flex flex-wrap gap-4 justify-content-center justify-content-lg-start">
                <Linkable link={projectData.hero.buttonHref} onLinkChange={(val) => updateHero({ buttonHref: val })}>
                  <button className="organic-btn organic-btn-primary">
                    <EditableText tagName="span" value={projectData.hero.buttonText} onChange={(val) => updateHero({ buttonText: val })} />
                    <IconEditor value={projectData.hero.icon || "fa-solid fa-seedling"} onChange={(val) => updateHero({ icon: val })} />
                  </button>
                </Linkable>
              </div>

              <div className="mt-5 d-flex gap-3 justify-content-center justify-content-lg-start align-items-center">
                 <div className="d-flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-none bg-[#E6D5C3] border-2 border-[#FAF6ED]"></div>)}
                 </div>
                 <span className="text-sm font-semibold text-[#8A7969]">Loved by 10,000+ naturally</span>
              </div>
            </div>
            
            <div className="col-12 col-lg-6 text-center position-relative">
               {/* Decorative blob background */}
               <div className="position-absolute top-50 start-50 translate-middle organic-blob" style={{ width: '120%', height: '120%', backgroundColor: bgAccent, zIndex: 0 }}></div>
               
               <div className="position-relative z-10 d-inline-block">
                 <EditableImage src={projectData.hero.image || '/image/index-img.webp'} onChange={(val) => updateHero({ image: val })} className="img-fluid" style={{ maxHeight: '500px', objectFit: 'contain' }} alt="Product" />
                 
                 <div className="position-absolute bottom-0 end-0 bg-white p-3 leaf-shape shadow-sm d-flex align-items-center justify-content-center" style={{ width: '100px', height: '100px', transform: 'translate(20%, 20%)' }}>
                   <EditableImage src={projectData.hero.badgeImage || '/image/supplement-fats.webp'} onChange={(val) => updateHero({ badgeImage: val })} className="img-fluid" style={{ maxWidth: '70px' }} alt="Badge" />
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
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ width: '70px' }}>
                  <EditableImage src={projectData.logos?.[i] || `/image/logo-${i + 1}.webp`} onChange={(val) => { const nl = [...(projectData.logos || [])]; nl[i] = val; updateProjectData({ logos: nl }); }} className="img-fluid" style={{ filter: 'opacity(0.7) sepia(0.5) hue-rotate(-30deg)' }} />
                </div>
              ))}
            </div>
         </div>
      </section>

      {/* Ingredients Grid */}
      {projectData.sections?.ingredients && (
        <section className="py-5 group/section relative" style={{ backgroundColor: bgAccent }}>
          <SectionSettings sectionKey="ingredients" />
          <div className="container py-lg-5">
           <div className="text-center mb-5 max-w-[600px] mx-auto">
             <i className="fa-solid fa-leaf mb-3 text-2xl" style={{ color: secondary }}></i>
             <EditableText tagName="h2" className="fw-bold mb-3" style={{ color: primary, fontSize: '2.5rem' }} value={projectData.ingredients.title || "From the Earth"} onChange={(val) => updateIngredient(-1, { title: val })} />
             <p className="text-[#6A5949] font-serif text-lg">Sourced sustainably, crafted carefully.</p>
           </div>

          <div className="row g-4 component-grid">
            {projectData.ingredients?.items?.map((item, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4">
                <div className="organic-card p-4 h-100 text-center relative bg-white">
                  <RemoveButton onClick={() => removeIngredient(i)} />
                  <div className="mx-auto mb-4 organic-blob overflow-hidden" style={{ width: '130px', height: '130px', border: `4px solid ${bgLight}` }}>
                    <EditableImage src={item.image || '/image/ingredient-schisandra.png'} onChange={(val) => updateIngredient(i, { image: val })} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                  </div>
                  <EditableText tagName="h4" className="fw-bold mb-2 font-serif" style={{ color: primary, fontSize: '1.25rem' }} value={item.title} onChange={(val) => updateIngredient(i, { title: val })} />
                  <EditableText tagName="p" className="mb-0 text-[#6A5949]" style={{ fontSize: '0.95rem', lineHeight: 1.6 }} value={item.description} onChange={(val) => updateIngredient(i, { description: val })} />
                </div>
              </div>
            ))}
          </div>
          <AddButton onClick={addIngredient} label="Botanical" />
        </div>
      </section>
      )}

      {/* Benefits - Why it Works */}
      {projectData.sections?.benefits && (
        <section className="py-5 group/section relative" style={{ backgroundColor: '#ffffff' }}>
          <SectionSettings sectionKey="benefits" />
          <div className="container py-lg-5">
           <div className="text-center mb-5 max-w-[700px] mx-auto">
             <i className="fa-solid fa-sun mb-3 text-2xl" style={{ color: secondary }}></i>
             <EditableText tagName="h2" className="fw-bold mb-3 font-serif" style={{ color: primary, fontSize: '2.5rem' }} value={projectData.benefits.title || "The Gift of Vitality"} onChange={(val) => updateBenefit(-1, { title: val })} />
             <EditableText tagName="p" className="text-[#6A5949] italic" value={projectData.benefits.description} onChange={(val) => updateBenefit(-1, { description: val })} />
           </div>

           <div className="row g-4">
             {projectData.benefits.items.map((benefit, i) => (
               <div key={i} className="col-md-6 relative">
                 <div className="organic-card p-4 h-100 flex gap-4 bg-[#FAF6ED]/30">
                   <RemoveButton onClick={() => removeBenefit(i)} />
                   <div className="flex-shrink-0 w-12 h-12 bg-white rounded-none border border-[#E6D5C3] flex items-center justify-center">
                     <i className="fa-solid fa-check text-[#8A7969]"></i>
                   </div>
                   <div>
                     <EditableText tagName="h4" className="fw-bold mb-2 font-serif" style={{ color: primary }} value={benefit.title} onChange={(val) => updateBenefit(i, { title: val })} />
                     <EditableText tagName="p" className="mb-0 text-[#6A5949] text-sm" style={{ lineHeight: 1.7 }} value={benefit.description} onChange={(val) => updateBenefit(i, { description: val })} />
                   </div>
                 </div>
               </div>
             ))}
           </div>
           <AddButton onClick={addBenefit} label="Benefit" />
        </div>
      </section>
      )}

      {/* Testimonials - Voices of Harmony */}
      {projectData.sections?.testimonials && (
        <section className="py-5 group/section relative" style={{ backgroundColor: bgAccent }}>
          <SectionSettings sectionKey="testimonials" />
          <div className="container py-lg-5">
           <div className="text-center mb-5">
             <i className="fa-solid fa-heart mb-3 text-2xl" style={{ color: secondary }}></i>
             <EditableText tagName="h2" className="fw-bold font-serif" style={{ color: primary, fontSize: '2.5rem' }} value={projectData.testimonials?.title || "Kind Words"} onChange={(val) => updateTestimonials(-1, { title: val })} />
           </div>
           <div className="row g-4 justify-content-center">
             {projectData.testimonials?.items.map((item, i) => (
               <div key={i} className="col-md-6 col-lg-4 relative">
                 <div className="organic-card p-4 h-100 bg-white">
                   <RemoveButton onClick={() => removeTestimonial(i)} />
                   <div className="mb-4 text-center">
                     <div className="mb-3 organic-blob overflow-hidden mx-auto" style={{ width: '80px', height: '80px', border: `3px solid ${bgLight}` }}>
                       <EditableImage src={item.image || "https://i.pravatar.cc/150"} onChange={(val) => updateTestimonials(i, { image: val })} className="w-100 h-100 object-cover" />
                     </div>
                     <EditableText tagName="h5" className="fw-bold mb-1 font-serif" value={item.name} onChange={(val) => updateTestimonials(i, { name: val })} />
                     <EditableText tagName="p" className="mb-0 text-xs italic text-[#8A7969]" value={item.role || ""} onChange={(val) => updateTestimonials(i, { role: val })} />
                   </div>
                   <EditableText tagName="p" className="mb-0 text-[#6A5949] text-sm italic text-center" style={{ lineHeight: 1.8 }} value={item.content} onChange={(val) => updateTestimonials(i, { content: val })} />
                 </div>
               </div>
             ))}
           </div>
           <AddButton onClick={addTestimonial} label="Story" />
        </div>
      </section>
      )}

      {/* Gallery */}
      {projectData.sections?.gallery && projectData.gallery && (
        <section className="py-5 group/section relative" style={{ backgroundColor: '#FAF6ED' }}>
          <SectionSettings sectionKey="gallery" />
          <div className="container">
            <div className="text-center mb-5">
              <EditableText tagName="h2" className="fw-bold mb-2" style={{ color: '#2D4A22', fontSize: '2.5rem' }} value={projectData.gallery.title} onChange={(val) => updateGallery({ title: val })} />
              <EditableText tagName="p" className="text-[#6A5949] fs-5" value={projectData.gallery.subtitle} onChange={(val) => updateGallery({ subtitle: val })} />
            </div>
            <div className="row g-3">
              {projectData.gallery.images.map((img, i) => (
                <div key={i} className="col-6 col-md-4">
                  <div className="p-1 overflow-hidden" style={{ background: 'white', borderRadius: '1.5rem', aspectRatio: '16/9' }}>
                    <EditableImage src={img} onChange={(val) => {
                      const ni = [...projectData.gallery!.images];
                      ni[i] = val;
                      updateGallery({ images: ni });
                    }} className="w-100 h-100" style={{ objectFit: 'cover', borderRadius: '1.25rem', maxHeight: '200px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Research */}
      {projectData.sections?.research && projectData.research && (
        <section className="py-5 bg-white border-y group/section relative" style={{ borderColor: '#FAF6ED' }}>
          <SectionSettings sectionKey="research" />
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <EditableText tagName="h2" className="fw-bold fs-1 mb-4" style={{ color: '#2D4A22', fontSize: '2.5rem' }} value={projectData.research.title} onChange={(val) => updateResearch({ title: val })} />
                <EditableText tagName="p" className="fs-5 text-[#2D4A22] mb-4 opacity-75 fw-bold italic" value={projectData.research.subtitle} onChange={(val) => updateResearch({ subtitle: val })} />
                <EditableText tagName="div" className="text-[#6A5949] mb-5" style={{ lineHeight: 1.9, fontSize: '1.05rem' }} value={projectData.research.description} onChange={(val) => updateResearch({ description: val })} />
                <div className="row g-4 border-top pt-4" style={{ borderColor: '#FAF6ED' }}>
                  {projectData.research.stats.map((stat, i) => (
                    <div key={i} className="col-4">
                      <EditableText tagName="div" className="fw-bold fs-1" style={{ color: '#2D4A22' }} value={stat.value} onChange={(val) => {
                        const ns = [...projectData.research!.stats];
                        ns[i] = { ...stat, value: val };
                        updateResearch({ stats: ns });
                      }} />
                      <EditableText tagName="div" className="text-[#6A5949] small uppercase fw-bold" value={stat.label} onChange={(val) => {
                        const ns = [...projectData.research!.stats];
                        ns[i] = { ...stat, label: val };
                        updateResearch({ stats: ns });
                      }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-6 text-center">
                <div className="p-3 d-inline-block" style={{ background: '#FAF6ED', borderRadius: '3rem' }}>
                  <EditableImage src={projectData.research.image} onChange={(val) => updateResearch({ image: val })} className="img-fluid" style={{ borderRadius: '2.5rem', maxHeight: '420px', width: 'auto', objectFit: 'contain' }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {projectData.sections?.about && (
        <section className="py-5 group/section relative" style={{ backgroundColor: bgLight }}>
          <SectionSettings sectionKey="about" />
          <div className="container py-lg-5">
          <div className="row align-items-center g-5">
             <div className="col-12 col-lg-5">
                <div className="position-relative">
                   <div className="position-absolute top-0 start-0 w-100 h-100 organic-blob" style={{ backgroundColor: secondary, transform: 'translate(-5%, 5%)', opacity: 0.1 }}></div>
                   <EditableImage src={projectData.about.image || '/image/banner-img.webp'} onChange={(val) => updateAbout({ image: val })} className="img-fluid position-relative z-10 rounded-none shadow-sm" style={{ objectFit: 'cover' }} />
                </div>
             </div>
             <div className="col-12 col-lg-7 ps-lg-5">
                <EditableText tagName="h2" className="fw-bold mb-4 font-serif" style={{ color: primary, fontSize: '2.5rem' }} value={projectData.about.title || "Our Roots"} onChange={(val) => updateAbout({ title: val })} />
                <EditableText tagName="div" value={projectData.about.description} onChange={(val) => updateAbout({ description: val })} className="text-[#6A5949]" style={{ lineHeight: 1.9, fontSize: '1.1rem', whiteSpace: 'pre-line' }} />
             </div>
          </div>
        </div>
      </section>
      )}

      {/* Pricing - Botanical Garden Theme */}
      <section className="py-5" style={{ backgroundColor: '#ffffff' }} id="pricing">
        <div className="container py-lg-5">
          <div className="text-center mb-5">
             <i className="fa-solid fa-basket-shopping mb-3 text-2xl" style={{ color: secondary }}></i>
             <EditableText tagName="h2" className="fw-bold" style={{ color: primary, fontSize: '2.5rem' }} value={projectData.pricingTitle || "Bountiful Harvests"} onChange={(val) => updateProjectData({ pricingTitle: val })} />
          </div>

          <div className="row g-4 justify-content-center">
            {projectData.pricing?.map((plan, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4 relative">
                <RemoveButton onClick={() => removePricing(i)} />
                <div className="organic-card h-100 text-center d-flex flex-column overflow-hidden" 
                    style={{ border: plan.isPrimary ? `2px solid ${primary}` : `1px solid ${bgAccent}` }}
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
                    <div className="p-4" style={{ backgroundColor: plan.isPrimary ? bgLight : 'transparent' }}>
                     {plan.isPrimary && <span className="d-block font-serif italic mb-2" style={{ color: secondary }}>Most Nurturing Option</span>}
                    <EditableText tagName="h4" className="fw-bold mb-0 font-serif" style={{ color: primary, fontSize: '1.4rem' }} value={plan.title} onChange={(val) => updatePricing(i, { title: val })} />
                  </div>
                  
                  <div className="p-4 flex-grow-1 d-flex flex-column">
                    <div className="relative mb-4 group/img">
                      {/* Rustic Label Badge */}
                      <div className="absolute -top-1 -right-1 z-10 pointer-events-auto">
                        <div className="relative">
                          <div className="absolute inset-0 bg-[#4A3320]/10 translate-x-0.5 translate-y-0.5" />
                          <EditableText
                            className="relative bg-[#4A3320] text-[#FAF6ED] px-2 py-1 rounded-none flex items-center justify-center font-bold text-[10px] border border-[#E6D5C3] shadow-md min-w-[32px]"
                            value={plan.multiplier || "X1"}
                            onChange={(val) => updatePricing(i, { multiplier: val })}
                          />
                        </div>
                      </div>
                      <EditableImage src={plan.image || '/image/bottle-snap.webp'} onChange={(val) => updatePricing(i, { image: val })} className="img-fluid mx-auto transition-transform duration-700 hover:scale-105" style={{ height: '160px', objectFit: 'contain' }} />
                    </div>
                    <EditableText tagName="div" className="fw-bold mb-4 font-serif" style={{ color: primary, fontSize: '2.5rem' }} value={plan.price} onChange={(val) => updatePricing(i, { price: val })} />
                    
                    <ul className="list-unstyled text-start mb-4 mx-auto" style={{ maxWidth: '80%' }}>
                      {plan.features.map((f, fi) => (
                        <li key={fi} className="mb-3 d-flex align-items-center gap-3 text-[#6A5949]">
                          <i className="fa-solid fa-leaf" style={{ color: secondary, fontSize: '0.8rem' }}></i>
                          <EditableText tagName="span" value={f} onChange={(val) => { const nf = [...plan.features]; nf[fi] = val; updatePricing(i, { features: nf }); }} />
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-3">
                      <Linkable link={plan.buttonHref} onLinkChange={() => {}}>
                        <button className={`organic-btn w-100 justify-content-center ${plan.isPrimary ? 'organic-btn-primary' : 'organic-btn-outline'}`}>
                          <EditableText tagName="span" value={plan.buttonText} onChange={(val) => updatePricing(i, { buttonText: val })} />
                        </button>
                      </Linkable>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <AddButton onClick={addPricing} label="Bundle" />
        </div>
      </section>
 
      {/* Satisfaction Promise */}
      <section className="py-5" style={{ backgroundColor: bgAccent }}>
        <div className="container py-lg-5">
          <div className="p-5 bg-white shadow-md" style={{ borderRadius: '3rem', border: `2px dashed ${bgAccent}` }}>
            <div className="row align-items-center g-5">
              <div className="col-lg-4 text-center">
                <EditableImage src={projectData.footer.trustImage || '/image/money-back-guarantee-..webp'} onChange={(val) => updateFooter({ trustImage: val })} className="img-fluid mb-4 mx-auto" style={{ maxWidth: '220px' }} />
                <EditableText tagName="p" className="fw-bold font-serif italic mb-0" style={{ color: secondary }} value={projectData.guaranteeSubtitle || "Pure Assurance"} onChange={(val) => updateProjectData({ guaranteeSubtitle: val })} />
              </div>
              <div className="col-lg-8">
                <EditableText tagName="h2" className="fw-bold mb-3 font-serif" style={{ color: primary, fontSize: '2.2rem' }} value={projectData.guaranteeHeadline || "Pure Satisfaction Promise"} onChange={(val) => updateProjectData({ guaranteeHeadline: val })} />
                <EditableText tagName="p" className="text-[#6A5949]" style={{ lineHeight: 1.8, fontSize: '1.05rem' }} value={projectData.guaranteeDescription || `Your happiness is our highest priority. Every order of ${projectData.productName} comes protected by a comprehensive 60-day satisfaction promise. If you are not completely satisfied with the results, simply contact our support team for a full refund.`} onChange={(val) => updateProjectData({ guaranteeDescription: val })} />
                <Linkable link={projectData.hero.buttonHref} onLinkChange={() => { }}>
                  <button className="organic-btn-primary mt-4">Order Now <i className="fa-solid fa-seedling"></i></button>
                </Linkable>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {projectData.sections?.faq && (
        <section className="py-5 group/section relative" style={{ backgroundColor: bgAccent }}>
          <SectionSettings sectionKey="faq" />
          <div className="container max-w-[800px] mx-auto py-lg-4">
          <EditableText tagName="h2" className="text-center fw-bold mb-5 font-serif" style={{ color: primary, fontSize: '2.2rem' }} value={projectData.faqTitle || "Wisdom & Questions"} onChange={(val) => updateProjectData({ faqTitle: val })} />
          
          <div className="d-flex flex-column gap-3">
            {projectData.faq?.map((item, i) => (
              <div key={i} className="bg-white rounded-none border border-[#E6D5C3] overflow-hidden relative">
                <RemoveButton onClick={() => removeFAQ(i)} />
                <div className="p-4 cursor-pointer d-flex justify-content-between align-items-center" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <EditableText tagName="span" className="fw-bold font-serif" style={{ color: primary, fontSize: '1.1rem' }} value={item.question} onChange={(val) => updateFAQ(i, { question: val })} />
                  <div className="w-8 h-8 rounded-none d-flex align-items-center justify-content-center transition-colors" style={{ backgroundColor: openFaq === i ? primary : bgLight, color: openFaq === i ? '#fff' : primary }}>
                     <i className={`fa-solid ${openFaq === i ? 'fa-minus' : 'fa-plus'} text-xs`}></i>
                  </div>
                </div>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <EditableText tagName="p" className="mb-0 text-[#6A5949]" style={{ fontSize: '1rem', lineHeight: 1.7 }} value={item.answer} onChange={(val) => updateFAQ(i, { answer: val })} />
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
      <footer className="py-5 text-center" style={{ backgroundColor: primary, color: '#FAF6ED' }}>
         <div className="container">
           <i className="fa-solid fa-seedling text-3xl mb-4" style={{ color: secondary }}></i>
           <EditableText tagName="h2" className="fw-bold mb-4 font-serif" style={{ fontSize: '1.8rem' }} value={projectData.footerHeadline || "Back to Nature"} onChange={(val) => updateProjectData({ footerHeadline: val })} />
           <EditableText tagName="p" className="mx-auto mb-5 text-center" style={{ maxWidth: '600px', opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.8 }} value={projectData.footer.companyInfo} onChange={(val) => updateFooter({ companyInfo: val })} />
           
           <div className="d-flex justify-content-center flex-wrap gap-4 mb-4">
              {projectData.footer.links.map((link, i) => (
                <div key={i} className="relative group/linkitem">
                  <RemoveButton onClick={() => {
                    const nl = [...projectData.footer.links];
                    nl.splice(i, 1);
                    updateFooter({ links: nl });
                  }} />
                  <Linkable link={link.href} onLinkChange={(val) => { const nl = [...projectData.footer.links]; nl[i] = { ...nl[i], href: val }; updateFooter({ links: nl }); }}>
                    <EditableText tagName="span" className="font-serif italic cursor-pointer group-hover/linkitem:opacity-75 transition-opacity" style={{ fontSize: '1.1rem' }} value={link.label} onChange={(val) => { const nl = [...projectData.footer.links]; nl[i] = { ...nl[i], label: val }; updateFooter({ links: nl }); }} />
                  </Linkable>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <AddButton onClick={() => updateFooter({ links: [...projectData.footer.links, { label: 'New Link', href: '#' }] })} label="Link" />
            </div>
           
           <hr className="my-4 mx-auto" style={{ maxWidth: '300px', borderColor: 'rgba(250, 246, 237, 0.2)' }} />
           <p className="opacity-50 text-sm mb-0">© {new Date().getFullYear()} {projectData.productName}. Cultivated with care.</p>
         </div>
      </footer>

      {/* Purchase Proof Popup */}
      {projectData.socialProof?.enabled && (
        <div
          className={`purchase-proof ${showProof ? 'active' : ''} group/proof cursor-pointer hover:border-[#8A7969]/50 transition-all`}
          onClick={() => setShowProofSettings(true)}
        >
          <div className="absolute -top-10 left-0 bg-[#4A3320] text-[#FAF6ED] text-[9px] font-bold px-2 py-1.5 rounded-none opacity-0 group-hover/proof:opacity-100 transition-all shadow-xl pointer-events-none">
            <i className="fa-solid fa-gear mr-1"></i> Popup Settings
          </div>
          <div className="flex-shrink-0 w-12 h-12 rounded-[15px] bg-[#FAF6ED] border border-[#E6D5C3] overflow-hidden">
            <img
              src={projectData.socialProof?.items[proofIndex]?.image || projectData.hero.image || '/image/banner-img.webp'}
              className="w-100 h-100 object-contain"
              alt="Product"
            />
          </div>
          <div className="flex flex-col text-left">
            <div className="text-[#8A7969] text-[8px] mb-1">
              {[...Array(5)].map((_, si) => <i key={si} className="fa-solid fa-star"></i>)}
            </div>
            <div className="text-[#4A3320] text-xs leading-tight font-serif">
              <strong className="text-green-600">{projectData.socialProof?.items[proofIndex]?.name}</strong> from <strong className="text-green-600">{projectData.socialProof?.items[proofIndex]?.location}</strong> <br />
              <span className="opacity-70">{projectData.socialProof?.items[proofIndex]?.content}</span>
            </div>
            <small className="text-[#8A7969] text-[9px] mt-1 font-sans italic font-bold uppercase tracking-wider">{projectData.socialProof?.items[proofIndex]?.timeAgo} • Verified Customer</small>
          </div>
        </div>
      )}

      {/* Social Proof Settings Modal */}
      {showProofSettings && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#4A3320]/60 backdrop-blur-sm" onClick={() => setShowProofSettings(false)}></div>
          <div className="bg-[#FAF6ED] w-full max-w-xl rounded-none shadow-2xl z-10 overflow-hidden border border-[#E6D5C3]">
            <div className="p-4 border-b border-[#E6D5C3] d-flex justify-content-between align-items-center bg-[#F0EBE1]">
              <h3 className="m-0 fs-6 fw-bold text-[#4A3320] uppercase tracking-widest font-serif">Widget Configuration</h3>
              <button onClick={() => setShowProofSettings(false)} className="border-none bg-transparent text-[#8A7969] hover:text-[#4A3320]">
                <i className="fa-solid fa-times fs-5"></i>
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between p-3 bg-white border border-[#E6D5C3]">
                <span className="text-xs font-bold text-[#8A7969] uppercase">Display Widget</span>
                <button
                  onClick={() => updateSocialProof({ enabled: !projectData.socialProof?.enabled })}
                  className={`px-4 py-1.5 rounded-none text-[10px] font-bold transition-all border-none ${projectData.socialProof?.enabled ? 'bg-[#8A7969] text-white' : 'bg-[#E6D5C3] text-[#8A7969]'}`}
                >
                  {projectData.socialProof?.enabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="row g-3 text-left">
                <div className="col-md-6 text-left">
                  <label className="text-[10px] font-bold text-[#8A7969] uppercase mb-1 block">Show Time (ms)</label>
                  <input type="number" className="w-full p-2 bg-white border border-[#E6D5C3] text-[#4A3320] text-sm outline-none focus:border-[#8A7969]" value={projectData.socialProof?.displayTime} onChange={(e) => updateSocialProof({ displayTime: parseInt(e.target.value) })} />
                </div>
                <div className="col-md-6 text-left">
                  <label className="text-[10px] font-bold text-[#8A7969] uppercase mb-1 block">Gap Time (ms)</label>
                  <input type="number" className="w-full p-2 bg-white border border-[#E6D5C3] text-[#4A3320] text-sm outline-none focus:border-[#8A7969]" value={projectData.socialProof?.interval} onChange={(e) => updateSocialProof({ interval: parseInt(e.target.value) })} />
                </div>
              </div>

              <div className="space-y-4 text-left">
                <label className="text-[10px] font-bold text-[#8A7969] uppercase block mb-1">Customer Notifications</label>
                {(projectData.socialProof?.items || []).map((item, idx) => (
                  <div key={idx} className="p-3 bg-white border border-[#E6D5C3] relative group/item">
                    <button 
                      onClick={() => {
                        const ni = [...(projectData.socialProof?.items || [])];
                        ni.splice(idx, 1);
                        updateSocialProof({ items: ni });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-none flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity border-none"
                    >
                      <i className="fa-solid fa-times text-[10px]"></i>
                    </button>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="text-[9px] font-bold text-[#8A7969] uppercase block mb-1">Name</label>
                        <input type="text" className="w-full p-1.5 bg-[#FAF6ED] border border-[#E6D5C3] text-[#4A3320] text-[11px] outline-none" value={item.name} onChange={(e) => {
                          const ni = [...(projectData.socialProof?.items || [])];
                          ni[idx] = { ...ni[idx], name: e.target.value };
                          updateSocialProof({ items: ni });
                        }} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-[9px] font-bold text-[#8A7969] uppercase block mb-1">From</label>
                        <input type="text" className="w-full p-1.5 bg-[#FAF6ED] border border-[#E6D5C3] text-[#4A3320] text-[11px] outline-none" value={item.location} onChange={(e) => {
                          const ni = [...(projectData.socialProof?.items || [])];
                          ni[idx] = { ...ni[idx], location: e.target.value };
                          updateSocialProof({ items: ni });
                        }} />
                      </div>
                      <div className="col-md-12">
                        <label className="text-[9px] font-bold text-[#8A7969] uppercase block mb-1">Purchase Content</label>
                        <input type="text" className="w-full p-1.5 bg-[#FAF6ED] border border-[#E6D5C3] text-[#4A3320] text-[11px] outline-none" value={item.content} onChange={(e) => {
                          const ni = [...(projectData.socialProof?.items || [])];
                          ni[idx] = { ...ni[idx], content: e.target.value };
                          updateSocialProof({ items: ni });
                        }} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-[9px] font-bold text-[#8A7969] uppercase block mb-1">Timestamp</label>
                        <input type="text" className="w-full p-1.5 bg-[#FAF6ED] border border-[#E6D5C3] text-[#4A3320] text-[11px] outline-none" value={item.timeAgo} onChange={(e) => {
                          const ni = [...(projectData.socialProof?.items || [])];
                          ni[idx] = { ...ni[idx], timeAgo: e.target.value };
                          updateSocialProof({ items: ni });
                        }} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-[9px] font-bold text-[#8A7969] uppercase block mb-1">Image URL</label>
                        <input type="text" className="w-full p-1.5 bg-[#FAF6ED] border border-[#E6D5C3] text-[#4A3320] text-[11px] outline-none" value={item.image} onChange={(e) => {
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
                    const ni = [...(projectData.socialProof?.items || []), { name: "New Gardener", location: "Portland", content: "bought 3 jars", timeAgo: "2 minutes ago", image: projectData.hero.image || "/image/bottle-snap.webp" }];
                    updateSocialProof({ items: ni });
                  }}
                  className="w-full py-2 bg-white text-[#8A7969] text-[10px] font-bold uppercase border border-[#E6D5C3] hover:bg-[#F0EBE1] transition-all mt-2"
                >
                  <i className="fa-solid fa-plus mr-1"></i> Add Record
                </button>
              </div>
            </div>
            <div className="p-4 border-t border-[#E6D5C3] text-right bg-[#F0EBE1]">
              <button onClick={() => setShowProofSettings(false)} className="bg-[#4A3320] text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest border-none hover:opacity-90 transition-all">Save Changes</button>
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
