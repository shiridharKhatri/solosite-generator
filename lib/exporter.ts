import JSZip from 'jszip';

export async function generateProjectZip(data: any) {
    const zip = new JSZip();
    const imagesFolder = zip.folder("images");
    const cssFolder = zip.folder("css");

    // Sitemap & Robots
    const baseUrl = data.seo?.canonicalUrl || 'https://example.com';
    const legalPageLinks = [
        'privacy-policy.html',
        'disclaimer.html',
        'terms-and-conditions.html'
    ].filter(id => {
        const key = id.replace('.html', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase()) as keyof typeof data.legalPages;
        return !!data.legalPages?.[key];
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/index.html</loc><priority>1.0</priority></url>
${legalPageLinks.map(link => `  <url><loc>${baseUrl}/${link}</loc><priority>0.5</priority></url>`).join('\n')}
</urlset>`;
    zip.file("sitemap.xml", sitemap);
    zip.file("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml`);

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
        <img id="proof-img" src="${data.socialProof?.items[0]?.image || data.hero.image}" alt="Product">
      </div>
      <div class="proof-content">
        <div class="proof-stars">
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
      .purchase-proof { position: fixed; bottom: 30px; left: 30px; background: #ffffff; border-radius: 12px; padding: 16px; border: 1px solid #eee; font-size: 13px; max-width: 320px; z-index: 9999; transform: translateX(-150%); transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); display: flex; align-items: center; gap: 15px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); color: #333; line-height: 1.4; font-family: sans-serif; }
      .purchase-proof.active { transform: translateX(0); }
      .proof-image { width: 60px; height: 60px; flex-shrink: 0; border-radius: 10px; overflow: hidden; background: #f8f9fa; border: 1px solid #f0f0f0; }
      .proof-image img { width: 100%; height: 100%; object-fit: contain; }
      .proof-stars { color: #fbbf24; font-size: 10px; margin-bottom: 4px; }
      .proof-time { font-size: 10px; color: #999; margin-top: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
      @media (max-width: 576px) { .purchase-proof { display: none !important; } }
    </style>
    <script>
      (function() {
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
    ` : '';

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
    `;

    if (layoutStyle === 'default') {
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
.btn-custom-pill { background-color: ${secondaryColor}; color: black; font-weight: 700; border-radius: 9999px; border: 1px solid rgba(0,0,0,0.05); padding: 0.75rem 2rem; transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; text-decoration: none; }
.btn-custom-pill:hover { opacity: 0.9; transform: translateY(-2px); color: black; }
.about-description { text-align: justify; }
@media (max-width: 992px) { 
    .title-scale { font-size: 1.6rem !important; } 
    .about-description { text-align: center !important; }
}
@media (max-width: 768px) { .bgbadge { max-width: 100%; } .py-5 { padding-top: 3rem !important; padding-bottom: 3rem !important; } }
`;
        htmlContent = `<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
${seoBlock}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">
    <link rel="stylesheet" href="css/style.css" />
    <style>
      .sectioncolor { background-color: ${primaryColor}; color: white; padding: 3rem 0; }
      .sectioncolor1 { background-color: #f8f9fa; padding: 5rem 0; }
      .ingredient-card { background: white; border-radius: 2.5rem; padding: 2rem; height: 100%; transition: all 0.3s; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; border: none !important; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
      .ingredient-card:hover { transform: translateY(-8px); box-shadow: 0 15px 45px rgba(0,0,0,0.1); }
      .ingredient-img-frame { width: 160px; height: 160px; border-radius: 50%; border: 10px solid #fcfcfc; overflow: hidden; background: #f9fafb; margin-bottom: 1.5rem; outline: 2px solid ${secondaryColor}; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }
      .pricing-card { border-radius: 2rem; transition: all 0.3s; }
      .pricing-card.primary { border: 4px solid ${secondaryColor} !important; transform: scale(1.05); z-index: 10; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
      .testimonial-card { border-radius: 2rem; border: none; box-shadow: 0 10px 30px rgba(0,0,0,0.05); padding: 2rem; transition: all 0.3s; }
      .testimonial-card:hover { transform: translateY(-5px); }
      .avatar-frame { width: 64px; height: 64px; border-radius: 50%; overflow: hidden; border: 2px solid ${secondaryColor}; }
      .accordion-button:not(.collapsed) { background-color: ${primaryColor}10; color: ${primaryColor}; }
      .accordion-button:focus { box-shadow: none; }
      .btn-custom-pill { box-shadow: 0 4px 15px rgba(0,0,0,0.1); transition: all 0.3s; }
    </style>
</head>
<body>
    <header>
        <nav class="navbar navbar-expand-lg sticky-top border-bottom bg-white py-2">
            <div class="container px-3 d-flex justify-content-between align-items-center mx-auto">
                <a class="navbar-brand d-flex align-items-center gap-2 text-decoration-none" href="index.html">
                    ${data.hero?.logoImage ? `<img src="${data.hero.logoImage}" style="height: 40px; width: auto;" alt="Logo" />` : ''}
                    <span class="fs-2 fw-bold logo text-capitalize">${data.productName}</span>
                </a>
                <div class="d-flex align-items-center gap-2 d-lg-none ms-auto">
                    <a href="${data.hero?.buttonHref || '#'}" class="btn-custom-pill py-2 px-3 fs-6 text-decoration-none" style="background-color: ${secondaryColor} !important; color: #000 !important; border-radius: 50px; font-weight: 700; font-family: 'Outfit', sans-serif;">${data.hero?.buttonText || 'Order Now'}</a>
                    <button class="navbar-toggler border-0 shadow-none px-1 ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <i class="fa-solid fa-bars fs-3 text-dark"></i>
                    </button>
                </div>

                <div class="collapse navbar-collapse" id="navbarNav">
                    <div class="navbar-nav ms-auto align-items-center gap-4 mt-3 mt-lg-0 pb-3 pb-lg-0 text-center">
                        ${(data.navbar?.links || []).map((link: any) => `<a href="${link.href}" class="nav-link text-dark fs-5 fw-bold text-decoration-none w-100">${link.label}</a>`).join('')}
                        <a href="${data.hero?.buttonHref || '#'}" class="btn-custom-pill text-decoration-none d-none d-lg-inline-block" style="background-color: ${secondaryColor} !important; color: #000 !important; padding: 0.6rem 1.5rem; border-radius: 50px; font-weight: 700; font-family: 'Outfit', sans-serif; white-space: nowrap;">${data.hero?.buttonText || 'Order Now'} <i class="${data.hero?.icon || 'fa-solid fa-arrow-right'}"></i></a>
                    </div>
                </div>
            </div>
        </nav>
    </header>

    <section class="container-fluid py-4 py-lg-5 mb-3 bg-white">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-12 col-lg-5 text-center mb-3 mb-lg-0">
                    <div class="position-relative d-inline-block mb-3">
                        <img src="${data.hero?.image || ''}" class="img-fluid mx-auto d-block" style="max-height: 50vh; object-fit: contain;" />
                        <div class="position-absolute top-0 end-0" style="width: 80px; transform: translate(25%, -25%);">
                            <img src="${data.hero?.badgeImage || ''}" class="img-fluid" />
                        </div>
                    </div>
                    <div class="d-flex justify-content-center flex-wrap gap-2 mt-4 pt-2">
                        ${(data.logos || []).filter((l: string) => l && l.trim() !== '').map((logo: string) => `<div style="width: 65px; height: 65px;"><img src="${logo}" class="img-fluid" /></div>`).join('')}
                    </div>
                </div>
                <div class="col-12 col-lg-7 px-3 px-lg-5 text-center text-lg-start pt-3 pt-lg-4">
                    <h1 class="fw-bold mb-3" style="font-size: clamp(1.5rem, 4vw, 2.75rem); line-height: 1.15;">${data.hero?.title}</h1>
                    <p class="fs-6 mt-2 fw-medium text-dark opacity-75 mx-auto mx-lg-0" style="line-height: 1.7; max-width: 600px; white-space: pre-line; text-align: justify;">${data.hero?.subtitle}</p>
                    <div class="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start mt-4">
                        <a href="${data.hero?.buttonHref}" class="btn-custom-pill px-5 py-2 fs-6 text-decoration-none" style="min-width: 200px; background-color: ${secondaryColor} !important; color: #000 !important; border-radius: 50px; font-weight: 700;"><span>${data.hero?.buttonText}</span> <i class="${data.hero?.icon || 'fa-solid fa-cart-shopping'}"></i></a>
                        <a href="${data.hero?.secondaryButtonHref || '#'}" class="btn-custom-pill px-5 py-2 fs-6 text-decoration-none secondary-btn-export" style="background-color: transparent !important; border: 2px solid #ddd !important; color: #333 !important; min-width: 200px; border-radius: 50px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 10px;"><span>${data.hero?.secondaryButtonText || 'Learn More'}</span><i class="${data.hero?.secondaryIcon || 'fa-solid fa-arrow-right'}"></i></a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features -->
    <section id="features" class="container-fluid text-center sectioncolor"><h2 class="text-center py-4 fw-bold text-white mb-0" style="font-size: clamp(1.8rem, 5vw, 2.5rem);">${data.featuresTitle || "Key Benefits"}</h2></section>
    <section class="container-fluid py-5 sectioncolor1">
        <div class="container mx-auto">
            <div class="row justify-content-center g-4">
                ${(data.features || []).map((f: any) => `
                <div class="col-12 col-sm-6 col-md-4 col-lg-3"><div class="bgbadge text-center h-100"><img src="${f.image}" class="img-fluid mb-4" style="height: 120px; object-fit: contain;" /><h3 class="fw-bold fs-4 mb-3">${f.title}</h3><p class="fs-5 text-muted">${f.description}</p></div></div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- About -->
    <section id="about" class="container-fluid text-center sectioncolor"><h2 class="text-center py-4 fw-bold text-white mb-0" style="font-size: clamp(1.8rem, 5vw, 2.5rem);">${data.about?.title || "Understanding the Formula"}</h2></section>
    <section class="container-fluid py-4 sectioncolor1 border-bottom">
        <div class="container">
            <div class="clearfix">
                <!-- Image Section - Floated Right for Newspaper Style -->
                <div class="float-lg-end ms-lg-5 mb-4 mb-lg-1 col-12 col-lg-5 px-0 text-center">
                    <div class="d-inline-block p-3 bg-white rounded-3 shadow-md border border-light w-100">
                        <img src="${data.about?.image}" class="img-fluid rounded w-100" style="max-height: 380px; object-fit: contain;" />
                        <div class="mt-2" style="font-size: 9px; font-weight: bold; color: #999; text-transform: uppercase; letter-spacing: 0.2em; border-top: 1px solid #eee; pt-2;">Editorial: Clinical Formula Composition</div>
                    </div>
                </div>
                <div class="fs-5 text-muted about-description" style="line-height: 1.7; white-space: pre-line; text-align: justify; color: #444 !important;">${data.about?.description}</div>
            </div>
        </div>
    </section>

    <!-- Benefits -->
    <section id="benefits" class="container-fluid text-center sectioncolor"><h2 class="text-center py-4 fw-bold text-white mb-0" style="font-size: clamp(1.8rem, 5vw, 2.5rem);">${data.benefits?.title || "Powerful Advantages"}</h2></section>
    <section class="container-fluid py-5 sectioncolor1">
        <div class="container">
            <p class="fs-5 text-center mb-5  mx-auto text-muted" style="max-width: 896px;">${data.benefits?.description || ''}</p>
            <div class="row g-4 justify-content-center">
                ${(data.benefits?.items || []).map((b: any) => `
                <div class="col-12 col-lg-10"><div class="card h-100 border-0 p-4 bg-white shadow-sm" style="border-radius: 12px;"><h3 class="fw-bold fs-4 mb-2">${b.title}</h3><p class="fs-5 text-muted mb-0">${b.description}</p></div></div>
                `).join('')}
            </div>
        </div>
    </section>
 
    ${data.research ? `
    <section id="research" class="container-fluid text-center sectioncolor"><h2 class="text-center py-4 fw-bold text-white mb-0" style="font-size: clamp(1.8rem, 5vw, 2.5rem);">${data.research.title}</h2></section>
    <section class="container-fluid py-5 sectioncolor1 border-bottom">
        <div class="container">
            <div class="row align-items-center g-5">
                <div class="col-lg-6 text-center text-lg-start">
                    <h3 class="fw-bold mb-3 fs-2">${data.research.subtitle}</h3>
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
                <div class="col-lg-6">
                    <div class="p-3 bg-white border rounded shadow-sm">
                        <img src="${data.research.image}" class="img-fluid rounded w-100" style="max-height: 400px; object-fit: contain;" />
                    </div>
                </div>
            </div>
        </div>
    </section>` : ''}

    ${data.gallery ? `
    <section id="gallery" class="container-fluid text-center sectioncolor"><h2 class="text-center py-4 fw-bold text-white mb-0" style="font-size: clamp(1.8rem, 5vw, 2.5rem);">${data.gallery.title}</h2></section>
    <section class="container-fluid py-5 sectioncolor1 border-bottom">
        <div class="container">
            <p class="fs-5 text-center mb-5 text-muted mx-auto" style="max-width: 700px;">${data.gallery.subtitle}</p>
            <div class="row g-3">
                ${data.gallery.images.map((img: any) => `
                <div class="col-6 col-md-4">
                  <div class="p-2 border bg-light shadow-sm" style="aspect-ratio: 16/9;">
                    <img src="${img}" class="w-100 h-100" style="object-fit: cover; max-height: 200px;" />
                  </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    <!-- Money Back -->
    <section class="container-fluid text-center sectioncolor"><h2 class="text-center py-4 fw-bold text-white mb-0" style="font-size: clamp(1.8rem, 5vw, 2.5rem);">${data.guaranteeTitle || "Verified Quality"}</h2></section>
    <section class="container-fluid py-5 bg-white">
        <div class="container border p-4 p-lg-5 mx-auto" style="border-radius: 12px; background: #fff;">
            <div class="row align-items-center g-5">
                <div class="col-lg-4 text-center">
                    <img src="${data.footer?.trustImage || 'https://placehold.co/300x300?text=Guarantee'}" class="img-fluid mb-3 mx-auto" style="max-width: 300px;" />
                    <p class="fs-6 fw-semibold text-success mt-2">${data.guaranteeSubtitle || "Zero Risk • Complete Satisfaction Promise"}</p>
                </div>
                <div class="col-lg-8 text-center text-lg-start">
                    <h3 class="fs-2 fw-bold mb-3">${data.guaranteeHeadline || "Full 60-Day Refund Assurance"}</h3>
                    <p class="fs-5 text-gray-700 " style="line-height: 1.6;">${data.guaranteeDescription || `Your happiness is our highest priority. Every order of ${data.productName} comes protected by a comprehensive 60-day satisfaction promise. If you are not completely satisfied with the results, simply contact our support team for a full refund.`}</p>
                    <a href="${data.hero?.buttonHref || '#'}" class="btn-custom-pill mt-4 px-5 py-3 fs-5">Grab Your Risk-Free Package <i class="fa-solid fa-cart-arrow-down"></i></a>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing -->
    <section id="pricing" class="container-fluid text-center sectioncolor"><h2 class="text-center py-4 fw-bold text-white mb-0" style="font-size: clamp(1.8rem, 5vw, 2.5rem);">${data.pricingTitle || "Select Your Dynamic Package"}</h2></section>
    <section class="container-fluid py-5 bg-light">
        <div class="container"><div class="row g-4 justify-content-center">
            ${(data.pricing || []).map((plan: any) => `
            <div class="col-lg-4 col-md-6 mb-4"><div class="card h-100 p-4 text-center bg-white position-relative" style="border-radius: 2rem; border: ${plan.isPrimary ? '2px solid ' + secondaryColor : '1px solid #efefef'}; ${plan.isPrimary ? 'transform: scale(1.04); z-index: 10;' : ''}">
                ${plan.isPrimary ? `<div class="position-absolute top-0 start-50 translate-middle px-4 py-1 rounded-md fw-bold text-uppercase" style="background-color: ${secondaryColor}; color: #000; font-size: 10px; white-space: nowrap;">Best Value Bundle</div>` : ''}
                <h3 class="fs-4 fw-bold mb-3 text-uppercase">${plan.title}</h3>
                <div class="position-relative mx-auto mb-3" style="width: 160px;">
                    <div class="position-absolute top-0 end-0" style="z-index: 2; transform: translate(10%, -10%);">
                        <div style="position: relative;">
                            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.2); transform: translate(3px, 3px);"></div>
                            <div style="position: relative; background: #000; color: #fff; padding: 4px 8px; font-weight: 900; font-size: 11px; border: 1px solid #fff;">${plan.multiplier || 'X1'}</div>
                        </div>
                    </div>
                    <img src="${plan.image}" class="mx-auto" style="height: 160px; object-fit: contain;" />
                </div>
                <div class="d-flex align-items-baseline justify-content-center gap-1 mb-3">
                    <span class="fs-2 fw-bold" style="color: ${primaryColor};">${plan.price}</span>
                    <span class="fs-6 text-muted">/ bottle</span>
                </div>
                <div class="bg-light rounded-4 p-3 mb-4 mx-auto border" style="max-width: 280px;"><ul class="list-unstyled mb-0 text-start d-inline-block">${plan.features.map((f: string) => `<li class="mb-2 small fw-medium"><i class="fa-solid fa-check-circle me-2" style="color: ${primaryColor};"></i>${f}</li>`).join('')}</ul></div>
                <a href="${plan.buttonHref}" class="btn-custom-pill w-100 py-2 fs-6 fw-bold" style="background-color: ${plan.isPrimary ? secondaryColor : '#333'}; color: ${plan.isPrimary ? '#000' : '#fff'}; border: none;">${plan.buttonText}</a>
                <div class="mt-3 d-flex align-items-center justify-content-center gap-1 text-muted fw-bold" style="font-size: 10px;"><i class="fa-solid fa-lock"></i><span>60-DAY MONEY-BACK GUARANTEE</span></div>
            </div></div>
            `).join('')}
        </div></div>
    </section>

    <!-- Ingredients -->
    <section id="ingredients" class="container-fluid text-center sectioncolor"><h2 class="text-center py-4 fw-bold text-white mb-0" style="font-size: clamp(1.8rem, 5vw, 2.5rem);">${data.ingredients?.title || "Key Ingredients"}</h2></section>
    <section class="container-fluid py-5 sectioncolor1">
        <div class="container">
            <div class="row g-4 justify-content-center">
                ${(data.ingredients?.items || []).map((item: any) => `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="ingredient-card shadow-sm border-0">
                        <div class="ingredient-img-frame mx-auto">
                            <img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <h3 class="fw-bold fs-4 mb-2 text-dark">${item.title}</h3>
                        <p class="fs-6 text-muted mb-0 " style="line-height: 1.6;">${item.description}</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Testimonials -->
    ${data.testimonials ? `
    <section class="container py-5 bg-white">
        <div class="container py-lg-5">
            <div class="text-center mb-5">
                <h2 class="fs-1 fw-bold mb-3">${data.testimonials.title}</h2>
                <p class="fs-5 text-muted mx-auto" style="max-width: 700px;">${data.testimonials.subtitle || ''}</p>
            </div>
            <div class="row g-4 justify-content-center">
                ${data.testimonials.items.map((item: any) => `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="testimonial-card bg-white shadow-sm h-100 p-4 border rounded-0">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="avatar-frame overflow-hidden" style="width: 48px; height: 48px; border-radius: 50%;">
                                <img src="${item.image || 'https://i.pravatar.cc/150'}" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <div>
                                <h4 class="fw-bold mb-0 text-dark fs-6">${item.name}</h4>
                                <span class="text-muted small">${item.role || 'Verified Buyer'}</span>
                            </div>
                        </div>
                        <div class="mb-3 text-warning">
                            ${[...Array(5)].map((_, idx) => `<i class="fa-solid fa-star ${idx < (item.rating || 5) ? '' : 'opacity-25'}"></i>`).join('')}
                        </div>
                        <p class="fs-6 text-dark  font-italic italic" style="line-height: 1.6;">"${item.content || ''}"</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    <!-- FAQ -->
    <section class="container-fluid text-center sectioncolor" style="position: relative; z-index: 20;"><h2 class="text-center py-4 fw-bold text-white mb-0" style="font-size: clamp(1.8rem, 5vw, 2.5rem);">${data.faqTitle || "Frequently Asked Questions"}</h2></section>
    <section class="container-fluid py-5 bg-white" style="margin-top: -1rem; position: relative; z-index: 10;">
        <div class="container mx-auto" style="max-width: 900px;"><div class="accordion accordion-flush" id="faqAccordion">
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
        </div></div>
    </section>

    <!-- Footer -->
    <footer class="navcolor text-white py-5 text-center">
        <div class="container mx-auto px-4"><h2 class="fw-bold fs-1 mb-4">${data.footerHeadline || "Questions?"}</h2><p class="fs-5 fw-medium mb-5  mx-auto  opacity-75" style="line-height: 1.6;" style="max-width: 1024px;">${data.footer?.companyInfo}</p><hr class="my-5 opacity-25" /><ul class="list-inline fw-semibold fs-5 mb-5">${(data.footer?.links || []).map((link: any) => `<li class="list-inline-item mx-3"><a href="${link.href}" class="text-white text-decoration-none">${link.label}</a></li>`).join('')}</ul><p class="fs-6 opacity-75">© ${new Date().getFullYear()} ${data.productName} All Rights Reserved.</p></div>
    </footer>
    
    <script>
        // Simple mobile menu toggle if needed
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Site loaded');
        });
    </script>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
    ${socialProofBlock}
</body>
</html>`;
    }
    else if (layoutStyle === 'modern') {
        cssContent = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
body { font-family: 'Inter', sans-serif; background-color: #0a0a0a; color: #e0e0e0; overflow-x: hidden; margin: 0; padding: 0; }
h1, h2, h3, h4, h5, h6, .logo { font-family: 'Space Grotesk', sans-serif !important; }
.glass-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); transition: all 0.4s ease; }
.gradient-text { background: linear-gradient(135deg, ${secondaryColor}, #fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.modern-btn { padding: 0.85rem 2.5rem; border-radius: 999px; font-weight: 700; font-size: 0.9rem; border: none; transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; cursor: pointer; }
.modern-btn-primary { background: ${secondaryColor}; color: ${primaryColor}; }
.modern-btn-primary:hover { opacity: 0.85; transform: translateY(-2px); color: ${primaryColor}; }
.modern-btn-outline { background: transparent; border: 2px solid rgba(255,255,255,0.2); color: #fff; }
.modern-btn-outline:hover { border-color: ${secondaryColor}; color: ${secondaryColor}; }
.section-dark { background: #0a0a0a; }
.section-darker { background: #050505; }
.section-accent { background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd); }
.accordion-button { background: transparent !important; color: white !important; box-shadow: none !important; }
.accordion-button:not(.collapsed) { background: rgba(255,255,255,0.05) !important; color: ${secondaryColor} !important; }
.accordion-button::after { filter: invert(1); }
.accordion-item { background: transparent !important; border: 1px solid rgba(255,255,255,0.1) !important; }
.nav-link { transition: color 0.3s ease; }
.nav-link:hover { color: ${secondaryColor} !important; }
@media (max-width: 1200px) { .container { max-width: 95% !important; } }
@media (max-width: 992px) {
    .modern-btn { padding: 0.75rem 2rem; font-size: 0.85rem; }
    h1 { font-size: 2.8rem !important; }
}
@media (max-width: 768px) {
    .section-dark, .section-darker { padding-top: 4rem !important; padding-bottom: 4rem !important; }
    h1 { font-size: 2.2rem !important; }
    h2 { font-size: 1.8rem !important; }
    .modern-btn { width: 100%; justify-content: center; }
    .glass-card { border-radius: 16px; padding: 1.5rem !important; }
    .navbar { padding-top: 1rem !important; padding-bottom: 1rem !important; }
    section[style*="min-height: 80vh"] { min-height: auto !important; padding-top: 5rem !important; }
    div[style*="transform: scale(1.03)"] { transform: none !important; }
}
@media (max-width: 576px) {
    h1 { font-size: 1.6rem !important; letter-spacing: -0.01em !important; }
    .gradient-text { display: block; }
}
`;
        htmlContent = `<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
${seoBlock}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">
    <link rel="stylesheet" href="css/style.css" />
</head>
<body>
    <header>
    <nav class="navbar navbar-expand-lg sticky-top py-3" style="background: rgba(10,10,10,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05);">
        <div class="container d-flex justify-content-between align-items-center">
            <a class="navbar-brand d-flex align-items-center gap-2 text-decoration-none" href="index.html">
                ${data.hero?.logoImage ? `<img src="${data.hero.logoImage}" style="height: 36px; width: auto;" alt="Logo" />` : ''}
                <span class="fs-4 fw-bold logo gradient-text">${data.productName}</span>
            </a>
        <div class="d-flex align-items-center gap-2 d-lg-none ms-auto">
            <a href="${data.hero?.buttonHref || '#'}" class="modern-btn modern-btn-primary py-2 px-3" style="font-size: 0.8rem; width: auto; min-width: auto; padding: 0.5rem 1rem;">Shop Now</a>
            <button class="navbar-toggler border-0 shadow-none px-2 ms-1" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavModern">
                <i class="fa-solid fa-bars fs-3 text-white"></i>
            </button>
        </div>
        <div class="collapse navbar-collapse" id="navbarNavModern">
            <div class="navbar-nav ms-auto align-items-center gap-4 mt-3 mt-lg-0 pb-3 pb-lg-0 text-center bg-lg-transparent rounded p-3 p-lg-0" style="background: rgba(255,255,255,0.05); backdrop-filter: blur(10px);">
                ${(data.navbar?.links || []).map((link: any) => `<a href="${link.href}" class="nav-link fw-medium p-0 text-white text-decoration-none w-100" style="font-size: 0.95rem;">${link.label}</a>`).join('')}
                <a href="${data.hero?.buttonHref || '#'}" class="modern-btn modern-btn-primary d-none d-lg-inline-flex text-nowrap" style="width: auto; white-space: nowrap;">${data.hero?.buttonText || 'Shop Now'} <i class="${data.hero?.icon || 'fa-solid fa-arrow-right'}"></i></a>
            </div>
        </div>
    </div>
</nav>
</header>

    <section class="section-dark py-5" style="min-height: 80vh; display: flex; align-items: center;">
        <div class="container">
            <div class="row align-items-center g-5">
                <div class="col-12 col-lg-7 text-center text-lg-start">
                    <div class="mb-3">
                        ${data.hero?.badgeText ? `
                        <span class="px-4 py-1.5 rounded-md text-uppercase tracking-widest fw-bold" style="background: ${secondaryColor}20; color: ${secondaryColor}; border: 1px solid ${secondaryColor}40; font-size: 11px;">✦ ${data.hero.badgeText}</span>
                        ` : `<span class="px-4 py-1.5 rounded-md text-uppercase tracking-widest fw-bold" style="background: ${secondaryColor}20; color: ${secondaryColor}; border: 1px solid ${secondaryColor}40; font-size: 11px;">✦ Premium Support Formula</span>`}
                    </div>
                    <h1 class="fw-bold mb-4 gradient-text" style="font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.1;">${data.hero?.title}</h1>
                    <p class="mb-5 mx-auto mx-lg-0 text-white-50" style="line-height: 1.8; max-width: 550px; font-size: 0.95rem; white-space: pre-line;">${data.hero?.subtitle}</p>
                    <div class="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start mt-4">
                        <a href="${data.hero?.buttonHref}" class="modern-btn modern-btn-primary">${data.hero?.buttonText} <i class="${data.hero?.icon || 'fa-solid fa-cart-shopping'}"></i></a>
                        ${(data.hero?.secondaryButtonText && data.hero.secondaryButtonText.trim() !== '') ? `<a href="${data.hero?.secondaryButtonHref || '#'}" class="modern-btn modern-btn-outline">${data.hero.secondaryButtonText}</a>` : ''}
                    </div>
                    <div class="d-flex flex-wrap gap-3 mt-5 justify-content-center justify-content-lg-start" style="opacity: 0.4;">
                        ${(data.logos || []).filter((l: string) => l && l.trim() !== '').map((logo: string) => `<div style="width: 50px; height: 50px; filter: brightness(0) invert(1);"><img src="${logo}" class="img-fluid" /></div>`).join('')}
                    </div>
                </div>
                <div class="col-12 col-lg-5 text-center">
                    <div class="p-4 rounded-4" style="background: linear-gradient(135deg, ${primaryColor}40, transparent);">
                        <img src="${data.hero?.image}" class="img-fluid mx-auto d-block" style="max-height: 450px; object-fit: contain;" />
                    </div>
                </div>
            </div>
        </div>
    </section>


    ${data.ingredients?.items?.length ? `
    <section id="ingredients" class="section-dark py-5">
        <div class="container">
            <h2 class="text-center fw-bold mb-5 gradient-text" style="font-size: 2rem;">${data.ingredients.title || "Natural Ingredients"}</h2>
            <div class="row g-4 justify-content-center">
                ${data.ingredients.items.map((item: any) => `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="glass-card p-4 h-100 text-center">
                        <div class="mb-4 mx-auto rounded-circle overflow-hidden border border-white/10" style="width: 120px; height: 120px;">
                            <img src="${item.image}" class="w-100 h-100" style="object-fit: cover;" />
                        </div>
                        <h4 class="fw-bold mb-2 text-white" style="font-size: 1.1rem;">${item.title}</h4>
                        <p class="mb-0 text-white-50" style="font-size: 0.9rem; line-height: 1.6;">${item.description}</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}



    <section id="features" class="section-darker py-5">
        <div class="container">
            <h2 class="text-center fw-bold mb-2 gradient-text" style="font-size: 2rem;">${data.featuresTitle || "Key Features"}</h2>
            <p class="text-center mb-5 text-white-50" style="font-size: 0.9rem;">Science-backed ingredients. Zero compromises.</p>
            <div class="row g-4 justify-content-center">
                ${(data.features || []).map((f: any) => `
                <div class="col-12 col-sm-6 col-lg-3"><div class="glass-card p-4 h-100 text-center"><img src="${f.image}" class="img-fluid mx-auto mb-3" style="height: 80px; object-fit: contain; filter: brightness(0) invert(1); opacity: 0.7;" /><h4 class="fw-bold mb-2 text-white" style="font-size: 1rem;">${f.title}</h4><p class="mb-0 text-white-50" style="font-size: 0.85rem; line-height: 1.6;">${f.description}</p></div></div>
                `).join('')}
            </div>
        </div>
    </section>

    <section id="about" class="section-dark py-5">
        <div class="container">
            <h2 class="text-center fw-bold mb-5 gradient-text" style="font-size: 2rem;">${data.about?.title || "The Formula"}</h2>
            <div class="row align-items-center g-5">
                <div class="col-12 col-lg-5 text-center"><div class="glass-card p-4"><img src="${data.about?.image}" class="img-fluid rounded-3" style="max-height: 400px; object-fit: contain;" /></div></div>
                <div class="col-12 col-lg-7"><div class="text-white-50" style="line-height: 1.9; font-size: 0.95rem; white-space: pre-line;">${data.about?.description}</div></div>
            </div>
        </div>
    </section>

    <!-- Research -->
    ${data.research ? `
    <section class="section-darker py-5 border-top border-white/5">
        <div class="container">
            <div class="row align-items-center g-5">
                <div class="col-lg-6">
                    <h2 class="fw-bold fs-1 mb-4 gradient-text" style="font-size: 2.5rem;">${data.research.title}</h2>
                    <p class="fs-5 text-white mb-4 opacity-75">${data.research.subtitle}</p>
                    <div class="text-white-50 mb-5" style="line-height: 1.9; font-size: 0.95rem;">${data.research.description}</div>
                    <div class="row g-4">
                        ${data.research.stats.map((stat: any) => `
                        <div class="col-4">
                            <div class="fw-bold fs-2" style="color: ${secondaryColor}">${stat.value}</div>
                            <div class="text-white-50 small uppercase font-black tracking-widest" style="font-size: 10px;">${stat.label}</div>
                        </div>
                        `).join('')}
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="glass-card p-2">
                        <img src="${data.research.image}" class="img-fluid rounded-3 w-100" style="max-height: 450px; object-fit: contain;" />
                    </div>
                </div>
            </div>
        </div>
    </section>` : ''}

    ${data.benefits?.items?.length ? `
    <section id="benefits" class="section-darker py-5">
        <div class="container">
            <h2 class="text-center fw-bold mb-2 gradient-text" style="font-size: 2rem;">${data.benefits.title || "Benefits"}</h2>
            <p class="text-center mb-5 mx-auto text-white-50" style="max-width: 700px; font-size: 0.9rem;">${data.benefits.description || ''}</p>
            <div class="row g-4">
                ${data.benefits.items.map((b: any) => `
                <div class="col-12 col-md-6"><div class="glass-card p-4 h-100 d-flex align-items-start gap-3"><div class="flex-shrink-0 w-10 h-10 rounded-3 d-flex align-items-center justify-content-center" style="background: ${secondaryColor}15;"><i class="fa-solid fa-check" style="color: ${secondaryColor}; font-size: 0.8rem;"></i></div><div><h4 class="fw-bold mb-1 text-white" style="font-size: 1rem;">${b.title}</h4><p class="mb-0 text-white-50" style="font-size: 0.85rem; line-height: 1.6;">${b.description}</p></div></div></div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    ${data.testimonials ? `
    <section id="testimonials" class="section-dark py-5">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="fw-bold gradient-text mb-2" style="font-size: 2rem;">${data.testimonials.title}</h2>
                <p class="text-white-50 mx-auto" style="max-width: 700px;">${data.testimonials.subtitle || ''}</p>
            </div>
            <div class="row g-4 justify-content-center">
                ${data.testimonials.items.map((item: any) => `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="glass-card p-4 h-100">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="avatar-frame overflow-hidden" style="width: 48px; height: 48px; border-radius: 50%; border: 2px solid ${secondaryColor};">
                                <img src="${item.image || 'https://i.pravatar.cc/150'}" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <div>
                                <h4 class="fw-bold mb-0 text-white fs-6">${item.name}</h4>
                                <span class="text-white-50 small">${item.role || 'Verified Buyer'}</span>
                            </div>
                        </div>
                        <div class="mb-3" style="color: ${secondaryColor};">
                            ${[...Array(5)].map((_, idx) => `<i class="fa-solid fa-star ${idx < (item.rating || 5) ? '' : 'opacity-25'}"></i>`).join('')}
                        </div>
                        <p class="text-white-50 italic" style="font-size: 0.85rem; line-height: 1.6;">"${item.content || ''}"</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    <!-- Gallery -->
    ${data.gallery ? `
    <section class="section-darker py-5 border-top border-white/5">
        <div class="container">
            <h2 class="text-center fw-bold mb-2 gradient-text" style="font-size: 2.5rem;">${data.gallery.title}</h2>
            <p class="text-center mb-5 text-white-50" style="font-size: 1rem;">${data.gallery.subtitle}</p>
            <div class="row g-3">
                ${data.gallery.images.map((img: any) => `
                <div class="col-12 col-md-4">
                    <div class="glass-card p-1 overflow-hidden" style="aspect-ratio: 16/9;">
                        <img src="${img}" class="w-100 h-100 rounded-3" style="object-fit: cover; max-height: 200px;" />
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    <section class="py-5" style="background: linear-gradient(135deg, ${primaryColor}30, #0a0a0a);">
        <div class="container">
            <div class="glass-card p-5"><div class="row align-items-center g-5">
                <div class="col-lg-4 text-center"><img src="${data.footer?.trustImage || ''}" class="img-fluid mb-3" style="max-width: 200px;" /><p class="fw-semibold mb-0" style="color: ${secondaryColor}; font-size: 0.9rem;">${data.guaranteeSubtitle || "Zero Risk"}</p></div>
                <div class="col-lg-8"><h3 class="fw-bold mb-3 text-white" style="font-size: 1.6rem;">${data.guaranteeHeadline || "Satisfaction Guaranteed"}</h3><p class="text-white-50" style="line-height: 1.8; font-size: 0.95rem;">${data.guaranteeDescription || defaultGuaranteeDescription}</p><a href="${data.hero?.buttonHref}" class="modern-btn modern-btn-primary mt-3">Claim Your Package <i class="fa-solid fa-arrow-right"></i></a></div>
            </div></div>
        </div>
    </section>

    <section class="section-darker py-5" id="pricing">
        <div class="container">
            <h2 class="text-center fw-bold mb-5 gradient-text" style="font-size: 2rem;">${data.pricingTitle || "Choose Your Plan"}</h2>
            <div class="row g-4 justify-content-center">
                ${(data.pricing || []).map((plan: any) => `
                <div class="col-12 col-md-6 col-lg-4"><div class="glass-card p-4 h-100 text-center" style="${plan.isPrimary ? `border: 2px solid ${secondaryColor}; transform: scale(1.03);` : ''}">
                    ${plan.isPrimary ? `<div class="mb-3"><span class="px-3 py-1 rounded-md text-uppercase fw-bold" style="background: ${secondaryColor}; color: ${primaryColor}; font-size: 10px;">Best Value</span></div>` : ''}
                    <h4 class="fw-bold mb-2 text-uppercase text-white" style="font-size: 0.95rem; letter-spacing: 2px;">${plan.title}</h4>
                    <img src="${plan.image}" class="img-fluid mx-auto my-3" style="height: 140px; object-fit: contain;" />
                    <div class="fw-bold mb-3" style="color: ${secondaryColor}; font-size: 2rem;">${plan.price}</div>
                    <div class="mb-4">${plan.features.map((f: string) => `<div class="mb-2 d-flex align-items-center gap-2 justify-content-center text-white-50" style="font-size: 0.85rem;"><i class="fa-solid fa-check-circle" style="color: ${secondaryColor}; font-size: 0.7rem;"></i><span>${f}</span></div>`).join('')}</div>
                    <a href="${plan.buttonHref}" class="modern-btn w-100 ${plan.isPrimary ? 'modern-btn-primary' : 'modern-btn-outline'}" style="justify-content: center;">${plan.buttonText}</a>
                </div></div>
                `).join('')}
            </div>
        </div>
    </section>


    ${data.faq?.length ? `
    <section id="faq" class="section-dark py-5">
        <div class="container" style="max-width: 800px;">
            <h2 class="text-center fw-bold mb-5 gradient-text" style="font-size: 2rem;">${data.faqTitle || "FAQ"}</h2>
            <div class="accordion" id="faqAccordionModern">
                ${data.faq.map((item: any, i: number) => `
                <div class="accordion-item mb-3 glass-card border-0">
                    <h2 class="accordion-header" id="heading${i}">
                        <button class="accordion-button collapsed fw-bold p-4" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" style="color: #fff; font-size: 0.95rem;">
                            ${item.question}
                        </button>
                    </h2>
                    <div id="collapse${i}" class="accordion-collapse collapse" data-bs-parent="#faqAccordionModern">
                        <div class="accordion-body px-4 pb-4 pt-0 text-white-50" style="font-size: 0.9rem; line-height: 1.7;">
                            ${item.answer}
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    <footer class="py-5 text-center" style="background: #050505; border-top: 1px solid rgba(255,255,255,0.05);">
        <div class="container">
            <h2 class="fw-bold gradient-text mb-3" style="font-size: 1.5rem;">${data.footerHeadline || "Questions?"}</h2>
            <p class="mx-auto mb-4 text-white-50" style="max-width: 700px; font-size: 0.9rem; line-height: 1.7;">${data.footer?.companyInfo}</p>
            <div class="d-flex justify-content-center flex-wrap gap-4 mb-4">
                ${(data.footer?.links || []).map((l: any) => `<a href="${l.href}" class="text-decoration-none text-white-50" style="font-size: 0.85rem;">${l.label}</a>`).join('')}
            </div>
            <p class="text-white-50 opacity-25" style="font-size: 0.75rem;">© ${new Date().getFullYear()} ${data.productName}</p>
        </div>
    </footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
    ${socialProofBlock}
</body>
</html>`;
    }
    else if (layoutStyle === 'clinical') {
        cssContent = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
body { font-family: 'Roboto', sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
h1, h2, h3, h4, .logo { font-family: 'IBM Plex Sans', sans-serif !important; }
.clinical-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); transition: transform 0.2s; }
.clinical-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.clinical-btn-primary { background: ${secondaryColor}; color: #ffffff; border: 1px solid ${secondaryColor}; border-radius: 6px; padding: 0.75rem 2rem; font-weight: 500; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; }
.clinical-btn-primary:hover { background: #0056b3; color: white; }
.data-label { font-family: 'IBM Plex Sans', monospace; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 0.5rem; display: block; }
.clinical-header { border-left: 4px solid ${secondaryColor}; padding-left: 1rem; }
@media (max-width: 992px) {
    h1 { font-size: 2.5rem !important; }
}
@media (max-width: 768px) {
    .py-5 { padding-top: 3rem !important; padding-bottom: 3rem !important; }
    h1 { font-size: 1.8rem !important; }
    h2 { font-size: 1.5rem !important; }
    .clinical-header { padding-left: 0.75rem; }
    .clinical-card { padding: 1rem !important; }
    .data-label { font-size: 0.65rem; }
    .p-5.bg-light.border.rounded { padding: 2rem !important; }
}
`;
        htmlContent = `<!DOCTYPE html>
<html lang="en-US">
<head>
    <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
${seoBlock}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css">
    <link rel="stylesheet" href="css/style.css" />
</head>
<body>
    <header>
    <nav class="navbar navbar-expand-lg sticky-top bg-white border-bottom py-3">
        <div class="container d-flex justify-content-between align-items-center">
            <a class="navbar-brand d-flex align-items-center gap-3 text-decoration-none" href="index.html">
                <div style="width: 32px; height: 32px; background: #eff6ff; border: 1px solid #dbeafe; display: flex; align-items: center; justify-content: center; border-radius: 4px;"><i class="fa-solid fa-plus text-primary"></i></div>
                <span class="fw-bold fs-5 logo" style="color: ${primaryColor}">${data.productName}</span>
            </a>
            <div class="d-flex align-items-center gap-2 d-lg-none ms-auto">
                <a href="${data.hero?.buttonHref}" class="clinical-btn-primary py-2 px-3 text-decoration-none" style="background: ${secondaryColor} !important; border: none; font-size: 0.8rem;">Order Now</a>
        <div class="container px-4 d-flex justify-content-between align-items-center">
            <a class="navbar-brand d-flex align-items-center gap-3 no-underline" href="index.html">
                <img src="${data.hero?.logoImage}" style="width: 40px; height: 40px; object-fit: contain;" />
                <span class="fs-5 fw-bold logo" style="color: ${primaryColor}">${data.productName}</span>
            </a>
            <div class="d-none d-lg-flex align-items-center gap-5">
                ${(data.navbar?.links || []).map((link: any) => `<a href="${link.href}" class="nav-link fw-medium text-secondary hover-dark text-sm p-0">${link.label}</a>`).join('')}
                <div class="h-6 w-px bg-light mx-2"></div>
                <a href="${data.hero?.buttonHref}" class="clinical-btn-primary py-2 px-4 text-sm rounded-0 shadow-sm">${data.hero?.buttonText}</a>
            </div>
        </div>
    </nav>

    <section class="bg-white border-bottom py-5">
        <div class="container py-lg-4">
            <div class="row align-items-center g-5">
                <div class="col-12 col-lg-6 text-center text-lg-start pe-lg-5">
                    <span class="data-label text-primary mb-3">CLINICAL PROFILE • VERIFIED</span>
                    <h1 class="fw-bold mb-4" style="color: ${primaryColor}; font-size: clamp(2rem, 4vw, 3rem); letter-spacing: -0.02em;">${data.hero?.title}</h1>
                    <div class="p-4 border rounded bg-light mb-5"><p class="mb-0 text-muted" style="line-height: 1.6; font-size: 0.95rem;">${data.hero?.subtitle}</p></div>
                    <a href="${data.hero?.buttonHref}" class="clinical-btn-primary">${data.hero?.buttonText} <i class="${data.hero?.icon || 'fa-solid fa-arrow-right'}"></i></a>
                </div>
                <div class="col-12 col-lg-6 text-center"><div class="p-5 bg-light border rounded"><img src="${data.hero?.image}" class="img-fluid" style="max-height: 350px; object-fit: contain;" /></div></div>
            </div>
            <div class="row mt-5 border-top pt-4">
                <div class="col-12">
                    <span class="data-label text-center mb-4">REGULATORY / SAFETY COMPLIANCE</span>
                    <div class="d-flex justify-content-center flex-wrap gap-5 py-4">
                        ${(data.logos || []).map((logo: string) => `<div style="width: 80px; opacity: 0.5;"><img src="${logo}" class="img-fluid grayscale" /></div>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    </section>

    ${data.sections?.features ? `
    <section id="features" class="py-5 bg-light border-bottom">
        <div class="container py-lg-4">
            <span class="data-label text-center mb-2 d-block">EFFICACY METRICS</span>
            <h2 class="text-center fw-bold mb-5" style="color: ${primaryColor}">${data.featuresTitle || "Core Tolerances"}</h2>
            <div class="row g-4">
                ${(data.features || []).map((f: any) => `
                <div class="col-12 col-md-6 col-lg-3"><div class="clinical-card p-4 h-100"><div class="mb-4 pb-3 border-bottom d-flex align-items-center justify-content-between"><h4 class="fw-semibold mb-0 text-dark" style="font-size: 1rem;">${f.title}</h4><img src="${f.image}" class="opacity-25 grayscale" style="height: 32px;" /></div><p class="mb-0 text-muted" style="font-size: 0.85rem; line-height: 1.6;">${f.description}</p></div></div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    ${data.sections?.about ? `
    <section id="about" class="bg-white py-4 border-bottom">
        <div class="container  mx-auto" style="max-width: 1100px;">
            <div class="clinical-header mb-4"><span class="data-label">PROTOCOL SUMMARY</span><h2 class="fw-bold mb-0" style="color: ${primaryColor}; font-size: 2.3rem;">${data.about?.title || "The Formula"}</h2></div>
            <div class="clearfix">
                <div class="float-lg-start me-lg-5 mb-4 col-12 col-lg-5 px-0">
                    <div class="p-2 bg-light border rounded shadow-sm text-center">
                        <img src="${data.about?.image}" class="img-fluid rounded border border-light mx-auto" style="max-height: 380px; object-fit: contain;" />
                        <div class="mt-2 pb-1 text-center"><span class="data-label" style="font-size: 10px;">FIG 1.1: SYSTEMIC DISPERSION PROFILE</span></div>
                    </div>
                </div>
                <div class="protocol-text">
                    <div class="p-3 bg-light border-start border-2 border-secondary mb-3 d-flex gap-3 align-items-center"><i class="fa-solid fa-circle-info text-muted"></i><p class="mb-0 text-muted uppercase tracking-tight" style="font-size: 11px; font-family: monospace;">Clinical Note: Data suggests 60-day adherence for optimal metabolic synchronization.</p></div>
                    <div class="text-muted" style="line-height: 1.7; font-size: 1.05rem; white-space: pre-line; text-align: justify; font-family: serif;">${data.about?.description}</div>
                </div>
            </div>
        </div>
    </section>` : ''}

    ${data.sections?.research && data.research ? `
    <section id="research" class="py-5 bg-light border-bottom">
        <div class="container">
            <div class="row align-items-center g-5">
                <div class="col-lg-6">
                    <div class="clinical-header mb-4"><span class="data-label">R&D ANALYSIS</span><h2 class="fw-bold mb-0">${data.research.title}</h2></div>
                    <p class="fs-5 text-muted mb-4">${data.research.subtitle}</p>
                    <p class="text-muted mb-5">${data.research.description}</p>
                    <div class="row g-4">
                        ${data.research.stats.map((stat: any) => `
                        <div class="col-4">
                            <div class="fw-bold fs-2 text-primary">${stat.value}</div>
                            <div class="data-label">${stat.label}</div>
                        </div>
                        `).join('')}
                    </div>
                </div>
                <div class="col-lg-6 text-center">
                    <div class="clinical-card p-2 shadow-sm d-inline-block"><img src="${data.research.image}" class="img-fluid rounded" style="max-height: 400px; object-fit: contain;" /></div>
                </div>
            </div>
        </div>
    </section>` : ''}

    ${data.sections?.gallery && data.gallery ? `
    <section id="gallery" class="py-5 bg-white border-bottom">
        <div class="container">
            <div class="text-center mb-5"><span class="data-label">VERIFIED PROOF</span><h2 class="fw-bold" style="color: ${primaryColor}">${data.gallery.title}</h2><p class="text-muted mx-auto" style="max-width: 600px;">${data.gallery.subtitle}</p></div>
            <div class="row g-3">
                ${data.gallery.images.map((img: any) => `
                <div class="col-6 col-md-4">
                  <div class="clinical-card p-1 shadow-sm overflow-hidden" style="aspect-ratio: 16/9;">
                    <img src="${img}" class="w-100 h-100 rounded" style="object-fit: cover; max-height: 200px;" />
                  </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    ${data.sections?.benefits ? `
    <section id="benefits" class="py-5 bg-light border-bottom">
        <div class="container">
            <div class="text-center mb-5"><span class="data-label">THERAPEUTIC EFFECTS</span><h2 class="fw-bold" style="color: ${primaryColor}">${data.benefits.title || "Clinical Benefits"}</h2></div>
            <div class="row g-4 justify-content-center">
                ${(data.benefits?.items || []).map((b: any) => `
                <div class="col-12 col-lg-10"><div class="clinical-card p-4 d-flex align-items-start gap-3"><i class="fa-solid fa-check-circle text-success mt-1"></i><div><h4 class="fw-bold mb-1 text-dark" style="font-size: 1rem;">${b.title}</h4><p class="mb-0 text-muted" style="font-size: 0.85rem; line-height: 1.6;">${b.description}</p></div></div></div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    ${data.sections?.ingredients ? `
    <section id="ingredients" class="py-5 bg-white border-bottom">
        <div class="container text-center">
            <span class="data-label">COMPOUND ANALYSIS</span>
            <h2 class="fw-bold mb-5" style="color: ${primaryColor}">${data.ingredients?.title || "Active Constituents"}</h2>
            <div class="row g-3 justify-content-center">
                ${(data.ingredients?.items || []).map((item: any) => `
                <div class="col-lg-4 col-md-6"><div class="clinical-card p-0 h-100 d-flex text-start overflow-hidden"><div class="w-25 bg-light d-flex align-items-center justify-content-center border-end p-2"><img src="${item.image}" class="w-100 rounded-circle border border-white shadow-sm" /></div><div class="w-75 p-3 d-flex flex-column justify-content-center"><h4 class="fw-bold mb-1 text-primary font-monospace" style="font-size: 0.85rem;">${item.title}</h4><p class="mb-0 text-muted" style="font-size: 0.75rem; line-height: 1.5;">${item.description}</p></div></div></div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    ${data.sections?.testimonials && data.testimonials ? `
    <section id="testimonials" class="py-5 bg-light border-bottom">
        <div class="container">
            <div class="text-center mb-5"><span class="data-label">PATIENT FEEDBACK</span><h2 class="fw-bold" style="color: ${primaryColor}">${data.testimonials.title}</h2></div>
            <div class="row g-4 justify-content-center">
                ${data.testimonials.items.map((item: any) => `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="clinical-card p-4 h-100 bg-white shadow-sm border">
                        <div class="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                            <div class="w-12 h-12 rounded bg-light border d-flex align-items-center justify-content-center overflow-hidden">
                                <img src="${item.image || 'https://i.pravatar.cc/150'}" class="w-100 h-100" style="object-fit: cover;" />
                            </div>
                            <div>
                                <h4 class="fw-bold mb-0 text-dark fs-6">${item.name}</h4>
                                <span class="data-label mb-0" style="font-size: 10px;">${item.role || 'Verified'}</span>
                            </div>
                        </div>
                        <div class="mb-2 text-warning" style="font-size: 12px;">
                            ${[...Array(5)].map((_, idx) => `<i class="fa-solid fa-star ${idx < (item.rating || 5) ? '' : 'opacity-25'}"></i>`).join('')}
                        </div>
                        <p class="mb-0 text-muted italic" style="font-size: 0.85rem; line-height: 1.6;">"${item.content || ''}"</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    <section class="py-5 bg-white" id="pricing">
        <div class="container py-lg-5">
            <div class="text-center mb-5"><span class="data-label">DISTRIBUTION TIERS</span><h2 class="fw-bold" style="color: ${primaryColor};">${data.pricingTitle || "Select Supply"}</h2></div>
            <div class="row g-4 justify-content-center  mx-auto" style="max-width: 1000px;">
                ${(data.pricing || []).map((plan: any) => `
                <div class="col-lg-4 col-md-6"><div class="clinical-card p-0 h-100 text-center d-flex flex-column ${plan.isPrimary ? 'border-primary shadow' : ''}">
                    <div class="p-3 border-bottom ${plan.isPrimary ? 'bg-primary text-white' : 'bg-white text-dark'}"><h4 class="fw-bold mb-0 text-uppercase fs-6">${plan.title}</h4></div>
                    <div class="p-4 flex-grow-1 d-flex flex-column">
                        <img src="${plan.image}" class="img-fluid mx-auto mb-4" style="height: 120px; object-fit: contain;" />
                        <div class="fw-bold mb-4 font-monospace fs-2" style="color: ${primaryColor};">${plan.price}</div>
                        <div class="text-start border-start border-2 ps-3 mb-4 flex-grow-1">${plan.features.map((f: string) => `<div class="mb-2 text-muted" style="font-size: 0.85rem;"><i class="fa-solid fa-check text-success me-2"></i>${f}</div>`).join('')}</div>
                        <a href="${plan.buttonHref}" class="clinical-btn-primary w-100 ${plan.isPrimary ? '' : 'bg-white text-dark border'}" style="justify-content: center;">${plan.buttonText}</a>
                    </div>
                </div></div>
                `).join('')}
            </div>
        </div>
    </section>

    ${data.sections?.faq && data.faq?.length ? `
    <section id="faq" class="py-5 bg-white">
        <div class="container py-lg-5  mx-auto" style="max-width: 800px;">
            <h2 class="text-center fw-bold mb-5 clinical-header d-inline-block mx-auto border-0 px-0" style="color: ${primaryColor};">${data.faqTitle || "Protocol FAQ"}</h2>
            <div class="accordion" id="faqAccordionClinical">
                ${data.faq.map((item: any, i: number) => `
                <div class="accordion-item mb-3 border rounded shadow-sm">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed fw-semibold p-4" type="button" data-bs-toggle="collapse" data-bs-target="#c_collapse${i}" style="color: ${primaryColor};">
                            ${item.question}
                        </button>
                    </h2>
                    <div id="c_collapse${i}" class="accordion-collapse collapse" data-bs-parent="#faqAccordionClinical">
                        <div class="accordion-body px-4 pb-4 pt-0 text-secondary" style="font-size: 0.95rem; line-height: 1.7;">
                            ${item.answer}
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    <footer class="bg-dark text-light py-5 font-monospace text-sm"><div class="container text-center">
        <h2 class="fw-bold mb-3 text-white fs-5">${data.footerHeadline || "End of Document"}</h2>
        <p class="mb-4 text-secondary mx-auto" style="max-width: 600px;">${data.footer?.companyInfo}</p>
        <div class="d-flex justify-content-center gap-4 mb-4 border-top border-bottom border-secondary py-3">
            ${(data.footer?.links || []).map((l: any) => `<a href="${l.href}" class="text-light text-decoration-none">${l.label}</a>`).join('')}
        </div>
        <p class="text-secondary small">© ${new Date().getFullYear()} ${data.productName}. DOC_REV_A.</p>
    </div></footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
    ${socialProofBlock}
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
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Nunito:wght@300;400;600;700&display=swap');
        body { font-family: 'Nunito', sans-serif; background-color: #FAF6ED; color: ${primaryColor}; margin: 0; padding: 0; }
        h1, h2, h3, h4, .logo { font-family: 'Lora', serif !important; }
        .organic-card { background: #ffffff; border-radius: 30px 30px 30px 0; box-shadow: 10px 10px 30px rgba(74, 51, 32, 0.05); transition: all 0.3s ease; border: 1px solid rgba(138, 121, 105, 0.1); }
        .organic-card:hover { transform: translateY(-5px); border-radius: 30px; }
        .organic-btn-primary { background: ${primaryColor}; color: #FAF6ED; border-radius: 30px; padding: 0.8rem 2.2rem; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; border: none; }
        .organic-btn-primary:hover { background: ${secondaryColor}; color: #FAF6ED; }
        .organic-blob { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
        .leaf-shape { border-radius: 50% 0 50% 50%; }
        ${customCss}
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg sticky-top py-3" style="background: rgba(250, 246, 237, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(138, 121, 105, 0.1);">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center gap-3 no-underline" href="index.html">
                <div class="leaf-shape d-flex align-items-center justify-content-center shadow-sm" style="width: 45px; height: 45px; background: ${primaryColor}; color: white;">
                    <img src="${data.hero?.logoImage}" style="width: 30px; height: 30px; object-fit: contain; filter: brightness(0) invert(1);" />
                </div>
                <span class="fs-4 fw-bold logo" style="color: ${primaryColor}">${data.productName}</span>
            </a>
            <div class="d-none d-lg-flex align-items-center gap-5">
                ${(data.navbar?.links || []).map((link: any) => `<a href="${link.href}" class="nav-link fw-bold p-0 text-decoration-none font-serif italic" style="color: ${secondaryColor}; font-size: 1rem;">${link.label}</a>`).join('')}
                <a href="${data.hero?.buttonHref}" class="organic-btn-primary shadow-sm">${data.hero?.buttonText}</a>
            </div>
        </div>
    </nav>

    <section class="py-5 overflow-hidden" style="background: #FAF6ED;">
        <div class="container pt-lg-5 pb-lg-3">
            <div class="row align-items-center flex-column-reverse flex-lg-row g-5">
                <div class="col-12 col-lg-6 text-center text-lg-start position-relative">
                    ${data.hero?.badgeText ? `
                    <span class="font-serif italic mb-3 d-block fs-5" style="color: ${secondaryColor}">${data.hero.badgeText}</span>
                    ` : `<span class="font-serif italic mb-3 d-block fs-5" style="color: ${secondaryColor}">Pure • Earth-Sourced • Balanced</span>`}
                    <h1 class="fw-bold mb-4" style="color: ${primaryColor}; font-size: clamp(2.2rem, 5vw, 3.8rem); line-height: 1.1;">${data.hero?.title}</h1>
                    <p class="mb-5 mx-auto mx-lg-0" style="color: #6A5949; line-height: 1.8; max-width: 500px; font-size: 1.05rem; white-space: pre-line;">${data.hero?.subtitle}</p>
                    <a href="${data.hero?.buttonHref}" class="organic-btn-primary">${data.hero?.buttonText} <i class="${data.hero?.icon || 'fa-solid fa-seedling'}"></i></a>
                </div>
                <div class="col-12 col-lg-6 text-center position-relative">
                    <div class="position-absolute top-50 start-50 translate-middle organic-blob" style="width: 120%; height: 120%; background: #F0EBE1; z-index: 0;"></div>
                    <div class="position-relative z-1 d-inline-block p-4">
                        <img src="${data.hero?.image}" class="img-fluid" style="max-height: 500px; object-fit: contain;" />
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="py-4 border-top border-bottom" style="background: white; border-color: #E6D5C3 !important;">
        <div class="container">
            <div class="d-flex justify-content-center flex-wrap gap-4 gap-md-5 align-items-center">
                ${(data.logos || []).map((logo: string) => `<div style="width: 70px;"><img src="${logo}" class="img-fluid" style="filter: opacity(0.7) sepia(0.5) hue-rotate(-30deg);" /></div>`).join('')}
            </div>
        </div>
    </section>

    ${data.sections?.research && data.research ? `
    <section id="research" class="py-5 bg-white border-top border-bottom" style="border-color: #FAF6ED !important;">
        <div class="container">
            <div class="row align-items-center g-5">
                <div class="col-lg-6">
                    <h2 class="fw-bold fs-1 mb-4" style="color: #2D4A22; font-size: 2.5rem;">${data.research.title}</h2>
                    <p class="fs-5 text-success mb-4 opacity-75 fw-bold italic">${data.research.subtitle}</p>
                    <div class="text-muted mb-5" style="line-height: 1.9; font-size: 1.05rem;">${data.research.description}</div>
                    <div class="row g-4 border-top pt-4">
                        ${data.research.stats.map((stat: any) => `
                        <div class="col-4">
                            <div class="fw-bold fs-1" style="color: #2D4A22;">${stat.value}</div>
                            <div class="text-muted small uppercase fw-bold">${stat.label}</div>
                        </div>
                        `).join('')}
                    </div>
                </div>
                <div class="col-lg-6 text-center">
                    <div class="p-3 d-inline-block" style="background: #FAF6ED; border-radius: 3rem;">
                        <img src="${data.research.image}" class="img-fluid" style="border-radius: 2.5rem; max-height: 420px; object-fit: contain;" />
                    </div>
                </div>
            </div>
        </div>
    </section>` : ''}

    ${data.sections?.gallery && data.gallery ? `
    <section id="gallery" class="py-5" style="background-color: #FAF6ED;">
        <div class="container">
            <div class="text-center mb-5">
                <div class="d-inline-block p-1 px-3 rounded-pill bg-success text-white small fw-bold mb-3">Community Trust</div>
                <h2 class="fw-bold mb-2" style="color: #2D4A22; font-size: 2.5rem;">${data.gallery.title}</h2>
                <p class="text-muted fs-5">${data.gallery.subtitle}</p>
            </div>
            <div class="row g-3">
                ${data.gallery.images.map((img: any) => `
                <div class="col-6 col-md-4">
                  <div class="p-1 overflow-hidden" style="background: white; border-radius: 1.5rem; aspect-ratio: 16/9;">
                    <img src="${img}" class="w-100 h-100" style="object-fit: cover; border-radius: 1.25rem; max-height: 200px;" />
                  </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    ${data.sections?.ingredients ? `
    <section id="ingredients" class="py-5" style="background: #F0EBE1;">
        <div class="container py-lg-5 text-center">
            <i class="fa-solid fa-leaf mb-3 fs-2" style="color: ${secondaryColor}"></i>
            <h2 class="fw-bold mb-3" style="color: ${primaryColor}; font-size: 2.5rem;">${data.ingredients?.title || "From the Earth"}</h2>
            <p class="mb-5 font-serif fs-5" style="color: #6A5949;">Sourced sustainably, crafted carefully.</p>
            <div class="row g-4">
                ${(data.ingredients?.items || []).map((item: any) => `
                <div class="col-lg-4 col-md-6"><div class="organic-card p-4 h-100 bg-white"><div class="mx-auto mb-4 organic-blob overflow-hidden border border-4 border-light" style="width: 130px; height: 130px;"><img src="${item.image}" class="w-100 h-100" style="object-fit: cover;" /></div><h4 class="fw-bold mb-2 font-serif" style="color: ${primaryColor}; font-size: 1.25rem;">${item.title}</h4><p class="mb-0 text-muted" style="font-size: 0.95rem; line-height: 1.6;">${item.description}</p></div></div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    ${data.sections?.about ? `
    <section id="about" class="py-5" style="background: #FAF6ED;">
        <div class="container py-lg-5">
            <div class="row align-items-center g-5">
                <div class="col-lg-5"><div class="position-relative"><div class="position-absolute top-0 start-0 w-100 h-100 organic-blob" style="background: ${secondaryColor}; transform: translate(-5%, 5%); opacity: 0.1;"></div><img src="${data.about?.image}" class="img-fluid position-relative z-1 rounded-4 shadow-sm" /></div></div>
                <div class="col-lg-7 ps-lg-5"><h2 class="fw-bold mb-4 font-serif" style="color: ${primaryColor}; font-size: 2.5rem;">${data.about?.title || "Our Roots"}</h2><div class="text-muted" style="line-height: 1.9; font-size: 1.1rem; white-space: pre-line;">${data.about?.description}</div></div>
            </div>
        </div>
    </section>` : ''}

    ${data.sections?.benefits ? `
    <section id="features" class="py-5" style="background: #F0EBE1;">
        <div class="container">
            <h2 class="text-center fw-bold mb-2 font-serif" style="color: ${primaryColor}; font-size: 2.5rem;">${data.featuresTitle || "Nature's Bounty"}</h2>
            <div class="row g-4">
                ${(data.benefits?.items || []).map((b: any) => `
                <div class="col-12 col-md-6"><div class="organic-card p-4 h-100 d-flex align-items-start gap-3 bg-white"><i class="fa-solid fa-circle-check fs-4 mt-1" style="color: ${secondaryColor}"></i><div class="text-start"><h4 class="fw-bold mb-1 font-serif" style="color: ${primaryColor}">${b.title}</h4><p class="mb-0 text-muted" style="font-size: 0.95rem; line-height: 1.6;">${b.description}</p></div></div></div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    <section id="pricing" class="py-5" style="background: #F0EBE1;">
        <div class="container py-lg-5">
            <h2 class="text-center fw-bold mb-5 font-serif" style="color: ${primaryColor}; font-size: 2.5rem;">${data.pricingTitle || "Select Your Pack"}</h2>
            <div class="row g-4 justify-content-center">
                ${(data.pricing || []).map((plan: any) => `
                <div class="col-lg-4 col-md-6"><div class="organic-card p-4 h-100 bg-white text-center d-flex flex-column ${plan.isPrimary ? 'border-primary shadow' : ''}" style="${plan.isPrimary ? 'transform: scale(1.05); z-index: 10;' : ''}">
                    ${plan.isPrimary ? `<div class="mb-3"><span class="px-3 py-1 rounded-md text-uppercase fw-bold" style="background: ${secondaryColor}; color: white; font-size: 10px;">Best Choice</span></div>` : ''}
                    <h4 class="fw-bold mb-2 font-serif text-uppercase" style="color: ${primaryColor}">${plan.title}</h4>
                    <img src="${plan.image}" class="img-fluid mx-auto my-3" style="height: 140px; object-fit: contain;" />
                    <div class="fw-bold mb-3 font-serif fs-2" style="color: ${primaryColor}">${plan.price}</div>
                    <div class="mb-4 text-start flex-grow-1">${plan.features.map((f: string) => `<div class="mb-2 d-flex align-items-start gap-2" style="color: #6A5949; font-size: 0.9rem;"><i class="fa-solid fa-check mt-1" style="color: ${secondaryColor}"></i><span>${f}</span></div>`).join('')}</div>
                    <a href="${plan.buttonHref}" class="organic-btn-primary w-100" style="justify-content: center;">${plan.buttonText}</a>
                </div></div>
                `).join('')}
            </div>
        </div>
    </section>

    <section class="py-5" style="background: #FAF6ED;">
        <div class="container py-lg-5">
            <div class="organic-card p-5 bg-white"><div class="row align-items-center g-5">
                <div class="col-lg-4 text-center"><img src="${data.footer?.trustImage || ''}" class="img-fluid mb-3" style="max-width: 220px;" /><p class="font-serif italic mb-0" style="color: ${secondaryColor}">${data.guaranteeSubtitle || "Nature's Promise"}</p></div>
                <div class="col-lg-8"><h2 class="fw-bold mb-3 font-serif" style="color: ${primaryColor}">${data.guaranteeHeadline || "Pure Satisfaction Promise"}</h2><p class="text-muted" style="line-height: 1.8; font-size: 1.05rem;">${data.guaranteeDescription || defaultGuaranteeDescription}</p><a href="${data.hero?.buttonHref}" class="organic-btn-primary mt-4">Order Now <i class="fa-solid fa-seedling"></i></a></div>
            </div></div>
        </div>
    </section>

    ${data.sections?.testimonials && data.testimonials ? `
    <section id="testimonials" class="py-5" style="background: #FAF6ED;">
        <div class="container py-lg-5 text-center">
            <i class="fa-solid fa-heart mb-3 fs-3" style="color: ${secondaryColor}"></i>
            <h2 class="fw-bold mb-3 font-serif" style="color: ${primaryColor}; font-size: 2.5rem;">${data.testimonials.title}</h2>
            <p class="mb-5 font-serif fs-5 italic" style="color: #6A5949;">Real stories from our community.</p>
            <div class="row g-4 justify-content-center">
                ${data.testimonials.items.map((item: any) => `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="organic-card p-4 h-100 bg-white text-start shadow-sm">
                        <div class="d-flex align-items-center gap-3 mb-4">
                            <div class="leaf-shape overflow-hidden" style="width: 56px; height: 56px; border: 2px solid ${secondaryColor}30; border-radius: 50% 0 50% 0;">
                                <img src="${item.image || 'https://i.pravatar.cc/150'}" class="w-100 h-100" style="object-fit: cover;" />
                            </div>
                            <div>
                                <h4 class="fw-bold mb-0 font-serif" style="color: ${primaryColor}">${item.name}</h4>
                                <span class="small italic" style="color: #8A7969">${item.role || 'Verified'}</span>
                            </div>
                        </div>
                        <div class="mb-3" style="color: ${secondaryColor}">
                            ${[...Array(5)].map((_, idx) => `<i class="fa-solid fa-star ${idx < (item.rating || 5) ? '' : 'opacity-25'}" style="font-size: 14px;"></i>`).join('')}
                        </div>
                        <p class="mb-0 italic" style="color: #6A5949; line-height: 1.7; font-size: 0.95rem;">"${item.content || ''}"</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}


    ${data.sections?.faq && data.faq?.length ? `
    <section id="faq" class="py-5" style="background: #F0EBE1;">
        <div class="container py-lg-5" style="max-width: 800px;">
            <h2 class="text-center fw-bold mb-5 font-serif" style="color: ${primaryColor}; font-size: 2.5rem;">${data.faqTitle || "Wisdom & Questions"}</h2>
            <div class="accordion" id="faqAccordionOrganic">
                ${data.faq.map((item: any, i: number) => `
                <div class="accordion-item mb-3 border-0 bg-transparent">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed fw-bold p-4 bg-white shadow-sm font-serif" type="button" data-bs-toggle="collapse" data-bs-target="#o_collapse${i}" style="color: ${primaryColor}; font-size: 1.1rem; border-radius: 0;">
                            ${item.question}
                        </button>
                    </h2>
                    <div id="o_collapse${i}" class="accordion-collapse collapse bg-white" data-bs-parent="#faqAccordionOrganic">
                        <div class="accordion-body px-4 pb-4 pt-0" style="color: #6A5949; font-size: 1rem; line-height: 1.7;">
                            ${item.answer}
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    <footer class="py-5 text-center" style="background: ${primaryColor}; color: #FAF6ED;">
        <div class="container">
            <i class="fa-solid fa-seedling fs-1 mb-4" style="color: ${secondaryColor}"></i>
            <h2 class="fw-bold mb-4 font-serif" style="font-size: 1.8rem;">${data.footerHeadline || "Back to Nature"}</h2>
            <p class="mx-auto mb-5 opacity-75" style="max-width: 600px; line-height: 1.8;">${data.footer?.companyInfo}</p>
            <div class="d-flex justify-content-center flex-wrap gap-4 mb-4 border-bottom border-top py-4" style="border-color: rgba(250, 246, 237, 0.2) !important;">
                ${(data.footer?.links || []).map((l: any) => `<a href="${l.href}" class="text-light text-decoration-none font-serif italic fs-5">${l.label}</a>`).join('')}
            </div>
            <p class="opacity-50 small">© ${new Date().getFullYear()} ${data.productName}. Cultivated with care.</p>
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
    if (data.logos) data.logos.forEach((l: string) => { if (l) imageSources.add(l); });
    if (data.footer?.trustImage) imageSources.add(data.footer.trustImage);
    if (data.testimonials?.items) data.testimonials.items.forEach((t: any) => { if (t.image) imageSources.add(t.image); });
    if (data.gallery?.images) data.gallery.images.forEach((img: string) => { if (img) imageSources.add(img); });
    if (data.research?.image) imageSources.add(data.research.image);
    if (data.seo?.ogImage) imageSources.add(data.seo.ogImage);
    if (data.seo?.twitterImage) imageSources.add(data.seo.twitterImage);
    if (data.seo?.favicon) imageSources.add(data.seo.favicon);

    const sourcesArray = Array.from(imageSources);
    sourcesArray.sort((a, b) => b.length - a.length);

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

            const res = await fetch(fetchUrl);
            if (res.ok) {
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
    rawHtml = rawHtml.replace('</body>', `${socialProofBlock}${scrollToTopBlock}</body>`);
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
            pageFooter = pageFooter.replace('</body>', `${socialProofBlock}${scrollToTopBlock}</body>`);
        }
    } else {
        // Fallback to basic SEO header
        pageHeader = `<!DOCTYPE html><html lang="en"><head>${seoBlock}<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"></head><body>`;
        pageFooter = `\n        ${socialProofBlock}\n${scrollToTopBlock}\n        </body></html>`;
    }

    for (const page of legalPages) {
        const bodyContent = `
            <main class="container py-5" style="min-height: 70vh;">
                <div class="p-4 p-md-5 bg-white shadow-sm border" style="border-radius: 0;">
                    <h1 class="fw-bold mb-5">${page.title}</h1>
                    <div class="text-secondary" style="line-height: 1.8; white-space: pre-line; font-size: 1.1rem; text-align: justify;">
${page.content}
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
