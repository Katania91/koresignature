import { SignatureProfile, TemplateType, Translation } from "../types";

// HTML entity encoding to prevent XSS
const escapeHtml = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Sanitize HTML output - removes dangerous elements/attributes
export const sanitizeHtml = (html: string): string => {
  // Remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, 'data-blocked:');
};

// Helper to append UTM parameters
const addUtm = (url: string, marketing: SignatureProfile['marketing']): string => {
  if (!url) return '';
  if (!marketing.utmSource && !marketing.utmMedium && !marketing.utmCampaign) return url;
  
  // Basic validation to check if it's a valid http url
  if (!url.startsWith('http')) return url;

  const separator = url.includes('?') ? '&' : '?';
  const parts = [];
  if (marketing.utmSource) parts.push(`utm_source=${encodeURIComponent(marketing.utmSource)}`);
  if (marketing.utmMedium) parts.push(`utm_medium=${encodeURIComponent(marketing.utmMedium)}`);
  if (marketing.utmCampaign) parts.push(`utm_campaign=${encodeURIComponent(marketing.utmCampaign)}`);
  
  if (parts.length === 0) return url;
  return `${url}${separator}${parts.join('&')}`;
};

// Helper to get icons
const getIconUrl = (platform: string, style: 'original' | 'colored' | 'black' | 'white', color: string) => {
  const baseUrl = "https://cdn-icons-png.flaticon.com/128";
  const map: Record<string, string> = {
    linkedin: "174/174857.png",
    twitter: "733/733579.png", 
    x: "5969/5969020.png",
    facebook: "733/733547.png",
    instagram: "174/174855.png",
    youtube: "1384/1384060.png",
    github: "733/733553.png",
    tiktok: "3046/3046121.png",
    discord: "5968/5968756.png",
    website: "14627/14627197.png"
  };

  const id = map[platform.toLowerCase()] || map['website'];
  return `${baseUrl}/${id}`;
};

const getFontSize = (size: 'small' | 'medium' | 'large', type: 'name' | 'body' | 'small') => {
  const base = size === 'small' ? 12 : size === 'medium' ? 14 : 16;
  if (type === 'name') return `${base + 4}px`;
  if (type === 'body') return `${base}px`;
  if (type === 'small') return `${base - 2}px`;
  return `${base}px`;
};

const getImageRadius = (shape: 'circle' | 'square' | 'rounded') => {
  if (shape === 'circle') return '50%';
  if (shape === 'rounded') return '8px';
  return '0px';
};

// Helper to calculate text contrast (Light vs Dark background)
const getContrastColor = (hexColor: string) => {
  const hex = hexColor.replace('#', '');
  let r = 0, g = 0, b = 0;

  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return { text: '#ffffff', border: 'rgba(255,255,255,0.3)' };
  }

  // Calculate luminance
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // If bright background, return dark text. Else return white.
  return yiq >= 128 
    ? { text: '#222222', border: 'rgba(0,0,0,0.15)' } 
    : { text: '#ffffff', border: 'rgba(255,255,255,0.3)' };
};

// Now accepts 't' (Translation object) to use localized abbreviations and messages
export const generateHtml = (profile: SignatureProfile, type: TemplateType, t: Translation): string => {
  // Escape all user inputs to prevent XSS
  const fullName = escapeHtml(profile.fullName);
  const jobTitle = escapeHtml(profile.jobTitle);
  const company = escapeHtml(profile.company);
  const logoUrl = escapeHtml(profile.logoUrl);
  const logoLink = escapeHtml(profile.logoLink);
  const email = escapeHtml(profile.email);
  const phone = escapeHtml(profile.phone);
  const mobile = escapeHtml(profile.mobile);
  const website = escapeHtml(profile.website);
  const address = escapeHtml(profile.address);
  const avatarUrl = escapeHtml(profile.avatarUrl);
  const socials = profile.socials.map(s => ({ platform: escapeHtml(s.platform), url: escapeHtml(s.url) }));
  const style = profile.style;
  const addons = {
    ...profile.addons,
    ctaText: escapeHtml(profile.addons.ctaText),
    ctaUrl: escapeHtml(profile.addons.ctaUrl),
    bannerUrl: escapeHtml(profile.addons.bannerUrl || ''),
    disclaimer: escapeHtml(profile.addons.disclaimer)
  };
  const marketing = profile.marketing;

  const color = style.themeColor;
  const textColor = style.textColor || '#333333';
  const cardBg = style.cardBackgroundColor || '#ffffff';
  const cardRadius = style.cardBorderRadius || 0;
  
  const font = style.fontFamily;
  const nameSize = getFontSize(style.fontSize, 'name');
  const bodySize = getFontSize(style.fontSize, 'body');
  const smallSize = getFontSize(style.fontSize, 'small');
  const imgRadius = getImageRadius(style.imageShape);
  const abbr = t.generatedContent.abbreviations; 

  // UTM Processing
  const utmWebsite = addUtm(website, marketing);
  const utmLogoLink = addUtm(logoLink, marketing);
  const utmCtaUrl = addUtm(addons.ctaUrl, marketing);

  // --- Sub-Components ---

  const renderQrCode = (align = 'left') => {
    if (!addons.includeQr) return '';
    // Generate vCard string
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nN:${fullName};;;\nFN:${fullName}\nORG:${company}\nTITLE:${jobTitle}\nTEL;TYPE=WORK,VOICE:${phone}\nTEL;TYPE=CELL,VOICE:${mobile}\nEMAIL:${email}\nURL:${website}\nADR;TYPE=WORK:;;${address};;;\nEND:VCARD`;
    const encodedVcard = encodeURIComponent(vcard);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedVcard}`;
    
    // Logic for center alignment
    const margin = align === 'center' ? '15px auto 0' : '15px 0 0';
    const display = align === 'center' ? 'block' : 'block';

    return `
      <div style="margin: ${margin}; width: 120px;">
        <img src="${qrUrl}" alt="Scan Contact" width="120" height="120" style="display: ${display}; border: 2px solid #eee; padding: 4px; background: #fff;" />
      </div>
    `;
  };

  const renderSocials = (minimal = false, align = 'left') => {
    if (!socials || socials.length === 0) return '';
    const size = minimal ? 16 : 24;
    const alignStyle = align === 'center' ? 'text-align: center;' : '';
    return `
      <div style="margin-top: ${minimal ? '6px' : '10px'}; ${alignStyle}">
        ${socials.map(s => `
          <a href="${addUtm(s.url, marketing)}" style="text-decoration: none; display: inline-block; margin-right: 5px;">
            <img src="${getIconUrl(s.platform, style.iconStyle, color)}" alt="${s.platform}" width="${size}" height="${size}" style="display: block;" />
          </a>
        `).join('')}
      </div>
    `;
  };

  const renderCTA = (align = 'left') => {
    if (!addons.ctaText || !addons.ctaUrl) return '';
    const btnColor = addons.ctaColor || color;
    const alignStyle = align === 'center' ? 'text-align: center;' : '';
    return `
      <div style="margin-top: 15px; margin-bottom: 10px; ${alignStyle}">
        <a href="${utmCtaUrl}" style="background-color: ${btnColor}; color: #ffffff; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: ${smallSize}; display: inline-block;">
          ${addons.ctaText}
        </a>
      </div>
    `;
  };

  const renderBanner = () => {
    if (!addons.bannerUrl) return '';
    return `
      <div style="margin-top: 15px; margin-bottom: 15px; width: 100%;">
        <img src="${addons.bannerUrl}" style="max-width: 100%; height: auto; display: block; border-radius: 4px;" alt="Banner" />
      </div>
    `;
  }

  const renderFooter = () => {
    let html = '';
    if (addons.greenMessage) {
      html += `
        <div style="margin-top: 15px; font-size: 11px; color: #2e7d32; font-style: italic;">
          ${t.generatedContent.eco}
        </div>
      `;
    }
    if (addons.disclaimer) {
      html += `
        <div style="margin-top: 10px; font-size: 10px; color: #999999; line-height: 1.4; border-top: 1px solid #eeeeee; padding-top: 5px; text-align: justify;">
          ${addons.disclaimer}
        </div>
      `;
    }
    return html;
  };

  const renderCompanyLogo = (marginTop = '0px', marginBottom = '0px', align = 'left', maxHeight = '60px') => {
    if (!logoUrl) return '';
    
    let alignStyle = '';
    if (align === 'center') {
      alignStyle = 'margin-left: auto; margin-right: auto;';
    } else if (align === 'right') {
      alignStyle = 'margin-left: auto;';
    }

    const imgContent = `<img src="${logoUrl}" alt="${company || 'Company Logo'}" style="display: block; height: auto; width: auto; max-height: ${maxHeight}; border: 0; ${alignStyle}" />`;
    
    const innerContent = logoLink 
      ? `<a href="${utmLogoLink}" style="text-decoration: none; border: 0;">${imgContent}</a>` 
      : imgContent;

    return `<div style="margin-top: ${marginTop}; margin-bottom: ${marginBottom};">${innerContent}</div>`;
  };

  const contactRows = `
    <table cellpadding="0" cellspacing="0" border="0" style="font-size: ${bodySize}; color: ${textColor}; margin-top: 8px;">
      ${email ? `<tr><td style="padding-bottom: 4px; padding-right: 10px;"><strong style="color: ${color}">${abbr.e}</strong></td><td><a href="mailto:${email}" style="color: ${textColor}; text-decoration: none;">${email}</a></td></tr>` : ''}
      ${phone ? `<tr><td style="padding-bottom: 4px; padding-right: 10px;"><strong style="color: ${color}">${abbr.p}</strong></td><td>${phone}</td></tr>` : ''}
      ${mobile ? `<tr><td style="padding-bottom: 4px; padding-right: 10px;"><strong style="color: ${color}">${abbr.m}</strong></td><td>${mobile}</td></tr>` : ''}
      ${website ? `<tr><td style="padding-bottom: 4px; padding-right: 10px;"><strong style="color: ${color}">${abbr.w}</strong></td><td><a href="${utmWebsite}" style="color: ${textColor}; text-decoration: none;">${website.replace(/^https?:\/\//, '')}</a></td></tr>` : ''}
      ${address ? `<tr><td style="padding-bottom: 4px; padding-right: 10px; vertical-align: top;"><strong style="color: ${color}">${abbr.a}</strong></td><td>${address}</td></tr>` : ''}
    </table>
  `;

  // --- GLOBAL CARD WRAPPER ---
  // Using a single cell table with background color and radius ensures compatibility across most clients (including dark mode fix)
  const wrapperStart = `
    <div style="font-family: ${font}; color: ${textColor};">
    <table cellpadding="0" cellspacing="0" border="0" style="background-color: ${cardBg}; border-radius: ${cardRadius}px; overflow: hidden; max-width: 600px;">
      <tr>
        <td style="padding: 20px;">
  `;
  
  const wrapperEnd = `
        </td>
      </tr>
    </table>
    </div>
  `;

  let templateContent = '';

  if (type === TemplateType.MODERN) {
    templateContent = `
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${avatarUrl ? `<td style="padding-right: 20px; vertical-align: top;"><img src="${avatarUrl}" alt="${fullName}" width="100" style="border-radius: ${imgRadius}; display: block; object-fit: cover; width: 100px; height: 100px;" /></td>` : ''}
          <td style="vertical-align: top; border-left: 3px solid ${color}; padding-left: 20px;">
            <div style="font-weight: bold; font-size: ${nameSize}; color: ${textColor};">${fullName}</div>
            <div style="color: ${color}; font-size: ${bodySize}; margin-bottom: 4px;">${jobTitle}</div>
            <div style="font-weight: bold; color: ${textColor}; font-size: ${smallSize}; opacity: 0.9;">${company}</div>
            ${renderCompanyLogo('8px', '4px')}
            ${contactRows}
            ${renderSocials()}
            ${renderCTA()}
            ${renderQrCode()}
          </td>
        </tr>
      </table>
    `;
  } 
  else if (type === TemplateType.SIDEBAR) {
    const contrast = getContrastColor(color);
    const innerRadius = Math.max(0, cardRadius - 4);
    
    // Explicitly set border-radius on cells (TL/BL for left, TR/BR for right) to ensure correct clipping
    templateContent = `
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: separate;">
        <tr>
          <td width="35%" style="background-color: ${color}; padding: 20px; vertical-align: middle; color: ${contrast.text}; text-align: center; border-radius: ${innerRadius}px;">
             ${avatarUrl ? `<img src="${avatarUrl}" width="80" style="border-radius: ${imgRadius}; margin-bottom: 15px; border: 2px solid ${contrast.border}; display: inline-block;" />` : ''}
             <div style="font-size: ${nameSize}; font-weight: bold; line-height: 1.2;">${fullName}</div>
             <div style="font-size: ${smallSize}; opacity: 0.9; margin-top: 5px;">${jobTitle}</div>
             <div style="margin-top: 20px;">
                ${renderCTA('center')} 
             </div>
             ${renderQrCode('center')}
          </td>
          <td width="65%" style="background-color: ${cardBg}; padding: 20px; vertical-align: top; border-radius: 0 ${innerRadius}px ${innerRadius}px 0;">
             <div style="font-weight: bold; color: ${textColor}; margin-bottom: 10px; font-size: ${bodySize};">${company}</div>
             ${renderCompanyLogo('0px', '10px')}
             ${contactRows}
             ${renderSocials()}
          </td>
        </tr>
      </table>
    `;
  }
  else if (type === TemplateType.MINIMAL) {
    const hasLogo = !!logoUrl;
    
    let infoContent = '';

    if (hasLogo) {
      infoContent = `
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align: middle; padding-right: 15px; font-weight: bold; color: ${color}; font-size: ${nameSize}; white-space: nowrap;">
               ${fullName}
            </td>
            <td style="vertical-align: middle; border-left: 1px solid #e0e0e0; padding-left: 15px;">
               <div style="font-size: ${bodySize}; color: ${textColor}; line-height: 1.2; margin-bottom: 2px; white-space: nowrap;">${jobTitle}</div>
               <div style="font-size: ${bodySize}; color: ${textColor}; line-height: 1.2; white-space: nowrap;">${company}</div>
            </td>
          </tr>
        </table>
      `;
    } else {
      infoContent = `
        <span style="font-weight: bold; color: ${color}; font-size: ${nameSize};">${fullName}</span>
        <span style="color: #ccc; margin: 0 8px;">|</span>
        <span style="font-size: ${bodySize}; color: ${textColor};">${jobTitle}</span>
        <div style="margin-top: 5px; font-size: ${smallSize}; color: ${textColor}; opacity: 0.8;">
          ${company}
        </div>
        ${renderCompanyLogo('5px', '0px')}
      `;
    }

    templateContent = `
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
        <tr>
          <td style="vertical-align: bottom; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
            ${infoContent}
          </td>
          ${hasLogo ? `<td style="vertical-align: bottom; border-bottom: 1px solid #ddd; padding-bottom: 8px; padding-left: 15px; white-space: nowrap; text-align: right;">${renderCompanyLogo('0px', '0px', 'right', '60px')}</td>` : ''}
        </tr>
      </table>
      <div style="margin-top: 10px; font-size: ${smallSize}; color: ${textColor}; opacity: 0.9; line-height: 1.6;">
        ${email ? `<span style="display: inline-block; margin-right: 12px;"><a href="mailto:${email}" style="text-decoration: none; color: ${textColor};">${email}</a></span>` : ''}
        ${mobile ? `<span style="display: inline-block; margin-right: 12px;">${mobile}</span>` : ''}
        ${phone ? `<span style="display: inline-block; margin-right: 12px;">${phone}</span>` : ''}
        ${website ? `<span style="display: inline-block; margin-right: 12px;"><a href="${utmWebsite}" style="text-decoration: none; color: ${color};">${website.replace(/^https?:\/\//, '')}</a></span>` : ''}
        ${address ? `<span style="display: inline-block;">${address}</span>` : ''}
      </div>
      ${renderSocials(true)}
      ${renderCTA()}
      ${renderQrCode()}
    `;
  }
  else if (type === TemplateType.CLASSIC) {
    templateContent = `
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${avatarUrl ? `<td style="padding-right: 15px; vertical-align: middle;"><img src="${avatarUrl}" width="80" style="border-radius: ${imgRadius}; display: block;" /></td>` : ''}
          <td style="border-left: 1px solid #d1d1d1; padding-left: 15px; vertical-align: middle;">
             <div style="font-size: ${nameSize}; font-weight: bold; color: ${textColor};">${fullName}</div>
             <div style="font-size: ${bodySize}; color: ${textColor}; opacity: 0.8; margin-bottom: 5px;">${jobTitle} <span style="color: ${color};">@</span> ${company}</div>
             ${renderCompanyLogo('5px', '8px')}
             <div style="font-size: ${smallSize}; color: ${textColor}; opacity: 0.9;">
                ${mobile ? `<span style="display: inline-block;">${abbr.m} ${mobile}</span>` : ''}
                ${mobile && (email || phone) ? '<span style="margin: 0 5px; color: #ccc;">|</span>' : ''}
                ${phone ? `<span style="display: inline-block;">${abbr.p} ${phone}</span>` : ''}
                ${(phone || mobile) && email ? '<span style="margin: 0 5px; color: #ccc;">|</span>' : ''}
                ${email ? `<span style="display: inline-block;"><a href="mailto:${email}" style="color: ${textColor}; text-decoration: none;">${abbr.e} ${email}</a></span>` : ''}
             </div>
             
             ${website ? `<div style="font-size: ${smallSize}; margin-top: 2px;"><a href="${utmWebsite}" style="color: ${color}; text-decoration: none;">${website}</a></div>` : ''}
             ${address ? `<div style="font-size: ${smallSize}; margin-top: 2px; color: ${textColor}; opacity: 0.8;">${address}</div>` : ''}
             
             ${renderSocials(true)}
             ${renderQrCode()}
          </td>
        </tr>
      </table>
      ${renderCTA()}
    `;
  }
  else if (type === TemplateType.CORPORATE) {
    const hasHeaderLogo = !!logoUrl;
    
    templateContent = `
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
        <tr>
          <td style="background-color: ${color}; height: 8px; font-size: 0; line-height: 0;" colspan="2">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding-top: 20px; vertical-align: top; padding-right: 20px; width: 1px;">
             ${avatarUrl ? `<img src="${avatarUrl}" width="100" height="100" style="border-radius: ${imgRadius}; display: block;" />` : ''}
          </td>
          <td style="padding-top: 20px; vertical-align: top;">
             <table width="100%" cellpadding="0" cellspacing="0" border="0">
               <tr>
                 <td>
                    <div style="font-size: ${nameSize}; font-weight: bold; color: ${textColor}; text-transform: uppercase; letter-spacing: 0.5px;">${fullName}</div>
                    <div style="font-size: ${bodySize}; color: ${color}; font-weight: bold; margin-bottom: 8px;">${jobTitle}</div>
                 </td>
                 ${hasHeaderLogo ? `<td align="right" style="vertical-align: top;">${renderCompanyLogo('0px', '0px', 'right', '80px')}</td>` : ''}
               </tr>
             </table>
             
             <table cellpadding="0" cellspacing="0" border="0" style="font-size: ${smallSize}; color: ${textColor}; width: 100%;">
                ${email ? `<tr><td style="padding: 2px 0;"><span style="color: ${color}; font-weight: bold;">&#9993;</span> <a href="mailto:${email}" style="text-decoration: none; color: ${textColor};">${email}</a></td></tr>` : ''}
                ${phone ? `<tr><td style="padding: 2px 0;"><span style="color: ${color}; font-weight: bold;">&#9742;</span> ${phone}</td></tr>` : ''}
                ${mobile ? `<tr><td style="padding: 2px 0;"><span style="color: ${color}; font-weight: bold;">&#128241;</span> ${mobile}</td></tr>` : ''}
                ${address ? `<tr><td style="padding: 2px 0;"><span style="color: ${color}; font-weight: bold;">&#128205;</span> ${address}</td></tr>` : ''}
                ${website ? `<tr><td style="padding: 2px 0;"><span style="color: ${color}; font-weight: bold;">&#127760;</span> <a href="${utmWebsite}" style="text-decoration: none; color: ${textColor};">${website.replace(/^https?:\/\//, '')}</a></td></tr>` : ''}
             </table>

             <div style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px; display: flex; align-items: center; justify-content: space-between;">
               <span style="font-weight: bold; color: ${textColor}; font-size: ${smallSize};">${company}</span>
               ${renderSocials(true)}
             </div>
             ${renderCTA()}
             ${renderQrCode()}
          </td>
        </tr>
      </table>
    `;
  }
  else if (type === TemplateType.ELEGANT) {
    templateContent = `
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; text-align: center; margin: 0 auto;">
        <tr>
          <td align="center" style="padding-bottom: 15px;">
            ${avatarUrl ? `<img src="${avatarUrl}" width="90" height="90" style="border-radius: ${imgRadius}; display: block; border: 1px solid #ddd; padding: 3px;" />` : ''}
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom: 5px;">
             <span style="font-size: ${nameSize}; font-weight: bold; color: ${textColor}; letter-spacing: 1px; border-bottom: 2px solid ${color}; padding-bottom: 3px;">${fullName.toUpperCase()}</span>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top: 8px; padding-bottom: 15px;">
             <div style="font-size: ${bodySize}; font-style: italic; color: ${textColor}; opacity: 0.8;">${jobTitle}</div>
             <div style="font-size: ${smallSize}; font-weight: bold; color: ${textColor}; margin-top: 4px;">${company}</div>
             ${renderCompanyLogo('10px', '0px', 'center')}
          </td>
        </tr>
        <tr>
          <td align="center" style="font-size: ${smallSize}; color: ${textColor}; opacity: 0.9; line-height: 1.6;">
            ${email ? `<div><a href="mailto:${email}" style="color: ${textColor}; text-decoration: none;">${email}</a></div>` : ''}
            ${mobile ? `<div>${mobile}</div>` : ''}
            ${phone ? `<div>${phone}</div>` : ''}
            ${website ? `<div><a href="${utmWebsite}" style="color: ${color}; text-decoration: none;">${website.replace(/^https?:\/\//, '')}</a></div>` : ''}
            ${address ? `<div>${address}</div>` : ''}
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top: 15px;">
             ${renderSocials(false, 'center')}
          </td>
        </tr>
        <tr>
          <td align="center">
            ${renderCTA('center')}
            ${renderQrCode('center')}
          </td>
        </tr>
      </table>
    `;
  }
  else if (type === TemplateType.CREATIVE) {
    templateContent = `
       <table cellpadding="0" cellspacing="0" border="0">
         <tr>
           <td style="border-right: 5px solid ${color}; padding-right: 20px; vertical-align: middle;">
              ${avatarUrl ? `<img src="${avatarUrl}" width="80" height="80" style="border-radius: ${imgRadius}; display: block;" />` : ''}
              ${renderSocials(true, 'center')}
           </td>
           <td style="padding-left: 20px; vertical-align: middle;">
              <div style="font-size: ${nameSize}; font-weight: 800; color: ${color}; line-height: 1.1;">${fullName}</div>
              <div style="font-size: ${bodySize}; color: ${textColor}; margin-top: 4px;">${jobTitle}</div>
              
              <div style="margin-top: 12px; font-size: ${smallSize}; color: ${textColor}; opacity: 0.9; border-left: 1px solid #ccc; padding-left: 10px;">
                 ${email ? `<div style="margin-bottom: 2px;">${email}</div>` : ''}
                 ${mobile ? `<div style="margin-bottom: 2px;">${mobile}</div>` : ''}
                 ${phone ? `<div style="margin-bottom: 2px;">${phone}</div>` : ''}
                 ${website ? `<div style="margin-bottom: 2px;"><strong style="color: ${color};">${website.replace(/^https?:\/\//, '')}</strong></div>` : ''}
                 ${address ? `<div>${address}</div>` : ''}
              </div>
              
              <div style="margin-top: 10px; font-weight: bold; font-size: ${smallSize}; color: ${textColor}; opacity: 0.7;">${company}</div>
              ${renderCompanyLogo('8px', '0px')}
              ${renderCTA()}
              ${renderQrCode()}
           </td>
         </tr>
       </table>
    `;
  }
  else {
    // Fallback (Horizontal)
    const hasLogo = !!logoUrl;
    
    let infoContent = '';

    if (hasLogo) {
      infoContent = `
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align: middle; padding-right: 15px; font-weight: bold; color: ${color}; font-size: ${nameSize}; white-space: nowrap;">
               ${fullName}
            </td>
            <td style="vertical-align: middle; border-left: 1px solid #e0e0e0; padding-left: 15px;">
               <div style="font-size: ${bodySize}; color: ${textColor}; line-height: 1.2; margin-bottom: 2px; white-space: nowrap;">${jobTitle}</div>
               <div style="font-size: ${bodySize}; color: ${textColor}; line-height: 1.2; white-space: nowrap;">${company}</div>
            </td>
          </tr>
        </table>
      `;
    } else {
      infoContent = `
        <span style="font-size: ${nameSize}; font-weight: bold; color: ${color};">${fullName}</span>
        <span style="color: #ccc; margin: 0 8px;">|</span>
        <span style="font-size: ${bodySize}; color: ${textColor};">${jobTitle}</span>
        <div style="margin-top: 5px; font-size: ${smallSize}; color: ${textColor}; opacity: 0.8;">
          ${company}
        </div>
        ${renderCompanyLogo('5px', '0px')}
      `;
    }

    const colSpan = (avatarUrl ? 1 : 0) + 1 + (hasLogo ? 1 : 0);

    templateContent = `
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
        <tr>
          ${avatarUrl ? `<td style="vertical-align: middle; padding-right: 15px; width: 80px;">
            <img src="${avatarUrl}" width="80" style="border-radius: ${imgRadius}; display: block;" />
          </td>` : ''}
          <td style="vertical-align: middle;">
            ${infoContent}
          </td>
          ${hasLogo ? `<td style="vertical-align: middle; padding-left: 15px; text-align: right;">${renderCompanyLogo('0px', '0px', 'right', '60px')}</td>` : ''}
        </tr>
        <tr>
          <td colspan="${colSpan}" style="padding-top: 15px;">
            <div style="border-top: 1px solid #eee; padding-top: 10px; font-size: ${smallSize};">
              ${email ? `<span style="display:inline-block; margin-right: 15px;"><a href="mailto:${email}" style="color: ${textColor}; text-decoration: none;">✉ ${email}</a></span>` : ''}
              ${mobile ? `<span style="display:inline-block; margin-right: 15px; color: ${textColor}; opacity: 0.9;">📱 ${mobile}</span>` : ''}
              ${phone ? `<span style="display:inline-block; margin-right: 15px; color: ${textColor}; opacity: 0.9;">📞 ${phone}</span>` : ''}
              ${website ? `<span style="display:inline-block; margin-right: 15px;"><a href="${utmWebsite}" style="color: ${textColor}; text-decoration: none;">🌐 ${website.replace(/^https?:\/\//, '')}</a></span>` : ''}
              ${address ? `<span style="display:inline-block; color: ${textColor}; opacity: 0.9;">📍 ${address}</span>` : ''}
            </div>
            ${renderSocials()}
            ${renderCTA()}
            ${renderQrCode()}
          </td>
        </tr>
      </table>
    `;
  }

  return wrapperStart + templateContent + renderBanner() + renderFooter() + wrapperEnd;
};
