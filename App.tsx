import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SignatureProfile, TemplateType, SocialLink, SUPPORTED_FONTS, SOCIAL_PLATFORMS, LangCode, SavedProfile } from './types';
import { generateHtml, sanitizeHtml } from './utils/templates';
import { translations, getBrowserLang } from './utils/translations';
import { getProfileDefaults } from './utils/defaults';
import FormInput from './components/FormInput';
import { 
  Copy, Check, Layout, Palette, User, 
  Share2, Type as TypeIcon, 
  Plus, Trash2, Settings, Briefcase, Globe,
  Sun, Moon, Image as ImageIcon, ExternalLink,
  Target, QrCode, Save, FolderOpen, Share, HelpCircle, X, Shield
} from 'lucide-react';
import logo from './img/logo.webp';
import logoHeaderDark from './img/logo-header-dark.webp';
import footerLogoDark from './img/logo-footer-dark.webp';
import footerLogoLight from './img/logo-footer-light.webp';

const encodeBase64Utf8 = (str: string): string => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
};

const decodeBase64Utf8 = (str: string): string => {
  return decodeURIComponent(
    Array.from(atob(str))
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
};

const TABS = [
  { id: 'details', icon: User },
  { id: 'social', icon: Share2 },
  { id: 'design', icon: Palette },
  { id: 'addons', icon: Settings },
  { id: 'marketing', icon: Target },
];

const LANGUAGES: { code: LangCode; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'it', label: 'Italiano' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
];

const GLASS_CARD = "bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 shadow-xl rounded-3xl transition-colors duration-300";
const GLASS_INPUT = "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/30 dark:border-gray-600/50 focus:ring-2 focus:ring-indigo-500/50 rounded-xl";

export default function App() {
  const [lang, setLang] = useState<LangCode>(getBrowserLang());
  const [profile, setProfile] = useState<SignatureProfile>(() => getProfileDefaults(getBrowserLang()));
  
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>(TemplateType.MODERN);
  const [activeTab, setActiveTab] = useState('details');
  const [isCopied, setIsCopied] = useState(false);
  const [isShareCopied, setIsShareCopied] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [previewDarkMode, setPreviewDarkMode] = useState(false);

  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [newProfileName, setNewProfileName] = useState('');
  
  const [isDark, setIsDark] = useState(() => 
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  
  useEffect(() => {
    const stored = localStorage.getItem('kore_saved_profiles');
    if (stored) {
      try {
        setSavedProfiles(JSON.parse(stored));
      } catch (e) { console.error("Failed to load profiles", e); }
    }

    const params = new URLSearchParams(window.location.search);
    const sharedConfig = params.get('config');
    if (sharedConfig) {
      try {
        const decoded = JSON.parse(decodeBase64Utf8(sharedConfig));
        if (decoded && typeof decoded === 'object' && decoded.fullName) {
          setProfile(decoded);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (e) { console.error("Invalid share link", e); }
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    setProfile(prev => {
      const currentDisclaimer = prev.addons.disclaimer;
      const isDefault = Object.values(translations).some(t => t.generatedContent.disclaimer === currentDisclaimer) || currentDisclaimer === '';
      
      if (isDefault) {
        return {
          ...prev,
          addons: {
            ...prev.addons,
            disclaimer: translations[lang].generatedContent.disclaimer
          }
        };
      }
      return prev;
    });
  }, [lang]);

  const generatedHtml = useMemo(() => 
    generateHtml(profile, activeTemplate, translations[lang]),
    [profile, activeTemplate, lang]
  );

  const t = translations[lang];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleStyleChange = (key: keyof typeof profile.style, value: any) => {
    setProfile(prev => ({ ...prev, style: { ...prev.style, [key]: value } }));
  };

  const handleAddonChange = (key: keyof typeof profile.addons, value: any) => {
    setProfile(prev => ({ ...prev, addons: { ...prev.addons, [key]: value } }));
  };
  
  const handleMarketingChange = (key: keyof typeof profile.marketing, value: string) => {
    setProfile(prev => ({ ...prev, marketing: { ...prev.marketing, [key]: value } }));
  };

  const addSocial = () => {
    setProfile(prev => ({
      ...prev,
      socials: [...prev.socials, { platform: 'website', url: '' }]
    }));
  };

  const removeSocial = (index: number) => {
    setProfile(prev => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== index)
    }));
  };

  const updateSocial = (index: number, key: keyof SocialLink, value: string) => {
    const newSocials = [...profile.socials];
    newSocials[index] = { ...newSocials[index], [key]: value };
    setProfile(prev => ({ ...prev, socials: newSocials }));
  };

  const handleCopy = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html' });
    const textBlob = new Blob([generatedHtml], { type: 'text/plain' });
    const data = [new ClipboardItem({ 
      "text/html": blob,
      "text/plain": textBlob 
    })];
    
    navigator.clipboard.write(data).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => {
        navigator.clipboard.writeText(generatedHtml);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleSaveProfile = () => {
    if (!newProfileName.trim()) return;
    const newSaved: SavedProfile = {
      id: Date.now().toString(),
      name: newProfileName,
      data: profile,
      updatedAt: Date.now()
    };
    const updated = [...savedProfiles, newSaved];
    setSavedProfiles(updated);
    localStorage.setItem('kore_saved_profiles', JSON.stringify(updated));
    setNewProfileName('');
  };

  const handleLoadProfile = (id: string) => {
    const found = savedProfiles.find(p => p.id === id);
    if (found) setProfile(found.data);
  };

  const handleDeleteProfile = (id: string) => {
    const updated = savedProfiles.filter(p => p.id !== id);
    setSavedProfiles(updated);
    localStorage.setItem('kore_saved_profiles', JSON.stringify(updated));
  };

  const handleShare = async () => {
    const config = encodeBase64Utf8(JSON.stringify(profile));
    const url = `${window.location.origin}${window.location.pathname}?config=${encodeURIComponent(config)}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setIsShareCopied(true);
      setTimeout(() => setIsShareCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setIsShareCopied(true);
        setTimeout(() => setIsShareCopied(false), 2000);
      } catch (e) {
        console.error('Failed to copy URL', e);
        prompt('Copia questo link:', url);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative font-sans text-gray-900 dark:text-gray-100 overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* Dynamic Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden transition-colors duration-500 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-[#1e1b4b] dark:to-gray-950">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Header */}
      <header className="sticky top-2 sm:top-4 z-50 px-2 sm:px-6 lg:px-8 mb-4 sm:mb-6">
        <div className={`max-w-7xl mx-auto ${GLASS_CARD} px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3`}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0">
              <img src={logo} alt={t.labels.agencyLogoAlt} className="w-full h-full object-contain dark:hidden" />
              <img src={logoHeaderDark} alt={t.labels.agencyLogoAlt} className="w-full h-full object-contain hidden dark:inline" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                {t.title}
              </h1>
              <p className="text-[8px] sm:text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                {t.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Kore Agency Button */}
            <a 
              href="https://koreagency.it" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/30 backdrop-blur-md border border-indigo-400/50"
            >
              <span>{t.labels.visitAgency}</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all border border-white/20 dark:border-gray-700 backdrop-blur-sm"
            >
              {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
            
            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-full border border-white/20 dark:border-gray-700 backdrop-blur-sm">
              <Globe className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as LangCode)}
                className="bg-transparent text-gray-700 dark:text-gray-200 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className="dark:bg-gray-800">{l.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Controls */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* SAVED PROFILES SECTION */}
            <div className={GLASS_CARD + " p-5"}>
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                 <FolderOpen className="w-3.5 h-3.5" /> {t.labels.saveProfile}
              </h3>
              
              <div className="flex gap-2 mb-4">
                 <input 
                   type="text" 
                   value={newProfileName}
                   onChange={(e) => setNewProfileName(e.target.value)}
                   placeholder={t.placeholders.profileName}
                   className={`flex-1 ${GLASS_INPUT} px-3 py-2 text-xs`}
                 />
                 <button onClick={handleSaveProfile} className="bg-indigo-500 text-white rounded-xl px-4 py-2 text-xs font-bold hover:bg-indigo-600 transition-colors flex items-center gap-1">
                   <Save className="w-3 h-3" /> 
                 </button>
              </div>

              {savedProfiles.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                   {savedProfiles.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-white/30 dark:bg-black/20 text-xs">
                         <span className="font-medium truncate max-w-[150px]">{p.name}</span>
                         <div className="flex gap-1">
                            <button onClick={() => handleLoadProfile(p.id)} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                               {t.labels.loadProfile}
                            </button>
                            <button onClick={() => handleDeleteProfile(p.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                               <Trash2 className="w-3 h-3" />
                            </button>
                         </div>
                      </div>
                   ))}
                </div>
              )}
            </div>

            <div className={`${GLASS_CARD} overflow-hidden`}>
              {/* Glass Tabs with improved mobile scrolling */}
              <div className="flex p-2 sm:p-4 gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
                {TABS.map((tab) => {
                   const Icon = tab.icon;
                   const isActive = activeTab === tab.id;
                   return (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-shrink-0 sm:flex-1 py-2 sm:py-3 px-3 sm:px-2 flex flex-col items-center gap-1 sm:gap-1.5 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-bold uppercase tracking-wide transition-all duration-300 min-w-[60px] sm:min-w-0 ${
                          isActive 
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 transform scale-[1.02]' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-white/40 dark:hover:bg-gray-700/40'
                        }`}
                     >
                       <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'opacity-70'}`} />
                       <span className="whitespace-nowrap">{t.tabs[tab.id as keyof typeof t.tabs]}</span>
                     </button>
                   );
                })}
              </div>

              {/* Tab Content Area */}
              <div className="p-4 sm:p-6 min-h-[400px] sm:min-h-[500px] border-t border-white/20 dark:border-gray-700/30">
                
                {activeTab === 'details' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput label={t.labels.fullName} name="fullName" value={profile.fullName} onChange={handleInputChange} />
                      <FormInput label={t.labels.jobTitle} name="jobTitle" value={profile.jobTitle} onChange={handleInputChange} placeholder={t.placeholders.jobTitle} />
                    </div>
                    <FormInput label={t.labels.company} name="company" value={profile.company} onChange={handleInputChange} placeholder={t.placeholders.company} />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput label={t.labels.logoUrl} name="logoUrl" value={profile.logoUrl} onChange={handleInputChange} placeholder={t.placeholders.url} />
                      <FormInput label={t.labels.logoLink} name="logoLink" value={profile.logoLink} onChange={handleInputChange} placeholder={t.placeholders.url} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormInput label={t.labels.email} name="email" value={profile.email} onChange={handleInputChange} type="email" placeholder={t.placeholders.email} />
                      <FormInput label={t.labels.website} name="website" value={profile.website} onChange={handleInputChange} placeholder={t.placeholders.url} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormInput label={t.labels.phone} name="phone" value={profile.phone} onChange={handleInputChange} placeholder={t.placeholders.phone} />
                      <FormInput label={t.labels.mobile} name="mobile" value={profile.mobile} onChange={handleInputChange} placeholder={t.placeholders.mobile} />
                    </div>
                    <FormInput label={t.labels.address} name="address" value={profile.address} onChange={handleInputChange} placeholder={t.placeholders.address} />
                    <FormInput label={t.labels.avatarUrl} name="avatarUrl" value={profile.avatarUrl} onChange={handleInputChange} placeholder={t.placeholders.url} />
                  </div>
                )}

                {activeTab === 'social' && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">{t.labels.socialProfiles}</h3>
                      <button onClick={addSocial} className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors font-semibold">
                        <Plus className="w-3.5 h-3.5" /> {t.labels.addSocial}
                      </button>
                    </div>
                    
                    {profile.socials.length === 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t.labels.noSocials}</p>
                    )}

                    {profile.socials.map((social, idx) => (
                      <div key={idx} className={`${GLASS_INPUT} p-3 flex items-center gap-2 group`}>
                        <div className="flex-1 space-y-2">
                           <select
                              value={social.platform}
                              onChange={(e) => updateSocial(idx, 'platform', e.target.value)}
                              className="w-full text-xs bg-transparent border-b border-gray-200 dark:border-gray-600 py-1.5 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
                           >
                             {SOCIAL_PLATFORMS.map(p => (
                               <option key={p} value={p} className="dark:bg-gray-800">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                             ))}
                           </select>
                           <input
                              type="text"
                              value={social.url}
                              onChange={(e) => updateSocial(idx, 'url', e.target.value)}
                              placeholder={t.placeholders.url}
                              className="w-full text-xs bg-transparent border-none p-0 text-gray-600 dark:text-gray-400 focus:ring-0 placeholder-gray-400/70"
                           />
                        </div>
                        <button 
                          onClick={() => removeSocial(idx)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'design' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    <div>
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4 block flex items-center gap-2">
                        <Layout className="w-3.5 h-3.5" /> {t.labels.layout}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.values(TemplateType).map((type) => (
                          <button
                            key={type}
                            onClick={() => setActiveTemplate(type)}
                            className={`px-3 py-3 text-[10px] font-bold uppercase tracking-wide rounded-xl border transition-all duration-300 ${
                              activeTemplate === type 
                                ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/30 scale-105' 
                                : 'bg-white/40 dark:bg-gray-800/40 border-white/40 dark:border-gray-600/50 text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-700/60'
                            }`}
                          >
                            {type.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 block">{t.labels.themeColor}</label>
                        <div className="flex items-center gap-3">
                           <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-inner ring-2 ring-white/50 dark:ring-gray-600/50">
                             <input 
                                type="color" 
                                value={profile.style.themeColor}
                                onChange={(e) => handleStyleChange('themeColor', e.target.value)}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                              />
                           </div>
                           <span className="text-xs font-mono bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-md border border-white/20 dark:border-gray-600">{profile.style.themeColor}</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 block">{t.labels.textColor}</label>
                        <div className="flex items-center gap-3">
                           <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-inner ring-2 ring-white/50 dark:ring-gray-600/50">
                             <input 
                                type="color" 
                                value={profile.style.textColor || '#333333'}
                                onChange={(e) => handleStyleChange('textColor', e.target.value)}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                              />
                           </div>
                           <span className="text-xs font-mono bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-md border border-white/20 dark:border-gray-600">{profile.style.textColor || '#333333'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 block">{t.labels.cardBackgroundColor}</label>
                        <div className="flex items-center gap-3">
                           <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-inner ring-2 ring-white/50 dark:ring-gray-600/50">
                             <input 
                                type="color" 
                                value={profile.style.cardBackgroundColor || '#ffffff'}
                                onChange={(e) => handleStyleChange('cardBackgroundColor', e.target.value)}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                              />
                           </div>
                           <span className="text-xs font-mono bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-md border border-white/20 dark:border-gray-600">{profile.style.cardBackgroundColor || '#ffffff'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 block">{t.labels.cardBorderRadius} ({profile.style.cardBorderRadius}px)</label>
                        <input 
                           type="range"
                           min="0"
                           max="30"
                           step="1"
                           value={profile.style.cardBorderRadius || 0}
                           onChange={(e) => handleStyleChange('cardBorderRadius', parseInt(e.target.value))}
                           className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 block">{t.labels.imageShape}</label>
                        <select 
                          value={profile.style.imageShape}
                          onChange={(e) => handleStyleChange('imageShape', e.target.value)}
                          className={`w-full ${GLASS_INPUT} px-3 py-2 text-sm appearance-none cursor-pointer`}
                        >
                          <option className="dark:bg-gray-800" value="circle">{t.shapes.circle}</option>
                          <option className="dark:bg-gray-800" value="rounded">{t.shapes.rounded}</option>
                          <option className="dark:bg-gray-800" value="square">{t.shapes.square}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 block flex items-center gap-2">
                           <TypeIcon className="w-3.5 h-3.5" /> {t.labels.typography}
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                           <select 
                              value={profile.style.fontFamily}
                              onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                              className={`w-full ${GLASS_INPUT} px-3 py-2 text-sm appearance-none cursor-pointer`}
                           >
                              {SUPPORTED_FONTS.map(f => (
                                <option key={f} value={f} className="dark:bg-gray-800">{f.split(',')[0]}</option>
                              ))}
                           </select>
                           
                           <select 
                              value={profile.style.fontSize}
                              onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                              className={`w-full ${GLASS_INPUT} px-3 py-2 text-sm appearance-none cursor-pointer`}
                           >
                              <option className="dark:bg-gray-800" value="small">{t.sizes.small}</option>
                              <option className="dark:bg-gray-800" value="medium">{t.sizes.medium}</option>
                              <option className="dark:bg-gray-800" value="large">{t.sizes.large}</option>
                           </select>
                        </div>
                    </div>
                  </div>
                )}

                {activeTab === 'marketing' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl border border-yellow-200 dark:border-yellow-700/50 leading-relaxed">
                       {t.labels.marketingDescription}
                    </p>
                    <FormInput label={t.labels.utmSource} name="utmSource" value={profile.marketing.utmSource} onChange={(e) => handleMarketingChange('utmSource', e.target.value)} placeholder={t.placeholders.utmSource} />
                    <FormInput label={t.labels.utmMedium} name="utmMedium" value={profile.marketing.utmMedium} onChange={(e) => handleMarketingChange('utmMedium', e.target.value)} placeholder={t.placeholders.utmMedium} />
                    <FormInput label={t.labels.utmCampaign} name="utmCampaign" value={profile.marketing.utmCampaign} onChange={(e) => handleMarketingChange('utmCampaign', e.target.value)} placeholder={t.placeholders.utmCampaign} />
                  </div>
                )}

                {activeTab === 'addons' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100/50 dark:border-blue-800/30 backdrop-blur-sm">
                      <h3 className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2 uppercase tracking-wide">
                        <Briefcase className="w-4 h-4" /> {t.labels.ctaButton}
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase mb-1 block">{t.labels.ctaText}</label>
                              <input
                                  type="text"
                                  value={profile.addons.ctaText}
                                  onChange={(e) => handleAddonChange('ctaText', e.target.value)}
                                  className="w-full text-xs bg-white/60 dark:bg-gray-900/60 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400/50"
                                  placeholder={t.placeholders.cta}
                              />
                           </div>
                           <div>
                              <label className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase mb-1 block">{t.labels.ctaColor}</label>
                              <div className="relative w-full h-[34px] rounded-lg overflow-hidden border border-blue-200 dark:border-blue-800 bg-white/60 dark:bg-gray-900/60">
                                <input 
                                    type="color" 
                                    value={profile.addons.ctaColor}
                                    onChange={(e) => handleAddonChange('ctaColor', e.target.value)}
                                    className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer"
                                  />
                              </div>
                           </div>
                        </div>
                        <div>
                           <label className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase mb-1 block">{t.labels.ctaUrl}</label>
                           <input
                              type="text"
                              value={profile.addons.ctaUrl}
                              onChange={(e) => handleAddonChange('ctaUrl', e.target.value)}
                              className="w-full text-xs bg-white/60 dark:bg-gray-900/60 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400/50"
                              placeholder={t.placeholders.url}
                           />
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50/50 dark:bg-purple-900/10 p-5 rounded-2xl border border-purple-100/50 dark:border-purple-800/30 backdrop-blur-sm">
                       <h3 className="text-xs font-bold text-purple-800 dark:text-purple-300 mb-4 flex items-center gap-2 uppercase tracking-wide">
                         <ImageIcon className="w-4 h-4" /> {t.labels.bannerUrl}
                       </h3>
                       <input
                          type="text"
                          value={profile.addons.bannerUrl || ''}
                          onChange={(e) => handleAddonChange('bannerUrl', e.target.value)}
                          className="w-full text-xs bg-white/60 dark:bg-gray-900/60 border border-purple-200 dark:border-purple-800 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-400/50"
                          placeholder={t.placeholders.url}
                       />
                    </div>

                    <div className="space-y-4">
                       <div>
                         <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 block">{t.labels.legalDisclaimer}</label>
                         <textarea
                            value={profile.addons.disclaimer}
                            onChange={(e) => handleAddonChange('disclaimer', e.target.value)}
                            rows={4}
                            className={`w-full ${GLASS_INPUT} px-3 py-2 text-xs resize-none`}
                         />
                       </div>

                       <div className="flex items-center gap-3 p-4 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100/50 dark:border-green-800/30 backdrop-blur-sm cursor-pointer" onClick={() => handleAddonChange('greenMessage', !profile.addons.greenMessage)}>
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${profile.addons.greenMessage ? 'bg-green-500 border-green-500' : 'bg-transparent border-green-400'}`}>
                             {profile.addons.greenMessage && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span className="text-xs font-bold text-green-800 dark:text-green-300 select-none uppercase tracking-wide">
                             {t.labels.ecoMessage}
                          </span>
                       </div>

                       <div className="flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100/50 dark:border-gray-700/30 backdrop-blur-sm cursor-pointer" onClick={() => handleAddonChange('includeQr', !profile.addons.includeQr)}>
                          <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${profile.addons.includeQr ? 'bg-gray-800 border-gray-800' : 'bg-transparent border-gray-400'}`}>
                             {profile.addons.includeQr && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-300 select-none uppercase tracking-wide flex items-center gap-2">
                             <QrCode className="w-4 h-4" /> {t.labels.includeQr}
                          </span>
                       </div>
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Preview & Code */}
          <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-6 lg:sticky lg:top-28 lg:h-fit">
            
            {/* Live Preview Card */}
            <div className={GLASS_CARD}>
               <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-white/20 dark:border-gray-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-400/80 shadow-sm"></div>
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-400/80 shadow-sm"></div>
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-400/80 shadow-sm"></div>
                 </div>
                 <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1 sm:gap-2 cursor-pointer" onClick={() => setPreviewDarkMode(!previewDarkMode)}>
                       <div className={`w-7 h-3.5 sm:w-8 sm:h-4 rounded-full p-0.5 duration-300 ${previewDarkMode ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                          <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full shadow-md transform duration-300 ${previewDarkMode ? 'translate-x-3 sm:translate-x-4' : 'translate-x-0'}`}></div>
                       </div>
                       <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{t.labels.previewDarkMode}</span>
                    </div>
                    <button onClick={() => setShowInstallModal(true)} className="text-[8px] sm:text-[10px] font-bold text-indigo-500 hover:text-indigo-600 uppercase flex items-center gap-1">
                       <HelpCircle className="w-3 h-3" /> <span className="hidden xs:inline">{t.labels.installGuide}</span>
                    </button>
                    <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t.labels.livePreview}</span>
                 </div>
               </div>
               
               <div className="p-3 sm:p-8 min-h-[250px] sm:min-h-[300px] flex flex-col justify-center items-center bg-white/30 dark:bg-black/20 backdrop-blur-sm rounded-b-3xl">
                  {/* Preview Container: bg-white by default, or gray-900 if dark mode toggled */}
                  <div className={`rounded-xl shadow-2xl p-3 sm:p-8 w-full max-w-2xl mx-auto border border-white/50 animate-in zoom-in-95 duration-500 overflow-x-auto transition-colors ${previewDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                     <div 
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(generatedHtml) }} 
                        className="w-full transition-all duration-300" 
                        style={{
                           filter: !previewDarkMode ? 'drop-shadow(0 0 15px rgba(0,0,0,0.1))' : 'none'
                        }}
                     />
                  </div>
               </div>
            </div>

            {/* Source Code Card */}
            <div className="bg-gray-900/80 dark:bg-black/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-700/50 overflow-hidden group">
              <div className="px-3 sm:px-6 py-2 sm:py-3 bg-white/5 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-[10px] sm:text-xs font-mono text-gray-400">{t.labels.htmlSource}: {t.labels.htmlFileName}</span>
                <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
                   <button 
                    onClick={handleShare}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 rounded-lg text-[8px] sm:text-[10px] font-bold transition-all uppercase tracking-wide bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10`}
                  >
                    {isShareCopied ? <Check className="w-3 h-3" /> : <Share className="w-3 h-3" />}
                    <span className="hidden xs:inline">{isShareCopied ? t.labels.copied : t.labels.shareProfile}</span>
                  </button>
                  <button 
                    onClick={handleCopy}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 rounded-lg text-[8px] sm:text-[10px] font-bold transition-all uppercase tracking-wide ${
                      isCopied 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                        : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span className="hidden xs:inline">{isCopied ? t.labels.copied : t.labels.copyHtml}</span>
                  </button>
                </div>
              </div>
              <div className="p-3 sm:p-5 overflow-x-auto relative">
                <pre className="text-[8px] sm:text-[10px] text-indigo-200/80 font-mono leading-relaxed whitespace-pre-wrap break-all max-h-32 sm:max-h-48 overflow-y-auto custom-scrollbar">
                  {generatedHtml}
                </pre>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Installation Guide Modal */}
      {showInstallModal && (
         <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-2 sm:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInstallModal(false)}></div>
            <div className={`relative w-full max-w-2xl max-h-[90vh] ${GLASS_CARD} p-0 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200 rounded-t-3xl sm:rounded-3xl`}>
               <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200/20 dark:border-gray-700/50 flex justify-between items-center bg-white/40 dark:bg-black/40">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                     <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" /> {t.labels.installGuide}
                  </h3>
                  <button onClick={() => setShowInstallModal(false)} className="text-gray-500 hover:text-red-500 transition-colors p-1">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               <div className="p-4 sm:p-6 grid gap-4 sm:gap-6 overflow-y-auto max-h-[70vh]">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-3 sm:p-4 rounded-xl border border-white/20 dark:border-gray-700/50">
                     <h4 className="font-bold text-red-500 mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">{t.labels.gmail}</h4>
                     <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{t.installGuides.gmail}</p>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-3 sm:p-4 rounded-xl border border-white/20 dark:border-gray-700/50">
                     <h4 className="font-bold text-blue-500 mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">{t.labels.outlook}</h4>
                     <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{t.installGuides.outlook}</p>
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-3 sm:p-4 rounded-xl border border-white/20 dark:border-gray-700/50">
                     <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">{t.labels.appleMail}</h4>
                     <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{t.installGuides.apple}</p>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Privacy & Footer */}
      <div className="mt-auto pt-8 sm:pt-12 text-center relative z-10 px-3 sm:px-4">
        <div className="inline-block max-w-2xl mx-auto mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-800/30 backdrop-blur-sm">
           <p className="text-[10px] sm:text-xs text-indigo-800 dark:text-indigo-300 flex items-center justify-center gap-2 leading-relaxed">
             <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
             {t.privacyNotice}
           </p>
        </div>

        <footer className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 pb-4">
          <p className="mb-1 flex items-center justify-center gap-2">
            <span>{t.footer.madeBy}</span>
            <a href="https://koreagency.it" target="_blank" rel="noopener noreferrer" className="inline-flex items-center hover:opacity-90">
              <img src={footerLogoLight} alt={t.labels.agencyLogoAlt} className="h-7 w-auto dark:hidden" />
              <img src={footerLogoDark} alt={t.labels.agencyLogoAlt} className="h-7 w-auto hidden dark:inline" />
            </a>
          </p>
          <p className="opacity-70 text-[10px]">
            &copy; {new Date().getFullYear()} {t.labels.agencyName}. {t.footer.copyright}
          </p>
        </footer>
      </div>
    </div>
  );
}
