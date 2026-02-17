# 🌿 Virtual Herbal Garden

> An immersive, AI-powered educational platform bringing India's traditional Ayurvedic herbal knowledge to life through 3D visualization and intelligent guidance.

[![React](https://img.shields.io/badge/React-19.2.4-blue.svg)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.182.0-black.svg)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

![Virtual Herbal Garden Preview](https://via.placeholder.com/800x400/1a1a2e/16c79a?text=Virtual+Herbal+Garden)

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The **Virtual Herbal Garden** is an immersive educational platform that preserves and promotes traditional Ayurvedic knowledge through modern technology. Students and enthusiasts can:

- 🎮 **Explore** - Navigate a realistic 3D garden with interactive herbal plant beds
- 🤖 **Learn** - Get AI-powered information about medicinal plants and their uses
- 💬 **Consult** - Receive herbal remedy recommendations for common health concerns
- 📸 **Identify** - Upload plant photos for AI-powered identification
- 🌍 **Share** - Contribute to a community gallery with EXIF GPS mapping

### Use Case

This platform bridges the gap between ancient Ayurvedic wisdom and modern education, making traditional herbal knowledge accessible and engaging for the digital-native generation through:
- Interactive 3D plant models viewable from every angle
- AI-guided herbal remedies with safety disclaimers
- Cultural and historical context for each plant
- Educational content about sustainability and health

## ✨ Features

### 🎮 Immersive 3D Garden
- First-person navigation with pointer-lock controls (WASD + Mouse)
- 8 interactive plant beds featuring traditional Ayurvedic herbs
- Holographic information panels with detailed plant data
- Realistic lighting, sky, and environment effects

### 🤖 AI-Powered Intelligence
- **Plant Information**: Real-time Gemini AI-generated botanical and medicinal details
- **Health Chatbot**: RAG-powered Ayurvedic consultation with safety disclaimers
- **Plant Identification**: Vision AI identifies plants from uploaded photos
- **Semantic Search**: Pinecone vector database for accurate remedy recommendations

### 📸 Community Gallery
- Upload and organize plant photos with EXIF GPS extraction
- Lightbox view with image navigation
- Location-based plant mapping
- AI identification integration

### 🔒 Safety & Education First
- Medical disclaimers on all health-related content
- Emergency situation detection and appropriate responses
- Educational focus with professional consultation recommendations
- Evidence-based information sourced from traditional texts

## 🛠️ Tech Stack

<table>
<tr>
<td>

**Frontend**
- React 19.2.4
- React Three Fiber 9.5.0
- Three.js 0.182.0
- Vite 7.3.1
- @react-three/drei 10.7.7
- exifr 7.1.3

</td>
<td>

**Backend**
- Node.js + Express 5.2.1
- Google Gemini AI
- Pinecone Vector DB 7.0.0
- Multer 2.0.2
- CORS, dotenv

</td>
</tr>
<tr>
<td>

**AI Models**
- gemini-3-flash-preview (text + vision)
- multilingual-e5-large (embedding)
- bge-reranker-v2-m3 (reranking)

</td>
<td>

**Tools**
- Git (version control)
- npm (package management)
- WebGL (3D rendering)

</td>
</tr>
</table>

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ and npm v7+
- Google Gemini API Key ([Get one here](https://ai.google.dev/))
- Pinecone Account ([Sign up here](https://www.pinecone.io/))

### Installation

```bash
# Clone repository
git clone <repository-url>
cd V3HGGABHRC

# Install frontend dependencies
npm install

# Install backend dependencies
cd ayurveda-backend
npm install
cd ..
```

### Configuration

**1. Frontend `.env` (root directory)**
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**2. Backend `.env` (ayurveda-backend directory)**
```env
GEMINI_API_KEY=your_gemini_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=ayurveda-kb-v2
PINECONE_NAMESPACE=ayurveda
PORT=3000
```

**3. Create Pinecone Index**
- Name: `ayurveda-kb-v2`
- Model: `multilingual-e5-large`
- Reranking: `bge-reranker-v2-m3`

**4. Ingest Knowledge Base**
```bash
cd ayurveda-backend
npm run ingest
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd ayurveda-backend
npm start
# Backend runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser 🎉

## 📚 Documentation

For detailed documentation, see **[DOCUMENTATION.md](./DOCUMENTATION.md)** which includes:
- Complete system architecture
- Detailed modular structure
- Component API reference
- Backend process workflows
- API endpoint documentation
- Troubleshooting guide
- Future enhancement roadmap

## 🎮 Usage

### Navigation
- **W/A/S/D** - Move around the garden
- **Mouse** - Look around
- **Click** - Select plant beds
- **ESC** - Exit pointer-lock mode

### Exploring Plants
1. Click any plant bed to view information
2. Read holographic panel with herbal uses and preparation methods
3. AI generates additional cultivation and medicinal details

### Health Chatbot
1. Click 💬 button in bottom-right corner
2. Type symptoms or select quick examples
3. Receive herbal recommendations with preparation instructions
4. Always includes safety disclaimers

### Plant Identification
1. Click glowing Community Box near plant beds
2. Upload plant photo (JPEG/PNG, max 10MB)
3. Click "🔍 Identify this Plant"
4. View identification and medicinal value

## 📂 Project Structure

```
V3HGGABHRC/
├── 🎨 components/          # React UI components
│   ├── ChatWidget.jsx      # AI health chatbot
│   ├── CommunityBox.jsx    # Gallery trigger
│   └── GalleryPanel.jsx    # Image gallery
├── 🪝 hooks/               # Custom React hooks
│   └── useImageUpload.js   # Image upload logic
├── 🔧 services/            # API services
│   └── geminiService.js    # Gemini AI integration
├── 🔙 ayurveda-backend/    # Express backend
│   ├── server.js           # Main API server
│   ├── ingestToPinecone.js # Knowledge base ingestion
│   └── health-issues-kb.json # Ayurvedic remedies data
├── 🖼️ public/models/       # 3D plant models (.glb)
├── App.jsx                 # Main React application
├── plantData.json          # Plant information database
└── DOCUMENTATION.md        # Complete documentation
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 🐛 Issues

Found a bug or have a suggestion? Please [open an issue](https://github.com/yourusername/virtual-herbal-garden/issues).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** - Intelligent plant information and health recommendations
- **Pinecone** - Vector database for semantic search
- **Three.js Community** - 3D rendering excellence
- **Ayurvedic Texts** - Traditional knowledge sources

## 📞 Contact

For questions or collaborations:
- Email: your-email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

---

<p align="center">
  <strong>Built with ❤️ for preserving traditional herbal knowledge through modern technology</strong>
</p>

<p align="center">
  <sub>Version 1.0.2 | Last Updated: February 2026</sub>
</p>
