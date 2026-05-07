import JSZip from 'jszip';
import { marked } from 'marked';

marked.setOptions({
    breaks: true,
    gfm: true
});

export async function generateProjectZip(data: any) {
    // Helper to render the multi-bottle stack in static exports
    const renderBottleStack = (multiplier: string, image: string, title: string, height: string = '160px') => {
        const total = parseInt(multiplier.replace(/[^0-9]/g, '')) || 1;
        if (total <= 1) {
            return `
            <div style="position: relative; height: 200px; width: 100%; display: flex; align-items: center; justify-content: center;">
                <img src="${image || '/image/default.png'}" alt="${title}" class="mx-auto" style="height: ${height}; object-fit: contain; transform: scale(1.15); filter: drop-shadow(0 20px 40px rgba(0,0,0,0.12));" />
            </div>`;
        }

        const bottles = Array.from({ length: Math.min(total, 10) });
        const stackHtml = bottles.map((_, idx) => {
            const isMain = idx === bottles.length - 1;
            const bgIdx = bottles.length - 2 - idx;
            const side = bgIdx % 2 === 0 ? -1 : 1;
            const layer = Math.floor(bgIdx / 2) + 1;

            let transform, zIndex, filter;
            if (isMain) {
                transform = 'translate(-50%, -50%) scale(1.15)';
                zIndex = 100;
                filter = 'drop-shadow(0 20px 40px rgba(0,0,0,0.12))';
            } else {
                const x = -50 + (side * layer * 26);
                const y = -50 - (layer * 2);
                const rotate = side * (layer * 3);
                const scale = 1.1 - (layer * 0.05);
                transform = `translate(${x}%, ${y}%) scale(${scale}) rotate(${rotate}deg)`;
                zIndex = 100 - layer;
                filter = 'drop-shadow(0 15px 35px rgba(0,0,0,0.15))';
            }

            return `<img src="${image || '/image/default.png'}" alt="${title}" style="position: absolute; left: 50%; top: 50%; height: ${height}; object-fit: contain; transform: ${transform}; z-index: ${zIndex}; filter: ${filter}; transition: all 1s ease;">`;
        }).join('');

        return `<div style="position: relative; height: 200px; width: 100%; perspective: 1200px; overflow: visible; display: flex; align-items: center; justify-content: center;">${stackHtml}</div>`;
    };

    // Helper to render custom sections
    const renderCustomSections = (afterSection: string) => {
        const sections = data.customSections?.filter((s: any) => s.afterSection === afterSection) || [];
        if (!sections.length) return '';

        return sections.map((section: any) => {
            let innerHtml = '';

            const isOrganic = layoutStyle === 'organic';
            const showTitleInContent = section.title && isOrganic;
            const titleHtml = showTitleInContent ? `<h2 class="fw-bold mb-4 font-serif" style="font-size: 2.5rem;">${section.title}</h2>` : '';

            const contentHtml = section.content ? `<div class="fs-5 opacity-90" style="line-height: 1.8;">${section.content}</div>` : '';
            const contentHtmlLg = section.content ? `<div class="opacity-90" style="line-height: 1.9; font-size: 1.1rem;">${section.content}</div>` : '';
            const imageHtml = `<div class="p-4 bg-white/5 border border-white/10 rounded-2xl shadow-sm" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem;"><img src="${section.image || '/image/banner-img.webp'}" alt="${section.imageAlt || section.title}" class="img-fluid rounded-xl mx-auto d-block" style="max-height: 450px; object-fit: contain; border-radius: 0.75rem;" /></div>`;

            const buttonHtml = section.buttonText ? `
                <div class="mt-4 ${section.type === 'text' || section.type === 'cards' ? 'text-center mt-5' : ''}">
                    <a href="${section.buttonHref || '#order'}" class="d-inline-block fw-bold ${isOrganic ? 'organic-btn organic-btn-primary' : 'btn-custom-pill shadow-sm'}" style="${!isOrganic ? `background-color: ${secondaryColor}; color: #000; font-size: 1.1rem; padding: 1rem 2.5rem; text-decoration: none; border-radius: 50px;` : ''}">
                        ${section.buttonText}
                        ${section.icon ? `<i class="${section.icon}" style="color: ${section.iconColor || 'inherit'};"></i>` : ''}
                    </a>
                </div>
            ` : '';

            if (section.type === 'text') {
                innerHtml = `
                    <div class="text-center mx-auto" style="max-width: 800px;">
                        ${titleHtml}
                        ${contentHtml}
                        ${buttonHtml}
                    </div>
                `;
            } else if (section.type === 'image-text') {
                innerHtml = `
                    <div class="row align-items-center g-5">
                        <div class="col-12 col-lg-6">${imageHtml}</div>
                        <div class="col-12 col-lg-6">${titleHtml}${contentHtmlLg}${buttonHtml}</div>
                    </div>
                `;
            } else if (section.type === 'text-image') {
                innerHtml = `
                    <div class="row align-items-center g-5 flex-column-reverse flex-lg-row">
                        <div class="col-12 col-lg-6">${titleHtml}${contentHtmlLg}${buttonHtml}</div>
                        <div class="col-12 col-lg-6">${imageHtml}</div>
                    </div>
                `;
            } else if (section.type === 'cards') {
                const cardsHtml = (section.cards || []).map((card: any) => {
                    const cardImageHtml = card.image ? `<div class="mb-3 rounded-2 overflow-hidden" style="max-height: 180px;"><img src="${card.image}" alt="${card.title}" class="img-fluid w-100" style="object-fit: cover; max-height: 180px;" /></div>` : '';
                    const cardIconHtml = !card.image && card.icon ? `<i class="${card.icon} fs-1 mb-3 d-block" style="color: ${card.iconColor || primaryColor};"></i>` : '';
                    const cardButtonHtml = card.buttonText ? `<div class="mt-3 pt-3 border-top"><a href="${card.buttonHref || '#'}" class="d-inline-block fw-bold text-decoration-none ${isOrganic ? 'organic-btn organic-btn-outline' : 'btn-custom-pill shadow-sm'}" style="${!isOrganic ? `background-color: ${primaryColor}; color: #fff; font-size: 0.85rem; padding: 0.6rem 1.5rem; border-radius: 50px;` : ''}">${card.buttonText} ${card.icon ? `<i class="${card.icon}" style="color: ${card.iconColor || 'inherit'};"></i>` : ''}</a></div>` : '';
                    return `
                    <div class="col-12 col-md-6 col-lg-4">
                        <div class="h-100 p-4 border rounded-3 bg-white text-dark shadow-sm text-center d-flex flex-column">
                            ${cardImageHtml}
                            ${cardIconHtml}
                            <h4 class="fw-bold mb-3">${card.title}</h4>
                            <p class="mb-0 text-muted flex-grow-1" style="line-height: 1.6;">${card.content}</p>
                            ${cardButtonHtml}
                        </div>
                    </div>`;
                }).join('');

                innerHtml = `
                    <div>
                        ${titleHtml ? `<div class="text-center mb-5">${titleHtml}</div>` : ''}
                        ${contentHtml ? `<div class="text-center max-w-4xl mx-auto mb-5">${contentHtml}</div>` : ''}
                        <div class="row g-4 justify-content-center">
                            ${cardsHtml}
                        </div>
                        ${buttonHtml}
                    </div>
                `;
            }

            let topTitleHtml = '';
            if (!isOrganic && section.title) {
                topTitleHtml = `
                <section class="container-fluid text-center mt-0 sectioncolor" style="background-color: ${primaryColor};">
                    <div class="container">
                        <h2 class="text-center fs-1 py-3 fw-bold text-white mb-0">${section.title}</h2>
                    </div>
                </section>
                `;
            }

            return `
            ${topTitleHtml}
            <section class="container-fluid relative group/section section-reveal ${section.padding || 'py-5'}" style="background-color: ${section.bgColor || '#ffffff'}; color: ${section.textColor || '#333333'};">
                <div class="container">${innerHtml}</div>
            </section>
            `;
        }).join('');
    };

    const zip = new JSZip();
    const imagesFolder = zip.folder("images");
    const cssFolder = zip.folder("css");

    // Sitemap & Robots
    let baseUrl = (data.seo?.canonicalUrl || 'https://example.com').replace(/\/+$/, '');

    // Prevent localhost from leaking into production exports
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
        baseUrl = 'https://example.com';
    }

    const legalPageLinks = [
        'privacy-policy.html',
        'disclaimer.html',
        'terms-and-conditions.html'
    ].filter(id => {
        const key = id.replace('.html', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase()) as keyof typeof data.legalPages;
        return !!data.legalPages?.[key];
    });

    const lastMod = new Date().toISOString();

    const sectionLinks = [
        { id: 'ingredients', priority: '0.8' },
        { id: 'features', priority: '0.8' },
        { id: 'research', priority: '0.8' },
        { id: 'about', priority: '0.7' },
        { id: 'benefits', priority: '0.7' },
        { id: 'pricing', priority: '0.9' },
        { id: 'testimonials', priority: '0.8' },
        { id: 'faq', priority: '0.6' }
    ].filter(s => data.sections?.[s.id] !== false).map(s => ({
        loc: `#${s.id}`,
        priority: s.priority,
        changefreq: 'weekly'
    }));

    const pages = [
        { loc: '', priority: '1.0', changefreq: 'daily' },
        ...sectionLinks,
        ...legalPageLinks.map(link => ({ loc: link, priority: '0.7', changefreq: 'monthly' }))
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}/${page.loc}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    zip.file("sitemap.xml", sitemap);

    // DYNAMIC SITEMAP (PHP) - Auto-detects domain for Hostinger/PHP hosts
    const sitemapPhp = `<?php
header('Content-Type: application/xml; charset=utf-8');
$protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http");
$host = $_SERVER['HTTP_HOST'];
$domain = $protocol . "://" . $host;
$lastMod = "${lastMod}";
echo '<?xml version="1.0" encoding="UTF-8"?>';
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc><?php echo $domain; ?>/${page.loc}</loc>
    <lastmod><?php echo $lastMod; ?></lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    zip.file("sitemap.php", sitemapPhp);

    zip.file("robots.txt", `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`);

    // Order Page (order.html) - Professional high-trust redirect
    const orderLink = data.orderLink || 'https://example.com';
    const orderHtml = `<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />
    <meta http-equiv="Refresh" content="1.5; URL=${orderLink}" />
    <title>Redirecting to Checkout | ${data.productName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { border: 3px solid rgba(0,0,0,0.1); border-top-color: #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
        .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body class="bg-slate-50 flex items-center justify-center min-h-screen font-sans antialiased text-slate-900">
    <div class="max-w-sm w-full mx-auto p-8 text-center fade-in">
        <div class="mb-8 flex justify-center">
            <div class="spinner"></div>
        </div>
        
        <h1 class="text-xl font-bold mb-2 tracking-tight">Securing Your Connection</h1>
        <p class="text-slate-500 text-sm leading-relaxed mb-6">
            Please wait while we securely transfer you to the official checkout page for <strong>${data.productName}</strong>.
        </p>

        <div class="space-y-4">
            <div class="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                <div class="h-full bg-blue-600 rounded-full transition-all duration-[1500ms] w-0" id="progress-bar"></div>
            </div>
            
            <a href="${orderLink}" class="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                Click here if not redirected automatically
            </a>
        </div>
    </div>

    <script>
        setTimeout(() => {
            document.getElementById('progress-bar').style.width = '100%';
        }, 50);
        
        // Fallback redirect if meta fails
        setTimeout(() => {
            window.location.href = "${orderLink}";
        }, 3000);
    </script>
</body>
</html>`;
    zip.file("order.html", orderHtml);

    const primaryColor = data.theme?.primary || '#2C0D67';
    const secondaryColor = data.theme?.secondary || '#fbbf24';
    const layoutStyle = data.layoutStyle || 'default';
    const customCss = '';

    let htmlContent = '';
    let cssContent = '';

    const seo = data.seo || {};
    const metaTitle = seo.title || `${data.hero?.title || 'Welcome'} | ${data.productName}`;
    const metaDesc = seo.description || '';
    const canonicalUrl = seo.canonicalUrl || '';
    const robots = seo.robots || 'index, follow';
    const googleBot = seo.googleBot || robots;
    const keywords = seo.keywords || '';
    const author = seo.author || '';
    const language = seo.language || '';
    const locale = seo.locale || 'en_US';

    const favicon = seo.favicon || '';
    const themeColor = seo.themeColor || primaryColor;

    const socialProofBlock = data.socialProof?.enabled ? `
    <!-- Social Proof -->
    <div id="purchase-proof" class="purchase-proof">
      <div class="proof-image">
        <img id="proof-img" src="${data.socialProof?.items[0]?.image || data.hero.image}" alt="${data.socialProof?.items[0]?.imageAlt || 'Product'}">
      </div>
      <div class="proof-content">
        <div class="proof-stars" style="color: #fbbf24; font-size: 10px; margin-bottom: 4px;">
          <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
        </div>
        <div id="proof-text" class="proof-text">
          <strong style="color: #16a34a;">${data.socialProof?.items[0]?.name}</strong> from <strong style="color: #16a34a;">${data.socialProof?.items[0]?.location}</strong> <br>
          ${data.socialProof?.items[0]?.content}
        </div>
        <div id="proof-time" class="proof-time">${data.socialProof?.items[0]?.timeAgo} • Verified Buyer</div>
      </div>
    </div>
    <style>
      .purchase-proof { position: fixed; bottom: 30px; left: 30px; background: #111; border-radius: 12px; padding: 16px; border: 1px solid #333; font-size: 13px; max-width: 320px; z-index: 9999; transform: translateX(-150%); transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); display: flex; align-items: center; gap: 15px; box-shadow: 0 15px 35px rgba(0,0,0,0.3); color: #fff; line-height: 1.4; font-family: sans-serif; }
      .purchase-proof.active { transform: translateX(0); }
      .proof-image { width: 60px; height: 60px; flex-shrink: 0; border-radius: 10px; background: #222; border: 1px solid #333; }
      .proof-image img { width: 100%; height: 100%; object-fit: contain; }
      .proof-stars { color: #fbbf24; font-size: 10px; margin-bottom: 4px; }
      .proof-time { font-size: 10px; color: #aaa; margin-top: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
      @media (max-width: 576px) { .purchase-proof { display: none !important; } }
    </style>
    <script>
      (function() {
        // Smart Domain Detection
        const currentOrigin = window.location.origin;
        if (currentOrigin && !currentOrigin.includes('localhost') && !currentOrigin.includes('127.0.0.1')) {
            const canonical = document.querySelector('link[rel="canonical"]');
            if (canonical && (canonical.href.includes('example.com') || !canonical.href)) {
                canonical.href = currentOrigin + window.location.pathname;
            }
            const ogUrl = document.querySelector('meta[property="og:url"]');
            if (ogUrl && (ogUrl.content.includes('example.com') || !ogUrl.content)) {
                ogUrl.content = currentOrigin + window.location.pathname;
            }
        }

        const items = ${JSON.stringify(data.socialProof?.items || [])};
        if (!items.length) return;
        let index = 0;
        const proof = document.getElementById('purchase-proof');
        const img = document.getElementById('proof-img');
        const text = document.getElementById('proof-text');
        const time = document.getElementById('proof-time');

        function showNext() {
          const item = items[index];
          img.src = item.image || '${data.hero.image}';
          img.alt = item.imageAlt || 'Product';
          text.innerHTML = '<strong style="color: #16a34a;">' + item.name + '</strong> from <strong style="color: #16a34a;">' + item.location + '</strong> <br>' + item.content;
          time.innerText = item.timeAgo + ' • Verified Buyer';
          
          proof.classList.add('active');
          setTimeout(() => {
            proof.classList.remove('active');
          }, ${data.socialProof?.displayTime || 5000});
          
          index = (index + 1) % items.length;
        }

        setTimeout(() => {
          showNext();
          setInterval(showNext, ${data.socialProof?.interval || 8000});
        }, 3000);
      })();
    </script>
    ` : `
    <script>
      (function() {
        const currentOrigin = window.location.origin;
        if (currentOrigin && !currentOrigin.includes('localhost') && !currentOrigin.includes('127.0.0.1')) {
            const canonical = document.querySelector('link[rel="canonical"]');
            if (canonical && (canonical.href.includes('example.com') || !canonical.href)) {
                canonical.href = currentOrigin + window.location.pathname;
            }
            const ogUrl = document.querySelector('meta[property="og:url"]');
            if (ogUrl && (ogUrl.content.includes('example.com') || !ogUrl.content)) {
                ogUrl.content = currentOrigin + window.location.pathname;
            }
        }
      })();
    </script>
    `;

    const scrollToTopBlock = `
    <!-- Scroll To Top -->
    <button id="scroll-to-top" class="scroll-to-top" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">
      <i class="fas fa-arrow-up"></i>
    </button>
    <style>
      .scroll-to-top { 
        position: fixed; 
        bottom: 30px; 
        right: 30px; 
        width: 50px; 
        height: 50px; 
        background: ${secondaryColor}; 
        color: #000; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-size: 18px; 
        cursor: pointer; 
        border: 2px solid #000; 
        box-shadow: 0 10px 20px rgba(0,0,0,0.1); 
        z-index: 9998; 
        transition: all 0.3s ease;
        opacity: 0;
        visibility: hidden;
      }
      .scroll-to-top.visible {
        opacity: 1;
        visibility: visible;
      }
      .scroll-to-top:hover {
        transform: translateY(-5px);
        background: #fff;
      }
    </style>
    <script>
      window.addEventListener('scroll', function() {
        const btn = document.getElementById('scroll-to-top');
        if (window.pageYOffset > 300) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
      });
    </script>
    `;
    const viewport = seo.viewport || 'width=device-width, initial-scale=1.0';

    const ogTitle = seo.ogTitle || metaTitle;
    const ogDescription = seo.ogDescription || metaDesc;
    const ogImage = seo.ogImage || '';
    const ogType = seo.ogType || 'website';
    const ogUrl = seo.ogUrl || canonicalUrl;
    const ogSiteName = seo.ogSiteName || data.productName;

    const twitterCard = seo.twitterCard || 'summary_large_image';
    const twitterTitle = seo.twitterTitle || ogTitle;
    const twitterDescription = seo.twitterDescription || ogDescription;
    const twitterImage = seo.twitterImage || ogImage;
    const twitterCreator = seo.twitterCreator || '';

    const publishedTime = seo.publishedTime || '';
    const modifiedTime = seo.modifiedTime || new Date().toISOString();
    const section = seo.section || '';
    const tags = seo.tags || [];

    const alternates = seo.alternates || [];

    const sourcesFallback = `<ol><li>Panossian, A. and Wikman, G., 2008. Pharmacology of Schisandra chinensis Bail.: an overview of Russian research and uses in medicine. <i>Journal of ethnopharmacology</i>, 118(2), pp.183-212. Available at: <a href="https://pubmed.ncbi.nlm.nih.gov/18515024/" target="_blank">https://pubmed.ncbi.nlm.nih.gov/18515024/</a></li><li>D'Souza, J.J. et al., 2014. Anti-diabetic effects of the Indian gooseberry (Emblica officinalis Gaertn): a review. <i>Journal of Basic and Clinical Physiology and Pharmacology</i>, 25(2), pp.125-133. Available at: <a href="https://pubmed.ncbi.nlm.nih.gov/24362590/" target="_blank">https://pubmed.ncbi.nlm.nih.gov/24362590/</a></li><li>Ishaque, S. et al., 2012. Rhodiola rosea for physical and mental fatigue: a systematic review. <i>BMC complementary and alternative medicine</i>, 12(1), pp.1-9. Available at: <a href="https://pubmed.ncbi.nlm.nih.gov/22643043/" target="_blank">https://pubmed.ncbi.nlm.nih.gov/22643043/</a></li><li>Katz, D.L., Doughty, K. and Ali, A., 2011. Cocoa and chocolate in human health and disease. <i>Antioxidants & redox signaling</i>, 15(10), pp.2779-2811. Available at: <a href="https://pubmed.ncbi.nlm.nih.gov/21470061/" target="_blank">https://pubmed.ncbi.nlm.nih.gov/21470061/</a></li></ol>`;
    const sourcesHtml = (data.sections?.sources !== false) ? `
    <section id="sources" class="py-5 bg-white border-top">
        <div class="container mx-auto px-4" ${layoutStyle === 'organic' ? 'style="max-width: 800px;"' : ''}>
            <h3 class="fs-4 fw-bold mb-4 pb-2 d-inline-block text-uppercase" style="color: #000; border-bottom: 2px solid ${secondaryColor};">
                ${data.sourcesTitle || "SCIENTIFIC REFERENCES"}
            </h3>
            <div class="p-4 p-lg-5 border" style="background-color: #f8f9fa; border-color: ${layoutStyle === 'organic' ? '#E6D5C3' : '#e9ecef'}; font-size: 0.9rem; line-height: 1.8;">
                <div class="text-black source-links ${layoutStyle === 'organic' ? 'font-serif' : ''}">
                    ${data.sources || sourcesFallback}
                </div>
            </div>
        </div>
    </section>
    <style>
        .source-links ol { list-style-type: decimal; padding-left: 1.25rem; margin-bottom: 0; }
        .source-links li { margin-bottom: 0.5rem; }
        .source-links a { color: #0d6efd; text-decoration: underline; }
        .source-links a:hover { color: #0a58ca; }
    </style>
` : '';


    const defaultGuaranteeDescription = `Your happiness is our highest priority. Every order of ${data.productName} comes protected by a comprehensive 60-day satisfaction promise. If you are not completely satisfied with the results, simply contact our support team for a full refund.`;

    // Auto-generate schema if not provided
    let schemaJSON = seo.schema || '';
    if (!schemaJSON) {
        const baseUrl = seo.canonicalUrl || 'https://example.com';
        const graph = (data.pricing || []).map((plan: any, i: number) => ({
            "@id": `urn:product:${(plan.title || 'item').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`,
            "@type": "Product",
            "name": plan.title,
            "description": plan.features?.join('. ') || data.hero?.subtitle,
            "image": plan.image || data.hero?.image,
            "gtin": plan.gtin || '',
            "category": plan.category || '',
            "sku": plan.sku || `${(data.productName || 'prod').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`,
            "additionalProperty": [
                ...(plan.unclCode ? [{
                    "@type": "PropertyValue",
                    "name": "Product Type Code",
                    "description": `UN/CEFACT UNCL 1001 code for ${plan.category || 'Product'}`,
                    "propertyID": "https://service.unece.org/trade/untdid/d19b/tred/tred1001.htm",
                    "value": plan.unclCode
                }] : []),
                ...(plan.productRole ? [{
                    "@type": "PropertyValue",
                    "name": "Product Role",
                    "value": plan.productRole
                }] : [])
            ].filter(Boolean),
            "offers": {
                "@type": "Offer",
                "price": plan.price?.replace(/[^0-9.]/g, '') || '0',
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "url": baseUrl
            }
        }));

        if (graph.length > 0) {
            schemaJSON = JSON.stringify({
                "@context": [
                    "https://schema.org",
                    { "uncefact": "https://service.unece.org/trade/uncefact/" }
                ],
                "@graph": graph
            }, null, 4);
        }
    }

    const customTags = seo.customTags || [];

    let customTagsHtml = customTags.map((tag: any) => `    <meta ${tag.type}="${tag.key}" content="${tag.value}">`).join('\n');
    let alternatesHtml = alternates.map((alt: any) => `    <link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}">`).join('\n');
    let tagsHtml = tags.map((t: string) => `    <meta property="article:tag" content="${t}">`).join('\n');

    const seoBlock = `
    <title>${metaTitle}</title>
    ${metaDesc ? `<meta name="description" content="${metaDesc}">` : ''}
    ${keywords ? `<meta name="keywords" content="${keywords}">` : ''}
    ${author ? `<meta name="author" content="${author}">` : ''}
    <meta name="robots" content="${robots}">
    <meta name="googlebot" content="${googleBot}">
    ${canonicalUrl ? `<link rel="canonical" href="${canonicalUrl}">` : ''}
    ${favicon ? `<link rel="icon" href="${favicon}">` : ''}
    ${themeColor ? `<meta name="theme-color" content="${themeColor}">` : ''}
    <meta name="viewport" content="${viewport}">
    ${language ? `<meta name="language" content="${language}">` : ''}
    
    <!-- Open Graph Data -->
    <meta property="og:title" content="${ogTitle}">
    ${ogDescription ? `<meta property="og:description" content="${ogDescription}">` : ''}
    ${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
    ${ogUrl ? `<meta property="og:url" content="${ogUrl}">` : ''}
    <meta property="og:type" content="${ogType}">
    ${ogSiteName ? `<meta property="og:site_name" content="${ogSiteName}">` : ''}
    <meta property="og:locale" content="${locale}">
    
    <!-- Twitter Data -->
    <meta name="twitter:card" content="${twitterCard}">
    ${twitterTitle ? `<meta name="twitter:title" content="${twitterTitle}">` : ''}
    ${twitterDescription ? `<meta name="twitter:description" content="${twitterDescription}">` : ''}
    ${twitterImage ? `<meta name="twitter:image" content="${twitterImage}">` : ''}
    ${twitterCreator ? `<meta name="twitter:creator" content="${twitterCreator}">` : ''}
    ${twitterCreator ? `<meta name="twitter:site" content="${twitterCreator}">` : ''}
    
    <!-- Content Specific -->
    ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}">` : ''}
    ${modifiedTime ? `<meta property="article:modified_time" content="${modifiedTime}">` : ''}
    ${section ? `<meta property="article:section" content="${section}">` : ''}
${tagsHtml}
    
    <!-- International SEO -->
${alternatesHtml}

    <!-- Custom Meta Tags -->
${customTagsHtml}

    ${schemaJSON ? `<!-- JSON-LD Schema -->\n    <script type="application/ld+json">\n${schemaJSON}\n    </script>` : ''}
    ${seo.headerScripts ? `<!-- Header Scripts -->\n    ${seo.headerScripts}` : ''}
    `;

    if (layoutStyle === 'default' || layoutStyle === 'glycopezil') {
        cssContent = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap');
html, body { overflow-x: hidden; overflow-y: auto; scroll-behavior: smooth; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; color: #333; background-color: #ffffff; overflow-x: hidden; }
.navbar { position: sticky; top: 0; z-index: 1000; }
h1, h2, h3, h4, h5, h6, .logo { font-family: 'Outfit', sans-serif !important; }
p, span, li, a, .nav-link, button { font-family: 'Inter', sans-serif; }
.navcolor, .sectioncolor { background-color: ${primaryColor}; }
.sectioncolor1 { background-color: #f8f9fa; }
.logo { color: ${secondaryColor}; text-decoration: none; font-weight: 800; }
.bgbadge { background-color: white; border: 0.5px solid ${primaryColor}; border-radius: 20px; color: rgb(5, 0, 0); width: 100%; max-width: 312px; min-height: 380px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 1.5rem; margin: 0 auto; }
.ing { border-radius: 12px; }
.btn-custom-pill { background-color: ${secondaryColor}; color: black; font-weight: 700; border-radius: 9999px; border: 1px solid rgba(0,0,0,0.05); padding: 0.75rem 2.5rem; transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center; gap: 0.75rem; text-decoration: none; white-space: normal; text-align: center; min-width: max-content; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.85rem; }
@media (max-width: 576px) { section .btn-custom-pill { min-width: 100%; } }
.btn-custom-pill:hover { opacity: 0.9; transform: translateY(-2px); color: black; }
.about-description { text-align: justify; }
.text-muted, .text-muted * { color: #444 !important; }
.title-scale { font-size: clamp(1.5rem, 4vw, 2.75rem); line-height: 1.15; overflow-wrap: break-word; hyphens: auto; }
@media (max-width: 992px) { 
    .title-scale { font-size: 1.6rem !important; } 
    .about-description { text-align: center !important; }
}
@media (max-width: 768px) { .bgbadge { max-width: 100%; } .py-5 { padding-top: 3rem !important; padding-bottom: 3rem !important; } }
@media (max-width: 576px) {
    /* Phone-friendly spacing + typography */
    .hero-media { margin-top: 0 !important; }
    .py-5 { padding-top: 2.5rem !important; padding-bottom: 2.5rem !important; }
    .fs-1 { font-size: 1.8rem !important; }
    h1 { font-size: 2rem !important; line-height: 1.15 !important; }
    h2 { font-size: 1.6rem !important; line-height: 1.2 !important; }
    /* Justified text looks bad on narrow screens (huge word gaps) */
    .about-description { text-align: left !important; }
    [style*="text-align: justify"] { text-align: left !important; }
    p, li { hyphens: auto; overflow-wrap: anywhere; word-break: normal; }
    .bgbadge { min-height: auto !important; padding: 1.25rem !important; }
    .ingredient-card { padding: 1.5rem !important; border-radius: 2rem !important; }
    .testimonial-card { border-radius: 2rem !important; }
    .avatar-frame { width: 56px !important; height: 56px !important; }
    .navbar .container { padding-left: 1rem !important; padding-right: 1rem !important; }
}
/* Rich Text Editor Support */
ul, ol { padding-left: 1.5rem; margin-bottom: 1rem; }
[style*="text-align: center"] { text-align: center !important; }
[style*="text-align: right"] { text-align: right !important; }
[style*="text-align: justify"] { text-align: justify !important; }

`;
        htmlContent = `<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${seoBlock}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="css/style.css" />
    <style>
      .sectioncolor { background-color: ${primaryColor}; color: white; }
            .sectioncolor1 { background-color: #f8f9fa; }
      .ingredient-card { background: white; border-radius: 2.5rem; padding: 2rem; height: 100%; transition: all 0.3s; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; border: none !important; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
      .ingredient-card:hover { transform: translateY(-8px); box-shadow: 0 15px 45px rgba(0,0,0,0.1); }
      .ingredient-img-frame { width: 160px; height: 160px; border: 10px solid #fcfcfc; background: #f9fafb; margin-bottom: 1.5rem; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }
      .pricing-card { border-radius: 2rem; transition: all 0.3s; }
      .pricing-card.primary { border: 4px solid ${secondaryColor} !important; transform: scale(1.05); z-index: 10; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
            .testimonial-card { border-radius: 2rem; border: none; box-shadow: 0 10px 30px rgba(0,0,0,0.05); transition: all 0.3s; }
      .testimonial-card:hover { transform: translateY(-5px); }
      .avatar-frame { width: 64px; height: 64px; border-radius: 50%; border: 2px solid ${secondaryColor}; }
      .accordion-button:not(.collapsed) { background-color: ${primaryColor}10; color: ${primaryColor}; }
      .accordion-button:focus { box-shadow: none; }
      .btn-custom-pill { box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: all 0.3s; }
      .opacity-25 { opacity: 0.25; }
      .opacity-50 { opacity: 0.5; }
      .opacity-75 { opacity: 0.75; }
    </style>
</head>
<body>
    <header>
        <nav class="navbar navbar-expand-lg sticky-top border-bottom bg-white py-2">
            <div class="container px-3 d-flex justify-content-between align-items-center mx-auto">
                <a class="navbar-brand d-flex align-items-center gap-2 text-decoration-none" href="index.html">
                    ${data.hero?.logoImage ? `<img src="${data.hero.logoImage}" style="height: 40px; width: auto;" alt="${data.hero?.logoImageAlt || 'Logo'}" />` : ''}
                    <span class="fs-2 fw-bold logo text-capitalize">${data.productName}</span>
                </a>
                <div class="d-flex align-items-center gap-2 d-lg-none ms-auto">
                    <a href="${data.hero?.buttonHref || '#'}" class="btn-custom-pill py-2 px-3 fs-6 text-decoration-none" style="background-color: ${secondaryColor} !important; color: #000 !important; border-radius: 50px; font-weight: 700; font-family: 'Outfit', sans-serif; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">Order Now</a>
                    <button class="navbar-toggler border-0 shadow-none px-2 ms-2 flex-shrink-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <i class="fa-solid fa-bars fs-3 text-dark"></i>
                    </button>
                </div>

                <div class="collapse navbar-collapse" id="navbarNav">
                    <div class="navbar-nav ms-auto align-items-center gap-4 mt-3 mt-lg-0 pb-3 pb-lg-0 text-center">
                        ${(data.navbar?.links || []).filter((link: any) => {
            if (link.href?.startsWith('#')) {
                const sectionName = link.href.substring(1);
                if ((data.sections as any)?.[sectionName] === false) return false;
            }
            return true;
        }).map((link: any) => `<a href="${link.href}" class="nav-link text-dark fs-5 fw-bold text-decoration-none w-100">${link.label}</a>`).join('')}
                        <a href="${data.hero?.buttonHref || '#'}" class="btn-custom-pill text-decoration-none d-none d-lg-inline-block" style="background-color: ${secondaryColor} !important; color: #000 !important;">Order Now <i class="${data.hero?.icon || 'fa-solid fa-arrow-right'}"></i></a>
                    </div>
                </div>
            </div>
        </nav>
    </header>

    <style>
        .hero-row { display: flex; flex-wrap: wrap; align-items: stretch; }
        .hero-img-col { display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .hero-img-wrap { display: flex; align-items: center; justify-content: center; flex: 1 1 auto; width: 100%; }
        .hero-img-wrap img { width: 100%; max-width: 340px; object-fit: contain; height: auto; min-height: 260px; }
        @media (min-width: 992px) {
            .hero-img-wrap img { min-height: 320px; max-height: 520px; }
        }
    </style>
    <section class="container-fluid bg-white overflow-hidden" style="padding-top: 3rem; padding-bottom: 3rem; margin-bottom: 0;">
        <div class="container">
            <div class="row hero-row">
                <div class="col-12 col-lg-5 text-center mb-3 mb-lg-0 hero-img-col">
                    <div class="position-relative hero-img-wrap hero-media">
                        <img src="${data.hero?.image || ''}" alt="${data.hero?.imageAlt || 'Product Banner'}" class="mx-auto d-block" style="${data.hero.imageIsCircular ? 'border-radius: 50%; aspect-ratio: 1/1; object-fit: cover;' : 'object-fit: contain;'}" />
                        ${data.hero?.badge?.enabled ? `
                        <div style="position: absolute; top: -16px; right: -16px; z-index: 20; width: 140px; height: 140px; transform: rotate(5deg);">
                            <img src="${data.hero.badge.image}" alt="${data.hero.badge.imageAlt || 'Badge'}" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 20px 13px rgba(0,0,0,0.03)) drop-shadow(0 8px 5px rgba(0,0,0,0.08));" />
                        </div>
                        ` : ''}
                    </div>
                    ${data.timer?.enabled ? `
                    <div class="my-3 d-flex justify-content-center w-100 px-3">
                        <div class="d-flex align-items-center justify-content-between text-white rounded-4 px-4 py-3 w-100 shadow-lg" style="background-color: #cc1d1d; max-width: 500px; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">
                            <div class="d-flex flex-column align-items-start gap-1">
                                <div class="fw-black text-uppercase lh-1" style="font-size: 16px; letter-spacing: 0.025em; font-family: sans-serif;">${data.timer.title || 'LIMITED TIME OFFER'}</div>
                                <div class="fw-medium fst-italic opacity-75" style="font-size: 13px; font-family: sans-serif;">${data.timer.text || 'Hurry, Stock Running Low!'}</div>
                            </div>
                            <div class="bg-white text-dark rounded-3 px-3 py-2 d-flex align-items-center justify-content-center shadow-inner" style="min-width: 90px;">
                                <div id="countdown-timer-display" class="fw-black tabular-nums" style="font-size: 24px; letter-spacing: -0.05em; font-family: sans-serif;">
                                    ${String(data.timer.minutes || 3).padStart(2, '0')}:00
                                </div>
                            </div>
                        </div>
                    </div>
                    <style>@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .85; } }</style>
                    <script>
                        (function() {
                            var t = ${(data.timer.minutes || 3) * 60};
                            var el = document.getElementById('countdown-timer-display');
                            setInterval(function() {
                                t = t <= 1 ? ${(data.timer.minutes || 3) * 60} : t - 1;
                                var m = Math.floor(t / 60), s = t % 60;
                                el.textContent = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
                            }, 1000);
                        })();
                    </script>
                    ` : ''}
                    <div class="d-flex justify-content-center flex-wrap gap-2 mt-2 pt-1">
                        ${(data.logos || []).map((logo: any) => `<div style="width: 65px; height: 65px;"><img src="${logo.src}" alt="${logo.alt || 'Certification Logo'}" class="img-fluid" style="${logo.isCircular ? 'border-radius: 50%; aspect-ratio: 1/1; object-fit: cover;' : ''}" /></div>`).join('')}
                    </div>
                </div>
                <div class="col-12 col-lg-7 px-3 px-lg-5 text-center text-lg-start" style="padding-top: 0.25rem;">
                    <div class="fw-bold mb-3 title-scale w-100" style="margin-top: 0;">${data.hero?.title}</div>
                    <div class="fs-6 mt-2 fw-medium text-dark opacity-90 mx-auto mx-lg-0 w-100" style="line-height: 1.7; text-align: justify; white-space: pre-line;">${data.hero?.subtitle}</div>
                    <div class="d-flex flex-wrap flex-lg-nowrap gap-4 justify-content-center justify-content-lg-start align-items-center mt-4">
                        <a href="${data.hero?.buttonHref}" class="btn-custom-pill px-5 py-2.5 fs-6 text-decoration-none" style="background-color: ${secondaryColor} !important; color: #000 !important; border-radius: 50px; font-weight: 700;"><span>${data.hero?.buttonText}</span> ${data.hero?.icon ? `<i class="${data.hero.icon}" style="color: ${data.hero.iconColor || 'inherit'};"></i>` : ''}</a>
                        <a href="${data.hero?.secondaryButtonHref || '#'}" class="btn-custom-pill px-5 py-2.5 fs-6 text-decoration-none secondary-btn-export" style="background-color: transparent !important; border: 2px solid #ddd !important; color: #333 !important; border-radius: 50px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 10px;"><span>${data.hero?.secondaryButtonText || 'Learn More'}</span> ${data.hero?.secondaryIcon ? `<i class="${data.hero.secondaryIcon}" style="color: ${data.hero.secondaryIconColor || 'inherit'};"></i>` : ''}</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    ${renderCustomSections('hero')}

    <!-- Features -->
    ${(data.sections?.features !== false) ? `
    <section id="features" class="container-fluid text-center mt-0 sectioncolor">
        <div class="container">
            <h2 class="text-center fs-1 py-3 fw-bold text-white mb-0">${data.featuresTitle || 'Features'}</h2>
        </div>
    </section>

    <section class="container-fluid py-5 sectioncolor1">
        <div class="container">
            ${data.featuresSubtitle ? `<div class="text-center mb-5"><p class="fs-5 text-muted mx-auto" style="width: 100%;">${data.featuresSubtitle}</p></div>` : ''}
            <div class="row g-4 justify-content-center">
                ${(data.features || []).map((f: any) => `
                <div class="col-12 col-sm-6 col-md-4 col-lg-3"><div class="bgbadge text-center h-100"><img src="${f.image}" alt="${f.imageAlt || f.title}" class="img-fluid mb-4" style="height: 120px; object-fit: contain; ${f.isCircular ? 'border-radius: 50%; aspect-ratio: 1/1; object-fit: cover;' : ''}" /><h3 class="fw-bold fs-4 mb-3">${f.title}</h3><div class="fs-5 text-muted">${f.description}</div></div></div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    ${renderCustomSections('features')}

    <!-- About -->
    ${(data.sections?.about !== false) ? `
    <section id="about" class="container-fluid text-center mt-0 sectioncolor">
        <div class="container">
            <h2 class="text-center fs-1 py-3 fw-bold text-white mb-0">${data.about?.title || 'About'}</h2>
        </div>
    </section>

    <section class="container-fluid py-5 sectioncolor1 border-bottom">
        <div class="container">
            ${data.about?.subtitle ? `<div class="text-center mb-5"><p class="fs-5 text-muted mx-auto" style="width: 100%;">${data.about.subtitle}</p></div>` : ''}
            <div class="clearfix">
                <!-- Image Section - Floated Right for Newspaper Style -->
                <div class="float-lg-end ms-lg-5 mb-4 mb-lg-1 col-12 col-lg-5 px-0 text-center">
                    <div class="d-inline-block p-3 bg-white shadow-md border border-light w-100" style="${data.about.isCircular ? 'border-radius: 50%; aspect-ratio: 1/1;' : 'border-radius: 8px;'}">
                        <img src="${data.about?.image}" alt="${data.about?.imageAlt || 'About Product'}" class="img-fluid rounded w-100" style="max-height: 380px; ${data.about.isCircular ? 'border-radius: 50%; aspect-ratio: 1/1; object-fit: cover;' : 'object-fit: contain;'}" />
                        <div class="mt-2" style="font-size: 9px; font-weight: bold; color: #999; text-transform: uppercase; letter-spacing: 0.2em; border-top: 1px solid #eee; pt-2;">Editorial: Clinical Formula Composition</div>
                    </div>
                </div>
                <div class="fs-5 text-muted about-description" style="line-height: 1.7; text-align: justify; color: #444 !important;">${data.about?.description}</div>
            </div>
        </div>
    </section>` : ''}

    ${renderCustomSections('about')}

    <!-- Research -->
    ${(data.sections?.research !== false && data.research) ? `
    <section id="research" class="container-fluid text-center sectioncolor">
        <div class="container">
            <h2 class="text-center fs-1 py-3 fw-bold text-white mb-0">${data.research.title}</h2>
        </div>
    </section>
    <section class="container-fluid py-5 sectioncolor1 border-bottom">
        <div class="container">
            ${data.research.subtitle ? `<div class="text-center mb-5"><p class="fs-5 text-muted mx-auto" style="width: 100%;">${data.research.subtitle}</p></div>` : ''}
            <div class="row align-items-center g-5">
                <div class="col-12 col-lg-6 text-center text-lg-start">
                    <p class="fs-5 text-muted mb-4" style="line-height: 1.7; text-align: justify;">${data.research.description}</p>
                    <div class="row g-4 mt-2">
                        ${data.research.stats.map((stat: any) => `
                        <div class="col-4">
                            <div class="fw-bold fs-2" style="color: ${primaryColor};">${stat.value}</div>
                            <div class="text-muted small fw-bold">${stat.label}</div>
                        </div>
                        `).join('')}
                    </div>
                </div>
                <div class="col-12 col-lg-6">
                    <div class="p-3 bg-white border rounded shadow-sm">
                        <img src="${data.research.image}" alt="${data.research.imageAlt || 'Clinical Research'}" class="img-fluid rounded w-100" style="max-height: 400px; ${data.research.isCircular ? 'border-radius: 50%; aspect-ratio: 1/1; object-fit: cover;' : 'object-fit: contain;'}" />
                    </div>
                </div>
            </div>
        </div>
    </section>` : ''}

    ${renderCustomSections('research')}

    <!-- Benefits -->
    ${(data.sections?.benefits !== false) ? `
    <section id="benefits" class="container-fluid text-center sectioncolor">
        <div class="container">
            <h2 class="text-center fs-1 py-3 fw-bold text-white mb-0">${data.benefits?.title || 'Benefits'}</h2>
        </div>
    </section>
    <section class="container-fluid py-5 sectioncolor1">
        <div class="container">
            ${data.benefits?.subtitle ? `<div class="text-center mb-5"><p class="fs-5 text-muted mx-auto" style="width: 100%;">${data.benefits.subtitle}</p></div>` : ''}
            <p class="fs-5 text-center mb-5  mx-auto text-muted" style="width: 100%;">${data.benefits?.description || ''}</p>
            <div class="row g-4 justify-content-center">
                ${(data.benefits?.items || []).map((b: any) => `
                <div class="col-12 col-lg-10"><div class="card h-100 border-0 p-4 bg-white shadow-sm" style="border-radius: 12px;"><h3 class="fw-bold fs-4 mb-2">${b.title}</h3><div class="fs-5 text-muted mb-0">${b.description}</div></div></div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    ${renderCustomSections('benefits')}

    <!-- Ingredients -->
    ${(data.sections?.ingredients !== false) ? `
    <section id="ingredients" class="container-fluid text-center mt-0 sectioncolor">
        <div class="container">
            <h2 class="text-center fs-1 fw-bold py-3 text-white mb-0">${data.ingredients?.title || 'Ingredients'}</h2>
        </div>
    </section>

    <section class="container-fluid py-5 sectioncolor1">
        <div class="container">
            ${data.ingredients?.subtitle ? `<div class="text-center mb-5"><p class="fs-5 text-muted mx-auto" style="width: 100%;">${data.ingredients.subtitle}</p></div>` : ''}
            <div class="row g-4 justify-content-center">
                ${(data.ingredients?.items || []).map((item: any) => `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="ingredient-card shadow-sm border-0">
                        <div class="ingredient-img-frame mx-auto" style="${item.isCircular ? 'border-radius: 50%;' : 'border-radius: 0;'} box-shadow: 0 0 0 2px ${secondaryColor}, inset 0 2px 4px rgba(0,0,0,0.05);">
                            <img src="${item.image || 'https://placehold.co/400x400?text=Ingredient'}" alt="${item.imageAlt || item.title}" style="width: 100%; height: 100%; ${item.isCircular ? 'border-radius: 50%; aspect-ratio: 1/1; object-fit: cover;' : 'object-fit: cover;'}">
                        </div>
                        <h3 class="fw-bold fs-4 mb-2 text-dark">${item.title}</h3>
                        <div class="fs-6 text-muted mb-0 " style="line-height: 1.6;">${item.description}</div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    ${renderCustomSections('ingredients')}

    <!-- Money Back -->
    <section id="guarantee" class="container-fluid text-center mt-0 sectioncolor">
        <div class="container">
            <h2 class="text-center fs-1 fw-bold py-3 text-white mb-0">${data.guaranteeTitle || 'Guarantee'}</h2>
        </div>
    </section>
    <section class="container-fluid py-5 bg-white">
        <div class="container mx-auto">
            ${data.guaranteeSubtitle ? `<div class="text-center mb-5"><p class="fs-5 text-muted mx-auto" style="width: 100%;">${data.guaranteeSubtitle}</p></div>` : ''}
            <div class="container border p-4 p-lg-5 mx-auto" style="border-radius: 12px; background: #fff;">
                <div class="row align-items-center g-5">
                    <div class="col-12 col-lg-4 text-center">
                        <img src="${data.footer?.trustImage || 'https://placehold.co/300x300?text=Guarantee'}" alt="${data.footer?.trustImageAlt || 'Money Back Guarantee'}" class="img-fluid mb-3 mx-auto" style="max-width: 300px; ${data.footer.trustImageIsCircular ? 'border-radius: 50%; aspect-ratio: 1/1; object-fit: cover;' : ''}" />
                        <p class="fs-6 fw-semibold text-success mt-2">${data.guaranteeSmallText || "Zero Risk • Complete Satisfaction Promise"}</p>
                    </div>
                    <div class="col-12 col-lg-8 text-center text-lg-start">
                        <h3 class="fs-2 fw-bold mb-3">${data.guaranteeHeadline || "Full 60-Day Refund Assurance"}</h3>
                        <p class="fs-5 text-gray-700 " style="line-height: 1.6;">${data.guaranteeDescription || defaultGuaranteeDescription}</p>
                        <a href="${data.hero?.buttonHref || '#'}" class="btn-custom-pill mt-4 px-5 py-3 fs-5">Grab Your Risk-Free Package <i class="fa-solid fa-cart-arrow-down"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    ${renderCustomSections('guarantee')}

    <!-- Pricing -->
    ${(data.sections?.pricing !== false) ? `
    <section id="pricing" class="container-fluid text-center mt-0 sectioncolor">
        <div class="container">
            <h2 class="text-center fs-1 fw-bold py-3 text-white mb-0">${data.pricingTitle || 'Pricing'}</h2>
        </div>
    </section>

    <section class="container-fluid py-5" style="background-color: #f9f9f9;">
        <div class="container">
            ${data.pricingSubtitle ? `<div class="text-center mb-5"><p class="fs-5 text-dark mx-auto" style="width: 100%;">${data.pricingSubtitle}</p></div>` : ''}
            <div class="row g-4 justify-content-center">
            ${(data.pricing || []).map((plan: any) => `
            <div class="col-12 col-md-6 col-lg-4 mb-4">
                <div class="h-100 p-4 text-center bg-white position-relative" style="border-radius: 2rem; border: ${plan.isPrimary ? '2px solid ' + secondaryColor : '1px solid #efefef'}; ${plan.isPrimary ? 'transform: scale(1.04); z-index: 10;' : ''}">
                ${plan.isPrimary ? `<div class="position-absolute top-0 start-50 translate-middle px-4 py-1 rounded-none fw-bold text-uppercase" style="background-color: ${secondaryColor}; color: #000; font-size: 10px; white-space: nowrap;">BEST VALUE BUNDLE</div>` : ''}
                <h3 class="fs-4 fw-bold mb-3 text-uppercase tracking-tight">${plan.title}</h3>
                <div class="position-relative mx-auto mb-3" style="width: 100%; min-height: 200px; display: inline-block;">
                    ${renderBottleStack(plan.multiplier || 'X1', plan.image || '', plan.title, '180px')}
                    <div style="position: absolute; right: 0; bottom: 0; z-index: 20; transform: rotate(8deg);">
                        <div style="background-color: #dc2626; color: white; border-radius: 9999px; font-weight: 900; font-size: 14px; border: 3px solid white; box-shadow: 0 10px 25px rgba(0,0,0,0.2); padding: 8px 24px; letter-spacing: 0.1em; text-transform: uppercase; display: flex; align-items: center; justify-content: center; white-space: nowrap; width: fit-content; line-height: 1;">${plan.multiplier || 'X1'}</div>
                    </div>
                </div>
                <div class="d-flex align-items-baseline justify-content-center gap-1 mb-3">
                    <span class="fs-2 fw-bold" style="color: ${primaryColor};">${plan.price}</span>
                    <span class="fs-6 text-dark">/ bottle</span>
                </div>
                <div class="bg-light rounded-4 p-3 mb-4 mx-auto border" style="max-width: 280px;">
                    <ul class="list-unstyled mb-0 text-start d-inline-block w-100">
                        ${plan.features.map((f: string) => `<li class="mb-2 small fw-medium d-flex align-items-center gap-2"><i class="fa-solid fa-check-circle fs-6" style="color: ${primaryColor};"></i><span>${f}</span></li>`).join('')}
                    </ul>
                </div>
                <a href="${plan.buttonHref}" class="btn-custom-pill w-100 py-3.5 fs-6 fw-bold text-decoration-none d-flex align-items-center justify-content-center" style="background-color: ${plan.isPrimary ? secondaryColor : '#333'}; color: ${plan.isPrimary ? '#000' : '#fff'}; border: none;"><span>${plan.buttonText}</span> ${plan.icon ? `<i class="${plan.icon}" style="color: ${plan.iconColor || 'inherit'}; margin-left: 8px;"></i>` : ''}</a>
                <div class="mt-3 d-flex align-items-center justify-content-center gap-1 opacity-50 fw-bold" style="font-size: 10px;"><i class="${(plan.guaranteeBadge?.icon || data.guaranteeBadge?.icon) || 'fa-solid fa-lock'}"></i><span>${(plan.guaranteeBadge?.text || data.guaranteeBadge?.text) || '60-DAY MONEY-BACK GUARANTEE'}</span></div>
            </div></div>
            `).join('')}
        </div></div>
    </section>` : ''}

    ${renderCustomSections('pricing')}

    <!-- Testimonials -->
    ${(data.sections?.testimonials !== false && data.testimonials) ? `
    <section id="testimonials" class="container-fluid text-center mt-0 sectioncolor">
        <div class="container">
            <h2 class="text-center fs-1 fw-bold py-3 text-white mb-0">${data.testimonials.title}</h2>
        </div>
    </section>

    <section class="container-fluid py-5" style="background-color: #fff;">
        <div class="container mx-auto">
            ${data.testimonials.subtitle ? `
            <div class="text-center mb-4">
                <p class="fs-5 text-dark mx-auto w-100 mb-0">${data.testimonials.subtitle}</p>
            </div>
            ` : ''}
            <div class="row g-4 justify-content-center">
                ${data.testimonials.items.map((item: any) => `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card h-100 border-0 shadow-sm bg-white p-4 testimonial-card" style="border-radius: 2rem;">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="avatar-frame overflow-hidden" style="${item.isCircular !== false ? 'border-radius: 50%;' : 'border-radius: 0;'}">
                                <img src="${item.image || 'https://i.pravatar.cc/150'}" alt="${item.imageAlt || item.name}" style="width: 100%; height: 100%; object-fit: cover; ${item.isCircular !== false ? 'border-radius: 50%; aspect-ratio: 1/1;' : ''}">
                            </div>
                            <div>
                                <h4 class="fw-bold mb-0 text-dark">${item.name}</h4>
                                <span class="text-dark small">${item.role || 'Verified Buyer'}</span>
                            </div>
                        </div>
                        <div class="mb-3 text-warning d-flex gap-1">
                            ${[...Array(5)].map((_, idx) => {
            const fill = idx + 1;
            const rating = Number(item.rating || 5);
            if (rating >= fill) {
                return `<i class="fa-solid fa-star"></i>`;
            } else if (rating >= fill - 0.5) {
                return `
                                    <span style="position: relative; display: inline-block; width: 1em; height: 1em; vertical-align: middle;">
                                        <i class="fa-solid fa-star" style="position: absolute; left: 0; top: 0; width: 100%; opacity: 0.25;"></i>
                                        <i class="fa-solid fa-star" style="position: absolute; left: 0; top: 0; width: 100%; clip-path: inset(0 50% 0 0);"></i>
                                    </span>`;
            } else {
                return `<i class="fa-solid fa-star" style="opacity: 0.25;"></i>`;
            }
        }).join('')}
                        </div>
                        <div style="position: relative;">
                            <i class="fa-solid fa-quote-left" style="position: absolute; top: -10px; left: -10px; opacity: 0.1; font-size: 2rem;"></i>
                            <p class="fs-6 text-dark font-italic italic mb-0" style="line-height: 1.6; position: relative; z-index: 1;">${(item.content || '').trim()}</p>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    ${renderCustomSections('testimonials')}

    <!-- FAQ -->
    ${(data.sections?.faq !== false && data.faq?.length) ? `
    <section id="faq" class="container-fluid text-center mt-0 sectioncolor">
        <div class="container">
            <h2 class="text-center fs-1 fw-bold py-3 text-white mb-0">${data.faqTitle || 'FAQ'}</h2>
        </div>
    </section>

    <section class="container-fluid py-5 bg-white">
        <div class="container">
            ${data.faqSubtitle ? `<div class="text-center mb-5"><p class="fs-5 text-muted mx-auto" style="width: 100%;">${data.faqSubtitle}</p></div>` : ''}
            <div class="container mx-auto" style="width: 100%;">
                <div class="accordion accordion-flush" id="faqAccordion">
                    ${(data.faq || []).map((item: any, i: number) => `
                    <div class="accordion-item mb-3 border rounded shadow-sm overflow-hidden">
                        <h3 class="accordion-header">
                            <button class="accordion-button fw-bold fs-5 p-4 bg-white shadow-none ${i === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}">${item.question}</button>
                        </h3>
                        <div id="collapse${i}" class="accordion-collapse collapse ${i === 0 ? 'show' : ''}" data-bs-parent="#faqAccordion">
                            <div class="accordion-body fs-5 text-muted p-4 border-top bg-light">${item.answer}</div>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </section>` : ''}

    ${renderCustomSections('faq')}

${sourcesHtml}

    <!-- Footer -->
    <footer class="navcolor text-white py-5 text-center">
        <div class="container mx-auto px-4"><h2 class="fw-bold fs-1 mb-4">${data.footerHeadline || "Questions?"}</h2><p class="fs-5 fw-medium mb-5  mx-auto" style="line-height: 1.6; width: 100%; opacity: 0.75;">${data.footer?.companyInfo}</p><hr class="my-5" style="opacity: 0.25;" /><ul class="list-inline fw-semibold fs-5 mb-5">${(data.footer?.links || []).map((link: any) => `<li class="list-inline-item mx-3"><a href="${link.href}" class="text-white text-decoration-none">${link.label}</a></li>`).join('')}</ul><p class="fs-6" style="opacity: 0.75;">© ${new Date().getFullYear()} ${data.productName} All Rights Reserved.</p></div>
    </footer>
    
    <script>
        // Simple mobile menu toggle if needed
        document.addEventListener('DOMContentLoaded', function() {
        });
    </script>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
    ${socialProofBlock}
    ${seo.footerScripts ? `<!-- Footer Scripts -->\n    ${seo.footerScripts}` : ''}
</body>
</html>`;
    }
    else if (layoutStyle === 'organic') {
        htmlContent = `<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.productName}</title>
    ${seoBlock}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Outfit:wght@300;400;500;600;700&display=swap');
        
        :root {
          --org-primary: ${primaryColor};
          --org-secondary: ${secondaryColor};
          --org-bg: #F9F7F2;
          --org-accent: #F1EDE4;
          --org-text: #3D3A35;
          --org-border: #E6D5C3;
        }

        body { 
          font-family: 'Outfit', sans-serif; 
          color: var(--org-text);
          background-color: var(--org-bg);
          line-height: 1.6;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          scroll-behavior: smooth;
        }

        * {
          transition: border-color 0.3s ease, background-color 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
        }

        h1, h2, h3, h4, .logo, .font-serif { 
          font-family: 'Fraunces', serif !important; 
          letter-spacing: -0.01em;
          color: var(--org-text);
          font-weight: 700;
        }

        .organic-card {
          background: #ffffff;
          border: 1px solid var(--org-border);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 0;
        }

        .organic-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 40px 80px -15px rgba(61, 58, 53, 0.08);
          border-color: var(--org-primary);
        }

        .organic-btn {
          padding: 1.25rem 3rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-size: 0.7rem;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          text-decoration: none;
        }

        .organic-btn-primary { background: var(--org-primary); color: #ffffff; }
        .organic-btn-primary:hover { background: #0d1a17; transform: scale(1.03); color: white; }
        .organic-btn-outline { background: transparent; border: 1.5px solid var(--org-primary); color: var(--org-primary); }
        .organic-btn-outline:hover { background: var(--org-primary); color: #ffffff; }

        .organic-blob { 
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; 
          animation: blobby 20s infinite alternate cubic-bezier(0.45, 0, 0.55, 1);
        }

        @keyframes blobby {
          0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }

        .section-reveal {
          animation: reveal 1s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes reveal {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .navbar {
          background: rgba(249, 247, 242, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--org-border);
        }

        .nav-link {
          color: var(--org-text) !important;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-size: 0.75rem;
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          color: var(--org-primary) !important;
          opacity: 0.7;
        }

        .purchase-proof {
          position: fixed; bottom: 40px; left: 40px; background: rgba(255, 255, 255, 0.98);
          padding: 20px; border: 1px solid var(--org-border); z-index: 9999;
          transform: translateX(-150%); transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex; align-items: center; gap: 20px; min-width: 340px;
          backdrop-filter: blur(10px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05);
        }
        .purchase-proof.active { transform: translateX(0); }

        /* Utility classes to mirror Tailwind */
        .text-stone-600 { color: #57534e; }
        .text-stone-700 { color: #44403c; }
        .text-stone-800 { color: #292524; }
        .bg-stone-50 { background-color: #fafaf9; }
        .bg-stone-100 { background-color: #f5f5f4; }
        .tracking-widest { letter-spacing: 0.1em; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .organic-btn { padding: 1rem 2.5rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; font-size: 0.7rem; transition: all 0.4s ease; border: none; display: inline-flex; align-items: center; justify-content: center; gap: 0.75rem; cursor: pointer; text-decoration: none; border-radius: 9999px; white-space: normal; text-align: center; min-width: max-content; }
@media (max-width: 576px) { section .organic-btn { min-width: 100%; } }
        .organic-btn-primary { background: var(--org-primary); color: #ffffff; }
        .organic-btn-outline { background: transparent; border: 1.5px solid var(--org-primary); color: var(--org-primary); }
        .italic { font-style: italic; }
        .small { font-size: 0.875rem; }
        .opacity-75 { opacity: 0.75; }
        .opacity-50 { opacity: 0.5; }
        .no-underline { text-decoration: none; }
        .font-mono { font-family: monospace; }

        @media (max-width: 768px) {
          h1 { font-size: 2.2rem !important; line-height: 1.2 !important; }
          .organic-btn { padding: 1rem 2rem; width: 100%; justify-content: center; }
          .purchase-proof { left: 20px; bottom: 20px; min-width: calc(100% - 40px); }
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg sticky-top py-4">
        <div class="container px-3 d-flex justify-content-between align-items-center">
            <a class="navbar-brand d-flex align-items-center gap-3 no-underline" href="#">
                <div style="width: 45px; height: 45px; flex-shrink: 0;">
                    ${data.hero?.logoImage ? `<img src="${data.hero.logoImage}" class="w-100 h-100 object-contain grayscale hover:grayscale-0 transition-all" style="object-fit: contain;" alt="Logo" />` : ''}
                </div>
                <span class="fs-3 fw-bold logo" style="color: var(--org-primary);">${data.productName}</span>
            </a>
            <button class="navbar-toggler border-0 shadow-none px-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <i class="fa-solid fa-bars fs-3 text-dark"></i>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <div class="navbar-nav ms-auto align-items-center gap-5 mt-4 mt-lg-0">
                    ${(data.navbar?.links || []).filter((link: any) => {
            if (link.href?.startsWith('#')) {
                const sectionName = link.href.substring(1);
                if ((data.sections as any)?.[sectionName] === false) return false;
            }
            return true;
        }).map((link: any) => `<a href="${link.href}" class="nav-link fw-medium p-0 text-stone-700 hover:text-green-900 text-xs uppercase tracking-widest no-underline">${link.label}</a>`).join('')}
                    <a href="${data.hero?.buttonHref}" class="organic-btn organic-btn-primary py-2 px-4">${data.hero?.buttonText || 'Shop Collection'} ${data.hero?.icon ? `<i class="${data.hero.icon}" style="color: ${data.hero.iconColor || 'inherit'};"></i>` : ''}</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="py-5 overflow-hidden section-reveal">
        <div class="container">
            <div class="row align-items-center g-5">
                <div class="col-12 col-lg-7 text-center text-lg-start pe-lg-5">
                    <h1 class="display-3 fw-bold mb-3" style="line-height: 0.9;">${data.hero?.title}</h1>
                    <p class="fs-6 text-stone-700 mb-4 italic font-serif w-100" style="line-height: 1.6;">${data.hero?.subtitle}</p>
                    <div class="d-flex flex-wrap flex-lg-nowrap gap-3 justify-content-center justify-content-lg-start align-items-center">
                        <a href="${data.hero?.buttonHref}" class="organic-btn organic-btn-primary">
                            <span>${data.hero?.buttonText}</span>
                            ${data.hero?.icon ? `<i class="${data.hero.icon}" style="color: ${data.hero.iconColor || 'inherit'};"></i>` : ''}
                        </a>
                        ${data.hero?.secondaryButtonText ? `<a href="${data.hero?.secondaryButtonHref}" class="organic-btn organic-btn-outline"><span>${data.hero.secondaryButtonText}</span> ${data.hero?.secondaryIcon ? `<i class="${data.hero.secondaryIcon}" style="color: ${data.hero.secondaryIconColor || 'inherit'};"></i>` : ''}</a>` : ''}
                    </div>
                </div>
                <div class="col-12 col-lg-5">
                    <div class="position-relative">
                        <div class="position-absolute organic-blob bg-stone-100 rotate-12" style="width: 100%; height: 100%; top: 0; left: 0; z-index: -1; transform: rotate(12deg) translateX(20px);"></div>
                        <div class="p-4 organic-blob bg-white border border-[#E6D5C3]" style="position: relative; z-index: 10;">
                            <img src="${data.hero?.image}" alt="Hero Image" class="img-fluid mx-auto d-block" style="max-height: 450px; object-fit: contain;" />
                        </div>
                        ${data.hero?.badge?.enabled ? `
                        <div style="position: absolute; top: -16px; right: -16px; z-index: 20; width: 140px; height: 140px; transform: rotate(5deg);">
                            <img src="${data.hero.badge.image}" alt="${data.hero.badge.imageAlt || 'Badge'}" style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 20px 13px rgba(0,0,0,0.03)) drop-shadow(0 8px 5px rgba(0,0,0,0.08));" />
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    </section>

    ${renderCustomSections('hero')}

    <!-- Logos & Timer -->
    <section class="py-4 border-top border-bottom" style="background-color: white;">
        <div class="container">
            <div class="d-flex justify-content-center flex-wrap gap-4 gap-md-5 align-items-center">
                ${(data.logos || []).map((logo: any) => `
                <div style="width: 80px;">
                    <img src="${logo.src}" alt="Partner Logo" class="img-fluid grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all" />
                </div>`).join('')}
            </div>

            ${data.timer?.enabled ? `
            <div class="mt-5 mb-4 d-flex justify-content-center w-100 px-4">
                <div id="countdown-timer" class="d-flex align-items-center justify-content-between text-white px-4 py-3 w-100 shadow-lg" style="max-width: 500px; border-radius: 12px; background-color: #cc1d1d; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">
                    <div class="d-flex flex-column align-items-start">
                        <div class="text-[14px] fw-bold uppercase leading-tight tracking-wide" style="font-size: 14px; font-weight: 800;">${data.timer.title || 'LIMITED TIME OFFER'}</div>
                        <div class="text-[11px] opacity-90 italic" style="font-size: 11px;">${data.timer.text || 'Hurry, Stock Running Low!'}</div>
                    </div>
                    <div class="bg-white text-black px-3 py-2 d-flex align-items-center justify-content-center shadow-inner" style="background-color: white; color: black; border-radius: 8px; min-width: 80px;">
                        <div class="fs-4 fw-bold tabular-nums tracking-tighter" id="timer-display" style="font-size: 20px; font-weight: 800;">00:00</div>
                    </div>
                </div>
            </div>
            <style>
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .8; } }
            </style>
            <script>
                (function() {
                    let time = ${data.timer.minutes || 3} * 60;
                    const display = document.getElementById('timer-display');
                    function update() {
                        const m = Math.floor(time / 60);
                        const s = time % 60;
                        display.innerText = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
                        if (time > 0) { 
                            time--; 
                        } else {
                            time = ${data.timer.minutes || 3} * 60;
                        }
                        setTimeout(update, 1000);
                    }
                    update();
                })();
            </script>` : ''}
        </div>
    </section>

    <!-- Ingredients -->
    ${data.sections?.ingredients !== false ? `
    <section id="ingredients" class="py-5 section-reveal" style="background-color: var(--org-accent);">
        <div class="container py-lg-5 text-center">
            <i class="fa-solid fa-leaf mb-3 text-2xl" style="color: var(--org-secondary);"></i>
            <h2 class="fw-bold mb-3" style="color: var(--org-primary); font-size: 2.5rem;">${data.ingredients?.title || 'From the Earth'}</h2>
            ${data.ingredients?.subtitle ? `<p class="text-[#4A3B2E] font-serif text-lg mx-auto" style="max-width: 700px;">${data.ingredients.subtitle}</p>` : ''}
            
            <div class="row g-4 mt-4">
                ${(data.ingredients?.items || []).map((item: any) => `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="organic-card p-4 h-100 text-center bg-white">
                        <div class="mx-auto mb-4 organic-blob" style="width: 130px; height: 130px; border: 4px solid #F9F7F2;">
                            <img src="${item.image}" alt="${item.title}" class="w-100 h-100" style="object-fit: cover;" />
                        </div>
                        <h4 class="fw-bold mb-2 font-serif" style="color: var(--org-primary); font-size: 1.25rem;">${item.title}</h4>
                        <p class="mb-0 text-[#4A3B2E] small">${item.description}</p>
                    </div>
                </div>`).join('')}
            </div>
        </div>
    </section>` : ''}

    ${renderCustomSections('ingredients')}

    <!-- Features -->
    ${data.sections?.features !== false ? `
    <section id="features" class="py-5 bg-white section-reveal">
        <div class="container py-lg-4">
            <div class="text-center mb-5">
                <h2 class="fw-bold mb-2" style="color: var(--org-primary); font-size: 2.2rem;">${data.featuresTitle || 'Our Philosophy'}</h2>
                <div class="w-12 h-0.5 bg-green-800 mx-auto mt-3" style="width: 50px; height: 2px; background: #1e3932;"></div>
            </div>
            <div class="row g-0 border border-[#E6D5C3]">
                ${(data.features || []).map((f: any) => `
                <div class="col-12 col-md-3 border-end border-bottom border-[#E6D5C3] p-5 text-center transition-colors hover:bg-stone-50">
                    <img src="${f.image}" alt="${f.title}" class="w-12 h-12 mx-auto mb-4" style="width: 48px; height: 48px;" />
                    <h4 class="fw-bold mb-3 text-[0.85rem] uppercase tracking-widest">${f.title}</h4>
                    <p class="mb-0 text-stone-700 text-xs">${f.description}</p>
                </div>`).join('')}
            </div>
        </div>
    </section>` : ''}

    ${renderCustomSections('features')}

    <!-- Research -->
    ${data.research && data.sections?.research !== false ? `
    <section id="research" class="py-5 bg-[#F9F7F2] section-reveal">
        <div class="container">
            <div class="row align-items-center g-5">
                <div class="col-lg-6">
                    <span class="text-[10px] fw-bold text-stone-600 uppercase tracking-widest mb-3 d-block">Scientific Verification</span>
                    <h2 class="fw-bold mb-4 font-serif" style="color: var(--org-primary); font-size: 2.5rem;">${data.research.title}</h2>
                    <p class="fs-5 text-stone-700 mb-4 italic">${data.research.subtitle}</p>
                    <div class="text-stone-700 mb-5" style="line-height: 1.9; font-size: 0.95rem;">${data.research.description}</div>
                    <div class="row g-4 pt-4 border-top border-[#E6D5C3]">
                        ${(data.research.stats || []).map((stat: any) => `
                        <div class="col-4">
                            <div class="fw-bold fs-3 text-stone-800">${stat.value}</div>
                            <div class="text-stone-600 small uppercase tracking-tighter" style="font-size: 10px;">${stat.label}</div>
                        </div>`).join('')}
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="position-relative">
                        <div class="position-absolute organic-blob bg-stone-100 -rotate-6" style="width: 100%; height: 100%; top: 0; left: 0; z-index: -1; transform: rotate(-6deg) translateX(20px);"></div>
                        <div class="p-4 organic-blob bg-white border border-[#E6D5C3]">
                            <img src="${data.research.image}" alt="Research Data" class="img-fluid mx-auto d-block" style="max-height: 450px; object-fit: contain;" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>` : ''}

    ${renderCustomSections('research')}

    <!-- About Section -->
    ${data.sections?.about !== false && data.about ? `
    <section id="about" class="py-5 bg-white section-reveal">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="display-5 fw-bold mb-4" style="color: var(--org-primary);">${data.about.title || 'The Botanical Journal'}</h2>
            </div>
            <div class="row g-5 align-items-center">
                <div class="col-lg-5 text-center">
                    <div class="p-3 border border-stone-100 bg-stone-50 inline-block shadow-sm">
                        <img src="${data.about.image}" alt="About Us" class="img-fluid grayscale hover:grayscale-0 transition-all duration-700" style="max-height: 400px; object-fit: contain;" />
                    </div>
                </div>
                <div class="col-lg-7">
                    <div class="ps-lg-4 border-start border-4 border-success border-opacity-25" style="border-left: 4px solid rgba(25, 135, 84, 0.25) !important;">
                        <div class="text-stone-600 font-serif" style="line-height: 1.9; font-size: 1.1rem; white-space: pre-line;">${data.about.description}</div>
                    </div>
                </div>
            </div>
        </div>
    </section>` : ''}

    ${renderCustomSections('about')}

    <!-- Benefits -->
    ${data.sections?.benefits !== false && data.benefits ? `
    <section id="benefits" class="py-5 bg-accent section-reveal" style="background-color: var(--org-accent);">
        <div class="container py-lg-4">
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <div class="bg-white p-5 border border-[#E6D5C3]">
                        <div class="text-center mb-5">
                            <h2 class="fw-bold mb-3" style="color: var(--org-primary); font-size: 2rem;">${data.benefits.title || 'Holistic Rewards'}</h2>
                            <p class="text-stone-700 italic mx-auto font-serif" style="max-width: 600px;">${data.benefits.description}</p>
                        </div>
                        <div class="row g-4">
                            ${(data.benefits.items || []).map((b: any) => `
                            <div class="col-md-6">
                                <div class="d-flex align-items-start gap-4 p-3 hover:bg-stone-50 transition-colors">
                                    <div class="text-success pt-1"><i class="fa-solid fa-leaf text-xs"></i></div>
                                    <div>
                                        <h4 class="fw-bold mb-1 text-sm uppercase tracking-wider">${b.title}</h4>
                                        <p class="mb-0 text-stone-700 text-xs">${b.description}</p>
                                    </div>
                                </div>
                            </div>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>` : ''}

    ${renderCustomSections('benefits')}

    <!-- Pricing -->
    ${data.sections?.pricing !== false ? `
    <section id="pricing" class="py-5 bg-white section-reveal">
        <div class="container py-lg-5">
            <div class="text-center mb-5">
                <h2 class="fw-bold mb-2 font-serif" style="color: var(--org-primary); font-size: 2.8rem;">${data.pricingTitle || 'Select Your Batch'}</h2>
                <div class="w-16 h-px bg-stone-200 mx-auto mt-4" style="width: 64px; height: 1px; background: #e7e5e4;"></div>
            </div>
            <div class="row g-4 justify-content-center">
                ${(data.pricing || []).map((plan: any) => `
                <div class="col-12 col-md-4">
                    <div class="organic-card h-100 d-flex flex-column bg-white ${plan.isPrimary ? 'border-success' : ''}" style="${plan.isPrimary ? 'border-color: #1e3932 !important; border-width: 2px !important;' : ''}">
                        ${plan.isPrimary ? `<div class="bg-success text-white text-[9px] fw-bold py-1 text-center uppercase tracking-widest" style="background-color: #1e3932 !important;">Recommended Choice</div>` : ''}
                        <div class="p-5 flex-grow-1 text-center">
                            <h4 class="fw-bold mb-4 text-xs uppercase tracking-[0.2em] text-stone-600">${plan.title}</h4>
                            <div class="relative mb-5 position-relative" style="width: 100%; min-height: 200px; display: inline-block;">
                                ${renderBottleStack(plan.multiplier || 'X1', plan.image || '', plan.title, '180px')}
                                ${plan.multiplier ? `
                                <div style="position: absolute; right: 0; bottom: 0; z-index: 20; transform: rotate(8deg);">
                                    <div style="background-color: #dc2626; color: white; border-radius: 9999px; font-weight: 900; font-size: 14px; border: 3px solid white; box-shadow: 0 10px 25px rgba(0,0,0,0.2); padding: 8px 24px; letter-spacing: 0.1em; text-transform: uppercase; display: flex; align-items: center; justify-content: center; white-space: nowrap; width: fit-content; line-height: 1;">${plan.multiplier}</div>
                                </div>` : ''}
                            </div>
                            <div class="fw-bold mb-4 font-serif text-3xl" style="font-size: 1.875rem;">${plan.price}</div>
                            <div class="mb-5 text-start ps-4 border-start border-stone-100">
                                ${plan.features.map((f: string) => `
                                <div class="mb-2 d-flex align-items-center gap-2 text-stone-700 text-xs">
                                    <i class="fa-solid fa-check" style="color: var(--org-primary);"></i>
                                    <span>${f}</span>
                                </div>`).join('')}
                            </div>
                            <a href="${plan.buttonHref}" class="organic-btn w-100 justify-content-center ${plan.isPrimary ? 'organic-btn-primary' : 'organic-btn-outline'}"><span>${plan.buttonText}</span> ${plan.icon ? `<i class="${plan.icon}" style="color: ${plan.iconColor || 'inherit'};"></i>` : ''}</a>
                            ${plan.guaranteeBadge ? `
                            <div class="mt-4 d-flex align-items-center justify-content-center gap-2 text-stone-300 font-bold text-[9px] tracking-widest uppercase">
                                <i class="${plan.guaranteeBadge.icon || 'fa-solid fa-shield-halved'}"></i>
                                <span>${plan.guaranteeBadge.text}</span>
                            </div>` : ''}
                        </div>
                    </div>
                </div>`).join('')}
            </div>
        </div>
    </section>` : ''}

    ${renderCustomSections('pricing')}

    <!-- Testimonials -->
    ${data.sections?.testimonials !== false && data.testimonials ? `
    <section id="testimonials" class="py-5 bg-[#F9F7F2] section-reveal">
        <div class="container py-lg-4">
            <div class="text-center mb-5">
                <span class="text-[10px] fw-bold text-stone-600 uppercase tracking-widest mb-2 d-block">The Community Voice</span>
                <h2 class="fw-bold font-serif mb-4" style="color: var(--org-primary); font-size: 2.5rem;">${data.testimonials.title || 'Community Stories'}</h2>
            </div>
            <div class="row g-4">
                ${(data.testimonials.items || []).map((t: any) => `
                <div class="col-md-4">
                    <div class="p-4 bg-white border border-[#E6D5C3] h-100 d-flex flex-column align-items-start text-start">
                        <div class="w-16 h-16 rounded-circle mb-3 border border-2 border-light" style="width: 64px; height: 64px;">
                            <img src="${t.image || 'https://i.pravatar.cc/150'}" alt="${t.name}" class="w-100 h-100 object-cover grayscale hover:grayscale-0 transition-all" />
                        </div>
                        <h5 class="fw-bold mb-1 text-sm font-serif">${t.name}</h5>
                        <p class="mb-3 text-[10px] text-stone-600 uppercase tracking-widest">${t.role || ''}</p>
                        <div class="mb-3 d-flex gap-1 text-[#D4C3B2] text-[10px]">
                            ${[...Array(5)].map((_, idx) => {
            const fill = idx + 1;
            const rating = Number(t.rating || 5);
            if (rating >= fill) {
                return `<i class="fa-solid fa-star"></i>`;
            } else if (rating >= fill - 0.5) {
                return `
                                    <span style="position: relative; display: inline-block; width: 1em; height: 1em; vertical-align: middle;">
                                        <i class="fa-solid fa-star" style="position: absolute; left: 0; top: 0; width: 100%; opacity: 0.25;"></i>
                                        <i class="fa-solid fa-star" style="position: absolute; left: 0; top: 0; width: 100%; clip-path: inset(0 50% 0 0);"></i>
                                    </span>`;
            } else {
                return `<i class="fa-solid fa-star" style="opacity: 0.25;"></i>`;
            }
        }).join('')}
                        </div>
                        <p class="mb-0 text-stone-600 italic text-sm" style="line-height: 1.8;">${(t.content || '').trim()}</p>
                    </div>
                </div>`).join('')}
            </div>
        </div>
    </section>` : ''}

    ${renderCustomSections('testimonials')}

    <!-- Satisfaction Promise -->
    <section class="py-5 bg-white border-top border-[#E6D5C3]">
        <div class="container">
            <div class="row align-items-center g-5">
                <div class="col-lg-4 text-center">
                    <img src="${data.footer?.trustImage || 'https://via.placeholder.com/220x100?text=Guarantee'}" alt="Guarantee" class="img-fluid mb-3 mx-auto" style="max-width: 220px;" />
                </div>
                <div class="col-lg-8">
                    <span class="text-[10px] fw-bold text-stone-600 uppercase tracking-widest mb-2 d-block">Our Pure Promise</span>
                    <h3 class="fw-bold mb-3 font-serif" style="color: var(--org-primary); font-size: 2rem;">${data.guaranteeHeadline || '60-Day Botanical Promise'}</h3>
                    <p class="text-stone-700" style="line-height: 1.8; font-size: 0.95rem;">${data.guaranteeDescription || `Your path to wellness is protected. Every bottle of ${data.productName} is covered by our 60-day satisfaction protocol. If you don't feel the difference, we will honor a full refund.`}</p>
                </div>
            </div>
        </div>
    </section>

    ${renderCustomSections('guarantee')}

    <!-- FAQ -->
    ${data.sections?.faq !== false && data.faq ? `
    <section id="faq" class="py-5 bg-[#F9F7F2] section-reveal">
        <div class="container py-lg-4">
            <div class="text-center mb-5">
                <h2 class="fw-bold font-serif mb-3" style="color: var(--org-primary); font-size: 2.3rem;">${data.faqTitle || 'Inquiries & Insights'}</h2>
            </div>
            <div class="mx-auto" style="max-width: 800px;">
                ${data.faq.map((item: any, i: number) => `
                <div class="bg-white border border-[#E6D5C3] mb-3">
                    <div class="p-4 cursor-pointer d-flex justify-content-between align-items-center" onclick="const ans = document.getElementById('faq-ans-${i}'); const icon = document.getElementById('faq-icon-${i}'); ans.classList.toggle('d-none'); icon.classList.toggle('rotate-45');">
                        <span class="fw-bold text-stone-800 text-sm font-serif">${item.question}</span>
                        <i id="faq-icon-${i}" class="fa-solid fa-plus text-[10px] text-stone-300 transition-transform"></i>
                    </div>
                    <div id="faq-ans-${i}" class="px-4 pb-4 d-none">
                        <p class="mb-0 text-stone-700 text-xs" style="line-height: 1.8;">${item.answer}</p>
                    </div>
                </div>`).join('')}
            </div>
        </div>
        <style>
            .rotate-45 { transform: rotate(45deg); }
        </style>
    </section>` : ''}

    ${renderCustomSections('faq')}

${sourcesHtml}

    <!-- Footer -->
    <footer class="py-5 text-center" style="background-color: #1e3932; color: rgba(249, 247, 242, 0.6); font-family: 'Fraunces', serif;">
        <div class="container">
            <h2 class="fw-bold mb-2 text-white" style="font-size: 1.4rem;">${data.footerHeadline || 'Botanical Wisdom'}</h2>
            <p class="mx-auto mb-4 text-xs italic" style="max-width: 600px;">${data.footer?.companyInfo}</p>
            <div class="d-flex justify-content-center flex-wrap gap-5 my-5 border-top border-bottom border-white border-opacity-10 py-4">
                ${(data.footer?.links || []).map((link: any) => `<a href="${link.href}" class="text-white text-decoration-none text-[10px] uppercase tracking-widest hover:opacity-75 transition-opacity">${link.label}</a>`).join('')}
            </div>
            <p class="text-[9px] uppercase tracking-widest">© ${new Date().getFullYear()} ${data.productName}. Heritage Botanical.</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
    ${socialProofBlock}
</body>
</html>`;
    }

    let rawHtml = htmlContent;
    let rawCss = cssContent;
    let imageIndex = 1;

    // Re-use logic for fetching images
    const imageSources = new Set<string>();
    if (data.hero?.logoImage) imageSources.add(data.hero.logoImage);
    if (data.hero?.image) imageSources.add(data.hero.image);
    if (data.hero?.badgeImage) imageSources.add(data.hero.badgeImage);
    if (data.about?.image) imageSources.add(data.about.image);
    if (data.features) data.features.forEach((f: any) => { if (f.image) imageSources.add(f.image); });
    if (data.ingredients?.items) data.ingredients.items.forEach((i: any) => { if (i.image) imageSources.add(i.image); });
    if (data.pricing) data.pricing.forEach((p: any) => { if (p.image) imageSources.add(p.image); });
    if (data.logos) data.logos.forEach((l: any) => { if (l?.src) imageSources.add(l.src); else if (typeof l === 'string') imageSources.add(l); });
    if (data.footer?.trustImage) imageSources.add(data.footer.trustImage);
    if (data.testimonials?.items) data.testimonials.items.forEach((t: any) => { if (t.image) imageSources.add(t.image); });

    if (data.research?.image) imageSources.add(data.research.image);
    if (data.seo?.ogImage) imageSources.add(data.seo.ogImage);
    if (data.seo?.twitterImage) imageSources.add(data.seo.twitterImage);
    if (data.seo?.favicon) imageSources.add(data.seo.favicon);
    if (data.socialProof?.items) data.socialProof.items.forEach((item: any) => { if (item.image) imageSources.add(item.image); });
    if (data.customSections) data.customSections.forEach((s: any) => {
        if (s.image) imageSources.add(s.image);
        if (s.cards) s.cards.forEach((c: any) => { if (c.image) imageSources.add(c.image); });
    });

    const sourcesArray = Array.from(imageSources);
    sourcesArray.sort((a, b) => b.length - a.length);

    // Inject blocks BEFORE image replacement loop so they get processed too
    rawHtml = rawHtml.replace('</body>', `${socialProofBlock}${scrollToTopBlock}${seo.footerScripts ? `\n    <!-- Footer Scripts -->\n    ${seo.footerScripts}` : ''}\n</body>`);

    for (const imgSrc of sourcesArray) {
        try {
            if (!imgSrc) continue;

            // Handle DataURLs (Base64)
            if (imgSrc.startsWith('data:')) {
                const parts = imgSrc.split(',');
                if (parts.length < 2) continue;
                const base64Data = parts[1];
                const mimeType = parts[0].split(':')[1].split(';')[0];
                let extension = mimeType.split('/')[1] || 'png';
                if (extension === 'jpeg') extension = 'jpg';

                const filename = `uploaded_image_${imageIndex}.${extension}`;

                // Convert base64 to Buffer for JSZip
                const bytes = Buffer.from(base64Data, 'base64');

                imagesFolder?.file(filename, bytes);

                const escapedSrc = imgSrc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                const regex = new RegExp(escapedSrc, "g");
                rawHtml = rawHtml.replace(regex, `images/${filename}`);
                rawCss = rawCss.replace(regex, `../images/${filename}`);
                imageIndex++;
                continue;
            }

            if (imgSrc.startsWith('blob:')) continue;

            let fetchUrl = imgSrc;
            if (imgSrc.startsWith('//')) {
                fetchUrl = 'https:' + imgSrc;
            } else if (!imgSrc.startsWith('http')) {
                const baseUrlOrigin = typeof window !== 'undefined'
                    ? window.location.origin
                    : (process.env.NEXTAUTH_URL || 'http://localhost:3000');
                const path = imgSrc.startsWith('/') ? imgSrc : '/' + imgSrc;
                fetchUrl = baseUrlOrigin + path;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(fetchUrl, { signal: controller.signal }).catch(() => null);
            clearTimeout(timeoutId);

            if (res && res.ok) {
                const blob = await res.blob();
                let extension = imgSrc.split('.').pop()?.split(/[#?]/)[0] || 'png';
                if (extension.length > 4) extension = 'png';

                let filename = imgSrc.split('/').pop()?.split(/[#?]/)[0] || `img_${imageIndex}.${extension}`;
                if (filename.length < 3) filename = `asset_${imageIndex}.${extension}`;

                imagesFolder?.file(filename, blob);

                const escapedSrc = imgSrc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                const regex = new RegExp(escapedSrc, "g");

                rawHtml = rawHtml.replace(regex, `images/${filename}`);
                rawCss = rawCss.replace(regex, `../images/${filename}`);
                imageIndex++;
            }
        } catch (e) {
            console.warn(`Failed to fetch image: ${imgSrc}`, e);
        }
    }

    cssFolder?.file("style.css", rawCss);
    zip.file("index.html", rawHtml);

    // Legal Pages - Using user-provided high-quality content
    // Legal Pages - Using user-provided content with professional defaults
    const productName = data.productName || 'this product';
    const legalPages = [
        {
            id: 'privacy-policy',
            title: 'Privacy Policy',
            content: data.legalPages?.privacyPolicy || `This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from ${productName}. We are committed to protecting your privacy and ensuring a secure experience. We collect information about your device, including your web browser, IP address, and time zone. Additionally, as you browse the site, we collect information about the individual web pages or products that you view.`
        },
        {
            id: 'disclaimer',
            title: 'Disclaimer',
            content: data.legalPages?.disclaimer || `The information provided on this website is for educational purposes only and is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this website. Results may vary from person to person.`
        },
        {
            id: 'terms-and-conditions',
            title: 'Terms & Conditions',
            content: data.legalPages?.termsAndConditions || `By accessing this website, we assume you accept these terms and conditions. Do not continue to use ${productName} if you do not agree to take all of the terms and conditions stated on this page. These terms govern your use of the site and the purchase of any products. We reserve the right to update these terms at any time without prior notice.`
        }
    ];

    // Try to extract header/footer for consistent look, or use a basic layout
    let pageHeader = '';
    let pageFooter = '';

    const headerEndIndex = rawHtml.indexOf('</header>') > -1
        ? rawHtml.indexOf('</header>') + 9
        : (rawHtml.indexOf('</nav>') > -1 ? rawHtml.indexOf('</nav>') + 6 : -1);

    const footerStartIndex = rawHtml.lastIndexOf('<footer');

    if (headerEndIndex > -1 && footerStartIndex > -1) {
        pageHeader = rawHtml.substring(0, headerEndIndex);
        pageFooter = rawHtml.substring(footerStartIndex);
        // Ensure the legal pages also have the blocks if they didn't get them from rawHtml
        if (!pageFooter.includes('purchase-proof')) {
            pageFooter = pageFooter.replace('</body>', `${socialProofBlock}${scrollToTopBlock}${seo.footerScripts ? `\n    <!-- Footer Scripts -->\n    ${seo.footerScripts}` : ''}\n</body>`);
        }
    } else {
        // Fallback to basic SEO header
        pageHeader = `<!DOCTYPE html><html lang="en"><head>${seoBlock}<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"></head><body>`;
        pageFooter = `\n        ${socialProofBlock}\n${scrollToTopBlock}\n        </body></html>`;
    }

    for (const page of legalPages) {
        const markdownStyles = `
            <style>
                .markdown-content h1, .markdown-content h2, .markdown-content h3 { margin-top: 1.5rem; margin-bottom: 1rem; font-weight: 700; color: #1a202c; }
                .markdown-content p { margin-bottom: 1rem; }
                .markdown-content ul, .markdown-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
                .markdown-content li { margin-bottom: 0.5rem; }
                .markdown-content strong { color: #1a202c; }
                .markdown-content blockquote { border-left: 4px solid #e2e8f0; padding-left: 1rem; color: #718096; font-style: italic; margin: 1.5rem 0; }
            </style>    
        `;
        const bodyContent = `
            ${markdownStyles}
            <main class="container py-5" style="min-height: 70vh;">
                <div class="p-4 p-md-5 bg-white shadow-sm border" style="border-radius: 0;">
                    <h1 class="fw-bold mb-5">${page.title}</h1>
                    <div class="text-secondary markdown-content" style="line-height: 1.8; font-size: 1.1rem; text-align: justify;">
${await marked.parse(page.content || '')}
                    </div>
                    <div class="mt-5 pt-4 border-top">
                        <a href="index.html" class="btn btn-outline-dark px-4 py-2 fw-bold uppercase" style="border-radius: 0; font-size: 12px; letter-spacing: 1px;">← Back to Home</a>
                    </div>
                </div>
            </main>`;

        const fullHtml = pageHeader + bodyContent + pageFooter;
        zip.file(`${page.id}.html`, fullHtml.replace(/href="#"/g, 'href="index.html"'));
    }

    return await zip.generateAsync({ type: "blob" });
}
