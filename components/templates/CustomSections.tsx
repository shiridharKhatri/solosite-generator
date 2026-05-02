'use client';

import React, { useCallback, useMemo } from 'react';
import { EditableText } from '../editor/EditableText';
import { EditableImage } from '../editor/EditableImage';
import { RichTextEditor } from '../editor/RichTextEditor';
import { useStore } from '@/lib/store';

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
          <div className="mb-3 rounded-2 overflow-hidden" style={{ maxHeight: '180px' }}>
            <EditableImage
              src={card.image}
              alt={card.title}
              onChange={(val) => handleFieldUpdate('image', val)}
              className="img-fluid w-100"
              style={{ objectFit: 'cover', maxHeight: '180px' }}
            />
          </div>
        )}
        {/* Card Icon (shows when no image) */}
        {!card.image && card.icon && <i className={`${card.icon} fs-1 mb-3 d-block`} style={{ color: primaryColor }}></i>}
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
