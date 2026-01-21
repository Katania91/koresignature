<div align="center">

# KoreSignature

**Professional Email Signature Generator**

Create beautiful, responsive HTML email signatures in seconds. No coding required.

<br />

<br />

<img src="https://i.ibb.co/5XxYR7nL/Screenshot-2026-01-21-223719.png" alt="Desktop Preview" width="64%" /> <br>
<img src="https://i.ibb.co/ZzG04cMK/koreagency-it-signature-i-Phone-14-Pro-Max.png" alt="Mobile Preview" width="30%" />

<br />

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)

<br />

[Live Demo](https://koreagency.it/signature/) • [Report Bug](https://github.com/Katania91/koresignature/issues) • [Request Feature](https://github.com/Katania91/koresignature/issues)

</div>

---

## Features

- 🎨 **8 Professional Templates** - Modern, Classic, Minimal, Sidebar, Horizontal, Corporate, Elegant, Creative
- 🌐 **8 Languages** - English, Italian, Spanish, French, German, Portuguese, Chinese, Japanese
- 🌝 **Dark Mode** - Full dark mode support with preview toggle
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔗 **Social Links** - Add LinkedIn, Twitter/X, Instagram, GitHub, and more
- 📊 **UTM Tracking** - Built-in marketing parameters for analytics
- 💾 **Profile Saving** - Save multiple signatures locally
- 🔗 **Share Configuration** - Share signatures via URL
- 📋 **One-Click Copy** - Copy HTML with formatting preserved
- 🔒 **Privacy First** - No data sent to servers, everything stays in your browser
- 📱 **QR Code** - Generate vCard QR codes
- ⚙️ **Customizable** - Colors, fonts, shapes, CTA buttons, banners, disclaimers

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Katania91/koresignature.git
cd koresignature

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build optimized version
npm run build

# Preview production build
npm run preview
```

The build output will be in the `dist` folder, ready to deploy.

## Deployment

Deploy the `dist` folder to any static hosting:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop `dist` folder
- **GitHub Pages**: Use `gh-pages` branch
- **Traditional hosting**: Upload `dist` contents via FTP

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 6** - Build tool
- **Tailwind CSS 3** - Styling
- **Lucide React** - Icons

## Project Structure

```
koresignature/
├── App.tsx              # Main application component
├── index.tsx            # Entry point
├── index.css            # Global styles + Tailwind
├── types.ts             # TypeScript interfaces
├── components/
│   └── FormInput.tsx    # Reusable form input
├── utils/
│   ├── templates.ts     # HTML signature generation
│   ├── translations.ts  # i18n strings
│   └── defaults.ts      # Default profile values
├── img/                 # Logo assets
└── public/              # Static files
```

## License

MIT License - see [LICENSE](LICENSE) file.

## Credits

Made with ❤️ by [Kore Agency](https://koreagency.it)

---

<div align="center">
<sub>If you find this useful, please ⭐ the repo!</sub>
</div>
