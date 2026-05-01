'use client';

import React, { useMemo, useState } from 'react';
import { useStore, ProjectData } from '@/lib/store';

interface SEORequirement {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warning';
  score: number;
  maxScore: number;
  details?: string;
}

// Helper to strip HTML tags for cleaner analysis
const stripHtml = (text: string) => {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

export function SEOChecker() {
  const { projectData } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setIsMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const seoStats = useMemo(() => {
    if (!projectData) return null;

    // --- 1. CORE HELPERS ---
    const getReadability = (text: string) => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const words = text.split(/\s+/).filter(w => w.trim().length > 0);
      if (sentences.length === 0 || words.length === 0) return 0;
      const avgWordsPerSentence = words.length / sentences.length;
      // Simple scale: < 15 words is excellent, > 25 is difficult
      return Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 12) * 5));
    };

    const productName = stripHtml(projectData.productName || '[Product Name]');

    // --- 2. KEYWORD CLUSTERING ---
    // We group variants so they contribute to the same goal
    const primaryKeywords = [
      productName,
      `${productName} review`,
      `${productName} reviews`,
      `${productName} official website`,
      `buy ${productName}`,
      `${productName} ingredients`,
      `where to buy ${productName}`,
      `${productName} price`,
      `${productName} discount`,
      `order ${productName}`,
      `${productName} supplement`,
      `${productName} benefits`,
    ];

    // --- 3. DATA EXTRACTION (HYBRID) ---
    // We try to get "Real" DOM text first, fallback to JSON
    let allText = '';
    if (typeof window !== 'undefined') {
      const previewEl = document.getElementById('site-preview');
      if (previewEl) {
        allText = previewEl.innerText.toLowerCase();
      }
    }

    // If DOM isn't ready or empty, fallback to comprehensive JSON extraction
    if (!allText) {
      const extractFromJson = (data: ProjectData) => {
        let t = ` ${data.productName} ${data.hero.title} ${data.hero.subtitle} ${data.about.description} `;
        data.features.forEach(f => { t += ` ${f.title} ${f.description}`; });
        data.ingredients.items.forEach(i => { t += ` ${i.title} ${i.description}`; });
        data.testimonials.items.forEach(test => { t += ` ${test.content}`; });
        data.pricing.forEach(p => { t += ` ${p.title} ${p.buttonText}`; });
        data.faq.forEach(f => { t += ` ${f.question} ${f.answer}`; });
        if (data.research) t += ` ${data.research.description}`;
        return stripHtml(t).toLowerCase();
      };
      allText = extractFromJson(projectData);
    }

    const requirements: SEORequirement[] = [];

    // --- 4. ANALYSIS LOGIC ---

    // A. Primary Density (Clustered)
    let totalPrimaryCount = 0;
    const primaryKeywordStats = primaryKeywords.map(kw => {
      const count = (allText.match(new RegExp(`\\b${kw.toLowerCase()}\\b`, 'g')) || []).length;
      totalPrimaryCount += count;
      return { word: kw, count };
    });
    const primaryDensityScore = Math.min((totalPrimaryCount / 25) * 100, 100);
    requirements.push({
      id: 'primary-density',
      label: 'Keyword Density',
      status: primaryDensityScore >= 80 ? 'pass' : primaryDensityScore >= 40 ? 'warning' : 'fail',
      score: primaryDensityScore,
      maxScore: 100,
      details: `Found ${totalPrimaryCount} occurrences. Cluster target: 25+ variants.`
    });

    // B. Readability
    const readabilityScore = getReadability(allText);
    requirements.push({
      id: 'readability',
      label: 'Readability Score',
      status: readabilityScore >= 80 ? 'pass' : readabilityScore >= 50 ? 'warning' : 'fail',
      score: readabilityScore,
      maxScore: 100,
      details: readabilityScore >= 80 ? 'Excellent clarity!' : 'Sentences may be too long for easy reading.'
    });

    // C. Authority Links Check
    const hasAuthorityLink = allText.includes('.gov') || allText.includes('.edu') || allText.includes('.org') || allText.includes('ncbi.nlm.nih.gov');
    requirements.push({
      id: 'authority',
      label: 'Authority & Trust Links',
      status: hasAuthorityLink ? 'pass' : 'fail',
      score: hasAuthorityLink ? 100 : 0,
      maxScore: 100,
      details: hasAuthorityLink ? '✓ Authority citations found.' : 'Link to clinical studies or government sites to boost trust.'
    });

    // D. Image Alt-Text Audit
    let missingAltCount = 0;
    let totalImages = 0;
    if (typeof window !== 'undefined') {
      const previewEl = document.getElementById('site-preview');
      if (previewEl) {
        const imgs = previewEl.getElementsByTagName('img');
        totalImages = imgs.length;
        for (let i = 0; i < imgs.length; i++) {
          if (!imgs[i].getAttribute('alt') || imgs[i].getAttribute('alt')?.trim() === '') {
            missingAltCount++;
          }
        }
      }
    }
    const altScore = totalImages === 0 ? 100 : Math.max(0, 100 - (missingAltCount / totalImages) * 100);
    requirements.push({
      id: 'alt-text',
      label: 'Image Alt Tags',
      status: altScore === 100 ? 'pass' : altScore >= 50 ? 'warning' : 'fail',
      score: altScore,
      maxScore: 100,
      details: missingAltCount > 0 ? `${missingAltCount} images missing descriptive alt text.` : '✓ All images have alt tags.'
    });

    // E. Meta Optimization (Title)
    const titleLength = projectData.seo?.title?.length || 0;
    const isTitleGood = titleLength >= 50 && titleLength <= 60;
    requirements.push({
      id: 'title-length',
      label: 'Title Tag Length',
      status: isTitleGood ? 'pass' : (titleLength > 0 ? 'warning' : 'fail'),
      score: isTitleGood ? 100 : (titleLength > 30 ? 60 : 0),
      maxScore: 100,
      details: `Current: ${titleLength} chars. Ideal: 50-60 characters.`
    });

    // E2. Meta Optimization (Description)
    const descLength = projectData.seo?.description?.length || 0;
    const isDescGood = descLength >= 120 && descLength <= 160;
    requirements.push({
      id: 'desc-length',
      label: 'Meta Description',
      status: isDescGood ? 'pass' : (descLength > 0 ? 'warning' : 'fail'),
      score: isDescGood ? 100 : (descLength > 60 ? 60 : 0),
      maxScore: 100,
      details: `Current: ${descLength} chars. Ideal: 120-160 characters for CTR.`
    });

    // F. Placement Check (First 90 Chars)
    const intro120 = allText.substring(0, 150);
    const hasKwInIntro = primaryKeywords.some(kw => intro120.includes(kw.toLowerCase()));
    requirements.push({
      id: 'intro-placement',
      label: 'Keyword in Intro',
      status: hasKwInIntro ? 'pass' : 'fail',
      score: hasKwInIntro ? 100 : 0,
      maxScore: 100,
      details: hasKwInIntro ? '✓ Key terms placed early.' : 'Place your product name in the first 100 characters.'
    });

    // G. H1 Presence
    let hasH1 = false;
    if (typeof window !== 'undefined') {
      const previewEl = document.getElementById('site-preview');
      if (previewEl) {
        hasH1 = previewEl.getElementsByTagName('h1').length > 0;
      }
    }
    requirements.push({
      id: 'h1-check',
      label: 'H1 Header Found',
      status: hasH1 ? 'pass' : 'fail',
      score: hasH1 ? 100 : 0,
      maxScore: 100,
      details: hasH1 ? '✓ Main heading exists.' : 'Every page needs exactly one H1 tag for SEO.'
    });

    const totalScore = requirements.reduce((acc, req) => acc + req.score, 0);
    const percentage = Math.round((totalScore / (requirements.length * 100)) * 100);

    return {
      percentage,
      requirements,
      primaryKeywords: primaryKeywordStats
    };
  }, [projectData, refreshKey, isMounted]);

  const getColorClass = (status: string) => {
    switch (status) {
      case 'pass': return 'text-emerald-500';
      case 'warning': return 'text-amber-500';
      case 'fail': return 'text-rose-500';
      default: return 'text-gray-400';
    }
  };

  const getBgClass = (percentage: number) => {
    if (percentage >= 80) return 'bg-emerald-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  if (!isMounted || !seoStats) return (
    <div className="w-8 h-8 rounded-full border border-gray-100 animate-pulse bg-gray-50"></div>
  );

  return (
    <div className="relative" ref={containerRef} style={{ fontFamily: "'Outfit', sans-serif" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-gray-100 hover:border-gray-200 transition-all shadow-sm group hover:shadow-md"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <svg className="w-8 h-8 transform -rotate-90">
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              className="text-gray-100"
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 14}
              strokeDashoffset={2 * Math.PI * 14 * (1 - seoStats.percentage / 100)}
              className={`transition-all duration-1000 ${getColorClass(seoStats.percentage >= 80 ? 'pass' : seoStats.percentage >= 50 ? 'warning' : 'fail')}`}
            />
          </svg>
          <span className="absolute text-[9px] font-black">{seoStats.percentage}%</span>
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-600">SEO</span>
          <span className="text-[8px] font-bold text-gray-500">Checker</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[760px] bg-white border border-gray-100 shadow-2xl z-[10002] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          {/* Top Bar */}
          <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-magnifying-glass-chart text-gray-400 text-xs"></i>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900" style={{ fontFamily: "'Fraunces', serif" }}>SEO Dashboard</h3>
            </div>
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="px-2 py-1 bg-white border border-gray-100 hover:border-gray-200 text-[8px] font-black uppercase tracking-tight text-gray-400 hover:text-gray-900 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              <i className="fa-solid fa-arrows-rotate text-[8px]"></i>
              Refresh
            </button>
          </div>

          <div className="flex divide-x divide-gray-50">
            {/* Left Column: Requirements */}
            <div className="flex-[1.4] max-h-[500px] overflow-y-auto p-5 space-y-5 custom-scrollbar">
              <div className="space-y-4">
                {seoStats.requirements.map((req) => (
                  <div key={req.id} className="group">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold text-gray-700">{req.label}</span>
                      <span className={`text-[9px] font-black uppercase ${getColorClass(req.status)}`}>
                        {Math.round(req.score)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${getBgClass(Math.round(req.score))}`}
                        style={{ width: `${req.score}%` }}
                      ></div>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1 leading-tight opacity-0 group-hover:opacity-100 transition-opacity">{req.details}</p>
                  </div>
                ))}
              </div>

              {/* Keyword Section inside left col */}
              <div className="pt-5 border-t border-gray-50">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Primary Keywords</h4>
                <div className="grid grid-cols-2 gap-2">
                  {seoStats.primaryKeywords.slice(0, 10).map((kw, i) => (
                    <div key={i} className="flex justify-between items-center px-2 py-1 bg-gray-50/50 rounded-sm">
                      <span className="text-[9px] text-gray-500 truncate mr-2">{kw.word}</span>
                      <span className={`text-[9px] font-black ${kw.count >= 4 ? 'text-emerald-500' : kw.count >= 1 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {kw.count}/4
                      </span>
                    </div>
                  ))}
                </div>
                {seoStats.primaryKeywords.length > 10 && (
                  <p className="text-[8px] text-gray-300 italic mt-2 text-center">+{seoStats.primaryKeywords.length - 10} more variants tracked</p>
                )}
              </div>
            </div>

            {/* Right Column: Score Meter */}
            <div className="flex-1 bg-gray-50/30 p-6 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="white"
                    className="text-gray-100 shadow-inner"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={2 * Math.PI * 56 * (1 - seoStats.percentage / 100)}
                    className={`transition-all duration-1000 ${getColorClass(seoStats.percentage >= 80 ? 'pass' : seoStats.percentage >= 50 ? 'warning' : 'fail')}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center leading-none">
                  <span className="text-3xl font-black text-gray-900">{seoStats.percentage}%</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">Overall</span>
                </div>
              </div>

              <div className="mt-6 text-center space-y-1">
                <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white shadow-sm inline-block ${getColorClass(seoStats.percentage >= 80 ? 'pass' : seoStats.percentage >= 50 ? 'warning' : 'fail')}`}>
                  {seoStats.percentage >= 80 ? 'Optimized' : seoStats.percentage >= 50 ? 'Needs Work' : 'Poor SEO'}
                </div>
                <p className="text-[9px] text-gray-400 px-4 mt-2">
                  {seoStats.percentage >= 80
                    ? 'Excellent! Your content is highly optimized for search engines.'
                    : seoStats.percentage >= 50
                      ? 'Good start, but some critical keywords are missing placement.'
                      : 'Significant optimization required for competitive ranking.'}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 w-full">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-gray-400 font-bold uppercase">Health Check</span>
                    <span className="text-emerald-500 font-black">ACTIVE</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-emerald-400 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
