# Config Ninja

A powerful configuration creator application built with React, TypeScript, Vite, and Node.js. Works as both a web application and Progressive Web App (PWA).

## ✨ Features

- 🎯 **Configuration Templates** - Pre-built templates for popular tools and frameworks
- 📱 **PWA Support** - Works offline and can be installed as a native app
- 🚀 **Modern Stack** - React 18 + TypeScript + Vite for optimal performance
- 🎨 **Beautiful UI** - Clean, responsive design with smooth animations
- 💾 **Export Options** - Download or copy configurations to clipboard
- 🔧 **Live Editor** - Real-time configuration editing with syntax highlighting
- 🌐 **Full-Stack** - Node.js backend for template management and validation

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **CSS3** - Styling with modern features

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **ES Modules** - Modern JavaScript modules

### PWA
- **Vite PWA Plugin** - Service worker and manifest generation
- **Workbox** - PWA utilities

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd config-ninja

# Install dependencies
npm install
```

### Development

Start both frontend and backend in development mode:

```bash
npm start
```

This runs:
- Frontend development server on `http://localhost:3000`
- Backend API server on `http://localhost:8000`

Or run them separately:

```bash
# Frontend only
npm run dev

# Backend only
npm run dev:server
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
config-ninja/
├── public/                 # Static assets
│   ├── index.html         # HTML template
│   └── favicon.svg        # App icon
├── src/                   # Frontend source code
│   ├── components/        # Reusable components
│   │   ├── Header.tsx
│   │   └── Header.css
│   ├── pages/            # Page components
│   │   ├── Home.tsx
│   │   ├── Home.css
│   │   ├── ConfigCreator.tsx
│   │   └── ConfigCreator.css
│   ├── App.tsx           # Main app component
│   ├── App.css           # Global styles
│   ├── main.tsx          # Entry point
│   ├── index.css         # Base styles
│   └── vite-env.d.ts     # TypeScript declarations
├── server/               # Backend source code
│   └── index.js          # Express server
├── dist/                 # Production build output
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
├── tsconfig.node.json    # Node TypeScript config
└── .eslintrc.cjs         # ESLint configuration
```

## 🎯 Available Templates

- **package.json** - Node.js package configuration
- **docker-compose.yml** - Docker Compose setup
- **vite.config.ts** - Vite build configuration
- More templates coming soon!

## 📡 API Endpoints

- `GET /api/health` - Health check (http://localhost:8000/api/health)
- `GET /api/templates` - Get available templates
- `POST /api/validate` - Validate configuration content
- `POST /api/generate` - Generate configuration from template

## 🚀 PWA Features

- ✅ Offline functionality
- ✅ Install prompt
- ✅ App-like experience
- ✅ Fast loading with service worker caching
- ✅ Responsive design for all devices

## 📱 Installation as PWA

1. Open the app in a supported browser (Chrome, Edge, Firefox, Safari)
2. Click the install button in the address bar
3. Follow the installation prompts
4. Use the app like a native application!

## 🔧 Scripts

- `npm start` - Start both frontend and backend
- `npm run dev` - Start frontend development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start backend server
- `npm run dev:server` - Start backend in development mode
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the lightning-fast build tool
- The open source community for inspiration and tools
