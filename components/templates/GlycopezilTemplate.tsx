'use client';

import React, { useEffect, useState } from 'react';
import { EditableText } from '../editor/EditableText';
import { EditableImage } from '../editor/EditableImage';
import { useStore } from '@/lib/store';

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
      title="Right-click to set link"
    >
      {children}
      {showSettings && (
        <>
          <div className="fixed inset-0 z-[99998]" onClick={() => setShowSettings(false)} />
          <LinkSettings link={link} onChange={onLinkChange} onClose={() => setShowSettings(false)} x={pos.x} y={pos.y} />
        </>
      )}
      <div className="absolute -top-4 -right-4 opacity-0 group-hover/link:opacity-100 transition-opacity bg-blue-500 text-white w-5 h-5 rounded-none flex items-center justify-center shadow-lg z-50 pointer-events-none">
        <i className="fa-solid fa-link text-[8px]"></i>
      </div>
      {link && <div className="absolute -top-8 left-0 bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/link:opacity-100 transition-opacity whitespace-nowrap z-50">LINK: {link}</div>}
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
    className="absolute top-2 right-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white w-6 h-6 rounded-none flex items-center justify-center transition-all z-20 hover:scale-110 border-none"
  >
    <i className="fa-solid fa-trash-can text-[10px]"></i>
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
    updateFooter, updateProductName, updateTestimonials, addTestimonial, removeTestimonial
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

  const [proof, setProof] = useState<{ name: string; state: string; bottleCount: string; timeAgo: number } | null>(null);
  const [showProof, setShowProof] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const names = ["James", "Michael", "Harper Lewis", "Sophia Mitchell", "Ella Carter", "Chris", "Mark", "Brian", "Anthony", "Isabella Reed"];
    const states = ["California", "Texas", "Florida", "New York", "Illinois", "Ohio", "Austin", "Denver, Colorado", "Michigan", "Pennsylvania"];
    const bottles = ["2 bottle", "3 bottles", "6 bottles"];

    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.innerWidth >= 500) {
        setProof({
          name: names[Math.floor(Math.random() * names.length)],
          state: states[Math.floor(Math.random() * states.length)],
          bottleCount: bottles[Math.floor(Math.random() * bottles.length)],
          timeAgo: Math.floor(Math.random() * 10) + 1
        });
        setShowProof(true);
        setTimeout(() => setShowProof(false), 5000);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  if (!projectData) return null;

  const renderStars = (rating: number) => {
    const percentage = (rating / 5) * 100;
    const starSVG = <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>;

    return (
      <div className="yasr-stars-container" style={{ display: 'inline-flex', position: 'relative', lineHeight: 1, verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          <span style={{ fill: '#e4e4e4' }}>{starSVG}</span>
          <span style={{ fill: '#e4e4e4' }}>{starSVG}</span>
          <span style={{ fill: '#e4e4e4' }}>{starSVG}</span>
          <span style={{ fill: '#e4e4e4' }}>{starSVG}</span>
          <span style={{ fill: '#e4e4e4' }}>{starSVG}</span>
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', overflow: 'hidden', whiteSpace: 'nowrap', width: `${percentage}%` }}>
          <div style={{ display: 'flex', gap: '2px', width: 'max-content' }}>
            <span style={{ fill: '#fdbb02' }}>{starSVG}</span>
            <span style={{ fill: '#fdbb02' }}>{starSVG}</span>
            <span style={{ fill: '#fdbb02' }}>{starSVG}</span>
            <span style={{ fill: '#fdbb02' }}>{starSVG}</span>
            <span style={{ fill: '#fdbb02' }}>{starSVG}</span>
          </div>
        </div>
      </div>
    );
  };

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
            background: #ffffff;
            border-radius: 12px;
            padding: 15px 18px;
            border: 1px solid #eee;
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
              {projectData.footer.links.slice(0, 3).map((link, i) => (
                <div key={i} className="nav-item">
                  <Linkable link={link.href} onLinkChange={(val) => {
                    const newLinks = [...projectData.footer.links];
                    newLinks[i] = { ...newLinks[i], href: val };
                    updateFooter({ links: newLinks });
                  }}>
                    <EditableText
                      tagName="span"
                      className="nav-link text-dark fs-5 fw-bold cursor-pointer p-0"
                      value={link.label}
                      onChange={(val) => {
                        const newLinks = [...projectData.footer.links];
                        newLinks[i] = { ...newLinks[i], label: val };
                        updateFooter({ links: newLinks });
                      }}
                    />
                  </Linkable>
                </div>
              ))}
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
              {projectData.footer.links.map((link, i) => (
                <EditableText key={i} tagName="span" className="fs-5 fw-bold text-dark no-underline cursor-pointer" value={link.label} onChange={() => { }} />
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
              <div className="d-flex justify-content-center flex-wrap gap-2 mt-4 pt-2" style={{ width: '100%' }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} style={{ width: '65px', height: '65px' }}>
                    <EditableImage
                      src={projectData.logos?.[i] || `/image/logo-${i + 1}.webp`}
                      onChange={(val) => {
                        const newLogos = [...(projectData.logos || [])];
                        newLogos[i] = val;
                        useStore.getState().updateProjectData({ logos: newLogos });
                      }}
                      className="img-fluid"
                    />
                  </div>
                ))}
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
      <section className="container-fluid text-center mt-0 sectioncolor">
        <EditableText
          tagName="h2"
          className="text-center fs-1 py-4 fw-bold text-white mb-0"
          value={projectData.featuresTitle || "What Sets " + projectData.productName + " Apart?"}
          onChange={(val) => useStore.getState().updateProjectData({ featuresTitle: val })}
        />
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

      {/* Understanding the Formula Section */}
      <section className="container-fluid text-center sectioncolor">
        <EditableText
          tagName="h2"
          className="text-center fs-1 py-4 fw-bold text-white mb-0"
          value={projectData.about.title || "Understanding the " + projectData.productName + " Formula"}
          onChange={(val) => updateAbout({ title: val })}
        />
      </section>

      <section className="container-fluid sectioncolor1 py-4 border-bottom">
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

      {/* Benefits Section */}
      <section className="container-fluid text-center mt-0 sectioncolor" id="Benefits">
        <EditableText
          tagName="h2"
          className="text-center fs-1 fw-bold py-4 text-white mb-0"
          value={projectData.benefits.title || "Powerful Advantages of " + projectData.productName}
          onChange={(val) => updateBenefit(-1, { title: val })} // Special index for section title if needed, or updateBenefitsTitle
        />
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

      {/* Money Back Section */}
      <section className="container-fluid text-center mt-0 sectioncolor">
        <EditableText
          tagName="h2"
          className="text-center fs-1 fw-bold py-4 text-white mb-0"
          value={projectData.guaranteeTitle || "Pure Ingredients & Thoroughly Verified"}
          onChange={(val) => useStore.getState().updateProjectData({ guaranteeTitle: val })}
        />
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
                value={projectData.guaranteeDescription || "Your happiness is our highest priority. Every order of Glycopezil comes protected by a comprehensive 60-day satisfaction promise."}
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

      {/* Ingredients Section */}
      <section className="container-fluid text-center mt-0 sectioncolor" id="ingredients">
        <EditableText
          tagName="h2"
          className="text-center fs-1 fw-bold py-4 text-white mb-0"
          value={projectData.ingredients.title || "Purposefully Chosen Natural Ingredients"}
          onChange={(val) => updateIngredient(-1, { title: val })}
        />
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
        <section className="container-fluid py-5" style={{ backgroundColor: '#fff' }}>
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
        <EditableText
          tagName="h2"
          className="text-center fs-1 fw-bold py-4 text-white mb-0"
          value={projectData.pricingTitle || "Select Your Dynamic Package"}
          onChange={(val) => useStore.getState().updateProjectData({ pricingTitle: val })}
        />
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
                    border: plan.isPrimary ? `2px solid \${projectData.theme?.secondary}` : '1px solid #efefef',
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
                        className="btn-custom-pill w-100 py-2.5 fs-6 fw-bold d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: plan.isPrimary ? projectData.theme?.secondary : '#333', color: plan.isPrimary ? '#000' : '#fff', border: 'none' }}
                      >
                        <EditableText tagName="span" value={plan.buttonText} onChange={(val) => updatePricing(i, { buttonText: val })} />
                      </button>
                    </Linkable>

                    <div className="mt-3 flex items-center justify-center gap-1 text-muted fw-bold" style={{ fontSize: '10px' }}>
                      <i className="fa-solid fa-lock"></i>
                      <span>60-DAY MONEY-BACK GUARANTEE</span>
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
      <section className="container-fluid text-center mt-0 sectioncolor">
        <EditableText
          tagName="h2"
          className="text-center fs-1 fw-bold py-4 text-white mb-0"
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

      {/* Purchase Proof Popup */}
      <div className={`purchase-proof ${showProof ? 'active' : ''}`}>
        <img
          src={projectData.hero.image || '/image/banner-img.webp'}
          style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'contain' }}
          alt="Product"
        />
        <div className="flex flex-col">
          <div className="text-warning mb-1">{renderStars(4.8)}</div>
          <div className="text-dark leading-tight">
            <strong>{proof?.name}</strong> from <strong>{proof?.state}</strong> purchased <strong>{proof?.bottleCount}</strong>
          </div>
          <small className="text-gray-500 mt-1">{proof?.timeAgo} minutes ago</small>
        </div>
      </div>

      {/* Scroll Button */}
      <button
        className="position-fixed bottom-4 right-4 w-14 h-14 bg-yellow-400 hover:bg-yellow-500 rounded-none flex items-center justify-center text-black z-50 border-none transition-transform hover:-translate-y-2 border-2 border-black"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <i className="fa-solid fa-arrow-up fs-4"></i>
      </button>

    </div>
  );
};
