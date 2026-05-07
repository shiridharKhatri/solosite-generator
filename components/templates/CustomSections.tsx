'use client';

import React, { useCallback, useMemo } from 'react';
import { EditableText } from '../editor/EditableText';
import { EditableImage } from '../editor/EditableImage';
import { RichTextEditor } from '../editor/RichTextEditor';
import { useStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Portal helper for floating UI to prevent flickering/clipping
const Portal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
};

// Helper for Icon Selection and Styling
const IconEditor = ({ value, color, onChange, onColorChange, className = "" }: { 
  value?: string; 
  color?: string; 
  onChange: (val: string) => void;
  onColorChange?: (val: string) => void;
  className?: string;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const icons = ["fa-solid fa-star", "fa-solid fa-bolt", "fa-solid fa-check", "fa-solid fa-heart", "fa-solid fa-shield", "fa-solid fa-leaf", "fa-solid fa-lightbulb", "fa-solid fa-gear", "fa-solid fa-cart-shopping"];
  const colors = [
    { name: 'Default', value: '' },
    { name: 'Amber', value: '#fbbf24' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Black', value: '#000000' }
  ];

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPos({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  return (
    <>
      {value ? (
        <i
          className={`${value} cursor-pointer hover:scale-110 transition-all ${className}`}
          style={{ color: color || 'inherit' }}
          onClick={handleOpen}
          onContextMenu={handleOpen}
        />
      ) : (
        <button 
          onClick={handleOpen}
          className="bg-gray-100 hover:bg-gray-200 text-[9px] px-2 py-1 rounded border border-gray-200 text-gray-500 uppercase font-bold tracking-widest transition-all mb-3 mx-auto block"
        >
          + Add Icon
        </button>
      )}

      {showMenu && (
        <Portal>
          <div className="fixed inset-0 z-[99998]" onClick={() => setShowMenu(false)} />
          <div
            className="fixed bg-white rounded shadow-2xl border border-gray-100 p-4 z-[99999] w-64 animate-in fade-in zoom-in duration-200 text-left"
            style={{ left: Math.min(pos.x, typeof window !== 'undefined' ? window.innerWidth - 270 : pos.x), top: Math.min(pos.y, typeof window !== 'undefined' ? window.innerHeight - 350 : pos.y) }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <span className="text-[10px] font-bold uppercase text-gray-400">Card Icon Settings</span>
              <button onClick={() => setShowMenu(false)} className="text-gray-300 hover:text-dark border-none bg-transparent p-0"><i className="fa-solid fa-xmark"></i></button>
            </div>

            <div className="mb-4">
              <label className="text-[9px] font-bold text-gray-500 uppercase mb-2 block">Choose Icon</label>
              <div className="grid grid-cols-5 gap-2">
                {icons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => { onChange(icon); }}
                    className={`w-8 h-8 flex items-center justify-center rounded border transition-all ${value === icon ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 hover:bg-gray-50 text-gray-400'}`}
                  >
                    <i className={icon}></i>
                  </button>
                ))}
                <button
                  onClick={() => { onChange(''); setShowMenu(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded border border-red-100 text-red-400 hover:bg-red-50 transition-all"
                >
                  <i className="fa-solid fa-slash"></i>
                </button>
              </div>
            </div>

            {onColorChange && (
              <div className="mb-2">
                <label className="text-[9px] font-bold text-gray-500 uppercase mb-2 block">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => onColorChange?.(c.value)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${color === c.value ? 'border-blue-500 scale-110' : 'border-gray-200 hover:scale-105'}`}
                      style={{ backgroundColor: c.value || 'transparent' }}
                    >
                      {!c.value && <i className="fa-solid fa-droplet-slash text-[8px] text-gray-400"></i>}
                    </button>
                  ))}
                  <input 
                    type="color" 
                    value={color || '#000000'} 
                    onChange={(e) => onColorChange?.(e.target.value)}
                    className="w-6 h-6 p-0 border-none rounded-full cursor-pointer overflow-hidden"
                  />
                </div>
              </div>
            )}
          </div>
        </Portal>
      )}
    </>
  );
};

// Linkable wrapper for buttons
const Linkable = React.memo(({ link, onLinkChange, children }: { link: string; onLinkChange: (val: string) => void; children: React.ReactNode }) => (
  <div className="relative group/link inline-block">
    {children}
    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/link:opacity-100 transition-opacity z-50">
      <input
        type="text"
        value={link}
        onChange={(e) => onLinkChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="px-2 py-1 text-[10px] bg-black text-white border-none rounded shadow-lg w-48 outline-none"
        placeholder="Link URL..."
      />
    </div>
  </div>
));
Linkable.displayName = 'Linkable';

// Content block extracted outside render to prevent Tiptap remount
const ContentBlock = React.memo(({ value, onChange, className, style }: { value: string; onChange: (val: string) => void; className?: string; style?: React.CSSProperties }) => (
  <RichTextEditor
    value={value || ''}
    onChange={onChange}
    className={className || 'fs-5 opacity-90'}
    style={style || { lineHeight: 1.8 }}
    tagName="div"
  />
));
ContentBlock.displayName = 'ContentBlock';

// Card component extracted to prevent unnecessary re-renders
const CardItem = React.memo(({ card, idx, section, isOrganic, primaryColor, updateCards }: {
  card: any;
  idx: number;
  section: any;
  isOrganic: boolean;
  primaryColor: string;
  updateCards: (cards: any[]) => void;
}) => {
  const cards = section.cards || [];

  const handleRemove = useCallback(() => {
    const nc = [...cards];
    nc.splice(idx, 1);
    updateCards(nc);
  }, [cards, idx, updateCards]);

  const handleFieldUpdate = useCallback((field: string, val: any) => {
    const nc = [...cards];
    nc[idx] = { ...nc[idx], [field]: val };
    updateCards(nc);
  }, [cards, idx, updateCards]);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => handleFieldUpdate('image', reader.result as string);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [handleFieldUpdate]);

  const handleAddButton = useCallback(() => {
    const nc = [...cards];
    nc[idx] = { ...nc[idx], buttonText: 'Learn More', buttonHref: '#' };
    updateCards(nc);
  }, [cards, idx, updateCards]);

  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="h-100 p-4 border rounded-3 bg-white text-dark shadow-sm text-center transition-transform hover:-translate-y-1 relative group/card d-flex flex-column">
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity border-none text-xs z-10"
        >
          <i className="fa-solid fa-times"></i>
        </button>
        {/* Card Image */}
        {card.image && (
          <div className="mb-3 rounded-2" style={{ maxHeight: '180px' }}>
            <EditableImage
              src={card.image}
              alt={card.title}
              onChange={(val) => handleFieldUpdate('image', val)}
              className="img-fluid w-100"
              style={{ objectFit: 'cover', maxHeight: '180px' }}
            />
          </div>
        )}
        {/* Card Icon (shows when no image or explicitly chosen) */}
        {!card.image && (
          <div className="mb-3">
            <IconEditor 
              value={card.icon} 
              color={card.iconColor}
              onChange={(val) => handleFieldUpdate('icon', val)}
              onColorChange={(val) => handleFieldUpdate('iconColor', val)}
              className="fs-1 d-block"
            />
          </div>
        )}
        {/* Upload image button (when no image set) */}
        {!card.image && (
          <button
            onClick={handleImageUpload}
            className="mb-3 text-[10px] text-gray-400 hover:text-gray-600 transition-colors border border-dashed border-gray-300 hover:border-gray-400 px-3 py-1.5 rounded opacity-0 group-hover/card:opacity-100"
          >
            <i className="fa-solid fa-image me-1"></i> Add Image
          </button>
        )}
        <EditableText
          tagName="h4"
          className="fw-bold mb-3"
          value={card.title}
          onChange={(val) => handleFieldUpdate('title', val)}
        />
        <EditableText
          tagName="p"
          className="mb-0 text-muted flex-grow-1"
          style={{ lineHeight: 1.6 }}
          value={card.content}
          onChange={(val) => handleFieldUpdate('content', val)}
        />
        {/* Per-card Button */}
        {card.buttonText && (
          <div className="mt-3 pt-3 border-top">
            <Linkable link={card.buttonHref || '#'} onLinkChange={(val) => handleFieldUpdate('buttonHref', val)}>
              <a
                href={card.buttonHref || '#'}
                onClick={(e) => e.preventDefault()}
                className={`d-inline-block fw-bold text-decoration-none text-sm ${isOrganic ? 'organic-btn organic-btn-outline' : 'btn-custom-pill shadow-sm'}`}
                style={!isOrganic ? { backgroundColor: primaryColor, color: '#fff', fontSize: '0.85rem', padding: '0.6rem 1.5rem' } : undefined}
              >
                <EditableText
                  tagName="span"
                  value={card.buttonText}
                  onChange={(val) => handleFieldUpdate('buttonText', val)}
                />
              </a>
            </Linkable>
          </div>
        )}
        {/* Add button to card (when none exists) */}
        {!card.buttonText && (
          <button
            onClick={handleAddButton}
            className="mt-3 text-[10px] text-gray-400 hover:text-gray-600 transition-colors border border-dashed border-gray-300 hover:border-gray-400 px-3 py-1.5 rounded opacity-0 group-hover/card:opacity-100"
          >
            <i className="fa-solid fa-plus me-1"></i> Add Button
          </button>
        )}
      </div>
    </div>
  );
});
CardItem.displayName = 'CardItem';

export const CustomSections = React.memo(({ afterSection }: { afterSection: string }) => {
  const projectData = useStore((s) => s.projectData);
  const updateCustomSection = useStore((s) => s.updateCustomSection);

  if (!projectData || !projectData.customSections) return null;

  const sections = projectData.customSections.filter(s => s.afterSection === afterSection);

  if (sections.length === 0) return null;

  const isOrganic = projectData.layoutStyle === 'organic';
  const primaryColor = projectData.theme?.primary || '#2C0D67';
  const secondaryColor = projectData.theme?.secondary || '#fbbf24';

  return (
    <>
      {sections.map(section => {
        const updateCards = (cards: any[]) => updateCustomSection(section.id, { cards });

        return (
          <React.Fragment key={section.id}>
            {/* Title Bar (Glycopezil/Classic layout) */}
            {!isOrganic && section.title && (
              <section className="container-fluid text-center mt-0 sectioncolor relative group/section" style={{ backgroundColor: primaryColor }}>
                <div className="absolute top-4 left-4 z-50 flex gap-2 opacity-0 group-hover/section:opacity-100 transition-opacity">
                  <button
                    onClick={() => updateCustomSection(section.id, { title: '' })}
                    className="bg-red-500/80 hover:bg-red-500 text-white px-2 py-1 text-[10px] font-bold rounded uppercase flex items-center gap-1 shadow-lg border-none backdrop-blur-sm transition-all"
                  >
                    <i className="fa-solid fa-eraser"></i> Clear Title
                  </button>
                </div>
                <div className="container">
                  <EditableText
                    tagName="h2"
                    className="text-center fs-1 py-3 fw-bold text-white mb-0"
                    value={section.title}
                    onChange={(val) => updateCustomSection(section.id, { title: val })}
                  />
                </div>
              </section>
            )}

            {/* Content Section */}
            <section
              className={`relative group/section section-reveal ${section.padding || 'py-5'}`}
              style={{ backgroundColor: section.bgColor || '#ffffff', color: section.textColor || '#333333' }}
            >
              <div className="absolute top-4 left-4 z-50 flex gap-2 opacity-0 group-hover/section:opacity-100 transition-opacity">
                <button
                  onClick={() => useStore.getState().removeCustomSection(section.id)}
                  className="bg-red-500/80 hover:bg-red-500 text-white px-2 py-1 text-[10px] font-bold rounded uppercase flex items-center gap-1 shadow-lg border-none backdrop-blur-sm transition-all"
                >
                  <i className="fa-solid fa-trash-can"></i> Remove Section
                </button>
              </div>
              <div className="container">

                {/* TEXT ONLY */}
                {section.type === 'text' && (
                  <div className="text-center max-w-4xl mx-auto">
                    {section.title && isOrganic && (
                      <EditableText
                        tagName="h2"
                        className="fw-bold mb-4 font-serif"
                        style={{ fontSize: '2.5rem' }}
                        value={section.title}
                        onChange={(val) => updateCustomSection(section.id, { title: val })}
                      />
                    )}
                    <ContentBlock
                      value={section.content}
                      onChange={(val) => updateCustomSection(section.id, { content: val })}
                    />
                    {section.buttonText && (
                      <div className="mt-4 text-center mt-5">
                        <Linkable link={section.buttonHref || '#order'} onLinkChange={(val) => updateCustomSection(section.id, { buttonHref: val })}>
                          <a
                            href={section.buttonHref || '#order'}
                            onClick={(e) => e.preventDefault()}
                            className={`d-inline-block fw-bold text-decoration-none ${isOrganic ? 'organic-btn organic-btn-primary' : 'btn-custom-pill shadow-sm'}`}
                            style={!isOrganic ? { backgroundColor: secondaryColor, color: '#000', fontSize: '1.1rem', padding: '1rem 2.5rem' } : undefined}
                          >
                            <EditableText tagName="span" value={section.buttonText} onChange={(val) => updateCustomSection(section.id, { buttonText: val })} />
                          </a>
                        </Linkable>
                      </div>
                    )}
                  </div>
                )}

                {/* IMAGE LEFT, TEXT RIGHT */}
                {section.type === 'image-text' && (
                  <div className="row align-items-center g-5">
                    <div className="col-lg-6">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl shadow-sm">
                        <EditableImage
                          src={section.image || '/image/banner-img.webp'}
                          alt={section.imageAlt || section.title}
                          onChange={(val) => updateCustomSection(section.id, { image: val })}
                          onAltChange={(val) => updateCustomSection(section.id, { imageAlt: val })}
                          className="img-fluid rounded-xl mx-auto d-block"
                          style={{ maxHeight: '450px', objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      {section.title && isOrganic && (
                        <EditableText tagName="h2" className="fw-bold mb-4 font-serif" style={{ fontSize: '2.5rem' }} value={section.title} onChange={(val) => updateCustomSection(section.id, { title: val })} />
                      )}
                      <ContentBlock value={section.content} onChange={(val) => updateCustomSection(section.id, { content: val })} className="opacity-90" style={{ lineHeight: 1.9, fontSize: '1.1rem' }} />
                      {section.buttonText && (
                        <div className="mt-4">
                          <Linkable link={section.buttonHref || '#order'} onLinkChange={(val) => updateCustomSection(section.id, { buttonHref: val })}>
                            <a href={section.buttonHref || '#order'} onClick={(e) => e.preventDefault()} className={`d-inline-block fw-bold text-decoration-none ${isOrganic ? 'organic-btn organic-btn-primary' : 'btn-custom-pill shadow-sm'}`} style={!isOrganic ? { backgroundColor: secondaryColor, color: '#000', fontSize: '1.1rem', padding: '1rem 2.5rem' } : undefined}>
                              <EditableText tagName="span" value={section.buttonText} onChange={(val) => updateCustomSection(section.id, { buttonText: val })} />
                            </a>
                          </Linkable>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TEXT LEFT, IMAGE RIGHT */}
                {section.type === 'text-image' && (
                  <div className="row align-items-center g-5 flex-column-reverse flex-lg-row">
                    <div className="col-lg-6">
                      {section.title && isOrganic && (
                        <EditableText tagName="h2" className="fw-bold mb-4 font-serif" style={{ fontSize: '2.5rem' }} value={section.title} onChange={(val) => updateCustomSection(section.id, { title: val })} />
                      )}
                      <ContentBlock value={section.content} onChange={(val) => updateCustomSection(section.id, { content: val })} className="opacity-90" style={{ lineHeight: 1.9, fontSize: '1.1rem' }} />
                      {section.buttonText && (
                        <div className="mt-4">
                          <Linkable link={section.buttonHref || '#order'} onLinkChange={(val) => updateCustomSection(section.id, { buttonHref: val })}>
                            <a href={section.buttonHref || '#order'} onClick={(e) => e.preventDefault()} className={`d-inline-block fw-bold text-decoration-none ${isOrganic ? 'organic-btn organic-btn-primary' : 'btn-custom-pill shadow-sm'}`} style={!isOrganic ? { backgroundColor: secondaryColor, color: '#000', fontSize: '1.1rem', padding: '1rem 2.5rem' } : undefined}>
                              <EditableText tagName="span" value={section.buttonText} onChange={(val) => updateCustomSection(section.id, { buttonText: val })} />
                            </a>
                          </Linkable>
                        </div>
                      )}
                    </div>
                    <div className="col-lg-6">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl shadow-sm">
                        <EditableImage
                          src={section.image || '/image/banner-img.webp'}
                          alt={section.imageAlt || section.title}
                          onChange={(val) => updateCustomSection(section.id, { image: val })}
                          onAltChange={(val) => updateCustomSection(section.id, { imageAlt: val })}
                          className="img-fluid rounded-xl mx-auto d-block"
                          style={{ maxHeight: '450px', objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CARDS GRID */}
                {section.type === 'cards' && (
                  <div>
                    {section.title && isOrganic && (
                      <div className="text-center mb-5">
                        <EditableText tagName="h2" className="fw-bold mb-4 font-serif" style={{ fontSize: '2.5rem' }} value={section.title} onChange={(val) => updateCustomSection(section.id, { title: val })} />
                      </div>
                    )}
                    {section.content && (
                      <div className="text-center max-w-4xl mx-auto mb-5">
                        <ContentBlock value={section.content} onChange={(val) => updateCustomSection(section.id, { content: val })} />
                      </div>
                    )}
                    <div className="row g-4 justify-content-center">
                      {(section.cards || []).map((card, idx) => (
                        <CardItem
                          key={idx}
                          card={card}
                          idx={idx}
                          section={section}
                          isOrganic={isOrganic}
                          primaryColor={primaryColor}
                          updateCards={updateCards}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const nc = [...(section.cards || [])];
                        nc.push({ title: 'New Card', content: 'Card content goes here', icon: 'fa-solid fa-star' });
                        updateCustomSection(section.id, { cards: nc });
                      }}
                      className="text-white text-[12px] font-bold py-2 px-5 rounded-none transition-all flex items-center gap-2 mx-auto my-6 uppercase tracking-widest border-none"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <i className="fa-solid fa-plus"></i> Add Card
                    </button>
                    {section.buttonText && (
                      <div className="text-center mt-5">
                        <Linkable link={section.buttonHref || '#order'} onLinkChange={(val) => updateCustomSection(section.id, { buttonHref: val })}>
                          <a href={section.buttonHref || '#order'} onClick={(e) => e.preventDefault()} className={`d-inline-block fw-bold text-decoration-none ${isOrganic ? 'organic-btn organic-btn-primary' : 'btn-custom-pill shadow-sm'}`} style={!isOrganic ? { backgroundColor: secondaryColor, color: '#000', fontSize: '1.1rem', padding: '1rem 2.5rem' } : undefined}>
                            <EditableText tagName="span" value={section.buttonText} onChange={(val) => updateCustomSection(section.id, { buttonText: val })} />
                          </a>
                        </Linkable>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </section>
          </React.Fragment>
        );
      })}
    </>
  );
});
CustomSections.displayName = 'CustomSections';
