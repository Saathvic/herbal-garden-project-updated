# Virtual Herbal Garden - Complete Documentation

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Use Case](#use-case)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Modular Structure](#modular-structure)
- [Installation & Setup](#installation--setup)
- [How to Use](#how-to-use)
- [Backend Processes](#backend-processes)
- [API Documentation](#api-documentation)
- [Component Details](#component-details)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## 🌿 Project Overview

**Virtual Herbal Garden** is an immersive, AI-powered educational platform that bridges traditional Ayurvedic herbal knowledge with modern 3D visualization and artificial intelligence. The platform enables students and enthusiasts to explore India's rich medicinal plant heritage through interactive 3D models, learn about their cultural significance, and receive AI-guided herbal remedies for common health concerns.

### Project Vision
To preserve and promote traditional herbal knowledge by making it accessible, engaging, and interactive for the younger generation through cutting-edge technology.

---

## 🎯 Use Case

The Virtual Herbal Garden addresses the gap between traditional Ayurvedic knowledge and modern education by providing:

1. **Immersive 3D Learning Environment**: Students can explore realistic 3D models of medicinal plants from every angle in a virtual garden setting.

2. **Interactive AI Guide**: An intelligent chatbot powered by Google's Gemini AI provides:
   - Information about herbal remedies for common health issues
   - Safety disclaimers and professional guidance recommendations
   - Educational content about plant properties and preparation methods

3. **Plant Identification**: Users can upload photos of plants they encounter in real life and get AI-powered identification along with medicinal value information.

4. **Community Gallery**: Visual documentation of plants with EXIF GPS data extraction for location-based plant mapping.

5. **Cultural Preservation**: Connects traditional knowledge with modern sustainability practices, making Ayurveda relevant and accessible to digital-native learners.

---

## ✨ Key Features

### 🎮 3D Interactive Garden
- **First-Person Controls**: Navigate the garden using WASD keys and mouse look (pointer-lock controls)
- **8 Plant Beds**: Pre-populated with common Ayurvedic herbs (Tulsi, Neem, Aloe Vera, etc.)
- **Clickable Interactions**: Select plant beds to view detailed holographic information panels
- **Realistic 3D Models**: High-quality plant models with proper textures and materials
- **Immersive Environment**: Sky, lighting, and ground plane create a natural garden atmosphere

### 🤖 AI-Powered Features

#### Plant Information Assistant
- Real-time AI-generated content about each plant
- Covers cultivation methods, medical uses, and botanical descriptions
- Includes safety disclaimers for educational purposes

#### Ayurvedic Health Chatbot
- Symptom-based herbal remedy recommendations
- Powered by RAG (Retrieval-Augmented Generation) architecture
- Integrates with Pinecone vector database for accurate, context-aware responses
- Provides structured responses with:
  - Health condition summary
  - Recommended herbs with scientific names
  - Detailed preparation instructions
  - Safety disclaimers and emergency guidance

#### Plant Identification from Images
- Upload photos of unknown plants
- AI vision model identifies the plant
- Returns common name, scientific name, and medicinal value

### 📸 Community Gallery
- Upload and organize plant images by species
- Automatic EXIF GPS extraction for geographic mapping
- Lightbox view for detailed image inspection
- Integration with AI plant identification

### 🎨 Futuristic UI/UX
- Holographic-style information panels
- Glowing interactive "Community Boxes" for gallery access
- Smooth animations and transitions
- Responsive design elements

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.4 | UI framework and component architecture |
| **Vite** | 7.3.1 | Fast build tool and development server |
| **React Three Fiber** | 9.5.0 | React renderer for Three.js (3D graphics) |
| **Three.js** | 0.182.0 | 3D rendering engine |
| **@react-three/drei** | 10.7.7 | Helper components for R3F (controls, loaders, etc.) |
| **@google/generative-ai** | 0.24.1 | Gemini AI SDK for plant information |
| **exifr** | 7.1.3 | EXIF data extraction from images |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | - | JavaScript runtime |
| **Express** | 5.2.1 | Web server framework |
| **@google/generative-ai** | 0.24.1 | Gemini AI for chat and vision |
| **@pinecone-database/pinecone** | 7.0.0 | Vector database for semantic search |
| **Multer** | 2.0.2 | File upload handling |
| **CORS** | 2.8.6 | Cross-origin resource sharing |
| **dotenv** | 17.3.1 | Environment variable management |
| **Axios** | 1.13.5 | HTTP client |

### AI Models

| Model | Provider | Application |
|-------|----------|-------------|
| **gemini-3-flash-preview** | Google | Fast text generation for plant info and chat responses |
| **multilingual-e5-large** | Pinecone | Automatic text embedding for semantic search |
| **bge-reranker-v2-m3** | Pinecone | Re-ranking search results for better accuracy |

### Additional Tools

- **Git** - Version control
- **npm** - Package management
- **JSON** - Data storage for plant information and knowledge base

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + R3F)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   3D Garden │  │   Chat UI    │  │   Gallery    │       │
│  │   (Canvas)  │  │   Widget     │  │   Panel      │       │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                  │               │
│         └─────────────────┼──────────────────┘               │
│                           │                                  │
│                    ┌──────┴───────┐                          │
│                    │geminiService│                           │
│                    └──────┬───────┘                          │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTP/REST
                    ┌───────┴────────┐
┌───────────────────┤   PORT 5173    ├─────────────────────────┐
│                   └───────┬────────┘                          │
│                           │ CORS                              │
│                   ┌───────┴────────┐                          │
│                   │   PORT 3000    │                          │
└───────────────────┤  Backend API   ├──────────────────────────┘
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────┴─────┐      ┌─────┴──────┐     ┌─────┴──────┐
   │  Gemini  │      │  Pinecone  │     │   Multer   │
   │   AI     │      │  Vector DB │     │  (Upload)  │
   └──────────┘      └────────────┘     └────────────┘
```

### Data Flow

#### 1. Plant Information Request
```
User clicks plant bed → SelectionContext updated → 
geminiService.getPlantInfo() → Gemini API → 
Cached result → InfoPanel displays data
```

#### 2. Health Chat Query
```
User types symptom → ChatWidget sends POST to /chat →
Backend searches Pinecone (semantic search + reranking) →
Context retrieved → Gemini generates structured response →
JSON response with herbs, preparation, disclaimer →
ChatWidget displays formatted response
```

#### 3. Plant Identification
```
User uploads image → useImageUpload hook →
POST to /identify-plant with FormData →
Backend converts to base64 → Gemini Vision API →
Plant identified with medicinal value →
Result displayed in GalleryPanel
```

---

## 📂 Modular Structure

### Directory Tree

```
V3HGGABHRC/
├── 📄 Frontend Root Files
│   ├── index.html              # Entry HTML file
│   ├── main.jsx                # React root renderer
│   ├── App.jsx                 # Main application component (1115 lines)
│   ├── index.css               # Global styles (holographic themes)
│   ├── plantData.json          # Static plant information data
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite configuration
│
├── 🎨 components/              # Reusable React components
│   ├── ChatWidget.jsx          # Ayurvedic health chatbot UI (411 lines)
│   ├── CommunityBox.jsx        # 3D interactive gallery trigger (96 lines)
│   └── GalleryPanel.jsx        # Image gallery overlay (520 lines)
│
├── 🪝 hooks/                   # Custom React hooks
│   └── useImageUpload.js       # Image upload + EXIF + identification (121 lines)
│
├── 🔧 services/                # API integration services
│   └── geminiService.js        # Gemini AI service for plant info (75 lines)
│
├── 🖼️ public/                  # Static assets
│   └── models/                 # 3D plant models (.glb files)
│       └── neem_plant_0218122341_texture_obj/
│
├── 📁 plants images/           # Reference plant images
│
├── 🔙 ayurveda-backend/        # Express.js backend server
│   ├── server.js               # Main Express app (243 lines)
│   ├── ingestToPinecone.js     # One-time knowledge base ingestion (119 lines)
│   ├── package.json            # Backend dependencies
│   ├── .env                    # Environment variables (git-ignored)
│   │
│   ├── 📊 Knowledge Base Files
│   │   ├── health-issues-kb.json       # Ayurvedic remedies database
│   │   ├── ayurvedic-kb.json           # General Ayurvedic knowledge
│   │   ├── synthetic-ayurveda-kb.json  # Synthetic training data
│   │   └── records-to-upsert.json      # Prepared Pinecone records
│   │
│   ├── 🛠️ Utility Scripts
│   │   ├── generatePDFs.js    # PDF generation utility
│   │   └── prepareRecords.js  # Record preparation for ingestion
│   │
│   └── 📄 pdfs/               # Generated PDF documentation
│
└── 📚 Reference for papers/    # Research papers and documentation

```

### Module Descriptions

#### Core Application (`App.jsx`)

**Purpose**: Main React component orchestrating the entire 3D garden experience

**Key Responsibilities**:
- Canvas setup with React Three Fiber
- Context providers (Selection, Settings, Gallery)
- 3D scene management (camera, lighting, environment)
- Plant bed rendering and interaction
- First-person controls integration

**Contexts Provided**:
- `SelectionContext` - Manages selected plant bed and Gemini data
- `SettingsContext` - User preferences and settings
- `GalleryContext` - Gallery state management

**Major Components Inside**:
- `SelectionProvider` - Wraps selection state and AI data fetching
- `InfoPanel` - 3D holographic plant information display
- `PlantBed` - Individual plant bed with 3D model loading
- `PlayerController` - First-person movement and camera controls
- `Ground` - Garden floor mesh
- `ControlsOverlay` - On-screen control instructions

#### Components Module

##### 1. `ChatWidget.jsx`
**Purpose**: AI-powered Ayurvedic health consultation interface

**Features**:
- Floating action button (FAB) for easy access
- Full-screen chat overlay
- Quick example chips for common health issues
- Message history with user/bot distinction
- Loading states during AI processing
- Error handling for backend connectivity

**Data Flow**:
```
User input → POST /chat → Backend RAG pipeline → 
Structured JSON response → Formatted display
```

##### 2. `CommunityBox.jsx`
**Purpose**: 3D interactive cube that triggers the gallery panel

**Technical Details**:
- Positioned in front of each plant bed
- Glass material with glow effect
- Click handler to open gallery
- Uses Three.js `BoxGeometry` and `meshBasicMaterial`
- Prevents event propagation to avoid bed selection conflicts

##### 3. `GalleryPanel.jsx`
**Purpose**: Comprehensive image gallery for community plant documentation

**Features**:
- Responsive grid layout for uploaded images
- Lightbox mode for full-screen viewing
- Integration with `useImageUpload` hook
- AI plant identification button
- GPS coordinate display from EXIF data
- Image zoom and navigation controls

**State Management**:
- Local image array (can be extended to backend storage)
- Lightbox state for modal viewing
- AI identification results display

#### Hooks Module

##### `useImageUpload.js`
**Purpose**: Encapsulates image upload, EXIF extraction, and AI identification logic

**Exported Functions**:
- `handleFileSelect(file, plantId)` - Processes image, extracts GPS, creates record
- `identifyPlant(file)` - Sends image to backend for AI identification

**Capabilities**:
- File-to-DataURL conversion for preview
- EXIF GPS extraction using `exifr` library
- FormData construction for multipart upload
- Error handling and loading states

#### Services Module

##### `geminiService.js`
**Purpose**: Frontend integration with Google Gemini AI

**Functions**:
- `getPlantInfo(plantName)` - Fetches AI-generated plant information

**Features**:
- In-memory caching to prevent duplicate API calls
- Strict JSON output parsing
- Structured prompt engineering for consistent responses
- Educational disclaimers and safety warnings

**Response Schema**:
```javascript
{
  description: string,
  cultivation_method: string,
  medical_uses: string,
  disclaimer: string
}
```

#### Backend Module (`ayurveda-backend/`)

##### `server.js`
**Purpose**: Express API server with AI and vector search integration

**Endpoints**:

1. **GET /** - Serves chat.html (standalone test page)
2. **GET /health** - Health check endpoint
3. **POST /chat** - Main chatbot endpoint (RAG pipeline)
4. **POST /identify-plant** - Plant identification from uploaded image

**Core Functions**:
- `searchPinecone(queryText, topK)` - Semantic search with reranking
- `buildContext(hits)` - Formats retrieved documents for LLM context

**AI Integration**:
- Gemini 3 Flash Preview for fast text generation
- Pinecone integrated embedding (no manual vectorization)
- Safety-aware system prompt with medical disclaimers

##### `ingestToPinecone.js`
**Purpose**: One-time script to populate Pinecone vector database

**Process**:
1. Reads `health-issues-kb.json`
2. Transforms remedies into structured records
3. Upserts to Pinecone in batches of 4
4. Waits for indexing completion
5. Verifies ingestion with stats query

**Record Schema**:
```javascript
{
  _id: string,                  // Unique identifier
  chunk_text: string,           // Searchable text content
  condition: string,            // Health condition
  plantName: string,            // Herb name
  scientificName: string,       // Scientific name
  preparation: string,          // How to prepare
  source: string                // Reference source
}
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **Git**
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/))
- **Pinecone Account** ([Sign up here](https://www.pinecone.io/))

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd V3HGGABHRC
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd ayurveda-backend
npm install
cd ..
```

### Step 4: Configure Frontend Environment

Create a `.env` file in the **root directory**:

```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
```

### Step 5: Configure Backend Environment

Create a `.env` file in the **ayurveda-backend/** directory:

```env
# Google Gemini AI
GEMINI_API_KEY=your_google_gemini_api_key_here

# Pinecone Vector Database
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=ayurveda-kb-v2
PINECONE_NAMESPACE=ayurveda

# Server Port
PORT=3000
```

### Step 6: Create Pinecone Index

1. Log in to [Pinecone Console](https://app.pinecone.io/)
2. Create a new index with these settings:
   - **Name**: `ayurveda-kb-v2`
   - **Model**: `multilingual-e5-large` (hosted embedding)
   - **Reranking**: `bge-reranker-v2-m3`
   - **Metric**: `cosine`

### Step 7: Ingest Knowledge Base to Pinecone

```bash
cd ayurveda-backend
npm run ingest
```

**Expected Output**:
```
🌿 Ayurvedic Knowledge Base → Pinecone Ingestion
📄 Loaded 15 health issues from health-issues-kb.json
ℹ️  Generated 45 total records to upsert.
📤 Upserting batch 1 (4 records)...
   → Tulsi for Stress & Anxiety
   ...
✅ Ingestion complete! 45 records indexed.
```

### Step 8: Start Backend Server

```bash
cd ayurveda-backend
npm start
```

**Backend should run on**: `http://localhost:3000`

### Step 9: Start Frontend Development Server

Open a **new terminal** window:

```bash
npm run dev
```

**Frontend should run on**: `http://localhost:5173`

### Step 10: Open in Browser

Navigate to `http://localhost:5173`

---

## 🎮 How to Use

### Navigating the Garden

1. **Enter the Garden**:
   - When the page loads, click anywhere on the canvas to activate pointer-lock controls

2. **Movement Controls**:
   - **W** - Move forward
   - **S** - Move backward
   - **A** - Move left
   - **D** - Move right
   - **Mouse** - Look around
   - **ESC** - Exit pointer-lock mode

3. **On-Screen Instructions**:
   - Controls overlay appears at the bottom of the screen
   - Shows keyboard shortcuts for navigation

### Exploring Plants

1. **Select a Plant Bed**:
   - Look at a plant bed and click on it
   - The bed will highlight with a cyan glow
   - A holographic information panel appears above the bed

2. **View Plant Information**:
   - **Name** - Common and scientific names
   - **Herbal Use** - Medicinal properties and benefits
   - **Preparation** - Traditional preparation methods
   - Click on an empty area to deselect

3. **AI-Enhanced Information**:
   - After selecting a bed, AI generates additional details
   - Includes cultivation methods, medical uses, and disclaimers
   - Information is cached for faster subsequent access

### Using the Health Chatbot

1. **Open the Chat**:
   - Click the 💬 floating button in the bottom-right corner

2. **Ask About Health Concerns**:
   - Type your symptoms or health issue
   - Or click on quick example chips:
     - Stress & Anxiety
     - Digestive Issues
     - Joint Pain
     - Memory & Focus
     - Skin Problems
     - Cough & Cold

3. **Receive AI Recommendations**:
   - **Summary** - Overview of your health concern
   - **Recommended Herbs** - List with scientific names and reasons
   - **Preparation** - Detailed step-by-step instructions
   - **Disclaimer** - Safety information and professional consultation advice

4. **Example Interaction**:
   ```
   You: "I have trouble sleeping at night"
   
   Bot Response:
   Summary: Insomnia can be caused by stress, anxiety, or 
            irregular sleep patterns. Ayurveda recommends 
            calming herbs to promote restful sleep.
   
   Recommended Herbs:
   - Ashwagandha (Withania somnifera)
     Reason: Reduces stress and anxiety, promotes relaxation
   
   - Brahmi (Bacopa monnieri)
     Reason: Calms the mind and improves sleep quality
   
   Preparation: Boil 1 teaspoon of Ashwagandha powder in 
                warm milk before bedtime...
   
   Disclaimer: This information is for educational purposes...
   ```

### Community Gallery

1. **Access the Gallery**:
   - Each plant bed has a glowing glass cube in front of it
   - Click on the **Community Box** to open the gallery

2. **Upload Plant Images**:
   - Click the "📤 Upload Image" button
   - Select an image from your device
   - Image is added to the gallery with GPS data (if available)

3. **Identify Unknown Plants**:
   - After uploading an image, click "🔍 Identify this Plant"
   - AI analyzes the image and returns:
     - Plant name (common and scientific)
     - Medicinal value and traditional uses

4. **View Gallery Images**:
   - Click any image in the grid for lightbox view
   - Navigate with ◀ Previous / Next ▶ buttons
   - View GPS coordinates if EXIF data exists
   - Press ESC or click outside to close lightbox

### Tips for Best Experience

- **Performance**: Ensure WebGL is enabled in your browser
- **Graphics**: Use Chrome or Edge for best 3D rendering
- **Navigation**: Practice movement controls in an open area first
- **Chat**: Be specific about symptoms for better recommendations
- **Camera**: Use high-resolution plant photos for better AI identification

---

## ⚙️ Backend Processes

### 1. RAG (Retrieval-Augmented Generation) Pipeline

The chatbot uses a sophisticated RAG architecture for accurate, context-aware responses:

```
┌─────────────────────────────────────────────────────────┐
│  STEP 1: User Query                                     │
│  "I have a headache and stress"                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 2: Semantic Search (Pinecone)                     │
│  - Convert query to vector (multilingual-e5-large)      │
│  - Search vector database for similar remedies          │
│  - Return top 5 matches                                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 3: Reranking (bge-reranker-v2-m3)                 │
│  - Rerank results based on relevance                    │
│  - Consider multiple text fields (chunk_text, etc.)     │
│  - Return top N most relevant documents                 │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 4: Context Building                               │
│  Format retrieved documents:                            │
│  [Remedy 1 — Score: 0.923]                              │
│  Health Condition: Stress & Anxiety                     │
│  Herb: Ashwagandha (Withania somnifera)                 │
│  Preparation: Take as powder with warm milk...          │
│  ...                                                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 5: LLM Generation (Gemini 3 Flash)                │
│  System Prompt + Context + User Query →                 │
│  Generate structured JSON response with:                │
│  - Summary                                              │
│  - Recommended herbs                                    │
│  - Preparation instructions                             │
│  - Disclaimer                                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 6: Response Formatting                            │
│  Parse JSON, validate schema, return to frontend        │
└─────────────────────────────────────────────────────────┘
```

### 2. Plant Identification Process

```
┌─────────────────────────────────────────────────────────┐
│  STEP 1: Image Upload                                   │
│  User selects image file from device                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 2: Frontend Processing (useImageUpload.js)        │
│  - Convert to DataURL for preview                       │
│  - Extract EXIF GPS coordinates                         │
│  - Create FormData with file                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 3: Backend Upload (Multer)                        │
│  - Receive multipart form data                          │
│  - Store in memory buffer (max 10MB)                    │
│  - Validate MIME type                                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 4: Image Encoding                                 │
│  - Convert buffer to base64 string                      │
│  - Prepare inline data object for Gemini                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 5: Vision AI Processing (Gemini 3 Flash)          │
│  - Send image + prompt to vision model                  │
│  - AI identifies plant species                          │
│  - Extracts medicinal information                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  STEP 6: Response Parsing                               │
│  - Parse JSON response                                  │
│  - Return plant name + medicinal value                  │
│  - Display in gallery panel                             │
└─────────────────────────────────────────────────────────┘
```

### 3. Knowledge Base Ingestion

**One-time setup** to populate Pinecone with Ayurvedic knowledge:

```bash
cd ayurveda-backend
npm run ingest
```

**Process Flow**:

1. **Load JSON**: Reads `health-issues-kb.json`
2. **Transform**: Converts remedies to Pinecone record format
3. **Batch Upsert**: Uploads in batches of 4 records
4. **Auto-Embedding**: Pinecone generates vectors automatically
5. **Indexing**: Records indexed for semantic search
6. **Verification**: Stats query confirms successful ingestion

**Example Knowledge Base Entry**:
```json
{
  "condition": "Digestive Issues",
  "symptoms": ["indigestion", "bloating", "gas"],
  "remedies": [
    {
      "plantName": "Ginger",
      "scientificName": "Zingiber officinale",
      "preparation": "Boil fresh ginger slices in water...",
      "source": "Ayurvedic Pharmacopoeia Vol. 1"
    }
  ]
}
```

### 4. Caching Strategy

**Frontend Caching** (`geminiService.js`):
- In-memory Map stores plant information
- Key: plant name (string)
- Prevents duplicate API calls for same plant
- Cleared on page reload

**Benefits**:
- Reduced API costs
- Faster response times
- Better user experience

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Health Check

**GET** `/health`

**Description**: Verify backend is running and Pinecone is connected

**Response**:
```json
{
  "status": "ok",
  "index": "ayurveda-kb-v2"
}
```

---

#### 2. Chat - Health Consultation

**POST** `/chat`

**Description**: Get Ayurvedic herbal recommendations based on symptoms

**Request Body**:
```json
{
  "query": "I have stress and can't sleep"
}
```

**Response**:
```json
{
  "summary": "Stress and insomnia are common issues that Ayurveda addresses through calming herbs that regulate the nervous system and promote restful sleep.",
  "recommended_herbs": [
    {
      "name": "Ashwagandha",
      "scientific_name": "Withania somnifera",
      "reason": "Adaptogen that reduces stress hormones and promotes relaxation"
    },
    {
      "name": "Brahmi",
      "scientific_name": "Bacopa monnieri",
      "reason": "Calms the mind and improves sleep quality"
    }
  ],
  "preparation": "1. Mix 1 teaspoon of Ashwagandha powder in warm milk before bed. 2. Take Brahmi capsules (500mg) twice daily with meals.",
  "disclaimer": "This information is for educational purposes only and is based on traditional Ayurvedic texts. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before using any herbal remedy."
}
```

**Error Responses**:

- **400 Bad Request**:
```json
{
  "error": "A non-empty 'query' string is required."
}
```

- **500 Internal Server Error**:
```json
{
  "error": "Internal server error. Please try again later."
}
```

- **502 Bad Gateway**:
```json
{
  "error": "Failed to parse AI response. Please try again."
}
```

---

#### 3. Plant Identification

**POST** `/identify-plant`

**Description**: Identify a plant from an uploaded image using AI vision

**Request**: `multipart/form-data`

**Form Fields**:
- `image` (file) - Image file (max 10MB, JPEG/PNG/WEBP)

**Example Request** (JavaScript):
```javascript
const formData = new FormData()
formData.append('image', fileInput.files[0])

const response = await fetch('http://localhost:3000/identify-plant', {
  method: 'POST',
  body: formData
})

const data = await response.json()
```

**Response**:
```json
{
  "identified_plant": "Tulsi (Ocimum sanctum)",
  "medical_value": "Holy Basil is revered in Ayurveda for its adaptogenic properties. It boosts immunity, reduces stress, aids respiratory health, and has antibacterial properties. Commonly used for colds, cough, and as a daily wellness tea."
}
```

**Error Responses**:

- **400 Bad Request**:
```json
{
  "error": "No image file provided"
}
```

- **500 Internal Server Error**:
```json
{
  "error": "Failed to identify plant"
}
```

---

## 🧩 Component Details

### App.jsx - Core Application

**Key Functions**:

#### `SelectionProvider`
- Manages selected bed state
- Fetches AI data on bed selection
- Provides context to child components

#### `InfoPanel`
- 3D holographic display using `<Html>` from drei
- Shows plant name, scientific name, uses, preparation
- Positioned above selected bed

#### `PlantBed`
- Loads 3D model from `public/models/`
- Brown soil platform base
- Click handler for selection
- Glow effect when selected

#### `PlayerController`
- First-person camera controls
- WASD movement (speed: 0.1 units/frame)
- Velocity-based physics
- Collision detection (simplified)
- Height locked at y=1.6 (eye level)

**Context Values**:
```javascript
// SelectionContext
{
  selectedBed: string | null,
  setSelectedBed: (bedId: string) => void,
  geminiData: object | null,
  geminiLoading: boolean
}

// GalleryContext
{
  openPlantId: string | null,
  openGallery: (plantId: string) => void,
  closeGallery: () => void
}
```

---

### ChatWidget.jsx - AI Chat Interface

**State Management**:
```javascript
{
  open: boolean,              // Widget visibility
  messages: Array,            // Chat history
  input: string,              // Current input text
  loading: boolean            // AI response pending
}
```

**Message Types**:
- `{ role: 'user', text: string }` - User message
- `{ role: 'bot', text: string }` - Simple bot message (error)
- `{ role: 'bot', data: object }` - Structured response from AI

**Styling**:
- Fixed positioning (bottom-right)
- Glassmorphism effects
- Smooth animations
- Responsive height (max 500px)
- Auto-scroll to latest message

---

### GalleryPanel.jsx - Image Management

**Features**:
- Grid layout (3 columns on desktop)
- Responsive design (1-2 columns on mobile)
- Image metadata display (GPS, timestamp)
- Lightbox navigation
- AI identification integration

**State Structure**:
```javascript
{
  images: [
    {
      file: File,
      dataUrl: string,
      latitude: number | null,
      longitude: number | null,
      plantId: string,
      timestamp: number
    }
  ],
  lightbox: number | null,
  aiResult: {
    identified_plant: string,
    medical_value: string
  } | null,
  lastUploadedFile: File | null
}
```

---

## ⚙️ Configuration

### Frontend Environment Variables

Create `.env` in root:
```env
# Google Gemini AI API Key
VITE_GEMINI_API_KEY=AIza...

# Optional: Custom backend URL
VITE_BACKEND_URL=http://localhost:3000
```

### Backend Environment Variables

Create `.env` in `ayurveda-backend/`:
```env
# Google Gemini AI
GEMINI_API_KEY=AIza...

# Pinecone Vector Database
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=ayurveda-kb-v2
PINECONE_NAMESPACE=ayurveda

# Server Configuration
PORT=3000
NODE_ENV=development

# Optional: CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### Vite Configuration

`vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // Auto-open browser
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

### Package Scripts

**Frontend** (`package.json`):
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Backend** (`ayurveda-backend/package.json`):
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "ingest": "node ingestToPinecone.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot connect to backend" in Chat Widget

**Symptoms**: Chat shows "could not reach the server" message

**Solutions**:
- Verify backend is running: `http://localhost:3000/health`
- Check console for CORS errors
- Ensure `.env` variables are set correctly
- Restart backend server

```bash
cd ayurveda-backend
npm start
```

#### 2. 3D Models Not Loading

**Symptoms**: Empty plant beds, no 3D models visible

**Solutions**:
- Check browser console for 404 errors
- Verify `.glb` files exist in `public/models/`
- Ensure model paths in `plantData.json` match filenames
- Clear browser cache (Ctrl+Shift+Delete)

#### 3. API Key Errors

**Symptoms**: "API key not configured" or 401 errors

**Solutions**:
- Verify `.env` files exist in correct directories
- Check API key validity on provider dashboards
- Restart dev servers after adding keys
- Ensure `VITE_` prefix for frontend variables

```bash
# Test Gemini key
curl https://generativelanguage.googleapis.com/v1/models?key=YOUR_KEY
```

#### 4. Pinecone Ingestion Fails

**Symptoms**: "Index not found" or embedding errors

**Solutions**:
- Verify index exists in Pinecone console
- Check index name matches `.env` variable
- Ensure model is `multilingual-e5-large`
- Wait for index to finish provisioning (can take 5-10 mins)

#### 5. Plant Identification Returns Errors

**Symptoms**: "Failed to identify plant" after upload

**Solutions**:
- Check file size < 10MB
- Use supported formats (JPEG, PNG, WEBP)
- Verify backend has sufficient memory
- Check Gemini API quota and limits

#### 6. Performance Issues / Low FPS

**Symptoms**: Laggy 3D rendering, delayed interactions

**Solutions**:
- Use Chrome or Edge (better WebGL support)
- Update graphics drivers
- Reduce browser extensions
- Lower screen resolution temporarily
- Check for other running applications

#### 7. EXIF GPS Not Extracted

**Symptoms**: Gallery shows "No GPS" for all images

**Solutions**:
- Use photos taken with smartphone GPS enabled
- Check if image EXIF data wasn't stripped
- Test with sample images that have known GPS data
- Verify `exifr` library is installed

---

## 🎯 Future Enhancements

### Planned Features

1. **Backend Gallery Storage**
   - PostgreSQL database for persistent gallery
   - User authentication and profiles
   - Cloud storage integration (AWS S3/Firebase)

2. **Enhanced 3D Features**
   - Day/night cycle
   - Seasons affecting plant appearance
   - Weather effects (rain, wind)
   - VR support with WebXR

3. **Advanced AI Features**
   - Multi-language support
   - Voice interaction with chatbot
   - Personalized remedy recommendations based on user profile
   - Integration with wearable health data

4. **Social Features**
   - User comments and ratings on plants
   - Share discoveries on social media
   - Community challenges and learning paths

5. **Educational Content**
   - Video tutorials on plant cultivation
   - Interactive quizzes and certifications
   - Integration with school curricula
   - Augmented Reality (AR) for mobile devices

6. **Analytics & Insights**
   - Usage tracking and learning progress
   - Popular herbs and searches
   - Geographic distribution of plant queries

---

## 📄 License

MIT License - Free to use for educational and commercial purposes

---

## 👥 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: [your-email@example.com]

---

## 🙏 Acknowledgments

- **Google Gemini AI** - Powering intelligent plant information and health recommendations
- **Pinecone** - Vector database for semantic search
- **Three.js Community** - 3D rendering excellence
- **Ayurvedic Texts** - Traditional knowledge sources
- **Open Source Contributors** - Making this project possible

---

## 📊 Project Statistics

- **Total Lines of Code**: ~2,500+
- **Components**: 3 main UI components
- **3D Models**: 8 plant models
- **API Endpoints**: 3
- **Knowledge Base Entries**: 45+ remedies
- **Supported Health Conditions**: 15+

---

**Built with ❤️ for preserving traditional herbal knowledge through modern technology**

**Version**: 1.0.2
**Last Updated**: February 2026
