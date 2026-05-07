import { create } from 'zustand';

export interface ProjectData {
  productName: string;
  hero: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonHref: string;
    icon?: string;
    iconColor?: string;
    secondaryButtonText?: string;
    secondaryButtonHref?: string;
    secondaryIcon?: string;
    secondaryIconColor?: string;
    image: string;
    imageAlt?: string;
    logoImage?: string;
    logoImageAlt?: string;
    imageIsCircular?: boolean;
    logoImageIsCircular?: boolean;
    badge?: {
      enabled: boolean;
      image: string;
      imageAlt?: string;
    };
  };
  logos: { src: string; alt?: string; isCircular?: boolean }[];
  features: {
    title: string;
    description: string;
    image: string;
    imageAlt?: string;
    isCircular?: boolean;
    href?: string;
  }[];
  about: {
    title: string;
    subtitle?: string;
    description: string;
    stats: { label: string; value: string }[];
    image: string;
    imageAlt?: string;
    isCircular?: boolean;
  };
  ingredients: {
    title: string;
    subtitle: string;
    items: { title: string; description: string; image: string; imageAlt?: string; isCircular?: boolean; href?: string }[];
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
      imageAlt?: string;
      isCircular?: boolean;
    }[];
  };
  benefits: {
    title: string;
    subtitle?: string;
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
    imageAlt?: string;
    isCircular?: boolean;
    isPrimary?: boolean;
    guaranteeBadge?: {
      text: string;
      icon: string;
    };
    buttonText: string;
    icon?: string;
    iconColor?: string;
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
    trustImageAlt?: string;
    trustImageIsCircular?: boolean;
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
    headerScripts?: string;
    footerScripts?: string;
  };
  theme: {
    primary: string;
    secondary: string;
  };
  layoutStyle?: 'default' | 'modern' | 'clinical' | 'organic';

  guaranteeHeadline?: string;
  guaranteeDescription?: string;
  guaranteeBadge?: {
    text: string;
    icon: string;
  };
  research?: {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    imageAlt?: string;
    isCircular?: boolean;
    stats: { label: string; value: string }[];
  };
  featuresTitle?: string;
  featuresSubtitle?: string;
  pricingTitle?: string;
  pricingSubtitle?: string;
  faqTitle?: string;
  faqSubtitle?: string;
  guaranteeTitle?: string;
  guaranteeSubtitle?: string;
  guaranteeSmallText?: string;
  footerHeadline?: string;
  sourcesTitle?: string;
  sources?: string;


  socialProof?: {
    enabled: boolean;
    interval: number;
    displayTime: number;
    items: {
      name: string;
      location: string;
      content: string; // e.g. "purchased 6 bottles"
      timeAgo: string; // e.g. "5 minutes ago"
      image?: string;
      imageAlt?: string;
      isCircular?: boolean;
    }[];
  };
  sections?: {
    features: boolean;
    about: boolean;
    research: boolean;
    benefits: boolean;
    guarantee: boolean;
    ingredients: boolean;
    testimonials: boolean;
    faq: boolean;
    pricing: boolean;
    sources: boolean;
  };
  legalPages?: {
    privacyPolicy: string;
    termsAndConditions: string;
    disclaimer: string;
  };
  orderLink?: string;
  timer?: {
    enabled: boolean;
    minutes: number;
    text: string;
    title?: string;
  };
  customSections?: {
    id: string;
    afterSection: string;
    type: 'text' | 'image-text' | 'text-image' | 'cards';
    title: string;
    content: string;
    image?: string;
    imageAlt?: string;
    bgColor?: string;
    textColor?: string;
    padding?: string;
    buttonText?: string;
    buttonHref?: string;
    icon?: string;
    iconColor?: string;
    cards?: {
      title: string;
      content: string;
      image?: string;
      imageAlt?: string;
      icon?: string;
      iconColor?: string;
      buttonText?: string;
      buttonHref?: string;
    }[];
  }[];
}


interface EditorState {
  projectData: ProjectData | null;
  projectId: string | null;
  setProjectId: (id: string | null) => void;
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
  updateBenefit: (index: number, item: Partial<ProjectData['benefits'] & ProjectData['benefits']['items'][0]>) => void;
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

  updateNavbar: (navbar: Partial<ProjectData['navbar']>) => void;
  updateSocialProof: (proof: Partial<ProjectData['socialProof']>) => void;
  updateSectionVisibility: (section: keyof NonNullable<ProjectData['sections']>, visible: boolean) => void;
  updateLegalPage: (page: keyof NonNullable<ProjectData['legalPages']>, content: string) => void;
  updateOrderLink: (link: string) => void;
  updateProjectData: (data: Partial<ProjectData>) => void;
  showLegalModal: boolean;
  setShowLegalModal: (show: boolean) => void;
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  version: number;
  updateTimer: (timer: Partial<ProjectData['timer']>) => void;
  addCustomSection: (afterSection: string) => void;
  updateCustomSection: (id: string, data: Partial<NonNullable<ProjectData['customSections']>[0]>) => void;
  removeCustomSection: (id: string) => void;
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
    imageAlt: "Glycopezil Product Bottle front view",
    logoImage: "",
    logoImageAlt: "Glycopezil Logo"
  },
  logos: [
    { src: "/image/gmo.webp", alt: "Non-GMO Certified" },
    { src: "/image/natural.webp", alt: "100% Natural Ingredients" },
    { src: "/image/gmp.webp", alt: "GMP Certified Facility" },
    { src: "/image/fda.webp", alt: "FDA Registered Facility" }
  ],
  features: [
    {
      title: "100% Non-GMO Sourced",
      description: "Every component inside Glycopezil comes from verified non-GMO sources, ensuring a wholesome, unmodified, and trustworthy formula that prioritizes purity in every dose you take for blood sugar and metabolic harmony.",
      image: "/image/gmo.webp",
      imageAlt: "Non-GMO Icon"
    },
    {
      title: "Botanical-Origin Formula",
      description: "Harnessing the strength of plant-sourced compounds, Glycopezil assists in nurturing glucose harmony, efficient metabolic activity, and comprehensive daily vitality through a gentle, earth-derived approach.",
      image: "/image/natural.webp",
      imageAlt: "Natural Formula Icon"
    },
    {
      title: "Rigorous GMP Standards",
      description: "Manufactured inside GMP-certified laboratories, Glycopezil passes through demanding quality inspections to guarantee integrity, cleanliness, and reliable strength in every single production cycle.",
      image: "/image/gmp.webp",
      imageAlt: "GMP Certified Icon"
    },
    {
      title: "Produced in FDA-Registered Labs",
      description: "Created within an FDA-registered production environment, Glycopezil follows established safety and manufacturing protocols for dietary supplements, delivering dependable quality that inspires genuine confidence.",
      image: "/image/fda.webp",
      imageAlt: "FDA Registered Icon"
    }
  ],
  about: {
    title: "Understanding the Glycopezil Formula",
    subtitle: "A deeper look into how our advanced botanical formula supports your wellness journey.",
    description: "Glycopezil is a cutting-edge, nature-inspired blood support supplement engineered to foster balanced glucose readings, strengthen metabolic resilience, and deliver unwavering energy across your entire day. Many Glycopezil reviews confirm that with the demands of contemporary living, from ultra-processed meals and emotional pressure to prolonged sitting, having reliable blood sugar support matters. Glycopezil collaborates with your body's inherent biochemistry to encourage stable blood sugar and total metabolic vitality.\n\nEach Glycopezil active ingredient has been carefully selected. This meticulously developed formula incorporates targeted botanicals celebrated for their capacity to promote efficient glucose processing, calibrated insulin signaling, and robust cellular energy generation. Does Glycopezil work? By empowering the body to handle glucose with greater precision, these blood support drops foster reliable energy output, smooth out blood sugar volatility, and nurture lasting metabolic steadiness and overall vigor.\n\nWhen incorporated consistently into a health-conscious routine, Glycopezil assists in sustaining daily vigor, calibrated metabolic processes, and prolonged wellness over time. Looking to buy Glycopezil? It is offered exclusively through this authorized website, the only place where Glycopezil is for sale with guaranteed authenticity. This organic blood sugar companion is thoughtfully composed to assist in preserving optimal glucose levels while encouraging steady metabolic engagement. Understanding how to take Glycopezil is straightforward, simply follow the recommended Glycopezil dosage per day for best results.\n\nPresented in convenient daily drops, Glycopezil functions to bolster glucose equilibrium and organic metabolic pathways. Through its pristine, plant-centered composition, it furnishes a straightforward and potent method to help safeguard healthy blood sugar, maintain energy throughout waking hours, and encourage sustained wellness over the long term.",
    stats: [
      { label: "Rating", value: "4.8/5" },
      { label: "Reviews", value: "350+" },
      { label: "Satisfaction", value: "99%" }
    ],
    image: "/image/banner-img.webp",
    imageAlt: "Formula Banner"
  },
  ingredients: {
    title: "Purposefully Chosen Natural Ingredients",
    subtitle: "Six powerful botanicals selected for their specific role in supporting glucose metabolism, antioxidant protection, and energy balance.",
    items: [
      {
        title: "Schisandra: Whole-Body Balance Tonic",
        description: "Revered in traditional herbalism for centuries, Schisandra acts as a multi-tasking adaptogen that encourages healthy liver activity and fosters internal equilibrium.",
        image: "/image/ingredient-schisandra.png",
        imageAlt: "Schisandra Ingredient"
      },
      {
        title: "Amla: Nutrient-Dense Rejuvenator",
        description: "Also called Indian gooseberry, Amla delivers exceptional antioxidants that fortify digestive processes and reinforce immune defenses.",
        image: "/image/ingredient-amla.png",
        imageAlt: "Amla Ingredient"
      },
      {
        title: "Theobroma Cacao: Cardiovascular Energizer",
        description: "Brimmed with heart-friendly flavonoids, Cacao strengthens vascular health and bolsters smooth blood flow for daily vitality.",
        image: "/image/ingredient-cacao.png",
        imageAlt: "Cacao Ingredient"
      },
      {
        title: "Rhodiola: Adaptogenic Stamina Fuel",
        description: "A celebrated adaptogenic herb, Rhodiola empowers the body to navigate daily pressures and sustains balanced energy reserves.",
        image: "/image/ingredient-rhodiola.png",
        imageAlt: "Rhodiola Ingredient"
      },
      {
        title: "Maqui Berry: Free-Radical Fighter",
        description: "Sourced from pristine landscapes, Maqui Berry is loaded with potent anthocyanins that shield cells from oxidative damage.",
        image: "/image/ingredient-maqui.png",
        imageAlt: "Maqui Berry Ingredient"
      },
      {
        title: "Haematococcus: Superior Cellular Shield",
        description: "This microalga yields astaxanthin, guarding cellular structures against environmental wear and promoting graceful aging.",
        image: "/image/ingredient-haematococcus.png",
        imageAlt: "Haematococcus Ingredient"
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
        image: "https://i.pravatar.cc/150?u=sarah",
        imageAlt: "Sarah M. Profile"
      },
      {
        name: "David K.",
        role: "Verified Buyer",
        content: "The best part about Glycopezil is how easy it is to use. Just a few drops and I'm good to go. My cravings for sweets have significantly decreased since I started using it.",
        rating: 5,
        image: "https://i.pravatar.cc/150?u=david",
        imageAlt: "David K. Profile"
      },
      {
        name: "Elena R.",
        role: "Verified Buyer",
        content: "Highly recommend Glycopezil for anyone looking for natural support. It's gentle yet effective. I've noticed I don't get those afternoon energy crashes anymore.",
        rating: 4,
        image: "https://i.pravatar.cc/150?u=elena",
        imageAlt: "Elena R. Profile"
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
      image: "/image/default.png",
      buttonText: "Buy Now For $69",
      buttonHref: "order.html",
      guaranteeBadge: {
        text: "60-DAY MONEY-BACK GUARANTEE",
        icon: "fa-solid fa-lock"
      }
    },
    {
      title: "Best Value Bundle",
      quantity: "6 Bottles",
      multiplier: "X6",
      price: "49",
      features: ["180 Day Supply", "Free Shipping", "Huge Savings Included"],
      image: "/image/default.png",
      imageAlt: "Best Value 6 Bottles",
      isPrimary: true,
      buttonText: "Buy Now For $294",
      buttonHref: "order.html",
      guaranteeBadge: {
        text: "60-DAY MONEY-BACK GUARANTEE",
        icon: "fa-solid fa-lock"
      }
    },
    {
      title: "Popular Choice",
      quantity: "3 Bottles",
      multiplier: "X3",
      price: "59",
      features: ["90 Day Supply", "Significant Savings"],
      image: "/image/default.png",
      buttonText: "Buy Now For $177",
      buttonHref: "order.html",
      guaranteeBadge: {
        text: "60-DAY MONEY-BACK GUARANTEE",
        icon: "fa-solid fa-lock"
      }
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
    trustImage: "/image/money-back-guarantee-..webp",
    trustImageAlt: "60-Day Money Back Guarantee Badge"
  },

  footerHeadline: "Final Thoughts",
  research: {
    title: "The Science of Blood Support",
    subtitle: "Clinically-focused formulation for maximum metabolic impact.",
    imageAlt: "Laboratory Research",
    description: "Glycopezil is built on a foundation of scientific research into botanical insulin-mimetics and glucose transporters. Our formula combines ancient wisdom with modern extraction techniques to deliver a product that doesn't just work, but excels in purity and bioavailability.",
    image: "/image/banner-img.webp",
    stats: [
      { label: "Purity Level", value: "99.9%" },
      { label: "Bioavailability", value: "High" },
      { label: "Safety Tested", value: "100%" }
    ]
  },

  theme: {
    primary: "#2C0D67",
    secondary: "#fbbf24"
  },
  layoutStyle: "default",
  featuresTitle: "What Sets Glycopezil Apart?",
  featuresSubtitle: "Our commitment to quality, purity, and effectiveness makes us a leader in natural blood support.",
  pricingTitle: "Select Your Dynamic Package",
  pricingSubtitle: "Choose the bundle that best fits your needs and start your journey today.",
  faqTitle: "Common Questions Answered",
  faqSubtitle: "Find answers to frequently asked questions about our formula and how to use it.",
  guaranteeTitle: "Pure Ingredients & Thoroughly Verified",
  guaranteeSubtitle: "Your satisfaction is our priority. We stand behind our product with a 60-day money-back guarantee. Zero Risk",
  guaranteeSmallText: "Zero Risk • Complete Satisfaction Promise",
  guaranteeHeadline: "Try Glycopezil Risk-Free For 60 Days",
  guaranteeDescription: "We are so confident in the metabolic power of Glycopezil that we back every single bottle with our ironclad 60-day money-back guarantee. If you are not absolutely wowed by the results you see in the mirror or how you feel each morning, simply contact our support team for a full, prompt refund of every penny—no questions asked.",
  seo: {
    title: "Glycopezil Official Site | Advanced Glucose Management",
    description: "Glycopezil delivers plant-powered glucose regulation for everyday vitality. Achieve stable blood sugar, enhanced metabolic function, and renewed energy. Shop the official store.",
    keywords: "Glycopezil, Glycopezil Official Website, Glycopezil blood sugar support, glucose balance, natural metabolism booster",
    ogTitle: "Glycopezil Official Site | Advanced Glucose Management",
    ogDescription: "Plant-powered glucose regulation for everyday vitality.",
    ogImage: "https://www.glycopezil-official.us/assets/image/index-img.webp",
    ogType: "website",
    twitterCard: "summary_large_image",
    headerScripts: "",
    footerScripts: ""
  },
  navbar: {
    links: [
      { label: "Features", href: "#features" },
      { label: "Ingredients", href: "#ingredients" },
      { label: "Testimonials", href: "#testimonials" },
      { label: "FAQ", href: "#faq" },
      { label: "Pricing", href: "#pricing" }
    ]
  },
  socialProof: {
    enabled: true,
    interval: 8000,
    displayTime: 5000,
    items: [
      { name: "Anthony", location: "Ohio", content: "purchased 6 bottles", timeAgo: "5 minutes ago", image: "/image/default.png", imageAlt: "Anthony Purchase" },
      { name: "Sarah", location: "California", content: "purchased 3 bottles", timeAgo: "12 minutes ago", image: "/image/default.png", imageAlt: "Sarah Purchase" },
      { name: "Michael", location: "Texas", content: "purchased 1 bottle", timeAgo: "24 minutes ago", image: "/image/default.png", imageAlt: "Michael Purchase" },
      { name: "James", location: "Florida", content: "purchased 6 bottles", timeAgo: "45 minutes ago", image: "/image/default.png", imageAlt: "James Purchase" },
      { name: "Emily", location: "New York", content: "purchased 3 bottles", timeAgo: "1 hour ago", image: "/image/default.png", imageAlt: "Emily Purchase" }
    ]
  },
  sections: {
    features: true,
    about: true,
    research: true,
    benefits: true,
    guarantee: true,
    ingredients: true,
    testimonials: true,
    faq: true,
    pricing: true,
    sources: true
  },
  legalPages: {
    privacyPolicy: "This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from this site...",
    termsAndConditions: "By accessing this website, we assume you accept these terms and conditions. Do not continue to use this site if you do not agree to take all of the terms and conditions stated on this page...",
    disclaimer: "The information provided on this website is for educational purposes only and is not intended as a substitute for professional medical advice..."
  },
  orderLink: "https://glycopezil.com/gpz-lp-buy-aff/?aff_id=1343&subid=unika-solo",
  timer: {
    enabled: true,
    minutes: 3,
    text: "HURRY! OFFER ENDS IN:",
    title: "LIMITED TIME OFFER"
  },
  customSections: []
};

export const useStore = create<EditorState>((set) => ({
  projectData: initialProjectData,
  projectId: null,
  setProjectId: (id) => set({ projectId: id }),
  isDirty: false,
  version: 0,
  setDirty: (dirty) => set({ isDirty: dirty }),
  setProjectData: (data) => set({ projectData: data, isDirty: false, version: 0 }),
  updateProductName: (name) => set((state) => {
    if (!state.projectData) return state;
    return { 
      projectData: { ...state.projectData, productName: name }, 
      isDirty: true, 
      version: state.version + 1 
    };
  }),

  updateHero: (hero) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, hero: { ...state.projectData.hero, ...hero } } : null,
    isDirty: true,
    version: state.version + 1
  })),

  updateAbout: (about) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, about: { ...state.projectData.about, ...about } } : null,
    isDirty: true,
    version: state.version + 1
  })),

  updateFeature: (index, feature) => set((state) => {
    if (!state.projectData) return state;
    const newFeatures = [...state.projectData.features];
    newFeatures[index] = { ...newFeatures[index], ...feature };
    return { projectData: { ...state.projectData, features: newFeatures }, isDirty: true, version: state.version + 1 };
  }),

  addFeature: () => set((state) => {
    if (!state.projectData) return state;
    const newFeatures = [...state.projectData.features, { title: 'New Feature', description: 'Description', image: '' }];
    return { projectData: { ...state.projectData, features: newFeatures }, isDirty: true, version: state.version + 1 };
  }),

  removeFeature: (index) => set((state) => {
    if (!state.projectData) return state;
    const newFeatures = state.projectData.features.filter((_, i) => i !== index);
    return { projectData: { ...state.projectData, features: newFeatures }, isDirty: true, version: state.version + 1 };
  }),

  updateIngredient: (index, item) => set((state) => {
    if (!state.projectData || !state.projectData.ingredients) return state;
    if (index === -1) {
      return { projectData: { ...state.projectData, ingredients: { ...state.projectData.ingredients, ...item } }, isDirty: true, version: state.version + 1 };
    }
    const newItems = [...state.projectData.ingredients.items];
    newItems[index] = { ...newItems[index], ...item };
    return { projectData: { ...state.projectData, ingredients: { ...state.projectData.ingredients, items: newItems } }, isDirty: true, version: state.version + 1 };
  }),

  addIngredient: () => set((state) => {
    if (!state.projectData || !state.projectData.ingredients) return state;
    const newItems = [...state.projectData.ingredients.items, { title: 'New Ingredient', description: 'Description', image: '' }];
    return { projectData: { ...state.projectData, ingredients: { ...state.projectData.ingredients, items: newItems } }, isDirty: true, version: state.version + 1 };
  }),

  removeIngredient: (index) => set((state) => {
    if (!state.projectData || !state.projectData.ingredients) return state;
    const newItems = state.projectData.ingredients.items.filter((_, i) => i !== index);
    return { projectData: { ...state.projectData, ingredients: { ...state.projectData.ingredients, items: newItems } }, isDirty: true, version: state.version + 1 };
  }),

  updateBenefit: (index, item) => set((state) => {
    if (!state.projectData || !state.projectData.benefits) return state;
    if (index === -1) {
      return { projectData: { ...state.projectData, benefits: { ...state.projectData.benefits, ...item } }, isDirty: true, version: state.version + 1 };
    }
    const newItems = [...state.projectData.benefits.items];
    newItems[index] = { ...newItems[index], ...item };
    return { projectData: { ...state.projectData, benefits: { ...state.projectData.benefits, items: newItems } }, isDirty: true, version: state.version + 1 };
  }),

  addBenefit: () => set((state) => {
    if (!state.projectData || !state.projectData.benefits) return state;
    const newItems = [...state.projectData.benefits.items, { title: 'New Benefit', description: 'Description' }];
    return { projectData: { ...state.projectData, benefits: { ...state.projectData.benefits, items: newItems } }, isDirty: true, version: state.version + 1 };
  }),

  removeBenefit: (index) => set((state) => {
    if (!state.projectData || !state.projectData.benefits) return state;
    const newItems = state.projectData.benefits.items.filter((_, i) => i !== index);
    return { projectData: { ...state.projectData, benefits: { ...state.projectData.benefits, items: newItems } }, isDirty: true, version: state.version + 1 };
  }),

  updatePricing: (index, plan) => set((state) => {
    if (!state.projectData) return state;
    const newPricing = [...state.projectData.pricing];
    newPricing[index] = { ...newPricing[index], ...plan };
    return { projectData: { ...state.projectData, pricing: newPricing }, isDirty: true, version: state.version + 1 };
  }),

  addPricing: () => set((state) => {
    if (!state.projectData) return state;
    const newPricing = [...state.projectData.pricing, { title: 'New Plan', multiplier: 'X1', price: '49', features: [], buttonText: 'Buy Now', buttonHref: '#' }];
    return { projectData: { ...state.projectData, pricing: newPricing }, isDirty: true, version: state.version + 1 };
  }),

  removePricing: (index) => set((state) => {
    if (!state.projectData) return state;
    const newPricing = state.projectData.pricing.filter((_, i) => i !== index);
    return { projectData: { ...state.projectData, pricing: newPricing }, isDirty: true, version: state.version + 1 };
  }),

  addCustomSection: (afterSection) => set((state) => {
    if (!state.projectData) return state;
    const newSection = {
      id: Math.random().toString(36).substr(2, 9),
      afterSection,
      type: 'text' as const,
      title: 'New Custom Section',
      content: 'Write your custom content here...',
      bgColor: '#ffffff',
      textColor: '#333333',
      padding: 'py-5',
      buttonText: '',
      buttonHref: '',
      cards: [] as { title: string; content: string; image?: string; icon?: string }[]
    };
    return {
      projectData: {
        ...state.projectData,
        customSections: [...(state.projectData.customSections || []), newSection]
      },
      isDirty: true,
      version: state.version + 1
    };
  }),

  updateCustomSection: (id, data) => set((state) => {
    if (!state.projectData) return state;
    const sections = state.projectData.customSections || [];
    const newSections = sections.map(s => s.id === id ? { ...s, ...data } : s);
    return {
      projectData: { ...state.projectData, customSections: newSections },
      isDirty: true,
      version: state.version + 1
    };
  }),

  removeCustomSection: (id) => set((state) => {
    if (!state.projectData) return state;
    const sections = state.projectData.customSections || [];
    const newSections = sections.filter(s => s.id !== id);
    return {
      projectData: { ...state.projectData, customSections: newSections },
      isDirty: true,
      version: state.version + 1
    };
  }),

  updateFAQ: (index, faq) => set((state) => {
    if (!state.projectData) return state;
    const newFAQ = [...state.projectData.faq];
    newFAQ[index] = { ...newFAQ[index], ...faq };
    return { projectData: { ...state.projectData, faq: newFAQ }, isDirty: true, version: state.version + 1 };
  }),

  addFAQ: () => set((state) => {
    if (!state.projectData) return state;
    const newFAQ = [...state.projectData.faq, { question: 'New Question', answer: 'New Answer' }];
    return { projectData: { ...state.projectData, faq: newFAQ }, isDirty: true, version: state.version + 1 };
  }),

  removeFAQ: (index) => set((state) => {
    if (!state.projectData) return state;
    const newFAQ = state.projectData.faq.filter((_, i) => i !== index);
    return { projectData: { ...state.projectData, faq: newFAQ }, isDirty: true, version: state.version + 1 };
  }),

  updateTheme: (theme) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, theme: { ...state.projectData.theme, ...theme } } : null,
    isDirty: true,
    version: state.version + 1
  })),

  updateLayoutStyle: (style) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, layoutStyle: style } : null,
    isDirty: true,
    version: state.version + 1
  })),

  updateFooter: (footer) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, footer: { ...state.projectData.footer, ...footer } } : null,
    isDirty: true,
    version: state.version + 1
  })),
  updateSEO: (seo) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, seo: { ...state.projectData.seo, ...seo } as any } : null,
    isDirty: true,
    version: state.version + 1
  })),
  updateProjectData: (data) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, ...data } : null,
    isDirty: true,
    version: state.version + 1
  })),
  updateTimer: (timer) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, timer: { ...state.projectData.timer, ...timer } as any } : null,
    isDirty: true,
    version: state.version + 1
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
        isDirty: true,
        version: state.version + 1
      };
    }
    newItems[index] = { ...newItems[index], ...testimonial };
    return {
      projectData: {
        ...state.projectData,
        testimonials: { ...state.projectData.testimonials, items: newItems }
      },
      isDirty: true,
      version: state.version + 1
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
      isDirty: true,
      version: state.version + 1
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
      isDirty: true,
      version: state.version + 1
    };
  }),

  updateResearch: (research) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, research: { ...state.projectData.research, ...research } as any } : null,
    isDirty: true,
    version: state.version + 1
  })),

  updateNavbar: (navbar) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, navbar: { ...state.projectData.navbar, ...navbar } } : null,
    isDirty: true,
    version: state.version + 1
  })),
  updateSocialProof: (proof) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, socialProof: { ...state.projectData.socialProof, ...proof } as any } : null,
    isDirty: true,
    version: state.version + 1
  })),
  updateSectionVisibility: (section, visible) => set((state) => {
    if (!state.projectData) return state;
    const currentSections = state.projectData.sections || {
      features: true, about: true, research: true, benefits: true, guarantee: true,
      ingredients: true, testimonials: true, faq: true, pricing: true, sources: true
    };
    return {
      projectData: {
        ...state.projectData,
        sections: { ...currentSections, [section]: visible }
      },
      isDirty: true,
      version: state.version + 1
    };
  }),
  updateLegalPage: (page, content) => set((state) => {
    if (!state.projectData) return state;
    return {
      projectData: {
        ...state.projectData,
        legalPages: { ...state.projectData.legalPages, [page]: content } as any
      },
      isDirty: true,
      version: state.version + 1
    };
  }),
  updateOrderLink: (link) => set((state) => ({
    projectData: state.projectData ? { ...state.projectData, orderLink: link } : null,
    isDirty: true,
    version: state.version + 1
  })),
  showLegalModal: false,
  setShowLegalModal: (show: boolean) => set({ showLegalModal: show }),
}));
