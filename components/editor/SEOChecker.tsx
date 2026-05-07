'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useStore, ProjectData } from '@/lib/store';

interface SEORequirement {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warning';
  score: number;
  maxScore: number;
  details?: string;
}

interface KeywordStat {
  word: string;
  count: number;
  target: number;
}

// Escape special regex characters in a string
const escapeRegex = (str: string) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Strip HTML tags for cleaner analysis
const stripHtml = (text: string) => {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

// Count total words
const getWordCount = (text: string) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
};

// Flesch-Kincaid inspired readability (simplified)
const getReadability = (text: string): number => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 3);
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);
  if (sentences.length === 0 || words.length === 0) return 50;
  const avgWordsPerSentence = words.length / sentences.length;
  // < 15 words/sentence = excellent, > 25 = difficult
  return Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 12) * 4));
};

// Extract all text from the project JSON as a reliable fallback
const extractTextFromJson = (data: ProjectData): string => {
  let t = ` ${data.productName} ${data.hero.title} ${data.hero.subtitle} ${data.about.title} ${data.about.description} `;

  // Custom Sections (High Priority for Content)
  data.customSections?.forEach(s => {
    t += ` ${s.title} ${s.content} `;
    s.cards?.forEach(c => { t += ` ${c.title} ${c.content} `; });
  });

  data.features.forEach(f => { t += ` ${f.title} ${f.description}`; });
  data.ingredients.items.forEach(i => { t += ` ${i.title} ${i.description}`; });
  data.testimonials.items.forEach(test => { t += ` ${test.content}`; });
  data.pricing.forEach(p => { t += ` ${p.title} ${p.buttonText} ${p.features.join(' ')}`; });
  data.faq.forEach(f => { t += ` ${f.question} ${f.answer}`; });

  if (data.research) t += ` ${data.research.title} ${data.research.description}`;
  if (data.benefits) {
    t += ` ${data.benefits.title} ${data.benefits.description}`;
    data.benefits.items.forEach(b => { t += ` ${b.title} ${b.description}`; });
  }

  if (data.sources) t += ` ${data.sourcesTitle} ${data.sources}`;
  if (data.guaranteeDescription) t += ` ${data.guaranteeTitle} ${data.guaranteeDescription}`;

  t += ` ${data.footer.companyInfo}`;
  return stripHtml(t).toLowerCase();
};

// Count exact keyword occurrences (whole-word match)
const countKeyword = (text: string, keyword: string): number => {
  if (!keyword || !text) return 0;
  try {
    const pattern = new RegExp(`\\b${escapeRegex(keyword.toLowerCase())}\\b`, 'gi');
    return (text.match(pattern) || []).length;
  } catch {
    return 0;
  }
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

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const seoStats = useMemo(() => {
    if (!projectData) return null;

    const productName = stripHtml(projectData.productName || 'Product').trim();
    const pn = productName.toLowerCase();

    // --- KEYWORD LIST ---
    // Core product name + all requested intent variants
    const keywordDefs: { word: string; target: number }[] = [
      // Product name alone (highest priority)
      { word: productName, target: 12 },
      // Official / Trust
      { word: `${productName} official website`, target: 3 },
      { word: `official ${productName} website`, target: 2 },
      // Buy / purchase / order
      { word: `buy ${productName}`, target: 4 },
      { word: `purchase ${productName}`, target: 3 },
      { word: `order ${productName}`, target: 3 },
      // Supplement
      { word: `${productName} supplement`, target: 4 },
      // Reviews / scam
      { word: `${productName} reviews`, target: 4 },
      { word: `${productName} review`, target: 3 },
      { word: `${productName} scam`, target: 2 },
      // Sale / price / discount
      { word: `${productName} sale`, target: 2 },
      { word: `${productName} price`, target: 3 },
      { word: `${productName} discount`, target: 3 },
      // User Requested Stand-alone Keywords
      { word: 'Price', target: 2 },
      { word: 'Official site', target: 2 },
      { word: 'Specification', target: 2 },
      { word: 'Discount', target: 2 },
      { word: 'Offer', target: 2 },
      { word: 'Reviews', target: 2 },
      { word: 'Material and Build quality', target: 1 },
      { word: 'Scam', target: 1 },
      { word: 'Test', target: 1 },
      // Additional high-value variants
      { word: `where to buy ${productName}`, target: 2 },
      { word: `${productName} ingredients`, target: 3 },
      { word: `${productName} benefits`, target: 3 },
    ];

    // --- TEXT EXTRACTION ---
    // Always use JSON extraction for accuracy in the editor
    const allText = extractTextFromJson(projectData);
    const wordCount = getWordCount(allText);

    // --- KEYWORD STATS ---
    const keywordStats: KeywordStat[] = keywordDefs.map(({ word, target }) => ({
      word,
      count: countKeyword(allText, word),
      target,
    }));

    const requirements: SEORequirement[] = [];

    // --- 1. PRIMARY KEYWORD DENSITY ---
    const primaryStat = keywordStats[0];
    const density = (primaryStat.count / (wordCount || 1)) * 100;
    const densityScore = (density >= 1 && density <= 3.5) ? 100 : (density > 0.5 && density <= 5) ? 65 : density > 0 ? 35 : 0;
    requirements.push({
      id: 'primary-density',
      label: `"${productName}" Density`,
      status: densityScore === 100 ? 'pass' : densityScore >= 65 ? 'warning' : 'fail',
      score: densityScore,
      maxScore: 100,
      details: `Appears ${primaryStat.count} times (${density.toFixed(1)}%). Ideal: 1-3.5% density.`,
    });

    // --- 2. INTENT KEYWORD COVERAGE ---
    const intentKeywords = keywordStats.slice(1);
    const coveredCount = intentKeywords.filter(k => k.count >= 1).length;
    const coverageScore = Math.round((coveredCount / intentKeywords.length) * 100);
    requirements.push({
      id: 'intent-coverage',
      label: 'Intent Keywords',
      status: coverageScore >= 75 ? 'pass' : coverageScore >= 45 ? 'warning' : 'fail',
      score: coverageScore,
      maxScore: 100,
      details: `${coveredCount}/${intentKeywords.length} variants found (buy, reviews, official, scam, etc.)`,
    });

    // --- 3. WORD COUNT ---
    const countScore = wordCount >= 850 ? 100 : wordCount >= 600 ? 70 : wordCount >= 400 ? 40 : 10;
    requirements.push({
      id: 'word-count',
      label: 'Content Length',
      status: countScore === 100 ? 'pass' : countScore >= 70 ? 'warning' : 'fail',
      score: countScore,
      maxScore: 100,
      details: `Found ${wordCount} words. Aim for 850-1200+ for high-competition SEO.`,
    });

    // --- 4. READABILITY ---
    const readabilityScore = getReadability(allText);
    requirements.push({
      id: 'readability',
      label: 'Readability Score',
      status: readabilityScore >= 70 ? 'pass' : readabilityScore >= 45 ? 'warning' : 'fail',
      score: readabilityScore,
      maxScore: 100,
      details: readabilityScore >= 70
        ? 'Excellent clarity — easy to read.'
        : 'Sentences may be too long. Aim for under 20 words per sentence.',
    });

    // --- 5. AUTHORITY LINKS ---
    const hasAuthorityLink =
      allText.includes('.gov') ||
      allText.includes('.edu') ||
      allText.includes('.org') ||
      allText.includes('ncbi.nlm.nih.gov') ||
      allText.includes('pubmed');
    requirements.push({
      id: 'authority',
      label: 'Trust Citations',
      status: hasAuthorityLink ? 'pass' : 'fail',
      score: hasAuthorityLink ? 100 : 0,
      maxScore: 100,
      details: hasAuthorityLink
        ? '✓ Clinical studies or authority domains found.'
        : 'Link to clinical studies (.gov, .edu) to boost trust.',
    });

    // --- 6. IMAGE ALT TAGS ---
    let missingAltCount = 0;
    let totalImages = 0;
    if (typeof window !== 'undefined') {
      const previewEl = document.getElementById('site-preview');
      if (previewEl) {
        const imgs = previewEl.getElementsByTagName('img');
        totalImages = imgs.length;
        for (let i = 0; i < imgs.length; i++) {
          const alt = imgs[i].getAttribute('alt');
          if (!alt || alt.trim() === '') missingAltCount++;
        }
      }
    }
    const altScore = totalImages === 0 ? 100 : Math.max(0, Math.round(100 - (missingAltCount / totalImages) * 100));
    requirements.push({
      id: 'alt-text',
      label: 'Image Alt Tags',
      status: altScore === 100 ? 'pass' : altScore >= 60 ? 'warning' : 'fail',
      score: altScore,
      maxScore: 100,
      details: missingAltCount > 0
        ? `${missingAltCount} images missing alt text.`
        : `✓ All images have alt tags.`,
    });

    // --- 7. META TITLE ---
    const titleLength = projectData.seo?.title?.length || 0;
    const isTitleGood = titleLength >= 50 && titleLength <= 60;
    const titleScore = isTitleGood ? 100 : titleLength >= 30 && titleLength <= 70 ? 65 : titleLength > 0 ? 30 : 0;
    requirements.push({
      id: 'title-length',
      label: 'Meta Title',
      status: isTitleGood ? 'pass' : titleLength > 0 ? 'warning' : 'fail',
      score: titleScore,
      maxScore: 100,
      details: `${titleLength} chars. Ideal: 50–60 characters.`,
    });

    // --- 8. META DESCRIPTION ---
    const descLength = projectData.seo?.description?.length || 0;
    const isDescGood = descLength >= 120 && descLength <= 160;
    const descScore = isDescGood ? 100 : descLength >= 80 && descLength <= 180 ? 65 : descLength > 0 ? 30 : 0;
    requirements.push({
      id: 'desc-length',
      label: 'Meta Description',
      status: isDescGood ? 'pass' : descLength > 0 ? 'warning' : 'fail',
      score: descScore,
      maxScore: 100,
      details: `${descLength} chars. Ideal: 120–160 characters.`,
    });

    // --- 9. KEYWORD IN INTRO ---
    const intro200 = allText.substring(0, 300);
    const hasKwInIntro = intro200.includes(pn);
    requirements.push({
      id: 'intro-placement',
      label: 'Product Name in Intro',
      status: hasKwInIntro ? 'pass' : 'fail',
      score: hasKwInIntro ? 100 : 0,
      maxScore: 100,
      details: hasKwInIntro
        ? '✓ Appears early in the content.'
        : 'Place product name within the first 300 characters.',
    });

    // --- 10. H1 PRESENCE ---
    let h1Count = 0;
    let h2Count = 0;
    if (typeof window !== 'undefined') {
      const previewEl = document.getElementById('site-preview');
      if (previewEl) {
        h1Count = previewEl.getElementsByTagName('h1').length;
        h2Count = previewEl.getElementsByTagName('h2').length;
      }
    }
    requirements.push({
      id: 'h-tags-check',
      label: 'Header Structure (H1/H2)',
      status: h1Count === 1 && h2Count >= 3 ? 'pass' : 'warning',
      score: (h1Count === 1 ? 50 : 0) + (h2Count >= 3 ? 50 : Math.min(45, h2Count * 15)),
      maxScore: 100,
      details: `H1: ${h1Count}, H2: ${h2Count}. Need 1 H1 and 3+ H2s.`,
    });

    // --- OVERALL SCORE ---
    const totalScore = requirements.reduce((acc, req) => acc + req.score, 0);
    const percentage = Math.round((totalScore / (requirements.length * 100)) * 100);

    return {
      percentage,
      requirements,
      keywordStats,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectData, refreshKey, isMounted]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-emerald-500';
      case 'warning': return 'text-amber-500';
      case 'fail': return 'text-rose-500';
      default: return 'text-gray-400';
    }
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getScoreLabel = (pct: number) =>
    pct >= 80 ? 'Optimized' : pct >= 50 ? 'Needs Work' : 'Poor SEO';

  const getScoreMessage = (pct: number) =>
    pct >= 80
      ? 'Excellent! Your content is highly optimized for search engines.'
      : pct >= 50
        ? 'Good start — some intent keywords or meta fields need attention.'
        : 'Significant optimization required for competitive ranking.';

  if (!isMounted || !seoStats) {
    return <div className="w-8 h-8 rounded-full border border-gray-100 animate-pulse bg-gray-50" />;
  }

  const { percentage, requirements, keywordStats } = seoStats;

  return (
    <div className="relative" ref={containerRef} style={{ fontFamily: "'Outfit', sans-serif" }}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-white border border-gray-100 hover:border-gray-200 transition-all shadow-sm group hover:shadow-md"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <svg className="w-8 h-8 transform -rotate-90">
            <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-gray-100" />
            <circle
              cx="16" cy="16" r="14"
              stroke="currentColor" strokeWidth="3" fill="transparent"
              strokeDasharray={2 * Math.PI * 14}
              strokeDashoffset={2 * Math.PI * 14 * (1 - percentage / 100)}
              className={`transition-all duration-1000 ${getStatusColor(percentage >= 80 ? 'pass' : percentage >= 50 ? 'warning' : 'fail')}`}
            />
          </svg>
          <span className="absolute text-[9px] font-black">{percentage}%</span>
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-600">SEO</span>
          <span className="text-[8px] font-bold text-gray-500">Checker</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[820px] bg-white border border-gray-100 shadow-2xl z-[10002] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-magnifying-glass-chart text-gray-400 text-xs"></i>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-900" style={{ fontFamily: "'Fraunces', serif" }}>
                SEO Dashboard
              </h3>
            </div>
            <button
              onClick={handleRefresh}
              className="px-2 py-1 bg-white border border-gray-100 hover:border-gray-200 text-[8px] font-black uppercase tracking-tight text-gray-400 hover:text-gray-900 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
            >
              <i className="fa-solid fa-arrows-rotate text-[8px]"></i>
              Refresh
            </button>
          </div>

          <div className="flex divide-x divide-gray-50">
            {/* Left Column: Requirements + Keywords */}
            <div className="flex-[1.5] max-h-[540px] overflow-y-auto p-5 space-y-5 custom-scrollbar">

              {/* Requirements */}
              <div className="space-y-3.5">
                {requirements.map((req) => (
                  <div key={req.id} className="group">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold text-gray-700">{req.label}</span>
                      <span className={`text-[9px] font-black uppercase ${getStatusColor(req.status)}`}>
                        {req.status === 'pass' ? '✓ Pass' : req.status === 'warning' ? '⚠ Warn' : '✗ Fail'}
                        &nbsp;·&nbsp;{Math.round(req.score)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${getBarColor(Math.round(req.score))}`}
                        style={{ width: `${req.score}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1 leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                      {req.details}
                    </p>
                  </div>
                ))}
              </div>

              {/* Keyword Tracking */}
              <div className="pt-4 border-t border-gray-50">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">
                  Keyword Tracking — hover for details
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {keywordStats.map((kw, i) => {
                    const pct = Math.min(100, Math.round((kw.count / kw.target) * 100));
                    const color =
                      kw.count >= kw.target ? 'text-emerald-500' :
                        kw.count >= 1 ? 'text-amber-500' :
                          'text-rose-500';
                    return (
                      <div
                        key={i}
                        title={`Target: ${kw.target}+ · Found: ${kw.count}`}
                        className="flex justify-between items-center px-2 py-1.5 bg-gray-50/60 hover:bg-gray-100 transition-colors rounded-sm cursor-default"
                      >
                        <span className="text-[9px] text-gray-500 truncate mr-2 max-w-[160px]">{kw.word}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="w-10 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-400' : pct >= 30 ? 'bg-amber-400' : 'bg-rose-400'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className={`text-[9px] font-black ${color}`}>
                            {kw.count}/{kw.target}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Score Meter */}
            <div className="flex-1 bg-gray-50/30 p-6 flex flex-col items-center justify-center">
              {/* Big Donut */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="white" className="text-gray-100" />
                  <circle
                    cx="64" cy="64" r="56"
                    stroke="currentColor" strokeWidth="10" fill="transparent"
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={2 * Math.PI * 56 * (1 - percentage / 100)}
                    className={`transition-all duration-1000 ${getStatusColor(percentage >= 80 ? 'pass' : percentage >= 50 ? 'warning' : 'fail')}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center leading-none">
                  <span className="text-3xl font-black text-gray-900">{percentage}%</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">Overall</span>
                </div>
              </div>

              <div className="mt-6 text-center space-y-1">
                <div className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white shadow-sm inline-block ${getStatusColor(percentage >= 80 ? 'pass' : percentage >= 50 ? 'warning' : 'fail')}`}>
                  {getScoreLabel(percentage)}
                </div>
                <p className="text-[9px] text-gray-400 px-4 mt-2 leading-relaxed">
                  {getScoreMessage(percentage)}
                </p>
              </div>

              {/* Quick stats */}
              <div className="mt-6 w-full space-y-2">
                <div className="flex justify-between text-[9px]">
                  <span className="text-gray-400 font-bold">Checks Passed</span>
                  <span className="text-emerald-500 font-black">
                    {requirements.filter(r => r.status === 'pass').length}/{requirements.length}
                  </span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-gray-400 font-bold">Keywords Covered</span>
                  <span className="text-amber-500 font-black">
                    {keywordStats.filter(k => k.count >= 1).length}/{keywordStats.length}
                  </span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span className="text-gray-400 font-bold">Keywords at Target</span>
                  <span className="text-emerald-500 font-black">
                    {keywordStats.filter(k => k.count >= k.target).length}/{keywordStats.length}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100 w-full">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-gray-400 font-bold uppercase">Health Check</span>
                    <span className="text-emerald-500 font-black">ACTIVE</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-emerald-400 animate-pulse" />
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
