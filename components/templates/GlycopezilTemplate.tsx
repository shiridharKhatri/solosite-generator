'use client';

import React, { useEffect, useState } from 'react';
import { EditableText } from '../editor/EditableText';
import { EditableImage } from '../editor/EditableImage';
import { useStore, type ProjectData } from '@/lib/store';

// Helper for Context Menu (Right Click)
const LinkSettings = ({ link, onChange, onClose, x, y }: { link: string; onChange: (val: string) => void, onClose: () => void, x: number, y: number }) => {
  return (
    <div
      className="fixed bg-white rounded-none border border-gray-100 p-4 z-[99999] w-64 animate-in fade-in zoom-in duration-200"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-bold uppercase text-gray-400">Link Settings</span>
        <button onClick={onClose} className="text-gray-300 hover:text-gray-600"><i className="fa-solid fa-xmark"></i></button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-gray-500 mb-1 block">URL or Section Anchor</label>
          <input
            type="text"
            placeholder="e.g. #pricing or https://..."
            className="w-full text-xs p-2 bg-gray-50 border border-gray-100 rounded-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={link || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <p className="text-[9px] text-gray-400 italic">Example: #pricing to jump to pricing section.</p>
      </div>
    </div>
  );
};

// Wrapper for Linkable elements
const Linkable = ({ children, link, onLinkChange, className = "" }: { children: React.ReactNode, link: string, onLinkChange: (val: string) => void, className?: string }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
    setShowSettings(true);
  };

  return (
    <div
      onContextMenu={handleRightClick}
      className={`relative group/link ${className}`}
    >
      {children}
      {showSettings && (
        <>
          <div className="fixed inset-0 z-[99998]" onClick={() => setShowSettings(false)} />
          <LinkSettings link={link} onChange={onLinkChange} onClose={() => setShowSettings(false)} x={pos.x} y={pos.y} />
        </>
      )}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPos({ x: e.clientX, y: e.clientY });
          setShowSettings(true);
        }}
        className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/link:opacity-100 transition-all bg-blue-600 text-white px-2 py-1 rounded-none shadow-xl z-50 flex items-center gap-1 border-none hover:bg-blue-700 hover:scale-105"
        title="Edit Link Settings"
      >
        <i className="fa-solid fa-link text-[10px]"></i>
        <span className="text-[8px] font-bold uppercase tracking-widest">Link</span>
      </button>
      {link && <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/link:opacity-100 transition-opacity whitespace-nowrap z-50 backdrop-blur-sm">URL: {link}</div>}
    </div>
  );
};

// Helper for icon toggle
const IconEditor = ({ value, onChange, className = "" }: { value: string; onChange: (val: string) => void, className?: string }) => {
  const icons = ["fa-solid fa-cart-shopping", "fa-solid fa-arrow-right", "fa-solid fa-check", "fa-solid fa-bolt", "fa-solid fa-star", "fa-solid fa-circle-play", "fa-solid fa-cart-arrow-down"];
  const cycleIcon = () => {
    const currentIndex = icons.indexOf(value || icons[0]);
    const nextIndex = (currentIndex + 1) % icons.length;
    onChange(icons[nextIndex]);
  };
  return (
    <i
      className={`${value || icons[1]} cursor-pointer hover:scale-125 transition-transform text-current ${className}`}
      onClick={(e) => { e.stopPropagation(); cycleIcon(); }}
      title="Click to toggle icon"
    />
  );
};



// Remove Item Button
const RemoveButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className="absolute -top-3 -right-3 bg-red-500 text-white w-5 h-5 rounded-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-110 border-none shadow-lg"
  >
    <i className="fa-solid fa-xmark text-[10px]"></i>
  </button>
);

export const GlycopezilTemplate: React.FC = () => {
  const {
    projectData, updateHero, updateAbout,
    updateFeature, addFeature, removeFeature,
    updateIngredient, addIngredient, removeIngredient,
    updateBenefit, addBenefit, removeBenefit,
    updateFAQ, addFAQ, removeFAQ,
    updatePricing, addPricing, removePricing,
    updateFooter, updateProductName, updateTestimonials, addTestimonial, removeTestimonial,
    updateResearch, updateNavbar,
    updateSocialProof, updateSectionVisibility, updateLegalPage, updateProjectData,
    showLegalModal, setShowLegalModal
  } = useStore();

  // Add Item Button inside to access projectData
  const AddButton = ({ onClick, label }: { onClick: () => void, label: string }) => (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="text-white text-[12px] font-bold py-2 px-5 rounded-none transition-all flex items-center gap-2 mx-auto my-8 uppercase tracking-widest border-none"
      style={{ backgroundColor: projectData?.theme?.primary || '#2C0D67' }}
    >
      <i className="fa-solid fa-plus"></i> Add {label}
    </button>
  );

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

  const [proofIndex, setProofIndex] = useState(0);
  const [showProof, setShowProof] = useState(false);
  const [showProofSettings, setShowProofSettings] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <div className="glycopezil-template relative overflow-x-hidden bg-white">
      {/* Bootstrap & Icons */}
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" />

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap');

        .glycopezil-template {
            font-family: 'Inter', sans-serif;
            color: #333;
            overflow-y: auto;
            width: 100%;
            overflow-x: hidden;
        }

        .glycopezil-template h1, .glycopezil-template h2, .glycopezil-template h3, .glycopezil-template h4, .glycopezil-template h5, .glycopezil-template h6, .glycopezil-template .logo {
            font-family: 'Outfit', sans-serif !important;
        }

        .glycopezil-template p, .glycopezil-template span, .glycopezil-template li, .glycopezil-template a, .glycopezil-template .nav-link, .glycopezil-template button {
            font-family: 'Inter', sans-serif;
        }

        .navcolor, .sectioncolor {
            background-color: ${projectData.theme?.primary || '#2C0D67'};
        }

        .sectioncolor1 {
            background-color: #f8f9fa;
        }

        .logo {
            color: ${projectData.theme?.secondary || '#FF9202'};
        }

        .bannerimg {
            max-height: 55vh;
            width: auto;
            max-width: 100%;
            object-fit: contain;
        }

        .banner-img1 {
            max-height: 50vh;
            width: auto !important;
            max-width: 100% !important;
            object-fit: contain;
        }

        .title-scale {
            font-size: clamp(1.5rem, 4vw, 2.75rem);
            line-height: 1.15;
            overflow-wrap: break-word;
            hyphens: auto;
        }

        .bgbadge {
            background-color: white;
            border: 0.5px solid ${projectData.theme?.primary || '#2C0D67'};
            border-radius: 20px;
            color: rgb(5, 0, 0);
            width: 100%;
            max-width: 312px;
            min-height: 380px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding: 1.5rem;
            margin: 0 auto;
        }

        .ing { border-radius: 12px; }

        .revimg {
            max-width: 250px;
            border-radius: 15px;
            object-fit: cover;
        }

        .gurentybadge {
            width: 350px;
            max-width: 100%;
            object-fit: contain;
        }

        .purchase-proof {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #111;
            color: #fff;
            border-radius: 12px;
            padding: 15px 18px;
            border: 1px solid #333;
            font-size: 14px;
            max-width: 320px;
            z-index: 9999;
            transform: translateX(-120%);
            transition: transform 0.5s ease;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .purchase-proof.active {
            transform: translateX(0);
        }

        /* Responsive Breakpoints */
        @media (max-width: 992px) {
            .glycopezil-template { padding-top: 0 !important; }
            .bannerimg, .banner-img1 { height: auto !important; width: 100% !important; max-height: 40vh !important; }
            .clearfix::after { content: ""; clear: both; display: table; }
            .float-lg-end { float: none !important; margin: 0 auto 1.5rem !important; display: block !important; }
            .col-lg-7 { text-align: center !important; }
            .flex-wrap { justify-content: center !important; }
            .title-scale { font-size: 1.6rem !important; }
            .fs-1 { font-size: 2.22rem !important; }
            .fs-2 { font-size: 1.8rem !important; }
        }

        @media (max-width: 576px) {
            .purchase-proof { display: none !important; }
            .bgbadge { max-width: 100%; margin-bottom: 2rem; }
            .title-scale { font-size: 1.75rem !important; }
            .fs-1 { font-size: 1.8rem !important; }
            .fs-2 { font-size: 1.5rem !important; }
            .fs-3 { font-size: 1.3rem !important; }
            .py-5 { padding: 3rem 0 !important; }
            .container { padding-left: 20px !important; padding-right: 20px !important; }
            .navbar-brand .logo { font-size: 1.4rem !important; }
        }

        /* Forced Mobile Styles for Editor Preview Mode */
        .mobile-preview .glycopezil-template .col-lg-5,
        .mobile-preview .glycopezil-template .col-lg-7,
        .mobile-preview .glycopezil-template .col-lg-10,
        .mobile-preview .glycopezil-template .col-lg-4,
        .mobile-preview .glycopezil-template .col-md-6,
        .mobile-preview .glycopezil-template .col-md-4 {
            width: 100% !important;
            flex: 0 0 100% !important;
            max-width: 100% !important;
            display: block !important;
        }

        .mobile-preview .glycopezil-template .d-lg-flex {
            display: none !important;
        }

        .mobile-preview .glycopezil-template .d-lg-none {
            display: flex !important;
        }

        .mobile-preview .glycopezil-template .float-lg-end {
            float: none !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            max-width: 100% !important;
        }

        .mobile-preview .glycopezil-template .title-scale {
            font-size: 1.5rem !important;
        }

        .mobile-preview .glycopezil-template .text-center {
            text-align: center !important;
        }

        .mobile-preview .glycopezil-template .text-lg-start {
            text-align: center !important;
        }

        .mobile-preview .glycopezil-template .about-description {
            text-align: center !important;
        }

        .mobile-preview .glycopezil-template [style*="scale(1.04)"] {
            transform: scale(1) !important;
        }

        .about-description {
            text-align: justify;
        }

        @media (max-width: 992px) {
            .about-description {
                text-align: center !important;
            }
            .glycopezil-template [style*="scale(1.04)"] {
                transform: scale(1) !important;
            }
        }


        .btn-custom-pill {
            background-color: ${projectData.theme?.secondary || '#fbbf24'};
            color: black;
            font-weight: 700;
            border-radius: 9999px;
            border: none;
            padding: 0.75rem 2rem;
            border: 1px solid rgba(0,0,0,0.05);
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            text-transform: capitalize;
            text-decoration: none;
            white-space: normal;
            word-break: break-word;
            max-width: 100%;
        }
        .btn-custom-pill:hover {
            opacity: 0.9;
            transform: translateY(-2px);
            color: black;
        }

        @media (max-width: 576px) {
            .btn-custom-pill {
                padding: 0.6rem 1.25rem !important;
                font-size: 0.9rem !important;
            }
        }

      `}} />

      {/* Navbar Section */}
      <header>
        <nav className="navbar navbar-expand-lg sticky-top border-bottom bg-white py-2 z-[1000]">
          <div className="container px-3 d-flex justify-content-between align-items-center mx-auto">
            <a className="navbar-brand d-flex align-items-center gap-2 no-underline" href="#">
              <div style={{ width: '44px', height: '44px', flexShrink: 0 }}>
                <EditableImage
                  src={projectData.hero.logoImage || "https://placehold.co/100x100?text=Logo"}
                  onChange={(val) => updateHero({ logoImage: val })}
                  className="w-full h-full rounded-none bg-gray-50 border border-dashed border-gray-200"
                  style={{ objectFit: 'contain' }}
                  alt="Brand Logo"
                />
              </div>
              <EditableText
                tagName="span"
                className="fs-2 fw-bold logo text-capitalize"
                value={projectData.productName}
                onChange={(val) => updateProductName(val)}
              />
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
                    className="nav-link text-dark fs-5 fw-bold cursor-pointer p-0 no-underline"
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
                <button className="btn-custom-pill">
                  <EditableText tagName="span" value="Order Now" onChange={() => { }} />
                  <IconEditor value={projectData.hero.icon || "fa-solid fa-arrow-right"} onChange={(val) => updateHero({ icon: val })} />
                </button>
              </Linkable>
            </div>
            <div className="d-flex align-items-center gap-2 d-lg-none">
              <Linkable link={projectData.hero.buttonHref} onLinkChange={(val) => updateHero({ buttonHref: val })}>
                <button className="btn-custom-pill py-2 px-3 fs-6 text-nowrap" style={{ minWidth: 'auto', width: 'auto', whiteSpace: 'nowrap' }}>
                  <EditableText tagName="span" value={projectData.hero.buttonText} onChange={() => { }} />
                </button>
              </Linkable>
              {/* Mobile Toggler */}
              <button className="border-none bg-transparent p-2 text-[#FF922B]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} fs-2`}></i>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="d-lg-none absolute top-full left-0 w-full bg-white border-bottom p-4 d-flex flex-column align-items-center gap-3 z-[999] animate-in slide-in-from-top duration-300">
              {projectData.navbar?.links.map((link, i) => (
                <a key={i} href={link.href} className="fs-5 fw-bold text-dark no-underline cursor-pointer" onClick={() => setIsMenuOpen(false)}>{link.label}</a>
              ))}
              <Linkable link={projectData.hero.buttonHref} onLinkChange={() => { }}>
                <button className="btn-custom-pill w-100">
                  <EditableText tagName="span" value="Order Now" onChange={() => { }} />
                  <IconEditor value={projectData.hero.icon || "fa-solid fa-arrow-right"} onChange={(val) => updateHero({ icon: val })} />
                </button>
              </Linkable>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container-fluid py-4 py-lg-5 mb-3 bg-white overflow-hidden">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            {/* Image Column - Left on desktop, top on mobile */}
            <div className="col-12 col-lg-5 text-center mb-3 mb-lg-0 d-flex flex-column align-items-center">
              {/* Product Image */}
              <div style={{ width: '100%', maxWidth: '400px' }}>
                <EditableImage
                  src={projectData.hero.image || '/image/index-img.webp'}
                  onChange={(val) => updateHero({ image: val })}
                  className="mx-auto d-block img-fluid"
                  style={{ objectFit: 'contain', width: '100%' }}
                  alt="Product Banner"
                />
              </div>

              {/* Certification Logos Row - fully separate */}
              <div className="d-flex justify-content-center flex-wrap gap-3 mt-4 pt-2" style={{ width: '100%' }}>
                {(projectData.logos || []).map((logo, i) => (
                  <div key={i} className="relative group" style={{ width: '65px', height: '65px' }}>
                    <EditableImage
                      src={logo}
                      onChange={(val) => {
                        const newLogos = [...(projectData.logos || [])];
                        newLogos[i] = val;
                        updateProjectData({ logos: newLogos });
                      }}
                      onRemove={() => {
                        const nl = projectData.logos.filter((_, idx) => idx !== i);
                        updateProjectData({ logos: nl });
                      }}
                      className="img-fluid"
                    />
                  </div>
                ))}
                <button
                  onClick={() => updateProjectData({ logos: [...(projectData.logos || []), ""] })}
                  className="w-[65px] h-[65px] border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all"
                >
                  <i className="fa-solid fa-plus text-xs"></i>
                </button>
              </div>
            </div>

            {/* Content Column - Right on desktop, bottom on mobile */}
            <div className="col-12 col-lg-7 pt-3 pt-lg-4 text-dark px-3 px-lg-5 text-center text-lg-start">
              <EditableText
                tagName="h1"
                value={projectData.hero.title}
                onChange={(val) => updateHero({ title: val })}
                className="fw-bold mb-3 d-inline-block w-100 title-scale"
              />
              <EditableText
                tagName="p"
                value={projectData.hero.subtitle}
                onChange={(val) => updateHero({ subtitle: val })}
                className="fs-6 mt-2 fw-medium text-dark opacity-90 mx-auto mx-lg-0"
                style={{ whiteSpace: 'pre-line', lineHeight: '1.7', maxWidth: '600px', textAlign: 'justify' }}
              />

              <div className="mt-4">
                <div className="flex flex-wrap gap-3 justify-center justify-content-lg-start">
                  <Linkable link={projectData.hero.buttonHref} onLinkChange={(val) => updateHero({ buttonHref: val })}>
                    <div className="btn-custom-pill px-5 py-2.5 fs-6">
                      <EditableText tagName="span" value={projectData.hero.buttonText} onChange={(val) => updateHero({ buttonText: val })} />
                      <IconEditor value={projectData.hero.icon || "fa-solid fa-cart-shopping"} onChange={(val) => updateHero({ icon: val })} />
                    </div>
                  </Linkable>
                  <Linkable link={projectData.hero.secondaryButtonHref || ''} onLinkChange={(val) => updateHero({ secondaryButtonHref: val })}>
                    <div className="btn-custom-pill px-5 py-2.5 fs-6" style={{ backgroundColor: 'transparent', border: '2px solid #ddd' }}>
                      <EditableText tagName="span" value={projectData.hero.secondaryButtonText || 'Visit Official Site Now!'} onChange={(val) => updateHero({ secondaryButtonText: val })} />
                      <IconEditor className="text-dark" value={projectData.hero.secondaryIcon || "fa-solid fa-arrow-right"} onChange={(val) => updateHero({ secondaryIcon: val })} />
                    </div>
                  </Linkable>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      {projectData.sections?.features !== false && (
        <>
          <section id="features" className="container-fluid text-center mt-0 sectioncolor relative group/section">
            <SectionSettings sectionKey="features" />
            <div className="container">
              <EditableText
                tagName="h2"
                className="text-center fs-1 py-3 fw-bold text-white mb-0"
                value={projectData.featuresTitle || "What Sets " + projectData.productName + " Apart?"}
                onChange={(val) => useStore.getState().updateProjectData({ featuresTitle: val })}
              />
            </div>
          </section>

          <section className="container-fluid py-5 sectioncolor1">
            <div className="container mx-auto">
              <div className="row justify-content-center text-center gap-4">
                {projectData.features?.map((feature, i) => (
                  <div key={i} className="col-12 col-sm-6 col-md-4 col-lg-3 p-4 bgbadge relative group">
                    <RemoveButton onClick={() => removeFeature(i)} />
                    <EditableImage
                      src={feature.image || '/image/gmo.webp'}
                      onChange={(val) => updateFeature(i, { image: val })}
                      className="img-fluid w-75 mb-3 mx-auto"
                    />
                    <EditableText
                      tagName="h3"
                      className="fw-bold fs-4 mb-2"
                      value={feature.title}
                      onChange={(val) => updateFeature(i, { title: val })}
                    />
                    <EditableText
                      tagName="p"
                      className="fs-5 text-gray-700"
                      value={feature.description}
                      onChange={(val) => updateFeature(i, { description: val })}
                    />
                  </div>
                ))}
              </div>
              <AddButton onClick={addFeature} label="Feature Card" />
            </div>
          </section>
        </>
      )}

      {/* Understanding the Formula Section */}
      {projectData.sections?.about !== false && (
        <>
          <section id="about" className="container-fluid text-center sectioncolor relative group/section">
            <SectionSettings sectionKey="about" />
            <div className="container">
              <EditableText
                tagName="h2"
                className="text-center fs-1 py-3 fw-bold text-white mb-0"
                value={projectData.about.title || "Understanding the " + projectData.productName + " Formula"}
                onChange={(val) => updateAbout({ title: val })}
              />
            </div>
          </section>

          <section className="container-fluid sectioncolor1 py-3 border-bottom">
            <div className="container">
              <div className="clearfix">
                {/* Image Section - Floated Right for Newspaper Style */}
                <div className="float-lg-end ms-lg-5 mb-4 mb-lg-1 col-12 col-lg-5 px-0 text-center">
                  <div className="relative inline-block p-3 bg-white rounded-none shadow-md border border-gray-100 transition-transform hover:scale-[1.01] duration-300 w-full">
                    <EditableImage
                      src={projectData.about.image || '/image/banner-img.webp'}
                      onChange={(val) => updateAbout({ image: val })}
                      className="rounded-none img-fluid w-full"
                      style={{ maxHeight: '380px', objectFit: 'contain' }}
                    />
                    <div className="mt-2 text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] border-top pt-2">
                      Editorial: Clinical Formula Composition
                    </div>
                  </div>
                </div>

                {/* Text Section - Wrapped around image */}
                <div className="about-description-wrapper">
                  <EditableText
                    tagName="div"
                    value={projectData.about.description}
                    onChange={(val) => updateAbout({ description: val })}
                    className="fs-5 text-secondary about-description"
                    style={{ textAlign: 'justify', whiteSpace: 'pre-line', lineHeight: '1.7', color: '#444' }}
                  />
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Research */}
      {projectData.research && projectData.sections?.research !== false && (
        <>
          <section id="research" className="container-fluid text-center mt-0 sectioncolor relative group/section">
            <SectionSettings sectionKey="research" />
            <div className="container">
              <EditableText tagName="h2" className="text-center fs-1 py-3 fw-bold text-white mb-0" value={projectData.research.title} onChange={(val) => updateResearch({ title: val })} />
            </div>
          </section>
          <section className="container-fluid py-5 bg-light">
            <div className="container">
              <div className="row align-items-center g-5">
                <div className="col-lg-6">
                  <EditableText tagName="h3" className="fw-bold fs-2 mb-3" value={projectData.research.subtitle} onChange={(val) => updateResearch({ subtitle: val })} />
                  <EditableText tagName="div" className="fs-5 text-muted mb-5" value={projectData.research.description} onChange={(val) => updateResearch({ description: val })} style={{ whiteSpace: 'pre-line' }} />
                  <div className="row g-4 pt-4 border-top">
                    {projectData.research.stats.map((stat, i) => (
                      <div key={i} className="col-4">
                        <EditableText tagName="div" className="fw-bold fs-2" style={{ color: projectData.theme?.primary }} value={stat.value} onChange={(val) => {
                          const ns = [...projectData.research!.stats];
                          ns[i] = { ...stat, value: val };
                          updateResearch({ stats: ns });
                        }} />
                        <EditableText tagName="div" className="text-muted small fw-bold uppercase" value={stat.label} onChange={(val) => {
                          const ns = [...projectData.research!.stats];
                          ns[i] = { ...stat, label: val };
                          updateResearch({ stats: ns });
                        }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-lg-6 text-center">
                  <div className="p-2 bg-white border shadow-sm d-inline-block">
                    <EditableImage src={projectData.research.image} onChange={(val) => updateResearch({ image: val })} className="img-fluid" style={{ maxHeight: '400px', width: 'auto', objectFit: 'contain' }} />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Benefits Section */}
      {projectData.sections?.benefits !== false && (
        <>
          <section id="benefits" className="container-fluid text-center mt-0 sectioncolor relative group/section">
            <SectionSettings sectionKey="benefits" />
            <div className="container">
              <EditableText
                tagName="h2"
                className="text-center fs-1 fw-bold py-3 text-white mb-0"
                value={projectData.benefits.title || "Powerful Advantages of " + projectData.productName}
                onChange={(val) => updateBenefit(-1, { title: val })}
              />
            </div>
          </section>

          <section className="container-fluid bg-light py-5">
            <div className="container mx-auto">
              <EditableText
                tagName="p"
                className="fs-5 text-center mb-5 max-w-4xl mx-auto text-gray-700"
                value={projectData.benefits.description}
                onChange={(val) => updateBenefit(-1, { description: val })}
              />

              <div className="row g-4 justify-content-center">
                {projectData.benefits?.items?.map((benefit, i) => (
                  <div key={i} className="col-12 col-lg-10 relative">
                    <div className="card h-100 ing text-center text-lg-start p-4 bg-white hover:-translate-y-2 transition-all duration-300 border-0">
                      <RemoveButton onClick={() => removeBenefit(i)} />
                      <EditableText
                        tagName="h3"
                        className="fw-bold fs-4 mb-2"
                        value={benefit.title}
                        onChange={(val) => updateBenefit(i, { title: val })}
                      />
                      <EditableText
                        tagName="p"
                        className="fs-5 text-gray-600 mb-0"
                        value={benefit.description}
                        onChange={(val) => updateBenefit(i, { description: val })}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <AddButton onClick={addBenefit} label="Benefit Box" />
            </div>
          </section>
        </>
      )}

      {/* Money Back Section */}
      {projectData.sections?.guarantee !== false && (
        <>
          <section id="guarantee" className="container-fluid text-center mt-0 sectioncolor relative group/section">
            <SectionSettings sectionKey="guarantee" />
            <div className="container">
              <EditableText
                tagName="h2"
                className="text-center fs-1 fw-bold py-3 text-white mb-0"
                value={projectData.guaranteeTitle || "Pure Ingredients & Thoroughly Verified"}
                onChange={(val) => useStore.getState().updateProjectData({ guaranteeTitle: val })}
              />
            </div>
          </section>

          <section className="container-fluid py-5 bg-white">
            <div className="container bg-white border ing p-4 p-lg-5 mx-auto">
              <div className="row align-items-center g-5">
                <div className="col-lg-4 text-center">
                  <EditableImage
                    src={projectData.footer.trustImage || '/image/money-back-guarantee-..webp'}
                    onChange={(val) => updateFooter({ trustImage: val })}
                    className="img-fluid mb-3 mx-auto"
                    style={{ maxWidth: '300px' }}
                  />
                  <EditableText
                    tagName="p"
                    className="fs-6 fw-semibold text-success mt-2"
                    value={projectData.guaranteeSubtitle || "Zero Risk • Complete Satisfaction Promise"}
                    onChange={(val) => useStore.getState().updateProjectData({ guaranteeSubtitle: val })}
                  />
                </div>
                <div className="col-lg-8">
                  <EditableText
                    tagName="h3"
                    className="fs-2 fw-bold mb-3"
                    value={projectData.guaranteeHeadline || "Full 60-Day Refund Assurance"}
                    onChange={(val) => useStore.getState().updateProjectData({ guaranteeHeadline: val })}
                  />
                  <EditableText
                    tagName="p"
                    className="fs-5 text-gray-700 leading-relaxed"
                    style={{ textAlign: 'left' }}
                    value={projectData.guaranteeDescription || `Your happiness is our highest priority. Every order of ${projectData.productName} comes protected by a comprehensive 60-day satisfaction promise. If you are not completely satisfied with the results, simply contact our support team for a full refund.`}
                    onChange={(val) => useStore.getState().updateProjectData({ guaranteeDescription: val })}
                  />
                  <Linkable link={projectData.hero.buttonHref} onLinkChange={() => { }}>
                    <button className="btn-custom-pill mt-4 px-8 py-3 fs-5 w-full md:w-auto">
                      Grab Your Risk-Free Package
                      <IconEditor value="fa-solid fa-cart-arrow-down" onChange={() => { }} />
                    </button>
                  </Linkable>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Ingredients Section */}
      <section id="ingredients" className="container-fluid text-center mt-0 sectioncolor">
        <div className="container">
          <EditableText
            tagName="h2"
            className="text-center fs-1 fw-bold py-3 text-white mb-0"
            value={projectData.ingredients.title || "Purposefully Chosen Natural Ingredients"}
            onChange={(val) => updateIngredient(-1, { title: val })}
          />
        </div>
      </section>

      <section className="container-fluid py-5 bg-light">
        <div className="container mx-auto">
          <div className="row g-4 justify-content-center">
            {projectData.ingredients?.items?.map((item, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm bg-white hover:-translate-y-2 transition-all duration-300 rounded-[2.5rem] p-4 group">
                  <div className="relative">
                    <RemoveButton onClick={() => removeIngredient(i)} />
                    <div className="w-40 h-40 rounded-none overflow-hidden border-[10px] mx-auto mb-4 bg-gray-50 shadow-inner" style={{ borderColor: '#fcfcfc', outline: `2px solid ${projectData.theme?.secondary || '#fbbf24'}` }}>
                      <EditableImage
                        src={item.image || '/image/ingredient-schisandra.png'}
                        onChange={(val) => updateIngredient(i, { image: val })}
                        className="w-full h-full"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                  <div className="text-center px-2">
                    <EditableText
                      tagName="h3"
                      className="fw-bold fs-4 mb-2 text-dark"
                      value={item.title}
                      onChange={(val) => updateIngredient(i, { title: val })}
                    />
                    <EditableText
                      tagName="p"
                      className="fs-6 text-muted leading-relaxed mb-0"
                      value={item.description}
                      onChange={(val) => updateIngredient(i, { description: val })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <AddButton onClick={addIngredient} label="Ingredient" />
          </div>
        </div>
      </section>




      {/* Testimonials Section */}
      {projectData.testimonials && (
        <section id="testimonials" className="container-fluid py-5" style={{ backgroundColor: '#fff' }}>
          <div className="container mx-auto">
            <div className="text-center mb-5">
              <EditableText
                tagName="h2"
                className="fs-1 fw-bold mb-3"
                value={projectData.testimonials.title}
                onChange={(val) => useStore.getState().updateTestimonials(-1, { title: val })}
              />
              <EditableText
                tagName="p"
                className="fs-5 text-muted mx-auto"
                style={{ maxWidth: '700px' }}
                value={projectData.testimonials.subtitle || ""}
                onChange={(val) => useStore.getState().updateTestimonials(-1, { subtitle: val })}
              />
            </div>

            <div className="row g-4 justify-content-center">
              {projectData.testimonials.items.map((item, i) => (
                <div key={i} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm bg-white rounded-[2rem] p-4 group relative overflow-hidden">
                    <RemoveButton onClick={() => removeTestimonial(i)} />
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="w-16 h-16 rounded-none overflow-hidden border-2 border-warning shadow-sm">
                        <EditableImage
                          src={item.image || "https://i.pravatar.cc/150"}
                          onChange={(val) => updateTestimonials(i, { image: val })}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <EditableText
                          tagName="h4"
                          className="fw-bold mb-0 text-dark"
                          value={item.name}
                          onChange={(val) => updateTestimonials(i, { name: val })}
                        />
                        <EditableText
                          tagName="span"
                          className="text-muted small"
                          value={item.role || "Verified Buyer"}
                          onChange={(val) => updateTestimonials(i, { role: val })}
                        />
                      </div>
                    </div>

                    <div className="mb-3 text-warning">
                      {[...Array(5)].map((_, starIndex) => (
                        <i
                          key={starIndex}
                          className={`fa-solid fa-star ${starIndex < item.rating ? '' : 'opacity-30'}`}
                          onClick={() => updateTestimonials(i, { rating: starIndex + 1 })}
                        ></i>
                      ))}
                    </div>

                    <div className="relative">
                      <i className="fa-solid fa-quote-left absolute -top-2 -left-2 opacity-10 text-4xl"></i>
                      <EditableText
                        tagName="p"
                        className="fs-6 text-dark leading-relaxed font-medium italic relative z-10"
                        value={item.content}
                        onChange={(val) => updateTestimonials(i, { content: val })}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 text-center">
              <AddButton onClick={addTestimonial} label="Testimonial" />
            </div>
          </div>
        </section>
      )}


      {/* Pricing Section */}
      <section className="container-fluid text-center mt-0 sectioncolor" id="pricing">
        <div className="container">
          <EditableText
            tagName="h2"
            className="text-center fs-1 fw-bold py-3 text-white mb-0"
            value={projectData.pricingTitle || "Select Your Dynamic Package"}
            onChange={(val) => useStore.getState().updateProjectData({ pricingTitle: val })}
          />
        </div>
      </section>

      <section className="container-fluid py-5" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="container mx-auto">
          <div className="row g-4 justify-content-center">
            {projectData.pricing?.map((plan, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4 mb-4 relative" style={{ zIndex: plan.isPrimary ? 10 : 1 }}>
                <RemoveButton onClick={() => removePricing(i)} />
                <div
                  className={`h-100 border-0 transition-all duration-500 rounded-[2rem] p-4 text-center bg-white group hover:-translate-y-2`}
                  style={{
                    border: plan.isPrimary ? `2px solid ${projectData.theme?.secondary}` : '1px solid #efefef',
                    transform: plan.isPrimary ? 'scale(1.04)' : 'scale(1.0)'
                  }}
                >
                  {plan.isPrimary && (
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-none fw-bold text-xs"
                      style={{ backgroundColor: projectData.theme?.secondary, color: '#000' }}
                    >
                      BEST VALUE BUNDLE
                    </div>
                  )}

                  <div className="mt-2">
                    <EditableText
                      className="fs-4 fw-bold mb-1 uppercase tracking-tight"
                      value={plan.title}
                      onChange={(val) => updatePricing(i, { title: val })}
                    />

                    <div className="mb-2">
                      <EditableText
                        className="fs-6 fw-black text-purple-600 bg-purple-50 px-3 py-1 rounded-none d-inline-block"
                        value={plan.quantity || "1 Bottle"}
                        onChange={(val) => updatePricing(i, { quantity: val })}
                      />
                    </div>

                    <div className="mb-3 relative group mx-auto" style={{ width: '180px' }}>
                      {/* Premium Quantity Multiplier Badge */}
                      <div className="absolute -top-2 -right-2 z-20 pointer-events-auto">
                        <div className="relative group/badge">
                          <div className="absolute inset-0 bg-black/20 translate-x-1 translate-y-1" />
                          <EditableText
                            className="relative bg-[#2C0D67] text-white px-3 py-1 rounded-none flex items-center justify-center fw-black text-xs border border-white shadow-xl min-w-[40px]"
                            value={plan.multiplier || "X1"}
                            onChange={(val) => updatePricing(i, { multiplier: val })}
                          />
                        </div>
                      </div>

                      <EditableImage
                        src={plan.image || '/image/bottle-snap.webp'}
                        className="mx-auto transition-transform group-hover:scale-105 duration-500"
                        style={{ height: '160px', objectFit: 'contain' }}
                        onChange={(val) => updatePricing(i, { image: val })}
                      />
                    </div>

                    <div className="mb-3">
                      <div className="d-flex align-items-baseline justify-content-center gap-1">
                        <span className="fs-2 fw-bold" style={{ color: projectData.theme?.primary }}>
                          <EditableText value={plan.price} onChange={(val) => updatePricing(i, { price: val })} />
                        </span>
                        <span className="fs-6 text-muted">/ bottle</span>
                      </div>
                    </div>

                    <div className="bg-light rounded-[1rem] p-3 mb-4 mx-auto border" style={{ maxWidth: '280px' }}>
                      <ul className="list-unstyled mb-0 text-start d-inline-block">
                        {plan.features.map((feature, fi) => (
                          <li key={fi} className="mb-2 d-flex align-items-center gap-2">
                            <i className="fa-solid fa-check-circle fs-6" style={{ color: projectData.theme?.primary }}></i>
                            <EditableText
                              className="fw-medium text-dark small"
                              value={feature}
                              onChange={(val) => {
                                const newFeatures = [...plan.features];
                                newFeatures[fi] = val;
                                updatePricing(i, { features: newFeatures });
                              }}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Linkable link={plan.buttonHref} onLinkChange={() => { }}>
                      <button
                        className="btn-custom-pill w-100 py-3.5 fs-6 fw-bold d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: plan.isPrimary ? projectData.theme?.secondary : '#333', color: plan.isPrimary ? '#000' : '#fff', border: 'none' }}
                      >
                        <EditableText tagName="span" value={plan.buttonText} onChange={(val) => updatePricing(i, { buttonText: val })} />
                      </button>
                    </Linkable>

                    <div className="mt-3 flex items-center justify-center gap-1 opacity-50 font-bold text-[10px]">
                      <IconEditor value={plan.guaranteeBadge?.icon || "fa-solid fa-lock"} onChange={(val) => updatePricing(i, { guaranteeBadge: { ...(plan.guaranteeBadge || { text: '60-DAY MONEY-BACK GUARANTEE', icon: 'fa-solid fa-lock' }), icon: val } })} />
                      <EditableText tagName="span" value={plan.guaranteeBadge?.text || "60-DAY MONEY-BACK GUARANTEE"} onChange={(val) => updatePricing(i, { guaranteeBadge: { ...(plan.guaranteeBadge || { text: '60-DAY MONEY-BACK GUARANTEE', icon: 'fa-solid fa-lock' }), text: val } })} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <AddButton onClick={addPricing} label="Pricing Plan" />
          </div>
        </div>
      </section>
      <section id="faq" className="container-fluid text-center mt-0 sectioncolor">
        <EditableText
          tagName="h2"
          className="text-center fs-1 fw-bold py-3 text-white mb-0"
          value={projectData.faqTitle || "Common Questions Answered"}
          onChange={(val) => useStore.getState().updateProjectData({ faqTitle: val })}
        />
      </section>

      <section className="container-fluid py-5 bg-light">
        <div className="container mx-auto max-w-4xl">
          <div className="accordion accordion-flush" id="glycopezilFAQ">
            {projectData.faq?.map((item, i) => (
              <div key={i} className="accordion-item mb-3 rounded border relative group">
                <RemoveButton onClick={() => removeFAQ(i)} />
                <h3 className="accordion-header">
                  <div className="accordion-button fw-bold fs-5 p-4 bg-white shadow-none cursor-default">
                    <EditableText value={item.question} onChange={(val) => updateFAQ(i, { question: val })} className="w-full" />
                  </div>
                </h3>
                <div id={`faq${i}`} className="accordion-collapse show">
                  <div className="accordion-body fs-5 text-gray-600 p-4 bg-white border-top">
                    <EditableText value={item.answer} onChange={(val) => updateFAQ(i, { answer: val })} className="w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <AddButton onClick={addFAQ} label="FAQ" />
        </div>
      </section>

      {/* Footer */}
      <footer className="navcolor text-white py-5">
        <div className="container mx-auto text-center px-4">
          <EditableText
            tagName="h2"
            className="fw-bold fs-1 mb-3"
            value={projectData.footerHeadline || "Final Thoughts"}
            onChange={(val) => useStore.getState().updateProjectData({ footerHeadline: val })}
          />
          <EditableText
            tagName="p"
            className="fs-5 fw-semibold mb-5 max-w-5xl mx-auto leading-relaxed"
            value={projectData.footer.companyInfo}
            onChange={(val) => updateFooter({ companyInfo: val })}
          />

          <hr className="my-5 opacity-25" />

          <ul className="list-inline fw-semibold fs-4 mb-5">
            {projectData.footer.links.map((link, i) => (
              <li key={i} className="list-inline-item mx-3 relative group">
                <RemoveButton onClick={() => {
                  const newLinks = [...projectData.footer.links];
                  newLinks.splice(i, 1);
                  updateFooter({ links: newLinks });
                }} />
                <Linkable link={link.href} onLinkChange={(val) => {
                  const newLinks = [...projectData.footer.links];
                  newLinks[i] = { ...newLinks[i], href: val };
                  updateFooter({ links: newLinks });
                }}>
                  <EditableText tagName="span" className="custom-hover" value={link.label} onChange={(val) => {
                    const newLinks = [...projectData.footer.links];
                    newLinks[i] = { ...newLinks[i], label: val };
                    updateFooter({ links: newLinks });
                  }} />
                </Linkable>
              </li>
            ))}
          </ul>
          <AddButton onClick={() => {
            updateFooter({ links: [...projectData.footer.links, { label: 'New Link', href: '#' }] });
          }} label="Footer Link" />

          <p className="fs-5 fw-semibold mb-0 opacity-75">
            © Copyright {new Date().getFullYear()} <span className="fw-bold text-white uppercase">{projectData.productName}</span> All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Section Manager */}
      <div className="bg-gray-100 p-8 border-t border-dashed border-gray-300 text-center">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Manage Page Sections</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {Object.entries(projectData.sections || {}).map(([key, visible]) => (
            <button
              key={key}
              onClick={() => updateSectionVisibility(key as any, !visible)}
              className={`px-4 py-2 text-[10px] font-bold rounded-none uppercase transition-all flex items-center gap-2 border-none shadow-sm ${visible ? 'bg-gray-200 text-gray-500' : 'bg-green-500 text-white hover:scale-105'}`}
            >
              <i className={`fa-solid ${visible ? 'fa-eye-slash' : 'fa-plus'}`}></i>
              {visible ? 'Hide' : 'Add'} {key}
            </button>
          ))}
          <button
            onClick={() => setShowLegalModal(true)}
            className="px-4 py-2 text-[10px] font-bold rounded-none uppercase transition-all flex items-center gap-2 bg-blue-600 text-white hover:scale-105 border-none shadow-sm"
          >
            <i className="fa-solid fa-file-contract"></i> Edit Legal Pages
          </button>
        </div>
      </div>

      {/* Purchase Proof Popup */}
      {projectData.socialProof?.enabled && (
        <div
          className={`purchase-proof ${showProof ? 'active' : ''} group/proof cursor-pointer hover:border-blue-400 transition-colors`}
          onClick={() => setShowProofSettings(true)}
          title="Click to customize social proof"
        >
          <div className="absolute -top-10 left-0 bg-blue-600 text-white text-[9px] font-bold px-2 py-1.5 rounded-sm opacity-0 group-hover/proof:opacity-100 transition-all shadow-xl pointer-events-none">
            <i className="fa-solid fa-gear mr-1"></i> Edit Popup Settings
          </div>
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
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
            <div className="text-white/90 text-xs leading-tight">
              <strong className="text-green-500">{projectData.socialProof?.items[proofIndex]?.name}</strong> from <strong className="text-green-500">{projectData.socialProof?.items[proofIndex]?.location}</strong> <br />
              {projectData.socialProof?.items[proofIndex]?.content}
            </div>
            <small className="text-white/30 text-[9px] mt-1 font-bold uppercase tracking-wider">{projectData.socialProof?.items[proofIndex]?.timeAgo} • Verified Buyer</small>
          </div>
        </div>
      )}

      {/* Social Proof Settings Modal */}
      {showProofSettings && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowProofSettings(false)}></div>
          <div className="bg-white w-full max-w-xl rounded-none shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gray-50 p-4 border-bottom d-flex justify-content-between align-items-center">
              <h3 className="m-0 fs-5 fw-bold text-dark uppercase tracking-tight">Social Proof Popup Settings</h3>
              <button onClick={() => setShowProofSettings(false)} className="border-none bg-transparent text-gray-400 hover:text-dark">
                <i className="fa-solid fa-xmark fs-4"></i>
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 mb-4">
                <span className="text-sm font-bold text-blue-900">Enable Social Proof Widget</span>
                <button
                  onClick={() => updateSocialProof({ enabled: !projectData.socialProof?.enabled })}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border-none ${projectData.socialProof?.enabled ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'}`}
                >
                  {projectData.socialProof?.enabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Display Duration (ms)</label>
                  <input
                    type="number"
                    className="w-full p-2 border text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={projectData.socialProof?.displayTime}
                    onChange={(e) => updateSocialProof({ displayTime: parseInt(e.target.value) })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Interval Between (ms)</label>
                  <input
                    type="number"
                    className="w-full p-2 border text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={projectData.socialProof?.interval}
                    onChange={(e) => updateSocialProof({ interval: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-white/30 uppercase block mb-1">Entries</label>
                {(projectData.socialProof?.items || []).map((item, idx) => (
                  <div key={idx} className="p-3 bg-white/5 border border-white/10 relative group/item">
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
                        <label className="text-[9px] font-bold text-white/30 uppercase block mb-1">Name</label>
                        <input type="text" className="w-full p-1.5 bg-black/40 border border-white/10 text-white text-[11px] outline-none" value={item.name} onChange={(e) => {
                          const ni = [...(projectData.socialProof?.items || [])];
                          ni[idx] = { ...ni[idx], name: e.target.value };
                          updateSocialProof({ items: ni });
                        }} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-[9px] font-bold text-white/30 uppercase block mb-1">From</label>
                        <input type="text" className="w-full p-1.5 bg-black/40 border border-white/10 text-white text-[11px] outline-none" value={item.location} onChange={(e) => {
                          const ni = [...(projectData.socialProof?.items || [])];
                          ni[idx] = { ...ni[idx], location: e.target.value };
                          updateSocialProof({ items: ni });
                        }} />
                      </div>
                      <div className="col-md-12">
                        <label className="text-[9px] font-bold text-white/30 uppercase block mb-1">Content</label>
                        <input type="text" className="w-full p-1.5 bg-black/40 border border-white/10 text-white text-[11px] outline-none" value={item.content} onChange={(e) => {
                          const ni = [...(projectData.socialProof?.items || [])];
                          ni[idx] = { ...ni[idx], content: e.target.value };
                          updateSocialProof({ items: ni });
                        }} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-[9px] font-bold text-white/30 uppercase block mb-1">Time</label>
                        <input type="text" className="w-full p-1.5 bg-black/40 border border-white/10 text-white text-[11px] outline-none" value={item.timeAgo} onChange={(e) => {
                          const ni = [...(projectData.socialProof?.items || [])];
                          ni[idx] = { ...ni[idx], timeAgo: e.target.value };
                          updateSocialProof({ items: ni });
                        }} />
                      </div>
                      <div className="col-md-6">
                        <label className="text-[9px] font-bold text-white/30 uppercase block mb-1">Image URL</label>
                        <input type="text" className="w-full p-1.5 bg-black/40 border border-white/10 text-white text-[11px] outline-none" value={item.image} onChange={(e) => {
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
                  className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-[10px] font-bold uppercase border border-blue-500/30 transition-all mt-2"
                >
                  <i className="fa-solid fa-plus mr-1"></i> Add Entry
                </button>
              </div>
            </div>
            <div className="bg-gray-50 p-4 border-top text-right">
              <button
                onClick={() => setShowProofSettings(false)}
                className="bg-dark text-white px-6 py-2 text-xs font-bold uppercase tracking-wider border-none hover:bg-black transition-all"
              >
                Done
              </button>
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
