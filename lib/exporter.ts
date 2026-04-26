import JSZip from 'jszip';

export async function generateProjectZip(data: any) {
    const zip = new JSZip();
    const imagesFolder = zip.folder("images");
    const cssFolder = zip.folder("css");

    // Sitemap & Robots
    const baseUrl = data.seo?.canonicalUrl || 'https://example.com';
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/index.html</loc><priority>1.0</priority></url>
  <url><loc>${baseUrl}/privacy-policy.html</loc><priority>0.5</priority></url>
  <url><loc>${baseUrl}/disclaimer.html</loc><priority>0.5</priority></url>
  <url><loc>${baseUrl}/terms-and-conditions.html</loc><priority>0.5</priority></url>
</urlset>`;
    zip.file("sitemap.xml", sitemap);
    zip.file("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml`);

    const primaryColor = data.theme?.primary || '#2C0D67';
    const secondaryColor = data.theme?.secondary || '#fbbf24';
    const layoutStyle = data.layoutStyle || 'default';

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
.purchase-proof { position: fixed; bottom: 20px; left: 20px; background: #ffffff; border-radius: 12px; padding: 15px 18px; border: 1px solid #eee; font-size: 14px; max-width: 320px; z-index: 9999; transform: translateX(-120%); transition: transform 0.5s ease; display: flex; align-items: center; gap: 12px; }
.about-description { text-align: justify; }
@media (max-width: 992px) { 
    .title-scale { font-size: 1.6rem !important; } 
    .about-description { text-align: center !important; }
}
@media (max-width: 768px) { .bgbadge { max-width: 100%; } .py-5 { padding-top: 3rem !important; padding-bottom: 3rem !important; } }
@media (max-width: 576px) { .purchase-proof { display: none !important; } .container { padding-left: 20px !important; padding-right: 20px !important; } }
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
                <button class="navbar-toggler border-0 shadow-none px-2 ms-1" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavClinical">
                    <i class="fa-solid fa-bars fs-3" style="color: ${primaryColor}"></i>
                </button>
            </div>
            <div class="collapse navbar-collapse" id="navbarNavClinical">
                <div class="navbar-nav ms-auto align-items-center gap-4 mt-3 mt-lg-0 pb-3 pb-lg-0 text-center bg-light bg-lg-transparent rounded p-3 p-lg-0">
                    ${(data.navbar?.links || []).map((link: any) => `<a href="${link.href}" class="nav-link fw-semibold p-0 text-decoration-none w-100" style="font-size: 0.85rem; color: #64748b;">${link.label.toUpperCase()}</a>`).join('')}
                    <a href="${data.hero?.buttonHref}" class="clinical-btn-primary py-2 px-4 text-sm text-decoration-none d-none d-lg-inline-flex text-nowrap" style="background: ${secondaryColor} !important; border: none; white-space: nowrap;">Order Now</a>
                </div>
            </div>
        </div>
    </nav>
    </header>

    <section id="features" class="bg-white border-bottom py-5">
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
                    <div class="d-flex justify-content-center flex-wrap gap-5 py-4 border-top border-bottom">
                        ${(data.logos || []).map((logo: string) => `<div style="width: 80px; opacity: 0.5;"><img src="${logo}" class="img-fluid grayscale" /></div>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    </section>



    <section id="ingredients" class="py-5 bg-light border-bottom">
        <div class="container py-lg-4">
            <span class="data-label text-center mb-2">EFFICACY METRICS</span>
            <h2 class="text-center fw-bold mb-5" style="color: ${primaryColor};">${data.featuresTitle || "Core Tolerances"}</h2>
            <div class="row g-4">
                ${(data.features || []).map((f: any) => `
                <div class="col-12 col-md-6 col-lg-3"><div class="clinical-card p-4 h-100"><div class="mb-4 pb-3 border-bottom d-flex align-items-center justify-content-between"><h4 class="fw-semibold mb-0 text-dark" style="font-size: 1rem;">${f.title}</h4><img src="${f.image}" class="opacity-25 grayscale" style="height: 32px;" /></div><p class="mb-0 text-muted" style="font-size: 0.85rem; line-height: 1.6;">${f.description}</p></div></div>
                `).join('')}
            </div>
        </div>
    </section>

    <section id="about" class="bg-white py-4 border-bottom">
        <div class="container  mx-auto" style="max-width: 1100px;">
            <div class="clinical-header mb-4"><span class="data-label">PROTOCOL SUMMARY</span><h2 class="fw-bold mb-0" style="color: ${primaryColor}; font-size: 2.3rem;">${data.about?.title || "The Formula"}</h2></div>
            <div class="clearfix">
                <!-- Image Section - Floated Left for Newspaper/Journal Style -->
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
    </section>

    <!-- Research -->
    ${data.research ? `
    <section class="py-5 bg-light border-bottom">
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
                <div class="col-lg-6">
                    <div class="clinical-card p-2 shadow-sm"><img src="${data.research.image}" class="img-fluid rounded" style="max-height: 400px; object-fit: contain;" /></div>
                </div>
            </div>
        </div>
    </section>` : ''}

    ${data.gallery ? `
    <section class="py-5 bg-white border-bottom">
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

    ${data.benefits?.items?.length ? `
    <section id="benefits" class="py-5 bg-light border-bottom">
        <div class="container">
            <div class="text-center mb-5"><span class="data-label">THERAPEUTIC EFFECTS</span><h2 class="fw-bold" style="color: ${primaryColor}">${data.benefits.title || "Clinical Benefits"}</h2></div>
            <div class="row g-4 justify-content-center">
                ${data.benefits.items.map((b: any) => `
                <div class="col-12 col-lg-10"><div class="clinical-card p-4 d-flex align-items-start gap-3"><i class="fa-solid fa-check-circle text-success mt-1"></i><div><h4 class="fw-bold mb-1 text-dark" style="font-size: 1rem;">${b.title}</h4><p class="mb-0 text-muted" style="font-size: 0.85rem; line-height: 1.6;">${b.description}</p></div></div></div>
                `).join('')}
            </div>
        </div>
    </section>` : ''}

    <section id="analysis" class="py-5 bg-white border-bottom">
        <div class="container text-center">
            <span class="data-label">COMPOUND ANALYSIS</span>
            <h2 class="fw-bold mb-5" style="color: ${primaryColor}">${data.ingredients?.title || "Active Constituents"}</h2>
            <div class="row g-3 justify-content-center">
                ${(data.ingredients?.items || []).map((item: any) => `
                <div class="col-lg-4 col-md-6"><div class="clinical-card p-0 h-100 d-flex text-start overflow-hidden"><div class="w-25 bg-light d-flex align-items-center justify-content-center border-end p-2"><img src="${item.image}" class="w-100 rounded-circle border border-white shadow-sm" /></div><div class="w-75 p-3 d-flex flex-column justify-content-center"><h4 class="fw-bold mb-1 text-primary font-monospace" style="font-size: 0.85rem;">${item.title}</h4><p class="mb-0 text-muted" style="font-size: 0.75rem; line-height: 1.5;">${item.description}</p></div></div></div>
                `).join('')}
            </div>
        </div>
    </section>

    ${data.testimonials ? `
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


    ${data.ingredients?.items?.length ? `
    <section id="ingredients" class="py-5 bg-light">
        <div class="container py-lg-5">
            <div class="text-center mb-5"><span class="data-label">FORMULATION</span><h2 class="fw-bold clinical-header border-0 px-0 d-inline-block" style="color: ${primaryColor};">${data.ingredients.title || "Active Constituents"}</h2></div>
            <div class="row g-4">
                ${data.ingredients.items.map((item: any) => `
                <div class="col-lg-4 col-md-6">
                    <div class="clinical-card p-4 h-100 d-flex gap-4 align-items-start">
                        <div class="flex-shrink-0 rounded overflow-hidden border" style="width: 80px; height: 80px;">
                            <img src="${item.image}" class="w-100 h-100" style="object-fit: cover;" />
                        </div>
                        <div>
                            <h4 class="fw-bold mb-2 fs-5" style="color: ${primaryColor};">${item.title}</h4>
                            <p class="mb-0 text-secondary text-sm" style="line-height: 1.6;">${item.description}</p>
                        </div>
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

    <section class="py-5 bg-light border-bottom">
        <div class="container py-lg-4">
            <div class="p-5 bg-white border rounded shadow-sm">
                <div class="row align-items-center g-5">
                    <div class="col-lg-4 text-center"><img src="${data.footer?.trustImage || ''}" class="img-fluid mb-3" style="max-width: 250px;" /><p class="data-label mb-0" style="color: ${secondaryColor}">${data.guaranteeSubtitle || "Security Protocol"}</p></div>
                    <div class="col-lg-8"><h3 class="fw-bold mb-3" style="color: ${primaryColor}">${data.guaranteeHeadline || "60-Day Satisfaction Protocol"}</h3><p class="text-muted" style="line-height: 1.8; font-size: 0.95rem;">${data.guaranteeDescription || defaultGuaranteeDescription}</p><a href="${data.hero?.buttonHref}" class="clinical-btn-primary mt-3">Order Now <i class="fa-solid fa-arrow-right"></i></a></div>
                </div>
            </div>
        </div>
    </section>


    ${data.faq?.length ? `
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
</body>
</html>`;
    }
    else if (layoutStyle === 'organic') {
        cssContent = `
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Nunito:wght@300;400;600;700&display=swap');
body { font-family: 'Nunito', sans-serif; background-color: #FAF6ED; color: ${primaryColor}; margin: 0; padding: 0; }
h1, h2, h3, h4, .logo { font-family: 'Lora', serif !important; }
.organic-card { background: #ffffff; border-radius: 30px 30px 30px 0; box-shadow: 10px 10px 30px rgba(74, 51, 32, 0.05); transition: all 0.3s ease; border: 1px solid rgba(138, 121, 105, 0.1); }
.organic-card:hover { transform: translateY(-5px); border-radius: 30px; }
.organic-btn-primary { background: ${primaryColor}; color: #FAF6ED; border-radius: 30px; padding: 0.8rem 2.2rem; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; border: none; }
.organic-btn-primary:hover { background: ${secondaryColor}; color: #FAF6ED; }
.organic-btn-outline { background: transparent; border: 2px solid ${primaryColor}; color: ${primaryColor}; border-radius: 30px; padding: 0.8rem 2.2rem; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; }
.organic-btn-outline:hover { background: #F0EBE1; }
.organic-blob { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
.leaf-shape { border-radius: 50% 0 50% 50%; }
@media (max-width: 992px) {
    h1 { font-size: 2.8rem !important; }
}
@media (max-width: 768px) {
    .py-5 { padding-top: 3rem !important; padding-bottom: 3rem !important; }
    h1 { font-size: 2.2rem !important; }
    h2 { font-size: 1.8rem !important; }
    .organic-blob { width: 150% !important; height: 150% !important; }
    .organic-btn-primary, .organic-btn-outline { width: 100%; justify-content: center; }
    .navbar { padding-top: 1rem !important; padding-bottom: 1rem !important; }
    .font-serif.italic { font-size: 1rem !important; }
    img[style*="max-height: 500px"] { max-height: 300px !important; }
    h1 { font-size: 1.8rem !important; }
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
    <nav class="navbar navbar-expand-lg sticky-top py-4" style="background: rgba(250, 246, 237, 0.95); backdrop-filter: blur(10px);">
        <div class="container d-flex justify-content-between align-items-center">
            <a class="navbar-brand d-flex align-items-center gap-2 text-decoration-none" href="index.html">
                <i class="fa-solid fa-leaf fs-4" style="color: ${secondaryColor}"></i>
                <span class="fw-bold fs-4 logo" style="color: ${primaryColor}">${data.productName}</span>
            </a>
            <div class="d-flex align-items-center gap-2 d-lg-none ms-auto">
                <a href="${data.hero?.buttonHref}" class="organic-btn-primary py-2 px-3 text-decoration-none" style="background: ${primaryColor} !important; color: #FAF6ED !important; font-size: 0.8rem; width: auto; min-width: auto;">Order Now</a>
                <button class="navbar-toggler border-0 shadow-none px-2 ms-1" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavOrganic">
                    <i class="fa-solid fa-bars fs-3" style="color: ${primaryColor}"></i>
                </button>
            </div>
            <div class="collapse navbar-collapse" id="navbarNavOrganic">
                <div class="navbar-nav ms-auto align-items-center gap-4 mt-3 mt-lg-0 pb-3 pb-lg-0 text-center rounded p-3 p-lg-0" style="background: rgba(250, 246, 237, 0.95);">
                    ${(data.navbar?.links || []).map((link: any) => `<a href="${link.href}" class="nav-link fw-bold p-0 text-decoration-none font-serif italic w-100" style="color: ${secondaryColor}; font-size: 1rem;">${link.label}</a>`).join('')}
                    <a href="${data.hero?.buttonHref}" class="organic-btn-primary py-2 px-4 text-decoration-none d-none d-lg-inline-flex text-nowrap" style="background: ${primaryColor} !important; color: #FAF6ED !important; width: auto; white-space: nowrap;">Order Now</a>
                </div>
            </div>
        </div>
    </nav>
    </header>

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
                    <div class="mt-5 d-flex gap-3 justify-content-center justify-content-lg-start align-items-center">
                        <div class="d-flex" style="margin-left: 0.5rem;">
                            ${[1, 2, 3].map(i => `<div style="width: 32px; height: 32px; border-radius: 50%; background: #E6D5C3; border: 2px solid #FAF6ED; margin-left: -0.5rem;"></div>`).join('')}
                        </div>
                        <span class="small fw-bold" style="color: #8A7969">Loved by 10,000+ naturally</span>
                    </div>
                </div>
                <div class="col-12 col-lg-6 text-center position-relative">
                    <div class="position-absolute top-50 start-50 translate-middle organic-blob" style="width: 120%; height: 120%; background: #F0EBE1; z-index: 0;"></div>
                    <div class="position-relative z-1 d-inline-block p-4">
                        <img src="${data.hero?.image}" class="img-fluid" style="max-height: 500px; object-fit: contain;" />
                        ${data.hero?.badgeImage ? `
                        <div class="position-absolute bottom-0 end-0 bg-white p-3 leaf-shape shadow-sm d-flex align-items-center justify-content-center" style="width: 100px; height: 100px; transform: translate(10%, 10%);">
                            <img src="${data.hero.badgeImage}" class="img-fluid" style="max-width: 70px;" />
                        </div>` : ''}
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



    <!-- Research -->
    ${data.research ? `
    <section class="py-5 bg-white border-top border-bottom" style="border-color: #FAF6ED !important;">
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
                <div class="col-lg-6">
                    <div class="p-3" style="background: #FAF6ED; border-radius: 3rem;">
                        <img src="${data.research.image}" class="img-fluid w-100" style="border-radius: 2.5rem; max-height: 420px; object-fit: contain;" />
                    </div>
                </div>
            </div>
        </div>
    </section>` : ''}

    ${data.gallery ? `
    <section class="py-5" style="background-color: #FAF6ED;">
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
    </section>

    <section id="about" class="py-5" style="background: #FAF6ED;">
        <div class="container py-lg-5">
            <div class="row align-items-center g-5">
                <div class="col-lg-5"><div class="position-relative"><div class="position-absolute top-0 start-0 w-100 h-100 organic-blob" style="background: ${secondaryColor}; transform: translate(-5%, 5%); opacity: 0.1;"></div><img src="${data.about?.image}" class="img-fluid position-relative z-1 rounded-4 shadow-sm" /></div></div>
                <div class="col-lg-7 ps-lg-5"><h2 class="fw-bold mb-4 font-serif" style="color: ${primaryColor}; font-size: 2.5rem;">${data.about?.title || "Our Roots"}</h2><div class="text-muted" style="line-height: 1.9; font-size: 1.1rem; white-space: pre-line;">${data.about?.description}</div></div>
            </div>
        </div>
    </section>

    ${data.benefits?.items?.length ? `
    <section id="features" class="py-5" style="background: #F0EBE1;">
        <div class="container">
            <h2 class="text-center fw-bold mb-2 font-serif" style="color: ${primaryColor}; font-size: 2.5rem;">${data.featuresTitle || "Nature's Bounty"}</h2>
            <div class="row g-4">
                ${data.benefits.items.map((b: any) => `
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

    ${data.testimonials ? `
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


    ${data.faq?.length ? `
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
    zip.file("index.html", rawHtml);

    // Legal Pages - Using user-provided high-quality content
    const legalPages = [
        { id: 'privacy-policy', title: 'Privacy Policy' },
        { id: 'disclaimer', title: 'Disclaimer' },
        { id: 'terms-and-conditions', title: 'Terms & Conditions' }
    ];

    const headerEndIndex = rawHtml.indexOf('</header>') + 9;
    const footerStartIndex = rawHtml.lastIndexOf('<footer');

    if (headerEndIndex > 8 && footerStartIndex > -1) {
        const pageHeader = rawHtml.substring(0, headerEndIndex);
        const pageFooter = rawHtml.substring(footerStartIndex);

        for (const page of legalPages) {
            let bodyContent = '';

            if (page.id === 'privacy-policy') {
                bodyContent = `
                    <main class="container py-5" style="min-height: 70vh;">
                        <div class="p-4 p-md-5 bg-white shadow-sm border" style="border-radius: 0;">
                            <h1 class="fw-bold mb-5">${page.title}</h1>
                            <div class="text-secondary " style="line-height: 1.6;" style="white-space: pre-line; font-size: 0.95rem;">
At ${data.productName}, safeguarding your personal data is fundamental to how we operate. This Privacy Policy outlines the types of information we gather, the purposes for which we utilize it, and the protective measures we employ when you browse our website, complete a purchase, or engage with any of our digital services. Your continued use of this website indicates your agreement with the data practices described herein.

<h4 class="fw-bold text-dark mt-5 mb-3">1. Data We Gather</h4>
In order to deliver and enhance our offerings, we may collect specific personal details and technical data points whenever you interact with our digital platform.

<strong class="text-dark">Personally Identifiable Data:</strong> When you submit an order, sign up for newsletters, or reach out to our team, we may gather your full name, email address, telephone number, delivery and payment addresses, and purchase records.
<strong class="text-dark">Automatically Collected Data:</strong> Our systems may passively record details such as your IP address, hardware type, browser version, pages browsed, and navigation behavior to optimize site speed and improve your overall browsing experience.

All financial transactions are handled securely via reputable third-party payment processors. We do not retain complete credit card numbers or confidential financial details on any of our internal systems.

<h4 class="fw-bold text-dark mt-5 mb-3">2. Purpose of Data Usage</h4>
• To fulfill and dispatch your purchases
• To deliver prompt and helpful customer assistance
• To transmit order acknowledgments, status alerts, and delivery tracking notices
• To refine website performance and overall user satisfaction
• To distribute marketing materials (with straightforward opt-out mechanisms)
• To adhere to applicable legal and regulatory requirements

Under no circumstances do we trade or lease your personal details to outside organizations for their promotional activities.

<h4 class="fw-bold text-dark mt-5 mb-3">3. Cookie Usage and Tracking Technologies</h4>
This website may deploy cookies and comparable tracking mechanisms to enrich your browsing experience, recall your preferences, and evaluate overall site engagement. You retain the ability to configure or deactivate cookies via your browser preferences, though certain site features may function differently as a result.

<h4 class="fw-bold text-dark mt-5 mb-3">4. Information Protection</h4>
We maintain robust technical infrastructure and organizational protocols to shield your personal data against unauthorized access or unintended exposure. Nevertheless, no digital communication method can offer an absolute guarantee of security.

<h4 class="fw-bold text-dark mt-5 mb-3">5. External Service Partners</h4>
We may collaborate with vetted service providers who assist with payment handling, order fulfillment, data analytics, and customer care. These partners are granted access solely to the information essential for performing their designated functions and are contractually bound to maintain strict confidentiality.

<h4 class="fw-bold text-dark mt-5 mb-3">6. Your Data Rights</h4>
Subject to the privacy regulations in your jurisdiction, you may be entitled to review your stored personal data, rectify any inaccuracies, or request its removal. You may also withdraw from promotional communications at any point by utilizing the unsubscribe links embedded in our emails or by reaching out directly to our support staff.

<h4 class="fw-bold text-dark mt-5 mb-3">7. Policy Revisions</h4>
This Privacy Policy may be revised from time to time to accommodate legal developments, technological advancements, or evolving business practices. Any modifications will be published on this page along with the updated effective date. Your ongoing use of this website following any changes signifies your acceptance of the revised terms.

Should you have any inquiries regarding this Privacy Policy or the way your information is managed, please do not hesitate to contact our support team. ${data.productName} remains steadfast in its dedication to preserving your privacy and ensuring complete openness about your data.
                            </div>
                        </div>
                    </main>`;
            } else if (page.id === 'disclaimer') {
                bodyContent = `
                    <main class="container py-5" style="min-height: 70vh;">
                        <div class="p-4 p-md-5 bg-white shadow-sm border" style="border-radius: 0;">
                            <h1 class="fw-bold mb-5">${page.title}</h1>
                            <div class="text-secondary " style="line-height: 1.6;" style="white-space: pre-line; font-size: 0.95rem;">
All material published on this website is offered exclusively for general knowledge and educational reference. Nothing presented here should be construed as professional medical counsel, nor should it serve as a substitute for personalized advice from a certified healthcare practitioner. ${data.productName} is a naturally-formulated dietary supplement engineered to encourage stable blood sugar readings, well-tuned metabolic processes, and enhanced daily vitality when used in conjunction with sensible eating habits and consistent physical movement. Individual experiences and outcomes will naturally differ from person to person. User reviews, success stories, and shared testimonials represent the subjective views of those individuals and should not be taken as guarantees of typical results. How well any dietary supplement performs can be influenced by numerous variables including age, nutritional intake, activity frequency, personal habits, and baseline health condition.

<div class="bg-light p-4 border-start border-4 border-warning my-5">
    <h5 class="fw-bold text-dark mb-2">FDA Disclosure</h5>
    <p class="mb-0 text-dark small">Claims associated with ${data.productName} have not undergone formal review or approval by the U.S. Food and Drug Administration (FDA). This product is not formulated with the intent to diagnose, treat, cure, or prevent any disease, medical condition, or health disorder.</p>
</div>

Those who are currently pregnant, nursing, on prescription medication regimens, or dealing with ongoing health issues should seek professional medical guidance prior to incorporating this product into their routine. Should you experience any unexpected reactions, stop usage right away and consult a qualified medical professional without delay.

${data.productName} is composed of premium, plant-origin ingredients chosen specifically to promote metabolic well-being in a safe manner. However, every product and piece of information available on this site is furnished on an "as is" basis with no guarantees, whether explicit or implied. We encourage all users to thoroughly review product labels, composition details, and dosage guidelines before consumption to ensure proper and beneficial integration into their personal wellness practice.

By navigating this website or purchasing ${data.productName}, you recognize and agree that dietary supplements are meant to augment a health-conscious lifestyle rather than take the place of qualified medical treatment or professional healthcare services.
                            </div>
                        </div>
                    </main>`;
            } else {
                bodyContent = `
                    <main class="container py-5" style="min-height: 70vh;">
                        <div class="p-4 p-md-5 bg-white shadow-sm border" style="border-radius: 0;">
                            <h1 class="fw-bold mb-5">${page.title}</h1>
                            <div class="text-secondary " style="line-height: 1.6;" style="white-space: pre-line; font-size: 0.95rem;">
Welcome to ${data.productName}. These Terms & Conditions establish the guidelines governing your use of our website, product purchases, and access to services available at our official website. By navigating this website or submitting an order, you acknowledge and accept these terms in their entirety. If you find yourself unable to agree, please exit the site immediately.

<h4 class="fw-bold text-dark mt-5 mb-3">1. Agreement to These Terms</h4>
By entering this website, you affirm that you have thoroughly reviewed, comprehended, and consented to abide by these Terms & Conditions, our Privacy Policy, and any supplementary guidelines published on this platform. These provisions extend to every visitor, browser, and purchaser.

<h4 class="fw-bold text-dark mt-5 mb-3">2. Responsible Website Usage</h4>
This website may only be accessed and utilized for legitimate, lawful purposes. Any effort to undermine site operations, infiltrate secured sections, propagate malicious material, or participate in deceptive conduct is expressly forbidden.

Every element of this website, including written material, photographs, product specifications, visual assets, and brand marks, constitutes the intellectual property of ${data.productName} or its authorized licensors, safeguarded under applicable copyright and trademark statutes. No unauthorized reproduction, duplication, or redistribution is permitted without explicit written authorization.

<h4 class="fw-bold text-dark mt-5 mb-3">3. Product Details and Accuracy</h4>
Although we make every reasonable effort to present precise product descriptions, pricing structures, ingredient profiles, and stock availability, ${data.productName} cannot warrant that all published information is entirely free of error. We maintain the right to revise content, address inaccuracies, modify pricing, or withdraw products at any time without advance notification.

<h4 class="fw-bold text-dark mt-5 mb-3">4. Eligibility Requirements</h4>
By utilizing this website or completing a purchase, you certify that you are no younger than 18 years of age, or that you are accessing the platform with appropriate parental or guardian oversight. You pledge to furnish truthful and complete details when creating accounts, placing orders, or engaging with our support channels.

<h4 class="fw-bold text-dark mt-5 mb-3">5. Purchasing and Payment Processing</h4>
All orders placed through our website are contingent upon verification and formal acceptance. ${data.productName} retains the authority to decline or void any order where fraud is suspected, errors have occurred, or requested items are temporarily unavailable.

Payment transactions are executed securely through established third-party processing platforms. We do not collect or store complete credit card credentials, and all payment exchanges benefit from industry-standard encryption safeguards.

<h4 class="fw-bold text-dark mt-5 mb-3">6. Delivery and Shipping</h4>
Estimated shipping windows are approximate and may fluctuate based on carrier logistics, customs procedures, or other circumstances beyond our direct control. It is the buyer's responsibility to supply an accurate and complete shipping address during the checkout process.

<h4 class="fw-bold text-dark mt-5 mb-3">7. Return and Refund Procedures</h4>
${data.productName} is dedicated to ensuring buyer satisfaction. Qualifying purchases may be eligible for a return or monetary refund in accordance with our published return policy. Buyers are required to adhere to the designated return process and initiate any claims within the applicable guarantee timeframe.

<h4 class="fw-bold text-dark mt-5 mb-3">8. Wellness Disclaimer</h4>
All information appearing on this website serves general educational purposes exclusively. ${data.productName} is a dietary supplement formulated to complement overall wellness and support healthy blood sugar levels as part of a balanced nutritional plan and active lifestyle. Individual results are inherently variable.

<h4 class="fw-bold text-dark mt-5 mb-3">9. Liability Boundaries</h4>
To the maximum extent allowable under applicable law, ${data.productName} shall bear no responsibility for any direct, indirect, incidental, or consequential damages resulting from the use of this website, its published content, its products, or its associated services.

<h4 class="fw-bold text-dark mt-5 mb-3">10. External Website Links</h4>
This website may occasionally feature hyperlinks directing you to third-party websites. ${data.productName} exercises no authority over these external platforms and assumes no liability for their content, privacy practices, or operational policies.

<h4 class="fw-bold text-dark mt-5 mb-3">11. Modifications to These Terms</h4>
We reserve the right to amend these Terms & Conditions at any point to reflect operational shifts, legal developments, or policy refinements. Revised terms will be posted directly on this page, and your continued engagement with the website constitutes acceptance of the amended provisions.

<h4 class="fw-bold text-dark mt-5 mb-3">12. Applicable Legal Framework</h4>
These Terms & Conditions fall under the jurisdiction of the laws governing the company's registered location. Any disputes originating from website usage or product purchases will be resolved in accordance with those governing statutes.

For any questions or concerns regarding these Terms & Conditions, please contact our dedicated support team. ${data.productName} is firmly committed to upholding transparency, robust security measures, and unwavering trust for every user and customer.
                            </div>
                        </div>
                    </main>`;
            }

            const fullHtml = pageHeader + bodyContent + pageFooter;
            zip.file(`${page.id}.html`, fullHtml.replace(/href="#"/g, 'href="index.html"'));
        }
    }

    return await zip.generateAsync({ type: "blob" });
}
