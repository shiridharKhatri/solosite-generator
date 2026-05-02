'use client';
import { marked } from 'marked';
import TurndownService from 'turndown';

marked.setOptions({
  breaks: true,
  gfm: true
});

import React, { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore, initialProjectData } from '@/lib/store';
import { GlycopezilTemplate } from '@/components/templates/GlycopezilTemplate';
import { OrganicTemplate } from '@/components/templates/OrganicTemplate';
import { generateProjectZip } from '@/lib/exporter';
import { EditableImage } from '@/components/editor/EditableImage';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { ImageUploadField } from '@/components/editor/ImageUploadField';
import { SEOChecker } from '@/components/editor/SEOChecker';


const IconMonitor = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const IconSmartphone = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const IconDownload = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

const LegalMarkdownEditor = ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => {
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  const handlePaste = React.useCallback((e: React.ClipboardEvent) => {
    const html = e.clipboardData.getData('text/html');
    if (html) {
      e.preventDefault();
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        hr: '---',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced'
      });
      const markdown = turndownService.turndown(html);

      // Get current selection and insert markdown
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const text = target.value;
      const newText = text.substring(0, start) + markdown + text.substring(end);
      onChange(newText);

      // Small timeout to move cursor after paste
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + markdown.length;
      }, 0);
    }
  }, [onChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label} (Markdown Supported)</label>
        <div className="flex gap-2">
          <span className="text-[8px] text-gray-400 italic">Hint: Use # for title, ## for heading, 1. for list</span>
        </div>
      </div>
      <div className="border border-gray-200">
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setTab('write')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest ${tab === 'write' ? 'bg-white border-r border-gray-200 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Write
          </button>
          <button
            onClick={() => setTab('preview')}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest ${tab === 'preview' ? 'bg-white border-l border-r border-gray-200 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Preview
          </button>
          <div className="flex-1 bg-gray-50 border-b border-gray-200 -mb-[1px]"></div>
        </div>
        <div className="p-0 bg-white">
          {tab === 'write' ? (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onPaste={handlePaste}
              className="w-full p-4 min-h-[300px] border-none focus:outline-none focus:ring-0 font-mono text-sm leading-relaxed resize-y text-gray-800 bg-gray-50"
              placeholder={`Enter your ${label.toLowerCase()} content here...`}
            />
          ) : (
            <div
              className="w-full p-6 min-h-[300px] bg-white legal-md-preview overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: marked.parse(value || '') as string }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default function EditorPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const {
    projectData, setProjectData, projectId: storeProjectId, setProjectId, updateTheme, updateLayoutStyle, updateProductName, updateSEO,
    updateHero, updateAbout, updateFeature, addFeature, removeFeature,
    updateIngredient, addIngredient, removeIngredient, updateBenefit, addBenefit, removeBenefit,
    updatePricing, addPricing, removePricing, updateFAQ, addFAQ, removeFAQ,
    updateFooter, updateTestimonials, addTestimonial, removeTestimonial,
    updateResearch, updateNavbar, updateProjectData,
    showLegalModal, setShowLegalModal, updateOrderLink, updateLegalPage,
    isDirty, setDirty, version
  } = useStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [isSEOModalOpen, setIsSEOModalOpen] = useState(false);
  const [seoTab, setSeoTab] = useState<'general' | 'social' | 'advanced'>('general');
  const [projectStatus, setProjectStatus] = useState<'draft' | 'published'>('draft');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<'layout' | 'theme' | 'settings' | null>(null);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [activeContentTab, setActiveContentTab] = useState('hero');
  const [isLoading, setIsLoading] = useState(projectId !== 'new');
  const [jsonSyncStatus, setJsonSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [jsonSyncError, setJsonSyncError] = useState('');
  const [isSyncing, startSyncTransition] = useTransition();

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container') && activeDropdown) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  // Robust Deep Merge Migration: Ensure all new schema fields exist for old projects
  const sanitizeProjectData = React.useCallback((data: any) => {
    const deepMerge = (target: any, source: any): any => {
      const output = { ...target };
      if (source && typeof source === 'object' && !Array.isArray(source)) {
        Object.keys(source).forEach(key => {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!(key in target) || !target[key]) {
              output[key] = source[key];
            } else {
              output[key] = deepMerge(target[key], source[key]);
            }
          } else {
            if (!(key in target) || target[key] === undefined || target[key] === null || target[key] === "") {
              output[key] = source[key];
            }
          }
        });
      }
      return output;
    };

    let updatedData = deepMerge(data, initialProjectData);

    // Migration: Ensure each pricing plan has its own guaranteeBadge
    if (updatedData.pricing) {
      updatedData.pricing = updatedData.pricing.map((plan: any) => ({
        ...plan,
        guaranteeBadge: plan.guaranteeBadge || {
          text: "60-DAY MONEY-BACK GUARANTEE",
          icon: "fa-solid fa-lock"
        }
      }));
    }

    // Sanitize corrupted testimonials
    if (updatedData.testimonials?.items) {
      updatedData.testimonials.items = updatedData.testimonials.items.map((item: any, i: number) => {
        if (item.content === '"${item.content}"' || item.content === '${item.content}') {
          return { ...item, content: initialProjectData.testimonials.items[i]?.content || 'Highly recommend this product!' };
        }
        return item;
      });
    }

    return updatedData;
  }, []);

  // Fetch project data if editing existing
  useEffect(() => {
    if (projectId === storeProjectId) return; // Prevent re-fetching if already loaded

    if (projectId && projectId !== 'new') {
      fetch(`/api/projects?id=${projectId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            const sanitized = sanitizeProjectData(data.data);
            setProjectData(sanitized);
            setProjectStatus(data.status || 'draft');
            setProjectId(projectId as string);
            setDirty(false); // Reset dirty after load
            setIsLoading(false);
          }
        })
        .catch(err => {
          console.error('Failed to fetch project:', err);
          setIsLoading(false);
        });
    } else if (projectId === 'new') {
      setProjectData(initialProjectData);
      setProjectId('new');
      setDirty(false);
      setIsLoading(false);
    }
  }, [projectId, storeProjectId, setProjectData, setProjectId, sanitizeProjectData, setDirty]);

  const handleSave = React.useCallback(async (status: 'draft' | 'published', isAutoSave: boolean = false) => {
    if (!projectData) return;
    const startVersion = version;
    if (isAutoSave) setIsAutoSaving(true);
    else setIsSaving(true);

    try {
      const isNew = projectId === 'new';
      const method = isNew ? 'POST' : 'PUT';

      // Calculate a rough SEO score for the dashboard
      const seoScore = projectData.seo?.title && projectData.seo?.description ? 85 : 40;

      const body = isNew
        ? {
          name: projectData.productName,
          data: projectData,
          status,
          theme: projectData.layoutStyle || 'default',
          seoScore
        }
        : {
          id: projectId,
          data: projectData,
          status,
          name: projectData.productName,
          theme: projectData.layoutStyle || 'default',
          seoScore
        };

      const res = await fetch('/api/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setProjectStatus(status);
        setLastSaved(new Date());

        const currentVersion = useStore.getState().version;
        if (currentVersion === startVersion) {
          setDirty(false);
        }

        if (isNew && data._id) {
          setProjectId(data._id); // Update local store first to prevent fetch race condition
          // Immediately redirect to the new project ID to prevent further POSTs (duplicates)
          // Using window.history.replaceState to update URL without full reload if possible, 
          // but router.push is safer for Next.js consistency.
          router.replace(`/editor/${data._id}`);
        }
      } else if (!isAutoSave) {
        alert(data.error || 'Failed to save');
      }
    } catch (error) {
      if (!isAutoSave) alert('Save failed.');
    } finally {
      setIsAutoSaving(false);
      setIsSaving(false);
    }
  }, [projectData, projectId, router, setDirty, version]);

  // Auto-save effect
  useEffect(() => {
    if (!projectData || !isDirty) return;

    // Don't auto-save if we're currently manually saving
    if (isSaving || isAutoSaving) return;

    const timeout = setTimeout(() => {
      handleSave('draft', true);
    }, 1500);

    return () => clearTimeout(timeout);
  }, [projectData, isDirty, isSaving, isAutoSaving, handleSave]);

  const handleLegalPaste = React.useCallback((e: React.ClipboardEvent, field: 'privacyPolicy' | 'termsAndConditions' | 'disclaimer') => {
    const html = e.clipboardData.getData('text/html');
    if (html) {
      e.preventDefault();
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        hr: '---',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced'
      });
      const markdown = turndownService.turndown(html);
      updateLegalPage(field, markdown);
    }
  }, [updateLegalPage]);

  // Prevent accidental navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleExport = React.useCallback(async () => {
    if (!projectData) return;

    const defaultName = projectData.productName.toLowerCase().replace(/\s+/g, '-') || 'my-project';
    const customName = prompt('Enter a name for your export (e.g. glycopezil-official):', defaultName);

    if (customName === null) return; // User cancelled

    setIsExporting(true);
    try {
      const blob = await generateProjectZip({
        ...projectData,
        exportName: customName
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = customName.endsWith('.zip') ? customName : `${customName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Export failed.');
    } finally {
      setIsExporting(false);
    }
  }, [projectData]);

  if (!projectData) return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <i className="fa-solid fa-cube text-4xl text-blue-600 animate-bounce"></i>
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Loading project...</span>
      </div>
    </div>
  );

  const activeTemplate = React.useMemo(() => {
    switch (projectData?.layoutStyle) {
      case 'organic':
        return <OrganicTemplate />;
      case 'default':
      default:
        return <GlycopezilTemplate />;
    }
  }, [projectData?.layoutStyle]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden relative">
      {isLoading && (
        <div className="fixed inset-0 z-[100000] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="relative">
            {/* Pulsing rings */}
            <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping duration-1000"></div>
            <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-pulse duration-700 delay-75"></div>

            {/* Core logo/spinner */}
            <div className="relative bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex items-center justify-center group">
              <i className="fa-solid fa-cube text-4xl text-blue-600 animate-bounce duration-1000"></i>
            </div>
          </div>

          <div className="mt-8 text-center space-y-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Preparing your workspace</h2>
            <div className="flex items-center justify-center gap-1.5">
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></span>
              <span className="ml-2 text-xs font-black uppercase tracking-widest text-slate-400">Syncing with cloud</span>
            </div>
          </div>
        </div>
      )}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-[10000] shadow-sm">
        <div className="flex items-center gap-4">
          {/* Logo & Brand Info */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-10 h-10 bg-zinc-100 hover:bg-zinc-200 rounded-lg flex items-center justify-center text-zinc-600 transition-colors group"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight leading-tight">SoloSite</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isAutoSaving || isSaving ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Saving...</span>
                  </div>
                ) : isDirty ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Unsaved Changes</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
                      Saved {lastSaved ? `at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-gray-100 hidden xl:block"></div>

          {/* Settings Group */}
          <div className="relative dropdown-container">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'settings' ? null : 'settings')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-none text-[11px] font-bold transition-all border ${activeDropdown === 'settings' ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'}`}
            >
              <i className="fa-solid fa-cog"></i>
              Settings
              <i className={`fa-solid fa-chevron-down text-[7px] transition-transform ${activeDropdown === 'settings' ? 'rotate-180' : ''}`}></i>
            </button>
            {activeDropdown === 'settings' && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-none shadow-2xl border border-gray-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[10001]">
                <button
                  onClick={() => { setIsSEOModalOpen(true); setActiveDropdown(null); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-none hover:bg-gray-50 text-left transition-colors group"
                >
                  <div className="w-8 h-8 rounded-none bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <i className="fa-solid fa-chart-line text-xs"></i>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">SEO Settings</div>
                    <div className="text-[10px] text-gray-500">Meta tags & Social OG</div>
                  </div>
                </button>
                <button
                  onClick={() => { setIsContentModalOpen(true); setActiveDropdown(null); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-none hover:bg-gray-50 text-left transition-colors group"
                >
                  <div className="w-8 h-8 rounded-none bg-purple-50 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <i className="fa-solid fa-pen-to-square text-xs"></i>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Content Editor</div>
                    <div className="text-[10px] text-gray-500">Edit all sections via form</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure? This will OVERWRITE your current content with the official official Glycopezil brand data.')) {
                      setProjectData(initialProjectData);
                      setActiveDropdown(null);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-none hover:bg-red-50 text-left transition-colors group"
                >
                  <div className="w-8 h-8 rounded-none bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <i className="fa-solid fa-rotate-left text-xs"></i>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-red-600">Reset to Brand Content</div>
                    <div className="text-[10px] text-red-400">Overwrite with official data</div>
                  </div>
                </button>
                <div className="h-px bg-gray-100 my-2"></div>
                <button
                  onClick={() => { setShowLegalModal(true); setActiveDropdown(null); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-none hover:bg-emerald-50 text-left transition-colors group"
                >
                  <div className="w-8 h-8 rounded-none bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <i className="fa-solid fa-file-shield text-xs"></i>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Legal Pages</div>
                    <div className="text-[10px] text-gray-500">Edit policies & disclaimer</div>
                  </div>
                </button>

              </div>
            )}
          </div>

          <div className="h-8 w-px bg-gray-100 hidden xl:block"></div>

          {/* Design & Appearance Group */}
          <div className="relative dropdown-container">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'layout' ? null : 'layout')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-none text-[11px] font-bold transition-all border ${activeDropdown === 'layout' ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'}`}
            >
              <i className="fa-solid fa-palette"></i>
              Design
              <i className={`fa-solid fa-chevron-down text-[7px] transition-transform ${activeDropdown === 'layout' ? 'rotate-180' : ''}`}></i>
            </button>
            {activeDropdown === 'layout' && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-none shadow-2xl border border-gray-100 p-4 animate-in fade-in slide-in-from-top-2 duration-200 z-[10001]">
                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Layout Style</div>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {[
                    { id: 'default', name: 'Classic' },
                    { id: 'organic', name: 'Organic' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => { updateLayoutStyle(style.id as any); setActiveDropdown(null); }}
                      className={`px-3 py-2 text-[10px] font-bold border transition-all ${projectData.layoutStyle === style.id ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'}`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>

                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 border-t pt-4">Color Presets</div>
                <div className="flex gap-2 mb-6">
                  {[
                    { p: '#2C0D67', s: '#fbbf24' },
                    { p: '#0f172a', s: '#38bdf8' },
                    { p: '#064e3b', s: '#34d399' },
                    { p: '#7c3aed', s: '#f472b6' }
                  ].map((c, i) => (
                    <button
                      key={i}
                      onClick={() => updateTheme({ primary: c.p, secondary: c.s })}
                      className="w-8 h-8 rounded-none cursor-pointer border border-gray-200 hover:scale-110 transition-transform relative overflow-hidden"
                      style={{ backgroundColor: c.p }}
                    >
                      <div className="absolute top-0 right-0 w-1/2 h-full" style={{ backgroundColor: c.s }}></div>
                    </button>
                  ))}
                </div>

                <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 border-t pt-4">Custom Branding</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="text-[9px] font-bold text-gray-500">Primary</div>
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 border border-gray-100">
                      <input type="color" value={projectData.theme?.primary || '#2C0D67'} onChange={(e) => updateTheme({ primary: e.target.value })} className="w-4 h-4 cursor-pointer bg-transparent border-none" />
                      <span className="text-[9px] font-mono text-gray-400 uppercase">{projectData.theme?.primary}</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[9px] font-bold text-gray-500">Accent</div>
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 border border-gray-100">
                      <input type="color" value={projectData.theme?.secondary || '#fbbf24'} onChange={(e) => updateTheme({ secondary: e.target.value })} className="w-4 h-4 cursor-pointer bg-transparent border-none" />
                      <span className="text-[9px] font-mono text-gray-400 uppercase">{projectData.theme?.secondary}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Viewport & Export */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5 bg-gray-100 p-1 rounded-none border border-gray-100">
            <button
              onClick={() => setViewport('desktop')}
              className={`w-7 h-7 flex items-center justify-center rounded-none transition-all ${viewport === 'desktop' ? 'bg-white text-black' : 'text-gray-400 hover:text-gray-600'}`}
              title="Desktop Preview"
            >
              <i className="fa-solid fa-desktop text-[11px]"></i>
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`w-7 h-7 flex items-center justify-center rounded-none transition-all ${viewport === 'mobile' ? 'bg-white text-black' : 'text-gray-400 hover:text-gray-600'}`}
              title="Mobile Preview"
            >
              <i className="fa-solid fa-mobile-screen-button text-[11px]"></i>
            </button>
          </div>

          <div className="h-8 w-px bg-gray-100 mx-1"></div>

          <SEOChecker />

          <div className="h-8 w-px bg-gray-100 mx-1"></div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="px-3 py-1.5 bg-white border border-gray-200 text-black rounded-none font-bold text-[11px] hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              {isSaving ? '...' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={isSaving}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-none font-bold text-[11px] hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              Save
            </button>
          </div>

          <div className="h-8 w-px bg-gray-100 mx-1"></div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="group flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-none font-bold text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <i className="fa-solid fa-circle-notch animate-spin"></i>
            ) : (
              <i className="fa-solid fa-file-export text-[10px]"></i>
            )}
            <span>Export</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-gray-100 pt-20 px-8 pb-12 custom-scrollbar">
        <div
          id="site-preview"
          className={`mx-auto bg-white rounded-md border border-gray-100 transition-all duration-500 ease-in-out relative ${viewport === 'mobile' ? 'max-w-[450px] mobile-preview shadow-2xl' : 'max-w-[1400px]'}`}
          style={{ height: 'fit-content', overflow: 'hidden' }}
        >
          {activeTemplate}
        </div>
      </main>

      {/* Content Editor Modal */}
      {isContentModalOpen && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setIsContentModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-none shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header - ultra-compact */}
            <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-base font-black text-gray-900">Content Editor</h2>
              <button onClick={() => setIsContentModalOpen(false)} className="w-8 h-8 rounded-none hover:bg-gray-100 flex items-center justify-center transition-colors">
                <i className="fa-solid fa-times text-gray-400 text-sm"></i>
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar Tabs */}
              <div className="w-64 border-r border-gray-100 bg-gray-50/50 p-3 overflow-y-auto">
                <div className="space-y-0.5">
                  {[
                    { id: 'hero', name: 'Hero Section', icon: 'fa-bolt' },
                    { id: 'navbar', name: 'Navbar Links', icon: 'fa-link' },
                    { id: 'about', name: 'About', icon: 'fa-info-circle' },
                    { id: 'research', name: 'Research & Science', icon: 'fa-microscope' },
                    { id: 'ingredients', name: 'Ingredients', icon: 'fa-leaf' },
                    { id: 'testimonials', name: 'Testimonials', icon: 'fa-star' },
                    { id: 'benefits', name: 'Benefits', icon: 'fa-check-circle' },
                    { id: 'pricing', name: 'Pricing Plans', icon: 'fa-tags' },
                    { id: 'faq', name: 'FAQ', icon: 'fa-question-circle' },
                    { id: 'custom-sections', name: 'Custom Sections', icon: 'fa-layer-group' },
                    { id: 'order', name: 'Order Page (Link)', icon: 'fa-shopping-cart' },
                    { id: 'footer', name: 'Footer', icon: 'fa-shoe-prints' },
                    { id: 'global-json', name: 'Global Content (JSON)', icon: 'fa-code' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveContentTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-none text-[11px] font-bold transition-all ${activeContentTab === tab.id ? 'bg-white text-purple-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:bg-white/50 hover:text-gray-900'}`}
                    >
                      <i className={`fa-solid ${tab.icon} w-4 text-center text-[10px]`}></i>
                      <span className="truncate">{tab.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Form Content */}
              <div className="flex-1 overflow-y-auto p-5 bg-white">
                {activeContentTab === 'hero' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Product Name</label>
                        <input
                          type="text"
                          value={projectData.productName}
                          onChange={(e) => updateProductName(e.target.value)}
                          className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm"
                        />
                      </div>
                      <ImageUploadField
                        label="Navbar Logo (Optional)"
                        value={projectData.hero.logoImage || ''}
                        onChange={(url) => updateHero({ logoImage: url })}
                      />
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Primary Button Icon</label>
                        <input
                          type="text"
                          value={projectData.hero.icon}
                          onChange={(e) => updateHero({ icon: e.target.value })}
                          className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <ImageUploadField
                        label="Hero Image"
                        value={projectData.hero.image}
                        onChange={(url) => updateHero({ image: url })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Main Title</label>
                      <input type="text" value={projectData.hero.title} onChange={(e) => updateHero({ title: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <RichTextEditor
                        value={projectData.hero.subtitle}
                        onChange={(val) => updateHero({ subtitle: val })}
                        className="w-full px-3 py-2 rounded-none border border-gray-200 min-h-[80px] text-sm"
                        tagName="div"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Primary Button Text</label>
                        <input type="text" value={projectData.hero.buttonText} onChange={(e) => updateHero({ buttonText: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Primary Button URL</label>
                        <input type="text" value={projectData.hero.buttonHref} onChange={(e) => updateHero({ buttonHref: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" placeholder="#pricing" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Secondary Button Text</label>
                        <input type="text" value={projectData.hero.secondaryButtonText} onChange={(e) => updateHero({ secondaryButtonText: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Secondary Button URL</label>
                        <input type="text" value={projectData.hero.secondaryButtonHref} onChange={(e) => updateHero({ secondaryButtonHref: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" placeholder="order.html" />
                      </div>
                    </div>
                  </div>
                )}

                {activeContentTab === 'navbar' && (
                  <div className="space-y-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-link text-blue-500"></i> Navigation Links
                    </div>
                    <div className="space-y-2">
                      {(projectData.navbar?.links || []).map((link, idx) => (
                        <div key={idx} className="flex gap-2 items-center p-3 bg-gray-50 border border-gray-100 group">
                          <div className="flex-1 space-y-1">
                            <label className="text-[8px] font-bold text-gray-400 uppercase">Label</label>
                            <input
                              type="text"
                              value={link.label}
                              onChange={(e) => {
                                const nl = [...projectData.navbar.links];
                                nl[idx] = { ...nl[idx], label: e.target.value };
                                updateNavbar({ links: nl });
                              }}
                              className="w-full px-2 py-1 text-xs border border-gray-200 bg-white font-bold text-black"
                            />
                          </div>
                          <div className="flex-[2] space-y-1">
                            <label className="text-[8px] font-bold text-gray-400 uppercase">URL / Anchor</label>
                            <input
                              type="text"
                              value={link.href}
                              onChange={(e) => {
                                const nl = [...projectData.navbar.links];
                                nl[idx] = { ...nl[idx], href: e.target.value };
                                updateNavbar({ links: nl });
                              }}
                              className="w-full px-2 py-1 text-xs border border-gray-200 bg-white font-mono text-black"
                              placeholder="#section or https://..."
                            />
                          </div>
                          <button
                            onClick={() => {
                              const nl = projectData.navbar.links.filter((_, i) => i !== idx);
                              updateNavbar({ links: nl });
                            }}
                            className="mt-4 w-8 h-8 rounded-none bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 border-none"
                          >
                            <i className="fa-solid fa-trash-can text-[10px]"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => updateNavbar({ links: [...(projectData.navbar?.links || []), { label: 'New Link', href: '#' }] })}
                      className="w-full py-2 border-2 border-dashed border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2 bg-transparent"
                    >
                      <i className="fa-solid fa-plus"></i> Add Navbar Link
                    </button>
                  </div>
                )}

                {activeContentTab === 'custom-sections' && (
                  <div className="space-y-6">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <i className="fa-solid fa-layer-group text-purple-500"></i> Manage Custom Sections
                    </div>

                    <div className="space-y-4">
                      {(projectData.customSections || []).map((section, idx) => (
                        <div key={section.id} className="p-4 bg-gray-50 border border-gray-200 relative group">
                          <button
                            onClick={() => useStore.getState().removeCustomSection(section.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white flex items-center justify-center rounded-none opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                            title="Remove Section"
                          >
                            <i className="fa-solid fa-xmark text-[10px]"></i>
                          </button>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Position (Insert After)</label>
                              <select
                                value={section.afterSection}
                                onChange={(e) => useStore.getState().updateCustomSection(section.id, { afterSection: e.target.value })}
                                className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none text-xs bg-white font-bold"
                              >
                                <option value="hero">Hero Section</option>
                                <option value="logos">Featured Logos</option>
                                <option value="ingredients">Ingredients</option>
                                <option value="features">Features</option>
                                <option value="research">Research</option>
                                <option value="about">About</option>
                                <option value="benefits">Benefits</option>
                                <option value="pricing">Pricing</option>
                                <option value="testimonials">Testimonials</option>
                                <option value="faq">FAQ</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Section Type</label>
                              <select
                                value={section.type}
                                onChange={(e) => useStore.getState().updateCustomSection(section.id, { type: e.target.value as any })}
                                className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none text-xs bg-white font-bold"
                              >
                                <option value="text">Text Only</option>
                                <option value="image-text">Image Left, Text Right</option>
                                <option value="text-image">Text Left, Image Right</option>
                                <option value="cards">Cards Grid</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Section Title</label>
                              <input
                                type="text"
                                value={section.title}
                                onChange={(e) => useStore.getState().updateCustomSection(section.id, { title: e.target.value })}
                                className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none font-bold text-gray-900 text-sm bg-white"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <RichTextEditor
                                value={section.content}
                                onChange={(val) => useStore.getState().updateCustomSection(section.id, { content: val })}
                                className="w-full px-3 py-2 rounded-none border border-gray-200 min-h-[100px] text-sm bg-white"
                                tagName="div"
                              />
                            </div>

                            {(section.type === 'image-text' || section.type === 'text-image') && (
                              <ImageUploadField
                                label="Section Image"
                                value={section.image || ''}
                                onChange={(url) => useStore.getState().updateCustomSection(section.id, { image: url })}
                              />
                            )}

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Button Text</label>
                                <input
                                  type="text"
                                  value={section.buttonText || ''}
                                  onChange={(e) => useStore.getState().updateCustomSection(section.id, { buttonText: e.target.value })}
                                  className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-white"
                                  placeholder="e.g. Learn More"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Button Link</label>
                                <input
                                  type="text"
                                  value={section.buttonHref || ''}
                                  onChange={(e) => useStore.getState().updateCustomSection(section.id, { buttonHref: e.target.value })}
                                  className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm bg-white"
                                  placeholder="#order or https://..."
                                />
                              </div>
                            </div>

                            {section.type === 'cards' && (
                              <div className="space-y-3 pt-3 border-t border-gray-200">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cards</label>
                                {(section.cards || []).map((card, cIdx) => (
                                  <div key={cIdx} className="p-3 border border-gray-200 bg-gray-50 space-y-3 relative group/card">
                                    <button 
                                      onClick={() => { const nc = [...(section.cards || [])]; nc.splice(cIdx, 1); useStore.getState().updateCustomSection(section.id, { cards: nc }); }}
                                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-0 group-hover/card:opacity-100 transition-opacity"
                                    >
                                      <i className="fa-solid fa-trash text-xs"></i>
                                    </button>
                                    <input 
                                      type="text" 
                                      value={card.title} 
                                      onChange={(e) => { const nc = [...(section.cards || [])]; nc[cIdx].title = e.target.value; useStore.getState().updateCustomSection(section.id, { cards: nc }); }}
                                      placeholder="Card Title" 
                                      className="w-full px-2 py-1.5 text-sm border outline-none" 
                                    />
                                    <textarea 
                                      value={card.content} 
                                      onChange={(e) => { const nc = [...(section.cards || [])]; nc[cIdx].content = e.target.value; useStore.getState().updateCustomSection(section.id, { cards: nc }); }}
                                      placeholder="Card Content" 
                                      className="w-full px-2 py-1.5 text-sm border outline-none min-h-[60px]" 
                                    />
                                    <input 
                                      type="text" 
                                      value={card.icon || ''} 
                                      onChange={(e) => { const nc = [...(section.cards || [])]; nc[cIdx].icon = e.target.value; useStore.getState().updateCustomSection(section.id, { cards: nc }); }}
                                      placeholder="Icon (e.g. fa-solid fa-star)" 
                                      className="w-full px-2 py-1.5 text-sm border outline-none font-mono" 
                                    />
                                    <ImageUploadField
                                      label="Card Image"
                                      value={card.image || ''}
                                      onChange={(url) => { const nc = [...(section.cards || [])]; nc[cIdx].image = url; useStore.getState().updateCustomSection(section.id, { cards: nc }); }}
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                      <input 
                                        type="text" 
                                        value={card.buttonText || ''} 
                                        onChange={(e) => { const nc = [...(section.cards || [])]; nc[cIdx].buttonText = e.target.value; useStore.getState().updateCustomSection(section.id, { cards: nc }); }}
                                        placeholder="Button Text" 
                                        className="px-2 py-1.5 text-xs border outline-none" 
                                      />
                                      <input 
                                        type="text" 
                                        value={card.buttonHref || ''} 
                                        onChange={(e) => { const nc = [...(section.cards || [])]; nc[cIdx].buttonHref = e.target.value; useStore.getState().updateCustomSection(section.id, { cards: nc }); }}
                                        placeholder="Button Link" 
                                        className="px-2 py-1.5 text-xs border outline-none" 
                                      />
                                    </div>
                                  </div>
                                ))}
                                <button 
                                  onClick={() => { const nc = [...(section.cards || [])]; nc.push({ title: 'New Card', content: 'Card content goes here', icon: 'fa-solid fa-star' }); useStore.getState().updateCustomSection(section.id, { cards: nc }); }}
                                  className="w-full py-2 bg-gray-100 text-gray-600 font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200"
                                >
                                  + Add Card
                                </button>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200 mt-2">
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Background Color</label>
                                <div className="flex items-center gap-2">
                                  <input type="color" value={section.bgColor} onChange={(e) => useStore.getState().updateCustomSection(section.id, { bgColor: e.target.value })} className="w-6 h-6 p-0 border-0" />
                                  <input type="text" value={section.bgColor} onChange={(e) => useStore.getState().updateCustomSection(section.id, { bgColor: e.target.value })} className="flex-1 text-xs px-2 py-1 border border-gray-200 font-mono" />
                                </div>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Text Color</label>
                                <div className="flex items-center gap-2">
                                  <input type="color" value={section.textColor} onChange={(e) => useStore.getState().updateCustomSection(section.id, { textColor: e.target.value })} className="w-6 h-6 p-0 border-0" />
                                  <input type="text" value={section.textColor} onChange={(e) => useStore.getState().updateCustomSection(section.id, { textColor: e.target.value })} className="flex-1 text-xs px-2 py-1 border border-gray-200 font-mono" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="pt-2">
                        <button
                          onClick={() => useStore.getState().addCustomSection('hero')}
                          className="w-full py-3 bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-100 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <i className="fa-solid fa-plus"></i> Add Custom Section
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeContentTab === 'testimonials' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Section Title</label>
                        <input
                          type="text"
                          value={projectData.testimonials?.title || ''}
                          onChange={(e) => updateTestimonials(-1, { title: e.target.value })}
                          className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Section Subtitle</label>
                        <input
                          type="text"
                          value={projectData.testimonials?.subtitle || ''}
                          onChange={(e) => updateTestimonials(-1, { subtitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {projectData.testimonials?.items.map((item, i) => (
                        <div key={i} className="p-4 rounded-none border border-gray-100 bg-gray-50/50 space-y-3 relative group">
                          <button
                            onClick={() => removeTestimonial(i)}
                            className="absolute top-3 right-3 w-7 h-7 rounded-none bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                          >
                            <i className="fa-solid fa-times text-xs"></i>
                          </button>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Name</label>
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateTestimonials(i, { name: e.target.value })}
                                className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Rating (1-5)</label>
                              <input
                                type="number"
                                min="1"
                                max="5"
                                value={isNaN(item.rating) ? '' : item.rating}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  updateTestimonials(i, { rating: isNaN(val) ? 5 : val });
                                }}
                                className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <RichTextEditor
                              value={item.content}
                              onChange={(val) => updateTestimonials(i, { content: val })}
                              className="w-full px-3 py-2 rounded-none border border-gray-200 min-h-[80px] text-sm"
                              tagName="div"
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={addTestimonial}
                        className="w-full py-3 rounded-none border-2 border-dashed border-gray-200 text-gray-400 hover:border-purple-300 hover:text-purple-500 hover:bg-purple-50/50 transition-all font-bold flex items-center justify-center gap-2 text-sm"
                      >
                        <i className="fa-solid fa-plus-circle"></i>
                        Add Testimonial
                      </button>
                    </div>
                  </div>
                )}

                {activeContentTab === 'benefits' && (
                  <div className="space-y-3">
                    {projectData.features.map((feature, idx) => (
                      <div key={idx} className="p-4 rounded-none border border-gray-100 bg-gray-50/30 space-y-3 relative group">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-purple-500">Feature #{idx + 1}</span>
                          <button
                            onClick={() => removeFeature(idx)}
                            className="absolute top-3 right-3 w-7 h-7 rounded-none bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <i className="fa-solid fa-trash-can text-[10px]"></i>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Title</label>
                            <input type="text" value={feature.title} onChange={(e) => updateFeature(idx, { title: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" />
                          </div>
                          <ImageUploadField
                            label="Image"
                            value={feature.image}
                            onChange={(url) => updateFeature(idx, { image: url })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <RichTextEditor
                            value={feature.description}
                            onChange={(val) => updateFeature(idx, { description: val })}
                            className="w-full px-3 py-2 rounded-none border border-gray-200 min-h-[60px] text-sm"
                            tagName="div"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addFeature}
                      className="w-full py-3 rounded-none border-2 border-dashed border-gray-200 text-gray-400 font-bold hover:border-purple-300 hover:text-purple-500 hover:bg-purple-50/30 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <i className="fa-solid fa-plus-circle"></i>
                      Add New Feature
                    </button>
                  </div>
                )}

                {activeContentTab === 'about' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Section Title</label>
                      <input type="text" value={projectData.about.title} onChange={(e) => updateAbout({ title: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <RichTextEditor
                        value={projectData.about.description}
                        onChange={(val) => updateAbout({ description: val })}
                        className="w-full px-3 py-2 rounded-none border border-gray-200 min-h-[150px] text-sm"
                        tagName="div"
                      />
                    </div>
                    <ImageUploadField
                      label="About Image"
                      value={projectData.about.image}
                      onChange={(url) => updateAbout({ image: url })}
                    />
                  </div>
                )}

                {activeContentTab === 'research' && projectData.research && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Section Title</label>
                          <input type="text" value={projectData.research.title} onChange={(e) => updateResearch({ title: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 font-bold text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Subtitle</label>
                          <input type="text" value={projectData.research.subtitle} onChange={(e) => updateResearch({ subtitle: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 text-sm" />
                        </div>
                      </div>
                      <ImageUploadField
                        label="Research Image"
                        value={projectData.research.image}
                        onChange={(url) => updateResearch({ image: url })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Detailed Description</label>
                      <RichTextEditor
                        value={projectData.research.description}
                        onChange={(val) => updateResearch({ description: val })}
                        className="w-full px-3 py-2 rounded-none border border-gray-200 min-h-[120px] text-sm"
                        tagName="div"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-4">
                      {projectData.research.stats.map((stat, idx) => (
                        <div key={idx} className="space-y-1.5 p-3 bg-gray-50 border border-gray-100">
                          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Stat Label</label>
                          <input type="text" value={stat.label} onChange={(e) => {
                            const newStats = [...projectData.research!.stats];
                            newStats[idx] = { ...stat, label: e.target.value };
                            updateResearch({ stats: newStats });
                          }} className="w-full px-2 py-1 rounded-none border border-gray-200 text-xs" />
                          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-2 block">Stat Value</label>
                          <input type="text" value={stat.value} onChange={(e) => {
                            const newStats = [...projectData.research!.stats];
                            newStats[idx] = { ...stat, value: e.target.value };
                            updateResearch({ stats: newStats });
                          }} className="w-full px-2 py-1 rounded-none border border-gray-200 text-xs font-bold" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}



                {activeContentTab === 'ingredients' && (
                  <div className="space-y-3">
                    <div className="space-y-3 pb-4 border-b border-gray-100">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Section Title</label>
                        <input type="text" value={projectData.ingredients.title} onChange={(e) => updateIngredient(-1, { title: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Section Subtitle</label>
                        <input type="text" value={projectData.ingredients.subtitle} onChange={(e) => updateIngredient(-1, { subtitle: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" />
                      </div>
                    </div>
                    {projectData.ingredients.items.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-none border border-gray-100 bg-gray-50/30 space-y-3 relative group">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-purple-500">Ingredient #{idx + 1}</span>
                          <button
                            onClick={() => removeIngredient(idx)}
                            className="absolute top-3 right-3 w-7 h-7 rounded-none bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <i className="fa-solid fa-trash-can text-[10px]"></i>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Title</label>
                            <input type="text" value={item.title} onChange={(e) => updateIngredient(idx, { title: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" />
                          </div>
                          <ImageUploadField
                            label="Image"
                            value={item.image}
                            onChange={(url) => updateIngredient(idx, { image: url })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <RichTextEditor
                            value={item.description}
                            onChange={(val) => updateIngredient(idx, { description: val })}
                            className="w-full px-3 py-2 rounded-none border border-gray-200 min-h-[60px] text-sm"
                            tagName="div"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addIngredient}
                      className="w-full py-3 rounded-none border-2 border-dashed border-gray-200 text-gray-400 font-bold hover:border-purple-300 hover:text-purple-500 hover:bg-purple-50/30 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <i className="fa-solid fa-plus-circle"></i>
                      Add New Ingredient
                    </button>
                  </div>
                )}

                {activeContentTab === 'pricing' && (
                  <div className="space-y-3">
                    {projectData.pricing.map((plan, idx) => (
                      <div key={idx} className="p-4 rounded-none border border-gray-100 bg-gray-50/30 space-y-3 relative group">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-purple-500">Pricing Plan #{idx + 1}</span>
                          <button
                            onClick={() => removePricing(idx)}
                            className="absolute top-3 right-3 w-7 h-7 rounded-none bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <i className="fa-solid fa-trash-can text-[10px]"></i>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Plan Title</label>
                            <input type="text" value={plan.title} onChange={(e) => updatePricing(idx, { title: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Bottle Quantity</label>
                            <input type="text" value={plan.quantity || ''} onChange={(e) => updatePricing(idx, { quantity: e.target.value })} placeholder="6 Bottles" className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Price Per Bottle</label>
                            <input type="text" value={plan.price} onChange={(e) => updatePricing(idx, { price: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Button Text</label>
                            <input type="text" value={plan.buttonText} onChange={(e) => updatePricing(idx, { buttonText: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Button URL</label>
                            <input type="text" value={plan.buttonHref} onChange={(e) => updatePricing(idx, { buttonHref: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <ImageUploadField
                            label="Plan Image"
                            value={plan.image || ''}
                            onChange={(url) => updatePricing(idx, { image: url })}
                          />
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Options</label>
                            <div className="flex items-center gap-2 h-[42px]">
                              <input
                                type="checkbox"
                                checked={plan.isPrimary}
                                onChange={(e) => updatePricing(idx, { isPrimary: e.target.checked })}
                                className="w-4 h-4 rounded-none border-gray-200 text-purple-600 focus:ring-purple-500"
                              />
                              <span className="text-xs font-bold text-gray-700">Mark as Best Value</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Features (one per line)</label>
                          <textarea rows={3} value={plan.features.join('\n')} onChange={(e) => updatePricing(idx, { features: e.target.value.split('\n') })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addPricing}
                      className="w-full py-3 rounded-none border-2 border-dashed border-gray-200 text-gray-400 font-bold hover:border-purple-300 hover:text-purple-500 hover:bg-purple-50/30 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <i className="fa-solid fa-plus-circle"></i>
                      Add New Pricing Plan
                    </button>
                  </div>
                )}

                {activeContentTab === 'faq' && (
                  <div className="space-y-3">
                    {projectData.faq.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-none border border-gray-100 bg-gray-50/30 space-y-3 relative group">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-purple-500">FAQ Item #{idx + 1}</span>
                          <button
                            onClick={() => removeFAQ(idx)}
                            className="absolute top-3 right-3 w-7 h-7 rounded-none bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <i className="fa-solid fa-trash-can text-[10px]"></i>
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Question</label>
                          <input type="text" value={item.question} onChange={(e) => updateFAQ(idx, { question: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Answer</label>
                          <textarea rows={2} value={item.answer} onChange={(e) => updateFAQ(idx, { answer: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" />
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addFAQ}
                      className="w-full py-3 rounded-none border-2 border-dashed border-gray-200 text-gray-400 font-bold hover:border-purple-300 hover:text-purple-500 hover:bg-purple-50/30 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <i className="fa-solid fa-plus-circle"></i>
                      Add New FAQ Item
                    </button>
                  </div>
                )}

                {activeContentTab === 'order' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 border border-blue-100 flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-info-circle text-xl"></i>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-blue-900 mb-1">Dynamic Order Page</div>
                        <div className="text-[11px] text-blue-700 leading-relaxed">
                          Your exported site will include an <strong>order.html</strong> file.
                          When users click on "Buy Now" or "Order" buttons, they will be redirected to the link below.
                          This is perfect for affiliate links or external checkout pages.
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Redirect Destination URL</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                          <i className="fa-solid fa-link absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]"></i>
                          <input
                            type="url"
                            value={projectData.orderLink || ''}
                            onChange={(e) => updateOrderLink(e.target.value)}
                            placeholder="https://glycopezil.com/..."
                            className="w-full pl-9 pr-4 py-3 rounded-none border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-gray-900 text-sm"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 italic">Example: https://your-affiliate-link.com/?id=123</p>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Preview of order.html</div>
                      <div className="bg-gray-900 p-4 font-mono text-[11px] text-gray-300 overflow-x-auto whitespace-pre">
                        {`<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
  <meta http-equiv="Refresh" content="0; URL=${projectData.orderLink || '#'}" />
  <title>${projectData.productName} | Order Page</title>
</head>
<body>
  <a href="${projectData.orderLink || '#'}">Redirecting...</a>
</body>
</html>`}
                      </div>
                    </div>
                  </div>
                )}

                {activeContentTab === 'footer' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Company Info / Disclaimer</label>
                      <textarea rows={4} value={projectData.footer.companyInfo} onChange={(e) => updateFooter({ companyInfo: e.target.value })} className="w-full px-3 py-2 rounded-none border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all font-bold text-gray-900 text-sm" />
                    </div>
                    <ImageUploadField
                      label="Trust Badge / Guarantee Image"
                      value={projectData.footer.trustImage || ''}
                      onChange={(url) => updateFooter({ trustImage: url })}
                    />
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Footer Links</label>
                      <div className="space-y-2">
                        {projectData.footer.links.map((link, lIdx) => (
                          <div key={lIdx} className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={link.label}
                              onChange={(e) => {
                                const newLinks = [...projectData.footer.links];
                                newLinks[lIdx] = { ...newLinks[lIdx], label: e.target.value };
                                updateFooter({ links: newLinks });
                              }}
                              className="px-3 py-2 rounded-none border border-gray-200 text-xs font-bold"
                              placeholder="Label"
                            />
                            <input
                              type="text"
                              value={link.href}
                              onChange={(e) => {
                                const newLinks = [...projectData.footer.links];
                                newLinks[lIdx] = { ...newLinks[lIdx], href: e.target.value };
                                updateFooter({ links: newLinks });
                              }}
                              className="px-3 py-2 rounded-none border border-gray-200 text-xs font-bold"
                              placeholder="URL"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeContentTab === 'global-json' && (
                  <div className="h-full flex flex-col space-y-4">

                    <div className="flex-1 flex flex-col min-h-[400px]">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Raw Website Schema</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const textarea = document.getElementById('global-json-textarea') as HTMLTextAreaElement;
                              if (textarea) {
                                try {
                                  const obj = JSON.parse(textarea.value);
                                  textarea.value = JSON.stringify(obj, null, 2);
                                } catch (e) {
                                  setJsonSyncStatus('error');
                                  setJsonSyncError('Invalid JSON — cannot format.');
                                  setTimeout(() => setJsonSyncStatus('idle'), 3000);
                                }
                              }
                            }}
                            className="text-[10px] font-bold text-purple-600 hover:underline transition-all"
                          >
                            Format JSON
                          </button>
                          <button
                            onClick={() => {
                              const textarea = document.getElementById('global-json-textarea') as HTMLTextAreaElement;
                              if (textarea) {
                                navigator.clipboard.writeText(textarea.value);
                                setJsonSyncStatus('success');
                                setJsonSyncError('Copied to clipboard!');
                                setTimeout(() => setJsonSyncStatus('idle'), 2000);
                              }
                            }}
                            className="text-[10px] font-bold text-emerald-600 hover:underline transition-all"
                          >
                            Copy JSON
                          </button>
                          <button
                            onClick={() => {
                              const textarea = document.getElementById('global-json-textarea') as HTMLTextAreaElement;
                              if (textarea) {
                                textarea.value = JSON.stringify(projectData, null, 2);
                              }
                            }}
                            className="text-[10px] font-bold text-gray-500 hover:underline transition-all"
                          >
                            Reset to Store
                          </button>
                        </div>
                      </div>
                      <textarea
                        id="global-json-textarea"
                        key={projectData ? 'loaded' : 'loading'}
                        defaultValue={JSON.stringify(projectData, null, 2)}
                        rows={20}
                        className="flex-1 w-full p-4 bg-gray-900 text-green-400 font-mono text-xs rounded-none border-none outline-none focus:ring-2 focus:ring-purple-500 resize-none shadow-inner"
                        spellCheck={false}
                      />
                    </div>

                    {/* Status Toast */}
                    {jsonSyncStatus !== 'idle' && (
                      <div className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-none animate-in fade-in slide-in-from-bottom-2 duration-200 ${jsonSyncStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        <i className={`fa-solid ${jsonSyncStatus === 'success' ? 'fa-check-circle' : 'fa-triangle-exclamation'}`}></i>
                        {jsonSyncStatus === 'success' ? (jsonSyncError || 'Content synced successfully!') : jsonSyncError}
                      </div>
                    )}

                    <div className="flex justify-end pt-2 pb-12">
                      <button
                        disabled={isSyncing}
                        onClick={() => {
                          const textarea = document.getElementById('global-json-textarea') as HTMLTextAreaElement;
                          if (!textarea) return;
                          setJsonSyncStatus('idle');
                          let newData: any;
                          try {
                            newData = JSON.parse(textarea.value);
                            if (typeof newData !== 'object') throw new Error('Object is required.');
                          } catch (e: any) {
                            setJsonSyncStatus('error');
                            setJsonSyncError('Invalid JSON: ' + e.message);
                            return;
                          }
                          // Defer the heavy re-render as a non-blocking low-priority transition
                          startSyncTransition(() => {
                            const sanitized = sanitizeProjectData(newData);
                            setProjectData(sanitized);
                            setDirty(true);
                            setJsonSyncStatus('success');
                            setJsonSyncError('');
                            setTimeout(() => setJsonSyncStatus('idle'), 3000);
                          });
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white text-xs font-black uppercase tracking-widest hover:bg-purple-700 transition-colors shadow-lg shadow-purple-100 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSyncing ? (
                          <><i className="fa-solid fa-circle-notch animate-spin"></i> Syncing...</>
                        ) : 'Sync JSON Content'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsContentModalOpen(false)} className="px-8 py-3 rounded-none bg-black text-white text-sm font-black transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-gray-200">
                Done Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEO Modal */}
      {isSEOModalOpen && (
        <div className="fixed inset-0 z-[10005] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSEOModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-none shadow-xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-lg">SEO Settings</h3>
                <p className="text-sm text-gray-500">Manage your meta tags and schema markup.</p>
              </div>
              <button onClick={() => setIsSEOModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-none hover:bg-gray-100 text-gray-500 transition-colors">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="flex px-6 border-b border-gray-100 gap-6 mt-4">
              <button onClick={() => setSeoTab('general')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${seoTab === 'general' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>General SEO</button>
              <button onClick={() => setSeoTab('social')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${seoTab === 'social' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>Social & OG</button>
              <button onClick={() => setSeoTab('advanced')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${seoTab === 'advanced' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>Advanced & Struct</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">

              {seoTab === 'general' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Meta Title</label>
                    <input type="text" placeholder="e.g. Glycopezil - Natural Blood Support" value={projectData.seo?.title || ''} onChange={(e) => updateSEO({ title: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-sm focus:ring-2 focus:ring-black outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Meta Description</label>
                    <textarea rows={3} placeholder="Enter a compelling description for search engines..." value={projectData.seo?.description || ''} onChange={(e) => updateSEO({ description: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-sm focus:ring-2 focus:ring-black outline-none resize-none"></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Keywords</label>
                      <input type="text" placeholder="health, sugar, natural" value={projectData.seo?.keywords || ''} onChange={(e) => updateSEO({ keywords: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-sm focus:ring-2 focus:ring-black outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Author</label>
                      <input type="text" placeholder="Author Name" value={projectData.seo?.author || ''} onChange={(e) => updateSEO({ author: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-sm focus:ring-2 focus:ring-black outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Language</label>
                      <input type="text" placeholder="en" value={projectData.seo?.language || ''} onChange={(e) => updateSEO({ language: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-sm focus:ring-2 focus:ring-black outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Locale</label>
                      <input type="text" placeholder="en_US" value={projectData.seo?.locale || ''} onChange={(e) => updateSEO({ locale: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-sm focus:ring-2 focus:ring-black outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Theme Color</label>
                    <input type="color" value={projectData.seo?.themeColor || '#2C0D67'} onChange={(e) => updateSEO({ themeColor: e.target.value })} className="w-12 h-12 p-1 bg-white border border-gray-200 rounded-none cursor-pointer" />
                  </div>
                </div>
              )}

              {seoTab === 'social' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">OG Title</label>
                      <input type="text" placeholder="Overrides Meta Title for Socials" value={projectData.seo?.ogTitle || ''} onChange={(e) => updateSEO({ ogTitle: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-sm focus:ring-2 focus:ring-black outline-none" />

                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mt-4 mb-1">OG Description</label>
                      <textarea rows={3} placeholder="Overrides Meta Desc for Socials" value={projectData.seo?.ogDescription || ''} onChange={(e) => updateSEO({ ogDescription: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-sm focus:ring-2 focus:ring-black outline-none resize-none"></textarea>

                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mt-4 mb-1">Twitter Creator</label>
                      <input type="text" placeholder="@username" value={projectData.seo?.twitterCreator || ''} onChange={(e) => updateSEO({ twitterCreator: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-sm focus:ring-2 focus:ring-black outline-none" />

                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mt-4 mb-1">Twitter Card Type</label>
                      <select value={projectData.seo?.twitterCard || 'summary_large_image'} onChange={(e) => updateSEO({ twitterCard: e.target.value as any })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-sm focus:ring-2 focus:ring-black outline-none">
                        <option value="summary_large_image">Summary Large Image (Recommended)</option>
                        <option value="summary">Summary (Small Image)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">OG / Social Image</label>
                        <div className="w-full rounded-none overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                          <EditableImage src={projectData.seo?.ogImage || '/image/banner-img.webp'} onChange={(url) => updateSEO({ ogImage: url })} alt="Social Image" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-center">1200x630px strictly for FB, LinkedIn, X</p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Favicon</label>
                        <div className="w-full rounded-none overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center py-2">
                          <EditableImage src={projectData.seo?.favicon || '/favicon.ico'} onChange={(url) => updateSEO({ favicon: url })} alt="Favicon Preview" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-center">64x64px square icon</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {seoTab === 'advanced' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Canonical URL</label>
                        <button
                          onClick={() => updateSEO({ canonicalUrl: window.location.origin })}
                          className="text-[9px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <i className="fa-solid fa-wand-magic-sparkles"></i>
                          Detect Domain
                        </button>
                      </div>
                      <input type="text" placeholder="https://example.com" value={projectData.seo?.canonicalUrl || ''} onChange={(e) => updateSEO({ canonicalUrl: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-sm focus:ring-2 focus:ring-black outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 u                                                                                                                       ppercase tracking-wide mb-1">Robots</label>
                      <select value={projectData.seo?.robots || 'index, follow'} onChange={(e) => updateSEO({ robots: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-sm focus:ring-2 focus:ring-black outline-none">
                        <option value="index, follow">Index, Follow</option>
                        <option value="noindex, follow">Noindex, Follow</option>
                        <option value="index, nofollow">Index, Nofollow</option>
                        <option value="noindex, nofollow">Noindex, Nofollow</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Custom Meta Tags</label>
                      <button onClick={() => { const newTags = [...(projectData.seo?.customTags || [])]; newTags.push({ type: 'name', key: '', value: '' }); updateSEO({ customTags: newTags }); }} className="text-[10px] bg-black text-white px-3 py-1 rounded-none font-bold uppercase transition-all hover:scale-105">+ Add Tag</button>
                    </div>
                    <div className="space-y-2">
                      {(projectData.seo?.customTags || []).map((tag, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <select value={tag.type} onChange={(e) => { const newTags = [...(projectData.seo?.customTags || [])]; newTags[idx].type = e.target.value as 'name' | 'property'; updateSEO({ customTags: newTags }); }} className="w-24 px-2 py-1.5 border rounded-none text-xs outline-none bg-gray-50">
                            <option value="name">name</option>
                            <option value="property">property</option>
                          </select>
                          <input type="text" placeholder="key (e.g. fb:app_id)" value={tag.key} onChange={(e) => { const newTags = [...(projectData.seo?.customTags || [])]; newTags[idx].key = e.target.value; updateSEO({ customTags: newTags }); }} className="flex-1 px-3 py-1.5 border rounded-none text-xs outline-none bg-gray-50" />
                          <input type="text" placeholder="Content" value={tag.value} onChange={(e) => { const newTags = [...(projectData.seo?.customTags || [])]; newTags[idx].value = e.target.value; updateSEO({ customTags: newTags }); }} className="flex-1 px-3 py-1.5 border rounded-none text-xs outline-none bg-gray-50" />
                          <button onClick={() => { const newTags = [...(projectData.seo?.customTags || [])]; newTags.splice(idx, 1); updateSEO({ customTags: newTags }); }} className="w-7 h-7 flex items-center justify-center rounded-none bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><i className="fa-solid fa-trash-can text-[10px]"></i></button>
                        </div>
                      ))}
                      {(!projectData.seo?.customTags || projectData.seo.customTags.length === 0) && (
                        <p className="text-xs text-gray-400 italic py-2">No custom tags. Add them for specific verifications or schemas.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 flex justify-between">
                      <span>JSON-LD Schema</span>
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-2 rounded-none">DEV</span>
                    </label>
                    <textarea rows={3} placeholder='{"@context": "https://schema.org", ...}' value={projectData.seo?.schema || ''} onChange={(e) => updateSEO({ schema: e.target.value })} className="w-full px-4 py-2 bg-gray-900 text-green-400 font-mono border rounded-none text-xs outline-none resize-y"></textarea>
                  </div>

                  <div className="grid grid-cols-1 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 flex justify-between">
                        <span>Header Scripts</span>
                        <span className="text-[10px] text-blue-500 font-black">BEFORE &lt;/HEAD&gt;</span>
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Paste Google Analytics, Meta Pixel, or other head scripts here..."
                        value={projectData.seo?.headerScripts || ''}
                        onChange={(e) => updateSEO({ headerScripts: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-xs font-mono outline-none resize-y"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 flex justify-between">
                        <span>Footer Scripts</span>
                        <span className="text-[10px] text-orange-500 font-black">BEFORE &lt;/BODY&gt;</span>
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Paste tracking noscripts or footer scripts here..."
                        value={projectData.seo?.footerScripts || ''}
                        onChange={(e) => updateSEO({ footerScripts: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-none text-xs font-mono outline-none resize-y"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsSEOModalOpen(false)}
                className="px-6 py-2.5 bg-black text-white rounded-none font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )
      }
      {/* Legal Pages Modal */}
      {showLegalModal && projectData && (
        <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowLegalModal(false)}></div>
          <div className="bg-white w-full max-w-4xl rounded-none shadow-2xl z-[30001] overflow-hidden flex flex-col max-h-[90vh] relative animate-in zoom-in-95 duration-200">
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-scale-balanced text-blue-600 text-xl"></i>
                <h3 className="m-0 text-sm font-black text-gray-900 uppercase tracking-tight">Legal Pages Content</h3>
              </div>
              <button onClick={() => setShowLegalModal(false)} className="w-8 h-8 rounded-none hover:bg-gray-100 flex items-center justify-center transition-colors">
                <i className="fa-solid fa-xmark text-gray-400"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-8 bg-white custom-scrollbar">
              <style>{`
                .legal-md-preview h1 { font-size: 1.6rem; font-weight: 800; margin: 1.5rem 0 0.5rem; color: #111; border-bottom: 2px solid #f0f0f0; padding-bottom: 0.25rem; }
                .legal-md-preview h2 { font-size: 1.2rem; font-weight: 700; margin: 1.25rem 0 0.4rem; color: #222; }
                .legal-md-preview h3 { font-size: 1rem; font-weight: 700; margin: 1rem 0 0.3rem; color: #333; }
                .legal-md-preview p { margin-bottom: 0.75rem; line-height: 1.7; color: #444; font-size: 0.875rem; }
                .legal-md-preview ul, .legal-md-preview ol { padding-left: 1.5rem; margin-bottom: 0.75rem; }
                .legal-md-preview li { margin-bottom: 0.35rem; line-height: 1.6; font-size: 0.875rem; color: #444; }
                .legal-md-preview strong { font-weight: 700; color: #111; }
                .legal-md-preview a { color: #2563eb; text-decoration: underline; }
                .legal-md-preview blockquote { border-left: 3px solid #e5e7eb; padding-left: 1rem; color: #6b7280; margin: 1rem 0; }
                .legal-md-preview hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0; }
              `}</style>
              {([
                { key: 'privacyPolicy' as const, label: 'Privacy Policy' },
                { key: 'termsAndConditions' as const, label: 'Terms & Conditions' },
                { key: 'disclaimer' as const, label: 'Disclaimer' },
              ]).map(({ key, label }) => (
                <LegalMarkdownEditor
                  key={key}
                  label={label}
                  value={projectData.legalPages?.[key] || ''}
                  onChange={(val) => updateLegalPage(key, val)}
                />
              ))}
            </div>
            <div className="bg-gray-50 p-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowLegalModal(false)}
                className="bg-black text-white px-8 py-2.5 text-xs font-black uppercase tracking-widest border-none hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                Save Legal Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
