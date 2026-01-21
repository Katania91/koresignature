import { SignatureProfile, LangCode } from "../types";
import { translations } from "./translations";

const BASE_PROFILE: SignatureProfile = {
  fullName: '',
  jobTitle: '',
  company: '',
  logoUrl: '',
  logoLink: '',
  email: '',
  phone: '',
  mobile: '',
  website: '',
  address: '',
  avatarUrl: 'https://i.pravatar.cc/300?img=5',
  socials: [],
  style: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 'medium',
    imageShape: 'circle',
    themeColor: '#EC4899',
    textColor: '#333333',
    iconStyle: 'original',
    cardBackgroundColor: '#ffffff',
    cardBorderRadius: 0
  },
  addons: {
    ctaText: '',
    ctaUrl: '',
    ctaColor: '#EC4899',
    bannerUrl: '',
    disclaimer: '',
    greenMessage: true,
    includeQr: false
  },
  marketing: {
    utmSource: '',
    utmMedium: '',
    utmCampaign: ''
  }
};

export const getProfileDefaults = (lang: LangCode): SignatureProfile => {
  const t = translations[lang] || translations.en;
  const specific: Partial<SignatureProfile> = {
    company: 'Kore Agency',
    email: 'hello@koreagency.it',
    website: 'https://koreagency.it',
    logoUrl: 'https://koreagency.it/wp-content/uploads/2025/10/korered-2.png',
    socials: [
      { platform: 'linkedin', url: '' },
      { platform: 'instagram', url: '' }
    ],
    jobTitle: t.placeholders.jobTitle || '',
    phone: t.placeholders.phone || '',
    mobile: t.placeholders.mobile || '',
    address: t.placeholders.address || ''
  };

  return {
    ...BASE_PROFILE,
    ...specific,
    style: { ...BASE_PROFILE.style },
    addons: { ...BASE_PROFILE.addons },
    marketing: { ...BASE_PROFILE.marketing }
  };
};
