'use client';

import React from 'react';

export const GlycopezilStyles = ({ primaryColor, secondaryColor }: { primaryColor: string, secondaryColor: string }) => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,800;1,600&display=swap');
        
        :root {
          --primary-color: ${primaryColor};
          --accent-color: ${secondaryColor};
        }

        .glycopezil-template { font-family: 'Inter', sans-serif; color: #333; position: relative; }
        .glycopezil-template h1 { font-size: 3.5rem; font-weight: 800; line-height: 1.1; word-break: keep-all; hyphens: none; }
        .glycopezil-template h2 { font-size: 2.5rem; font-weight: 700; line-height: 1.2; }
        .glycopezil-template h3 { font-size: 1.5rem; font-weight: 700; }
        
        .glycopezil-template h1, .glycopezil-template h2, .glycopezil-template h3, .glycopezil-template .logo { font-family: 'Outfit', sans-serif !important; }
        .nav { background-color: white; }
        .navcolor, .sectioncolor { background-color: var(--primary-color); }
        .navtext { color: rgb(5, 1, 1); font-weight: 550; }
        .logo { color: #fbbf24; font-weight: 800; cursor: pointer; }
        .bannerimg { height: 50vh; object-fit: contain; }
        .banner-img1 { height: 40vh; object-fit: contain; }
        .bgbadge { background-color: white; border: 0.5px solid var(--primary-color); border-radius: 24px; color: rgb(5, 0, 0); min-height: 300px; padding: 2rem; position: relative; }
        .sectioncolor1 { background-color: #f8f9fa; }
        
        .purchase-proof { position: absolute; bottom: 20px; left: 20px; background: #ffffff; border-radius: 16px; padding: 15px 18px; box-shadow: none; font-size: 14px; max-width: 300px; z-index: 9999; transform: translateX(-120%); transition: transform 0.5s ease; border: 1px solid #eee; }
        .purchase-proof.active { transform: translateX(0); }
        .custom-hover { color: white; text-decoration: none; }
        .custom-hover:hover { color: var(--accent-color); text-decoration: underline; }

        .btn-custom { 
          background-color: var(--accent-color); 
          color: black; 
          font-weight: 700; 
          border-radius: 16px; 
          box-shadow: none;
          border: none;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          cursor: pointer;
          user-select: none;
          padding: 0.62rem 1.4rem;
          font-size: 0.95rem;
          white-space: nowrap;
        }

        .ingredient-card {
          background: white; border-radius: 32px; padding: 2rem; height: 100%; transition: all 0.5s;
          box-shadow: none; display: flex; flex-direction: column;
          align-items: center; text-align: center; position: relative; margin-top: 4rem;
        }
        .ingredient-img-wrapper {
          width: 150px; height: 150px; border-radius: 50%; border: 8px solid white;
          box-shadow: none; overflow: hidden; background: white;
          margin-top: -6rem; margin-bottom: 1.5rem; z-index: 5; outline: 4px solid var(--accent-color);
        }

        .mobile-nav-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: white; z-index: 200; display: flex; flex-direction: column;
          align-items: center; justify-content: center; transform: translateY(-100%);
          transition: transform 0.4s cubic-bezier(0.77, 0, 0.175, 1);
        }
        .mobile-nav-overlay.open { transform: translateY(0); }

        /* Themes */
        .layout-modern { background-color: #FAFCFB !important; font-family: 'Outfit', sans-serif !important; }
        .layout-modern h1, .layout-modern h2, .layout-modern h3, .layout-modern .logo { font-family: 'Outfit', sans-serif !important; letter-spacing: -0.03em; }
        .layout-modern p { font-size: 1.1rem; color: #4B5563 !important; }
        .layout-modern .navcolor, .layout-modern .sectioncolor { background-color: #EBF4F0 !important; color: #111827 !important; border: none; }
        .layout-modern .sectioncolor h2 { color: #111827 !important; font-weight: 800; font-size: 2.75rem !important; margin-bottom: 0; }
        .layout-modern .bgbadge, .layout-modern .ingredient-card, .layout-modern .card, .layout-modern .accordion-item { 
          background: #ffffff !important; border-radius: 32px !important; 
          box-shadow: none !important; border: 1px solid rgba(229, 231, 235, 0.5) !important; 
        }
        .layout-modern .btn-custom { border-radius: 16px !important; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em; padding: 1rem 2rem; box-shadow: none !important; }

        .layout-clinical { background-color: #F8FAFC !important; font-family: 'Inter', sans-serif; }
        .layout-clinical .navcolor, .layout-clinical .sectioncolor { background-color: #ffffff !important; color: #0F172A !important; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0; }
        .layout-clinical .btn-custom { border-radius: 8px !important; font-weight: 600; padding: 0.8rem 1.8rem; box-shadow: none !important; }

        .layout-organic { background-color: #FDFBF7 !important; }
        .layout-organic h1, .layout-organic h2, .layout-organic h3 { font-family: 'Playfair Display', serif !important; color: #3E2723 !important; }
        .layout-organic .bgbadge, .layout-organic .ingredient-card, .layout-organic .card, .layout-organic .accordion-item { background-color: #F8F4EC !important; border-radius: 24px !important; border: 1px solid #EBE1D5 !important; box-shadow: none !important; }
        .layout-organic .btn-custom { border-radius: 12px !important; font-family: 'Inter', sans-serif; font-weight: bold; box-shadow: none !important; }

        /* Preview Awareness */
        .mobile-preview .row { display: flex !important; flex-direction: column !important; flex-wrap: nowrap !important; }
        .mobile-preview [class*="col-lg-"], .mobile-preview [class*="col-md-"] { width: 100% !important; max-width: 100% !important; flex: 0 0 100% !important; margin-bottom: 1.5rem !important; }
        .mobile-preview h1 { font-size: 1.8rem !important; text-align: center !important; }
      `
    }} />
  );
};
