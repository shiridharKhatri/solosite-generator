import { create } from 'zustand';

interface ProjectData {
  productName: string;
  hero: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonHref: string;
    icon?: string;
    secondaryButtonText?: string;
    secondaryButtonHref?: string;
    secondaryIcon?: string;
    image: string;
    badgeText?: string;
    badgeImage?: string;
    logoImage?: string;
  };
  logos: string[];
  features: {
    title: string;
    description: string;
    image: string;
    href?: string;
  }[];
  about: {
    title: string;
    description: string;
    stats: { label: string; value: string }[];
    image: string;
  };
  ingredients: {
    title: string;
    subtitle: string;
    items: { title: string; description: string; image: string; href?: string }[];
  };
  testimonials: {
    title: string;
    subtitle?: string;
    items: {
      name: string;
      role?: string;
      content: string;
      rating: number;
      image?: string;
    }[];
  };
  benefits: {
    title: string;
    description: string;
    items: { title: string; description: string; href?: string }[];
  };
  connect: {
    title: string;
    subtitle: string;
    tools: string[];
  };
  pricing: {
    title: string;
    quantity?: string;
    multiplier?: string;
    price: string;
    features: string[];
    image?: string;
    isPrimary?: boolean;
    buttonText: string;
    icon?: string;
    buttonHref: string;
    gtin?: string;
    category?: string;
    sku?: string;
    unclCode?: string;
    productRole?: string;
  }[];
  faq: {
    question: string;
    answer: string;
  }[];
  footer: {
    companyInfo: string;
    links: { label: string; href: string }[];
    trustImage?: string;
  };
  navbar: {
    links: { label: string; href: string }[];
  };
  seo?: {
    title: string;
    description: string;
    canonicalUrl?: string;
    robots?: string;
    googleBot?: string;

    keywords?: string;
    author?: string;
    language?: string;
    locale?: string;

    favicon?: string;
    themeColor?: string;
    viewport?: string;

    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogType?: string;
    ogUrl?: string;
    ogSiteName?: string;

    twitterCard?: 'summary' | 'summary_large_image';
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    twitterCreator?: string;

    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];

    alternates?: {
      hreflang: string;
      href: string;
    }[];

    schema?: string; // Sticking to string to make JSON editing easier in textarea

    customTags?: {
      type: 'name' | 'property';
      key: string;
      value: string;
    }[];
  };
  theme: {
    primary: string;
    secondary: string;
  };
  layoutStyle?: 'default' | 'modern' | 'clinical' | 'organic';
  featuresTitle?: string;
  pricingTitle?: string;
  guaranteeTitle?: string;
  guaranteeSubtitle?: string;
  guaranteeHeadline?: string;
  guaranteeDescription?: string;
  faqTitle?: string;
  footerHeadline?: string;
  research?: {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    stats: { label: string; value: string }[];
  };
  gallery?: {
    title: string;
    subtitle: string;
    images: string[];
  };
}

interface EditorState {
  projectData: ProjectData | null;
  projectId: string | null;
  setProjectData: (data: ProjectData) => void;
  updateProductName: (name: string) => void;
  updateHero: (hero: Partial<ProjectData['hero']>) => void;
  updateFeature: (index: number, feature: Partial<ProjectData['features'][0]>) => void;
  addFeature: () => void;
  removeFeature: (index: number) => void;
  updateAbout: (about: Partial<ProjectData['about']>) => void;
  updateIngredient: (index: number, item: any) => void;
  addIngredient: () => void;
  removeIngredient: (index: number) => void;
  updateBenefit: (index: number, item: Partial<ProjectData['benefits']['items'][0]>) => void;
  addBenefit: () => void;
  removeBenefit: (index: number) => void;
  updatePricing: (index: number, plan: Partial<ProjectData['pricing'][0]>) => void;
  addPricing: () => void;
  removePricing: (index: number) => void;
  updateFAQ: (index: number, faq: Partial<ProjectData['faq'][0]>) => void;
  addFAQ: () => void;
  removeFAQ: (index: number) => void;
  updateTheme: (theme: Partial<ProjectData['theme']>) => void;
  updateLayoutStyle: (style: 'default' | 'modern' | 'clinical' | 'organic') => void;
  updateFooter: (footer: Partial<ProjectData['footer']>) => void;
  updateSEO: (seo: Partial<ProjectData['seo']>) => void;
  updateTestimonials: (index: number, testimonial: Partial<ProjectData['testimonials'] & ProjectData['testimonials']['items'][0]>) => void;
  addTestimonial: () => void;
  removeTestimonial: (index: number) => void;
  updateResearch: (research: Partial<ProjectData['research']>) => void;
  updateGallery: (gallery: Partial<ProjectData['gallery']>) => void;
  updateNavbar: (navbar: Partial<ProjectData['navbar']>) => void;
  updateProjectData: (data: Partial<ProjectData>) => void;
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
}

export const initialProjectData: ProjectData = {
  productName: "Glycopezil",
  hero: {
    title: "Support Healthy Blood Sugar Naturally with Glycopezil Blood Support Drops",
    subtitle: "Glycopezil Blood Support Drops are a natural blood sugar supplement designed to help support healthy glucose levels, balanced metabolism, and steady daily energy. Made with botanically derived ingredients, Glycopezil is crafted for people dealing with modern lifestyle challenges such as poor diet, stress, and low activity levels that can affect blood sugar balance.\n\nThis advanced formula helps promote better glucose utilization, supports healthy insulin function, and encourages overall metabolic wellness. With an easy daily dosage, Glycopezil Drops may help maintain stable blood sugar levels while supporting energy, vitality, and long-term well-being.",
    buttonText: "Buy now just $49",
    buttonHref: "order.html",
    icon: "fa-solid fa-cart-shopping",
    secondaryButtonText: "Visit official Site Now!",
    secondaryButtonHref: "order.html",
    secondaryIcon: "fa-solid fa-arrow-right",
    image: "/image/index-img.webp",
    badgeImage: "/image/supplement fats.webp",
    badgeText: "Natural Blood Support",
    logoImage: ""
  },
  logos: [
    "/image/gmo.webp",
    "/image/natural.webp",
    "/image/gmp.webp",
    "/image/fda.webp"
  ],
  features: [
    {
      title: "100% Non-GMO Sourced",
      description: "Every component inside Glycopezil comes from verified non-GMO sources, ensuring a wholesome, unmodified, and trustworthy formula that prioritizes purity in every dose you take for blood sugar and metabolic harmony.",
      image: "/image/gmo.webp"
    },
    {
      title: "Botanical-Origin Formula",
      description: "Harnessing the strength of plant-sourced compounds, Glycopezil assists in nurturing glucose harmony, efficient metabolic activity, and comprehensive daily vitality through a gentle, earth-derived approach.",
      image: "/image/natural.webp"
    },
    {
      title: "Rigorous GMP Standards",
      description: "Manufactured inside GMP-certified laboratories, Glycopezil passes through demanding quality inspections to guarantee integrity, cleanliness, and reliable strength in every single production cycle.",
      image: "/image/gmp.webp"
    },
    {
      title: "Produced in FDA-Registered Labs",
      description: "Created within an FDA-registered production environment, Glycopezil follows established safety and manufacturing protocols for dietary supplements, delivering dependable quality that inspires genuine confidence.",
      image: "/image/fda.webp"
    }
  ],
  about: {
    title: "Understanding the Glycopezil Formula",
    description: "Glycopezil is a cutting-edge, nature-inspired blood support supplement engineered to foster balanced glucose readings, strengthen metabolic resilience, and deliver unwavering energy across your entire day. Many Glycopezil reviews confirm that with the demands of contemporary living, from ultra-processed meals and emotional pressure to prolonged sitting, having reliable blood sugar support matters. Glycopezil collaborates with your body's inherent biochemistry to encourage stable blood sugar and total metabolic vitality.\n\nEach Glycopezil active ingredient has been carefully selected. This meticulously developed formula incorporates targeted botanicals celebrated for their capacity to promote efficient glucose processing, calibrated insulin signaling, and robust cellular energy generation. Does Glycopezil work? By empowering the body to handle glucose with greater precision, these blood support drops foster reliable energy output, smooth out blood sugar volatility, and nurture lasting metabolic steadiness and overall vigor.\n\nWhen incorporated consistently into a health-conscious routine, Glycopezil assists in sustaining daily vigor, calibrated metabolic processes, and prolonged wellness over time. Looking to buy Glycopezil? It is offered exclusively through this authorized website, the only place where Glycopezil is for sale with guaranteed authenticity. This organic blood sugar companion is thoughtfully composed to assist in preserving optimal glucose levels while encouraging steady metabolic engagement. Understanding how to take Glycopezil is straightforward, simply follow the recommended Glycopezil dosage per day for best results.\n\nPresented in convenient daily drops, Glycopezil functions to bolster glucose equilibrium and organic metabolic pathways. Through its pristine, plant-centered composition, it furnishes a straightforward and potent method to help safeguard healthy blood sugar, maintain energy throughout waking hours, and encourage sustained wellness over the long term.",
    stats: [
      { label: "Rating", value: "4.8/5" },
      { label: "Reviews", value: "350+" },
      { label: "Satisfaction", value: "99%" }
    ],
    image: "/image/banner-img.webp"
  },
  ingredients: {
    title: "Purposefully Chosen Natural Ingredients",
    subtitle: "Six powerful botanicals selected for their specific role in supporting glucose metabolism, antioxidant protection, and energy balance.",
    items: [
      {
        title: "Schisandra: Whole-Body Balance Tonic",
        description: "Revered in traditional herbalism for centuries, Schisandra acts as a multi-tasking adaptogen that encourages healthy liver activity and fosters internal equilibrium.",
        image: "/image/ingredient-schisandra.png"
      },
      {
        title: "Amla: Nutrient-Dense Rejuvenator",
        description: "Also called Indian gooseberry, Amla delivers exceptional antioxidants that fortify digestive processes and reinforce immune defenses.",
        image: "/image/ingredient-amla.png"
      },
      {
        title: "Theobroma Cacao: Cardiovascular Energizer",
        description: "Brimmed with heart-friendly flavonoids, Cacao strengthens vascular health and bolsters smooth blood flow for daily vitality.",
        image: "/image/ingredient-cacao.png"
      },
      {
        title: "Rhodiola: Adaptogenic Stamina Fuel",
        description: "A celebrated adaptogenic herb, Rhodiola empowers the body to navigate daily pressures and sustains balanced energy reserves.",
        image: "/image/ingredient-rhodiola.png"
      },
      {
        title: "Maqui Berry: Free-Radical Fighter",
        description: "Sourced from pristine landscapes, Maqui Berry is loaded with potent anthocyanins that shield cells from oxidative damage.",
        image: "/image/ingredient-maqui.png"
      },
      {
        title: "Haematococcus: Superior Cellular Shield",
        description: "This microalga yields astaxanthin, guarding cellular structures against environmental wear and promoting graceful aging.",
        image: "/image/ingredient-haematococcus.png"
      }
    ]
  },
  testimonials: {
    title: "Real Stories, Real Results",
    subtitle: "Join thousands of satisfied Glycopezil users who have transformed their wellness journey.",
    items: [
      {
        name: "Sarah M.",
        role: "Verified Buyer",
        content: "I've tried so many different things for my blood sugar, but Glycopezil is the first one that actually made a noticeable difference in my daily energy levels. I feel much more stable throughout the day!",
        rating: 5,
        image: "https://i.pravatar.cc/150?u=sarah"
      },
      {
        name: "David K.",
        role: "Verified Buyer",
        content: "The best part about Glycopezil is how easy it is to use. Just a few drops and I'm good to go. My cravings for sweets have significantly decreased since I started using it.",
        rating: 5,
        image: "https://i.pravatar.cc/150?u=david"
      },
      {
        name: "Elena R.",
        role: "Verified Buyer",
        content: "Highly recommend Glycopezil for anyone looking for natural support. It's gentle yet effective. I've noticed I don't get those afternoon energy crashes anymore.",
        rating: 4,
        image: "https://i.pravatar.cc/150?u=elena"
      }
    ]
  },
  benefits: {
    title: "Powerful Advantages of Glycopezil",
    description: "Glycopezil is masterfully designed to encourage balanced glucose levels, optimized metabolic function, and all-day endurance. With consistent daily usage, this sophisticated natural blend assists in preserving blood sugar harmony and nurtures comprehensive metabolic wellness alongside a mindful lifestyle.",
    items: [
      {
        title: "Encourages Optimal Glucose Levels",
        description: "Glycopezil harmonizes with your body's innate regulatory systems to foster consistent and balanced blood sugar readings across every hour of the day."
      },
      {
        title: "Nurtures Healthy Insulin Activity",
        description: "Assists in maintaining responsive insulin signaling, enabling the body to channel glucose into productive energy and achieve sustained metabolic equilibrium."
      },
      {
        title: "Delivers Dependable All-Day Vitality",
        description: "Through its glucose-balancing properties, Glycopezil helps power consistent energy levels and sharpens mental acuity and output from morning through evening."
      },
      {
        title: "Tames Unwanted Sugar Urges",
        description: "Stabilized glucose dynamics can help suppress persistent sweet tooth tendencies, paving the way for more mindful and nutritious dietary choices on autopilot."
      },
      {
        title: "Elevates Metabolic Efficiency",
        description: "Glycopezil helps fine-tune the body's glucose conversion pathways, contributing to a well-oiled metabolic engine and heightened daily dynamism."
      },
      {
        title: "Builds Lasting Health Foundations",
        description: "Habitual use contributes to prolonged metabolic resilience, balanced energy throughout every season, and a solid platform for enduring total-body wellness."
      },
      {
        title: "Effortless Daily Integration",
        description: "Practical and uncomplicated to weave into any schedule, Glycopezil transforms daily blood sugar management and metabolic upkeep into a seamless habit."
      }
    ]
  },
  connect: {
    title: "Get Started",
    subtitle: "Join thousands of satisfied users today.",
    tools: ["Official Support", "Secure Checkout", "60-Day Guarantee"]
  },
  pricing: [
    {
      title: "Starter Package",
      quantity: "1 Bottle",
      multiplier: "X1",
      price: "69",
      features: ["30 Day Supply", "60-Day Guarantee"],
      image: "/image/bottle-snap.webp",
      buttonText: "Buy Now For $69",
      buttonHref: "order.html"
    },
    {
      title: "Best Value Bundle",
      quantity: "6 Bottles",
      multiplier: "X6",
      price: "49",
      features: ["180 Day Supply", "Free Shipping", "Huge Savings Included"],
      image: "/image/bottle-snap.webp",
      isPrimary: true,
      buttonText: "Buy Now For $294",
      buttonHref: "order.html"
    },
    {
      title: "Popular Choice",
      quantity: "3 Bottles",
      multiplier: "X3",
      price: "59",
      features: ["90 Day Supply", "Significant Savings"],
      image: "/image/bottle-snap.webp",
      buttonText: "Buy Now For $177",
      buttonHref: "order.html"
    }
  ],
  faq: [
    {
      question: "What exactly is Glycopezil?",
      answer: "Glycopezil is an all-natural dietary formula created to encourage healthy glucose readings, well-tuned metabolic function, and dependable daily energy through a blend of carefully chosen botanical extracts."
    },
    {
      question: "What is the mechanism behind Glycopezil?",
      answer: "Glycopezil collaborates with the body's inherent glucose-regulation pathways. It assists in keeping blood sugar within a healthy range, reinforces metabolic efficiency, and encourages sustained energy throughout every part of the day."
    },
    {
      question: "Is Glycopezil suitable for everyone?",
      answer: "Glycopezil is intended for adults seeking additional nutritional assistance for maintaining healthy glucose levels, efficient metabolic activity, and greater overall vitality within a balanced lifestyle framework."
    },
    {
      question: "What is the recommended way to take Glycopezil?",
      answer: "Adhere to the usage directions printed on the product packaging. For optimal outcomes, incorporate Glycopezil into your daily wellness habit to promote ideal blood sugar regulation and metabolic fitness."
    },
    {
      question: "Is it safe to pair Glycopezil with other supplements?",
      answer: "Numerous users successfully incorporate Glycopezil alongside other dietary supplements. That said, if you are currently on prescription medications or managing particular health conditions, seeking guidance from a qualified medical professional beforehand is advisable."
    },
    {
      question: "Where is Glycopezil produced?",
      answer: "Glycopezil is produced in facilities that comply with stringent safety regulations and quality benchmarks to guarantee that every production run delivers a pure, safe, and reliably potent product."
    },
    {
      question: "Can Glycopezil substitute for healthy living habits?",
      answer: "Not at all. Glycopezil is designed to work alongside a nutritious diet, consistent physical activity, and sensible lifestyle practices, reinforcing your overall wellness through natural supplementation."
    },
    {
      question: "Does Glycopezil have any side effects?",
      answer: "Glycopezil is formulated with natural, plant-based ingredients and is generally well-tolerated. No significant Glycopezil side effects have been widely reported. However, as with any supplement, individual responses may differ. If you experience any discomfort, discontinue use and consult your healthcare provider."
    },
    {
      question: "Has Glycopezil received FDA approval?",
      answer: "As a dietary supplement, Glycopezil is not subject to FDA approval in the same way prescription drugs are. However, it is manufactured in an FDA-registered, GMP-certified facility that adheres to strict safety and quality protocols, ensuring every batch meets high production standards."
    },
    {
      question: "Is Glycopezil a legitimate product?",
      answer: "Absolutely. Glycopezil is a legitimate, thoroughly vetted dietary supplement produced in certified facilities under strict quality controls. Thousands of satisfied customers have shared positive Glycopezil reviews attesting to its quality and effectiveness as a blood sugar support formula."
    },
    {
      question: "What is the recommended Glycopezil dosage per day?",
      answer: "The recommended Glycopezil dosage per day is clearly indicated on the product label. For most adults, the standard dosage involves taking the drops once daily, preferably in the morning or as directed. Consistent daily use yields the best results for blood sugar support and metabolic balance."
    },
    {
      question: "Where can I buy Glycopezil?",
      answer: "You can buy Glycopezil exclusively through this official website. Glycopezil is not available in retail stores or third-party marketplaces. Purchasing directly ensures you receive a genuine product, access to current discounts, and the full 60-day money-back guarantee. If you're looking for where Glycopezil is for sale, this is the only authorized source."
    },
    {
      question: "What are the pros and cons of Glycopezil?",
      answer: "Glycopezil pros: All-natural plant-based ingredients, supports healthy blood sugar and metabolism, easy-to-use drop format, manufactured in GMP/FDA-registered facilities, backed by a 60-day money-back guarantee, and no reported major side effects.\nGlycopezil cons: Only available online through the official website, individual results may vary, and it is not intended to replace prescribed medication."
    },
    {
      question: "Is Glycopezil associated with Dr Phil?",
      answer: "There is no verified endorsement or official association between Glycopezil and Dr Phil. Any claims linking Glycopezil and Dr Phil should be treated with caution. We recommend purchasing only through this official website to ensure you receive the authentic product."
    },
    {
      question: "What do Glycopezil reviews and complaints on consumer reports say?",
      answer: "The majority of Glycopezil reviews reflect positive experiences, with users reporting improved energy, steadier blood sugar, and fewer sugar cravings. As for Glycopezil complaints, very few negative reports have surfaced, and most are related to shipping timelines rather than product quality. We encourage all customers to share honest feedback to help others make informed decisions."
    },
    {
      question: "What are the active ingredients in Glycopezil?",
      answer: "The Glycopezil ingredients include six powerful botanicals: Schisandra, Amla, Theobroma Cacao, Rhodiola, Maqui Berry, and Haematococcus. Each Glycopezil active ingredient is selected for its specific role in supporting glucose metabolism, antioxidant protection, energy balance, and overall metabolic health. All ingredients are plant-based and non-GMO sourced."
    },
    {
      question: "Does Glycopezil actually work for blood sugar?",
      answer: "Glycopezil is formulated with ingredients that have been traditionally used and studied for their role in supporting healthy blood sugar levels. Many users in their Glycopezil reviews report noticeable improvements in energy stability and reduced cravings. While individual outcomes vary, the formula is designed to complement your body's natural glucose regulation when used consistently."
    },
    {
      question: "How do I use Glycopezil blood support drops?",
      answer: "Learning how to use Glycopezil is simple. Take the recommended number of Glycopezil drops as indicated on the label, typically once daily with or without food. The best way to take Glycopezil is consistently at the same time each day for optimal blood sugar support. Shake the bottle gently before each use and follow the dosage instructions precisely."
    }
  ],
  footer: {
    companyInfo: "The material presented on this website is intended purely for educational and informational use and should not be interpreted as professional medical guidance. Glycopezil is a dietary supplement created to promote general health, blood sugar stability, and efficient metabolism. It is not designed to diagnose, treat, remedy, or prevent any disease or medical condition. We strongly recommend consulting with a qualified healthcare practitioner before beginning any new supplement, wellness program, or nutritional adjustment, particularly if you are expecting, breastfeeding, undergoing medical treatment, or living with a pre-existing health concern. Outcomes can differ between individuals, and the claims made regarding this product have not been evaluated or endorsed by the U.S. Food and Drug Administration (FDA).",
    links: [
      { label: "Home", href: "index.html" },
      { label: "Privacy Policy", href: "privacy-policy.html" },
      { label: "Disclaimer", href: "disclaimer.html" },
      { label: "Terms & Conditions", href: "terms-and-conditions.html" }
    ],
    trustImage: "/image/money-back-guarantee-..webp"
  },
  research: {
    title: "The Science of Blood Support",
    subtitle: "Clinically-focused formulation for maximum metabolic impact.",
    description: "Glycopezil is built on a foundation of scientific research into botanical insulin-mimetics and glucose transporters. Our formula combines ancient wisdom with modern extraction techniques to deliver a product that doesn't just work, but excels in purity and bioavailability.",
    image: "/image/banner-img.webp",
    stats: [
      { label: "Purity Level", value: "99.9%" },
      { label: "Bioavailability", value: "High" },
      { label: "Safety Tested", value: "100%" }
    ]
  },
  gallery: {
    title: "Global Community Trust",
    subtitle: "Join thousands who have already taken the first step toward better wellness.",
    images: [
      "/image/index-img.webp",
      "/image/banner-img.webp",
      "/image/bottle-snap.webp"
    ]
  },
  theme: {
    primary: "#2C0D67",
    secondary: "#fbbf24"
  },
  layoutStyle: "default",
  seo: {
    title: "Glycopezil Official Site | Advanced Glucose Management",
    description: "Glycopezil delivers plant-powered glucose regulation for everyday vitality. Achieve stable blood sugar, enhanced metabolic function, and renewed energy. Shop the official store.",
    keywords: "Glycopezil, Glycopezil Official Website, Glycopezil blood sugar support, glucose balance, natural metabolism booster",
    ogTitle: "Glycopezil Official Site | Advanced Glucose Management",
    ogDescription: "Plant-powered glucose regulation for everyday vitality.",
    ogImage: "https://www.glycopezil-official.us/assets/image/index-img.webp",
    ogType: "website",
    twitterCard: "summary_large_image"
  },
  navbar: {
    links: [
      { label: "Features", href: "#features" },
      { label: "About", href: "#about" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" }
    ]
  }
};

export const useStore = create<EditorState>((set) => ({
  projectData: initialProjectData,
  projectId: null,
  isDirty: false,
  setDirty: (dirty) => set({ isDirty: dirty }),
  setProjectData: (data) => set({ projectData: data, isDirty: false }),
  updateProductName: (name) => set((state) => {
    if (!state.projectData) return state;
    const oldName = state.projectData.productName;

    // Always update the product name property itself
    const updatedProjectData = { ...state.projectData, productName: name };

    // Only perform global find-and-replace if the old name is substantial 
    // to avoid replacing common characters/words during typing.
    if (!oldName || oldName.length < 3 || !name || oldName === name) {
      return { projectData: updatedProjectData, isDirty: true };
    }

    const replaceInObj = (obj: any): any => {
      if (typeof obj === 'string') {
        // Use regex with word boundaries to only replace the product name as a whole word
        const escapedOldName = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedOldName}\\b`, 'g');
        return obj.replace(regex, name);
      }
      if (Array.isArray(obj)) return obj.map(replaceInObj);
      if (obj !== null && typeof obj === 'object') {
        const res: any = {};
        for (const key in obj) {
          res[key] = replaceInObj(obj[key]);
        }
        return res;
      }
      return obj;
    };

    const newData = replaceInObj(updatedProjectData);
    return { projectData: newData, isDirty: true };
  }),

  updateHero: (hero) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, hero: { ...state.projectData.hero, ...hero } } : null,
    isDirty: true
  })),

  updateAbout: (about) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, about: { ...state.projectData.about, ...about } } : null,
    isDirty: true
  })),

  updateFeature: (index, feature) => set((state) => {
    if (!state.projectData) return state;
    const newFeatures = [...state.projectData.features];
    newFeatures[index] = { ...newFeatures[index], ...feature };
    return { projectData: { ...state.projectData, features: newFeatures }, isDirty: true };
  }),

  addFeature: () => set((state) => {
    if (!state.projectData) return state;
    const newFeatures = [...state.projectData.features, { title: 'New Feature', description: 'Description', image: '' }];
    return { projectData: { ...state.projectData, features: newFeatures }, isDirty: true };
  }),

  removeFeature: (index) => set((state) => {
    if (!state.projectData) return state;
    const newFeatures = state.projectData.features.filter((_, i) => i !== index);
    return { projectData: { ...state.projectData, features: newFeatures }, isDirty: true };
  }),

  updateIngredient: (index, item) => set((state) => {
    if (!state.projectData || !state.projectData.ingredients) return state;
    if (index === -1) {
      return { projectData: { ...state.projectData, ingredients: { ...state.projectData.ingredients, ...item } }, isDirty: true };
    }
    const newItems = [...state.projectData.ingredients.items];
    newItems[index] = { ...newItems[index], ...item };
    return { projectData: { ...state.projectData, ingredients: { ...state.projectData.ingredients, items: newItems } }, isDirty: true };
  }),

  addIngredient: () => set((state) => {
    if (!state.projectData || !state.projectData.ingredients) return state;
    const newItems = [...state.projectData.ingredients.items, { title: 'New Ingredient', description: 'Description', image: '' }];
    return { projectData: { ...state.projectData, ingredients: { ...state.projectData.ingredients, items: newItems } }, isDirty: true };
  }),

  removeIngredient: (index) => set((state) => {
    if (!state.projectData || !state.projectData.ingredients) return state;
    const newItems = state.projectData.ingredients.items.filter((_, i) => i !== index);
    return { projectData: { ...state.projectData, ingredients: { ...state.projectData.ingredients, items: newItems } }, isDirty: true };
  }),

  updateBenefit: (index, item) => set((state) => {
    if (!state.projectData || !state.projectData.benefits) return state;
    if (index === -1) {
      return { projectData: { ...state.projectData, benefits: { ...state.projectData.benefits, ...item } }, isDirty: true };
    }
    const newItems = [...state.projectData.benefits.items];
    newItems[index] = { ...newItems[index], ...item };
    return { projectData: { ...state.projectData, benefits: { ...state.projectData.benefits, items: newItems } }, isDirty: true };
  }),

  addBenefit: () => set((state) => {
    if (!state.projectData || !state.projectData.benefits) return state;
    const newItems = [...state.projectData.benefits.items, { title: 'New Benefit', description: 'Description' }];
    return { projectData: { ...state.projectData, benefits: { ...state.projectData.benefits, items: newItems } }, isDirty: true };
  }),

  removeBenefit: (index) => set((state) => {
    if (!state.projectData || !state.projectData.benefits) return state;
    const newItems = state.projectData.benefits.items.filter((_, i) => i !== index);
    return { projectData: { ...state.projectData, benefits: { ...state.projectData.benefits, items: newItems } }, isDirty: true };
  }),

  updatePricing: (index, plan) => set((state) => {
    if (!state.projectData) return state;
    const newPricing = [...state.projectData.pricing];
    newPricing[index] = { ...newPricing[index], ...plan };
    return { projectData: { ...state.projectData, pricing: newPricing }, isDirty: true };
  }),

  addPricing: () => set((state) => {
    if (!state.projectData) return state;
    const newPricing = [...state.projectData.pricing, { title: 'New Plan', multiplier: 'X1', price: '49', features: [], buttonText: 'Buy Now', buttonHref: '#' }];
    return { projectData: { ...state.projectData, pricing: newPricing }, isDirty: true };
  }),

  removePricing: (index) => set((state) => {
    if (!state.projectData) return state;
    const newPricing = state.projectData.pricing.filter((_, i) => i !== index);
    return { projectData: { ...state.projectData, pricing: newPricing }, isDirty: true };
  }),

  updateFAQ: (index, faq) => set((state) => {
    if (!state.projectData) return state;
    const newFAQ = [...state.projectData.faq];
    newFAQ[index] = { ...newFAQ[index], ...faq };
    return { projectData: { ...state.projectData, faq: newFAQ }, isDirty: true };
  }),

  addFAQ: () => set((state) => {
    if (!state.projectData) return state;
    const newFAQ = [...state.projectData.faq, { question: 'New Question', answer: 'New Answer' }];
    return { projectData: { ...state.projectData, faq: newFAQ }, isDirty: true };
  }),

  removeFAQ: (index) => set((state) => {
    if (!state.projectData) return state;
    const newFAQ = state.projectData.faq.filter((_, i) => i !== index);
    return { projectData: { ...state.projectData, faq: newFAQ }, isDirty: true };
  }),

  updateTheme: (theme) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, theme: { ...state.projectData.theme, ...theme } } : null,
    isDirty: true
  })),

  updateLayoutStyle: (style) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, layoutStyle: style } : null,
    isDirty: true
  })),

  updateFooter: (footer) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, footer: { ...state.projectData.footer, ...footer } } : null,
    isDirty: true
  })),
  updateSEO: (seo) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, seo: { ...state.projectData.seo, ...seo } as any } : null,
    isDirty: true
  })),
  updateProjectData: (data) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, ...data } : null,
    isDirty: true
  })),
  updateTestimonials: (index: number, testimonial: Partial<ProjectData['testimonials'] & ProjectData['testimonials']['items'][0]>) => set((state) => {
    if (!state.projectData || !state.projectData.testimonials) return state;
    const newItems = [...state.projectData.testimonials.items];
    if (index === -1) {
      // Update title/subtitle
      return {
        projectData: {
          ...state.projectData,
          testimonials: { ...state.projectData.testimonials, ...testimonial as any }
        },
        isDirty: true
      };
    }
    newItems[index] = { ...newItems[index], ...testimonial };
    return {
      projectData: {
        ...state.projectData,
        testimonials: { ...state.projectData.testimonials, items: newItems }
      },
      isDirty: true
    };
  }),
  addTestimonial: () => set((state) => {
    if (!state.projectData) return state;
    const current = state.projectData.testimonials || { title: "Testimonials", items: [] };
    return {
      projectData: {
        ...state.projectData,
        testimonials: {
          ...current,
          items: [...current.items, { name: "New User", role: "Verified Buyer", content: "Write your review here...", rating: 5, image: "https://i.pravatar.cc/150" }]
        }
      },
      isDirty: true
    };
  }),
  removeTestimonial: (index) => set((state) => {
    if (!state.projectData || !state.projectData.testimonials) return state;
    const newItems = state.projectData.testimonials.items.filter((_, i) => i !== index);
    return {
      projectData: {
        ...state.projectData,
        testimonials: { ...state.projectData.testimonials, items: newItems }
      },
      isDirty: true
    };
  }),

  updateResearch: (research) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, research: { ...state.projectData.research, ...research } as any } : null,
    isDirty: true
  })),
  updateGallery: (gallery) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, gallery: { ...state.projectData.gallery, ...gallery } as any } : null,
    isDirty: true
  })),
  updateNavbar: (navbar) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, navbar: { ...state.projectData.navbar, ...navbar } } : null,
    isDirty: true
  })),
}));
