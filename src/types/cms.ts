export interface HeroContent {
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    ctaPrimaryText: string;
    ctaSecondaryText: string;
    backgroundImageUrl?: string;
}

export interface AboutPillar {
    num: string;
    title: string;
    body: string;
}

export interface AboutContent {
    label: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    imageUrl?: string;
    imageCaptionTitle: string;
    imageCaptionSub: string;
    stats: { label: string; value: string; sub: string }[];
    pillars: AboutPillar[];
}

export interface PhilosophyPrinciple {
    num: string;
    title: string;
    text: string;
}

export interface PhilosophySymbol {
    title: string;
    value: string;
    sub: string;
    color: string;
}

export interface PhilosophyContent {
    label: string;
    titleLine1: string;
    titleLine2: string;
    description: string[];
    symbols: PhilosophySymbol[];
    principlesLabel: string;
    principles: PhilosophyPrinciple[];
    saluteQuoteLine1: string;
    saluteQuoteLine2: string;
    saluteQuoteAuthor: string;
    saluteExplanationTitle: string;
    saluteExplanationSub: string;
    saluteExplanationText: string;
    sourcesText: string;
}

export interface ScheduleSession {
    day: string;
    dayFr: string;
    time: string;
    location: string;
    type: string;
    focus: string;
}

export interface ScheduleStructure {
    phase: string;
    desc: string;
}

export interface ScheduleContent {
    label: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    sessions: ScheduleSession[];
    structureTitle: string;
    structure: ScheduleStructure[];
    benefitsTitle: string;
    benefits: string[];
    ctaTitle: string;
    ctaText: string;
    ctaSub: string;
}

export interface ContactInfo {
    iconName: string; // 'MapPin', 'Clock', etc. (mapped in frontend)
    label: string;
    value: string;
    sub: string;
    color: string;
}

export interface ContactFAQ {
    q: string;
    a: string;
}

export interface ContactContent {
    label: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    infoCards: ContactInfo[];
    whatsappNumber: string;
    whatsappMessage: string;
    faqLabel: string;
    faqs: ContactFAQ[];
    finalCtaLabel: string;
    finalCtaTitle: string;
    finalCtaDesc: string;
    finalCtaButton: string;
}

// Global SiteSettings map
export interface SiteSettings {
    hero: HeroContent;
    about: AboutContent;
    philosophy: PhilosophyContent;
    schedule: ScheduleContent;
    contact: ContactContent;
}

// Gallery types
export interface GalleryImage {
    id: string;
    src: string;
    label: string;
    cat: string;
    order_index?: number;
    created_at?: string;
}

// Event types
export interface EventImage {
    id: string;
    event_id: string;
    image_url: string;
    label?: string;
    order_index?: number;
    created_at?: string;
    created_by?: string;
}

export interface Event {
    id: string;
    title: string;
    description?: string;
    date: string;
    time?: string;
    location?: string;
    type: 'training' | 'competition' | 'ceremony' | 'stage';
    images?: EventImage[];
    created_at?: string;
    updated_at?: string;
    created_by?: string;
}
