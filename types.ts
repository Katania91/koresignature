
export interface SocialLink {
  platform: string;
  url: string;
}

export interface StyleConfig {
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  imageShape: 'circle' | 'square' | 'rounded';
  themeColor: string;
  textColor: string; 
  iconStyle: 'original' | 'colored' | 'black' | 'white';
  cardBackgroundColor: string;
  cardBorderRadius: number;
}

export interface SignatureAddons {
  ctaText: string;
  ctaUrl: string;
  ctaColor: string;
  bannerUrl: string; 
  disclaimer: string;
  greenMessage: boolean;
  includeQr: boolean;
}

export interface MarketingConfig {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

export interface SignatureProfile {
  fullName: string;
  jobTitle: string;
  company: string;
  logoUrl: string; 
  logoLink: string; 
  email: string;
  phone: string;
  mobile: string;
  website: string;
  address: string;
  avatarUrl: string;
  socials: SocialLink[];
  style: StyleConfig;
  addons: SignatureAddons;
  marketing: MarketingConfig; 
}

export interface SavedProfile {
  id: string;
  name: string;
  data: SignatureProfile;
  updatedAt: number;
}

export enum TemplateType {
  CLASSIC = 'CLASSIC',
  MODERN = 'MODERN',
  MINIMAL = 'MINIMAL',
  SIDEBAR = 'SIDEBAR',
  HORIZONTAL = 'HORIZONTAL',
  CORPORATE = 'CORPORATE', 
  ELEGANT = 'ELEGANT',     
  CREATIVE = 'CREATIVE'    
}

export const SUPPORTED_FONTS = [
  'Arial, sans-serif',
  'Verdana, sans-serif',
  'Georgia, serif',
  'Times New Roman, serif',
  'Trebuchet MS, sans-serif',
  'Courier New, monospace',
  'Helvetica, sans-serif',
  'Tahoma, sans-serif',
  'Geneva, sans-serif',
  'Palatino Linotype, serif',
  'Garamond, serif',
  'Lucida Console, monospace'
];

export const SOCIAL_PLATFORMS = [
  'linkedin', 'twitter', 'x', 'facebook', 'instagram', 'youtube', 'github', 'tiktok', 'discord', 'website'
];

export type LangCode = 'en' | 'it' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ja';

export interface Translation {
  title: string;
  subtitle: string;
  tabs: {
    details: string;
    social: string;
    design: string;
    addons: string;
    marketing: string; 
  };
  shapes: {
    circle: string;
    rounded: string;
    square: string;
  };
  sizes: {
    small: string;
    medium: string;
    large: string;
  };
  labels: {
    fullName: string;
    jobTitle: string;
    company: string;
    logoUrl: string; 
    logoLink: string; 
    email: string;
    phone: string;
    mobile: string;
    website: string;
    address: string;
    avatarUrl: string;
    themeColor: string;
    textColor: string; 
    cardBackgroundColor: string;
    cardBorderRadius: string;
    imageShape: string;
    typography: string;
    layout: string;
    ctaButton: string;
    ctaText: string;
    ctaUrl: string;
    ctaColor: string;
    bannerUrl: string; 
    legalDisclaimer: string;
    ecoMessage: string;
    includeQr: string; 
    addSocial: string;
    copyHtml: string;
    copied: string;
    livePreview: string;
    previewDarkMode: string; 
    htmlSource: string;
    htmlFileName: string;
    noSocials: string;
    utmSource: string; 
    utmMedium: string; 
    utmCampaign: string; 
    saveProfile: string; 
    loadProfile: string; 
    shareProfile: string; 
    installGuide: string; 
    marketingDescription: string; 
    visitAgency: string;
    socialProfiles: string;
    gmail: string;
    outlook: string;
    appleMail: string;
    agencyName: string;
    agencyLogoAlt: string;
  };
  placeholders: {
    url: string;
    cta: string;
    profileName: string;
    email: string;
    phone: string;
    mobile: string;
    company: string;
    jobTitle: string;
    address: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
  };
  generatedContent: {
    abbreviations: {
      e: string; 
      p: string; 
      m: string; 
      w: string; 
      a: string; 
    };
    disclaimer: string;
    eco: string;
  };
  footer: {
    madeBy: string;
    copyright: string;
  };
  privacyNotice: string;
  installGuides: { 
    gmail: string;
    outlook: string;
    apple: string;
  }
}
