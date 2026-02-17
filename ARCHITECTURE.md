# Virtual Herbal Garden - System Architecture

## Overview

This document provides a detailed technical overview of the Virtual Herbal Garden system architecture, including component interactions, data flows, and technology decisions.

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Technology Stack Details](#technology-stack-details)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Data Architecture](#data-architecture)
6. [Security Architecture](#security-architecture)
7. [Deployment Architecture](#deployment-architecture)
8. [Performance Considerations](#performance-considerations)

---

## High-Level Architecture

### System Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                            │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    React Application                       │  │
│  │                   (localhost:5173)                         │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │  │
│  │  │   3D Garden  │  │   Chat UI    │  │  Gallery Panel  │ │  │
│  │  │  (R3F/Three) │  │  (React)     │  │    (React)      │ │  │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘ │  │
│  │         │                  │                    │          │  │
│  │         └──────────────────┼────────────────────┘          │  │
│  │                            │                                │  │
│  │                    ┌───────┴────────┐                      │  │
│  │                    │ Services Layer │                      │  │
│  │                    │  - geminiAPI   │                      │  │
│  │                    │  - imageUpload │                      │  │
│  │                    └───────┬────────┘                      │  │
│  └────────────────────────────┼───────────────────────────────┘  │
│                                │                                  │
└────────────────────────────────┼──────────────────────────────────┘
                                 │ HTTP/REST
                                 │ (CORS enabled)
┌────────────────────────────────┼──────────────────────────────────┐
│                    EXPRESS BACKEND SERVER                         │
│                      (localhost:3000)                             │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                      API Routes                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │  │
│  │  │ GET /health │  │ POST /chat  │  │ POST /identify   │  │  │
│  │  └─────────────┘  └──────┬──────┘  └────────┬─────────┘  │  │
│  └─────────────────────────┼────────────────────┼────────────┘  │
│                             │                    │               │
│  ┌─────────────────────────┼────────────────────┼────────────┐  │
│  │            Business Logic & AI Integration                │  │
│  │                          │                    │            │  │
│  │     ┌────────────────────┴────────┐  ┌────────┴─────────┐ │  │
│  │     │  RAG Pipeline               │  │  Vision Pipeline │ │  │
│  │     │  1. Semantic Search         │  │  1. Base64 Conv  │ │  │
│  │     │  2. Context Building        │  │  2. AI Vision    │ │  │
│  │     │  3. LLM Generation          │  │  3. Parsing      │ │  │
│  │     └────────┬─────────┬──────────┘  └──────────────────┘ │  │
│  └──────────────┼─────────┼──────────────────────────────────┘  │
└─────────────────┼─────────┼─────────────────────────────────────┘
                  │         │
        ┌─────────┴─────┐   │
        │               │   │
    ┌───▼────┐    ┌─────▼───▼─────┐
    │Pinecone│    │   Google      │
    │Vector  │    │   Gemini AI   │
    │   DB   │    │  (3-Flash)    │
    └────────┘    └───────────────┘
```

### Component Interaction Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER INTERACTIONS                         │
└──────────────────────────────────────────────────────────────────┘
    │                      │                        │
    │ Navigate             │ Query Health           │ Upload Image
    │ 3D Garden            │ Chatbot                │ for ID
    │                      │                        │
┌───▼────────────┐   ┌────▼──────────────┐   ┌────▼──────────────┐
│ Canvas (R3F)   │   │  ChatWidget       │   │  GalleryPanel     │
│                │   │                   │   │                   │
│ - PlantBeds    │   │ POST /chat        │   │ POST /identify    │
│ - Models       │◄──┤ {query: "..."}    │   │ FormData(image)   │
│ - InfoPanels   │   │                   │   │                   │
│ - Controls     │   │ Response:         │   │ Response:         │
│                │   │ - herbs           │   │ - plant name      │
│ On bed click:  │   │ - preparation     │   │ - medical value   │
│ geminiAPI() ───┼───┤ - disclaimer      │   │                   │
└────────────────┘   └───────────────────┘   └───────────────────┘
         │                     │                        │
         ▼                     ▼                        ▼
    ┌────────────────────────────────────────────────────────────┐
    │            geminiService.js / useImageUpload.js            │
    │         (Frontend API layer - caching & formatting)        │
    └────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Details

### Frontend Stack

#### React 19.2.4
**Why chosen:**
- Latest stable version with improved performance
- Server Components support (future enhancement)
- Automatic batching of state updates
- Concurrent rendering capabilities

**Key features used:**
- Functional components with hooks
- Context API for state management
- Suspense for lazy loading 3D models
- Error boundaries for robust error handling

#### React Three Fiber 9.5.0
**Why chosen:**
- Best-in-class React renderer for Three.js
- Declarative 3D scene graph
- Automatic cleanup and memory management
- Hook-based API familiar to React developers

**Use cases:**
- 3D plant model rendering
- Scene lighting and environment
- Camera controls
- Interactive mesh objects

#### Three.js 0.182.0
**Why chosen:**
- Industry-standard WebGL library
- Comprehensive feature set
- Large community and ecosystem
- Excellent documentation

**Components used:**
- `GLTFLoader` - Load 3D models
- `Mesh` - 3D objects
- `Material` - Visual properties
- `Geometry` - Shape definitions

#### Vite 7.3.1
**Why chosen:**
- Lightning-fast HMR (Hot Module Replacement)
- Native ES modules support
- Optimized production builds
- Better than CRA/Webpack for modern React

**Configuration:**
```javascript
{
  plugins: [react()],
  server: { port: 5173 },
  build: { outDir: 'dist' }
}
```

### Backend Stack

#### Express.js 5.2.1
**Why chosen:**
- Mature and stable Node.js framework
- Minimal and flexible
- Large middleware ecosystem
- Easy integration with AI services

**Middleware used:**
- `cors` - Cross-origin requests
- `express.json()` - JSON parsing
- `multer` - File upload handling

#### Pinecone 7.0.0
**Why chosen:**
- Integrated embedding generation (no manual vectorization)
- Built-in reranking for better accuracy
- Serverless architecture (no infrastructure management)
- Optimized for semantic search

**Key features:**
- `searchRecords()` - Semantic search with auto-embedding
- `upsertRecords()` - Batch document ingestion
- `multilingual-e5-large` - Hosted embedding model
- `bge-reranker-v2-m3` - Result reranking

#### Google Gemini AI
**Model: gemini-3-flash-preview**

**Why chosen:**
- Fast inference (< 2s typical response time)
- Multimodal (text + vision)
- High-quality output with structured JSON
- Generous free tier

**Capabilities:**
- Text generation for plant information
- Vision for plant identification
- Structured output (JSON mode)
- Safety filters and moderation

---

## Frontend Architecture

### Component Hierarchy

```
App.jsx (Main Container)
├── SelectionProvider (Context)
│   ├── SettingsProvider (Context)
│   │   └── GalleryProvider (Context)
│   │       └── Canvas (R3F)
│   │           ├── Sky
│   │           ├── ambientLight
│   │           ├── directionalLight
│   │           ├── Ground
│   │           ├── PlantBed (x8)
│   │           │   ├── SoilBase (Mesh)
│   │           │   ├── PlantModel (GLTF)
│   │           │   └── CommunityBox
│   │           ├── InfoPanel (Html)
│   │           ├── AIInfoPanel (Html)
│   │           └── PlayerController
│   │               └── PointerLockControls
│   │
│   ├── ChatWidget
│   │   ├── FloatingActionButton
│   │   └── ChatPopup
│   │       ├── Header
│   │       ├── QuickChips
│   │       ├── MessageList
│   │       └── InputBar
│   │
│   ├── GalleryPanel (conditional)
│   │   ├── Header
│   │   ├── ImageGrid
│   │   │   └── ImageCard (x N)
│   │   ├── LightboxModal (conditional)
│   │   └── AIIdentificationResult
│   │
│   └── ControlsOverlay
```

### State Management Architecture

#### Context-Based State

**SelectionContext:**
```javascript
{
  selectedBed: string | null,       // Currently selected plant bed ID
  setSelectedBed: (id) => void,     // Bed selection handler
  geminiData: object | null,        // AI-generated plant info
  geminiLoading: boolean            // Loading state
}
```

**GalleryContext:**
```javascript
{
  openPlantId: string | null,       // Gallery open for which plant
  openGallery: (id) => void,        // Open gallery handler
  closeGallery: () => void          // Close handler
}
```

**Local Component State:**
- `ChatWidget` - Message history, input, loading
- `GalleryPanel` - Images array, lightbox state, AI result
- `PlayerController` - Velocity, position, locked state

### Data Flow Patterns

#### 1. Plant Selection Flow

```
User clicks PlantBed
    │
    ▼
onClick handler
    │
    ▼
setSelectedBed(bedId)
    │
    ├──▼ Update selectedBed in context
    │   │
    │   └──▼ InfoPanel re-renders (static data)
    │
    └──▼ Trigger geminiService.getPlantInfo()
        │
        ├──▼ Check cache (Map)
        │   │
        │   ├─► Cache hit → return cached
        │   │
        │   └─► Cache miss ──▼
        │                     │
        │                     ▼
        │           Fetch Gemini API
        │                     │
        │                     ▼
        │           Parse JSON response
        │                     │
        │                     ▼
        │           Store in cache
        │                     │
        └─────────────────────┘
                    │
                    ▼
        setGeminiData(result)
                    │
                    ▼
        AIInfoPanel re-renders
```

#### 2. Chat Query Flow

```
User types query in ChatWidget
    │
    ▼
Submit handler
    │
    ├──▼ Add user message to messages[]
    │
    └──▼ POST /chat via fetch
        │
        └──▼ Backend RAG Pipeline
            │
            ├──▼ searchPinecone(query)
            │   │
            │   ├──▼ Convert query to vector (auto)
            │   │
            │   ├──▼ Search vector DB
            │   │
            │   └──▼ Rerank results
            │
            ├──▼ buildContext(hits)
            │
            └──▼ Generate response (Gemini)
                │
                ▼
        Response received
            │
            ├──▼ Parse JSON
            │
            └──▼ Add bot message to messages[]
                │
                ▼
        ChatWidget re-renders
```

### Performance Optimizations

#### 1. Memoization

```javascript
// Heavy computations memoized
const plantPositions = useMemo(() => 
  Object.entries(bedPositions).map(([id, pos]) => ({...})),
  []
);

// Callbacks memoized to prevent child re-renders
const handleBedClick = useCallback((bedId) => {
  setSelectedBed(bedId);
}, [setSelectedBed]);
```

#### 2. Lazy Loading

```javascript
// 3D models loaded on-demand
function PlantBed({ model }) {
  const { scene } = useGLTF(`/models/${model}`, true);
  return <primitive object={scene} />;
}
```

#### 3. Code Splitting

```javascript
// Future enhancement
const GalleryPanel = lazy(() => import('./components/GalleryPanel'));

<Suspense fallback={<Loading />}>
  <GalleryPanel />
</Suspense>
```

---

## Backend Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Entry Point                            │
│                      server.js                              │
│  - Express app initialization                               │
│  - Environment config loading                               │
│  - Middleware registration                                  │
│  - Route registration                                       │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│                    Middleware Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   CORS       │  │ JSON Parser  │  │  Multer Upload   │  │
│  │ (Allow all)  │  │              │  │  (Memory, 10MB)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│                      Route Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ GET /health  │  │ POST /chat   │  │ POST /identify   │  │
│  │              │  │              │  │ -plant           │  │
│  └──────────────┘  └──────┬───────┘  └────────┬─────────┘  │
└────────────────────────────┼────────────────────┼───────────┘
                             │                    │
┌────────────────────────────┼────────────────────┼───────────┐
│                    Service Layer                            │
│                             │                    │           │
│  ┌──────────────────────────┴────────┐  ┌────────┴────────┐ │
│  │     RAG Service                   │  │  Vision Service │ │
│  │  - searchPinecone()               │  │  - imageToBase64│ │
│  │  - buildContext()                 │  │  - callVision() │ │
│  │  - generateResponse()             │  │  - parseResult()│ │
│  └───────────────────────────────────┘  └─────────────────┘ │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────┴────────────────────────────────┐
│                   External Services                         │
│  ┌─────────────────────────┐  ┌────────────────────────────┐│
│  │   Pinecone Vector DB    │  │   Google Gemini AI         ││
│  │  - Hosted embedding     │  │  - Text generation         ││
│  │  - Semantic search      │  │  - Vision analysis         ││
│  │  - Reranking            │  │  - Structured output       ││
│  └─────────────────────────┘  └────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### RAG Pipeline Detailed

```
┌───────────────────────────────────────────────────────────────┐
│               RAG (Retrieval-Augmented Generation)            │
│                    Pipeline Architecture                       │
└───────────────────────────────────────────────────────────────┘

1. USER QUERY
   "I have stress and can't sleep"
   │
   ▼
┌──────────────────────────────────────────────┐
│ 2. SEMANTIC SEARCH (Pinecone)               │
│                                              │
│  Query → Embedding (multilingual-e5-large)  │
│          [0.123, -0.456, 0.789, ...]        │
│                     │                        │
│                     ▼                        │
│  Vector Search (cosine similarity)          │
│  - Compare with indexed documents           │
│  - Return top K=5 matches                   │
│                     │                        │
│  Results:                                   │
│  1. Ashwagandha for stress (score: 0.92)   │
│  2. Brahmi for sleep (score: 0.89)         │
│  3. Tulsi for anxiety (score: 0.87)        │
│  ...                                        │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ 3. RERANKING (bge-reranker-v2-m3)           │
│                                              │
│  - Re-score results considering:            │
│    * Query terms directly in text           │
│    * Semantic relevance                     │
│    * Field importance (chunk_text > source) │
│                                              │
│  Reranked Results:                          │
│  1. Ashwagandha (score: 0.945)              │
│  2. Brahmi (score: 0.923)                   │
│  3. Tulsi (score: 0.901)                    │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ 4. CONTEXT CONSTRUCTION                      │
│                                              │
│  Format retrieved documents:                │
│                                              │
│  [Remedy 1 — Score: 0.945]                  │
│  Health Condition: Stress & Anxiety         │
│  Herb: Ashwagandha                          │
│  Scientific: Withania somnifera             │
│  Preparation: Take 1 tsp with warm milk...  │
│  Source: Ayurvedic Pharmacopoeia Vol. 1     │
│                                              │
│  [Remedy 2 — Score: 0.923]                  │
│  ...                                        │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ 5. LLM GENERATION (Gemini 3 Flash)          │
│                                              │
│  Prompt Structure:                          │
│  ┌────────────────────────────────────────┐ │
│  │ SYSTEM PROMPT                          │ │
│  │ - Safety instructions                  │ │
│  │ - Output format (JSON schema)          │ │
│  │ - Medical disclaimers                  │ │
│  ├────────────────────────────────────────┤ │
│  │ CONTEXT (Retrieved documents)          │ │
│  ├────────────────────────────────────────┤ │
│  │ USER QUERY                             │ │
│  └────────────────────────────────────────┘ │
│                     │                        │
│                     ▼                        │
│  Gemini generates structured JSON:          │
│  {                                          │
│    "summary": "...",                        │
│    "recommended_herbs": [...],              │
│    "preparation": "...",                    │
│    "disclaimer": "..."                      │
│  }                                          │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ 6. RESPONSE FORMATTING                       │
│                                              │
│  - Parse JSON (remove markdown fences)      │
│  - Validate schema                          │
│  - Return to client                         │
└──────────────────────────────────────────────┘
```

### Error Handling Strategy

```javascript
// Layered error handling
app.post('/chat', async (req, res) => {
  try {
    // 1. Input validation
    const { query } = req.body;
    if (!query?.trim()) {
      return res.status(400).json({ 
        error: 'A non-empty query string is required.' 
      });
    }

    // 2. External service calls (with error handling)
    const hits = await searchPinecone(query).catch(err => {
      console.error('Pinecone error:', err);
      throw new Error('Search service unavailable');
    });

    // 3. AI generation (with parsing error handling)
    const response = await generateResponse(context, query);
    const parsed = JSON.parse(response); // May throw SyntaxError

    // 4. Success response
    return res.json(parsed);

  } catch (error) {
    // Specific error handling
    if (error instanceof SyntaxError) {
      return res.status(502).json({ 
        error: 'Failed to parse AI response' 
      });
    }

    // Generic error
    console.error('Chat error:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
      });
  }
});
```

---

## Data Architecture

### Knowledge Base Structure

**health-issues-kb.json:**
```json
[
  {
    "condition": "string",          // Health condition name
    "symptoms": ["string"],         // Array of symptoms
    "remedies": [
      {
        "plantName": "string",      // Common name
        "scientificName": "string", // Scientific name
        "preparation": "string",    // How to prepare
        "dosage": "string",         // Recommended dosage
        "duration": "string",       // Treatment duration
        "precautions": "string",    // Safety warnings
        "source": "string"          // Reference text
      }
    ]
  }
]
```

### Pinecone Index Schema

**Record Structure:**
```typescript
interface PineconeRecord {
  _id: string;                      // Unique identifier
  chunk_text: string;               // Searchable text (auto-embedded)
  condition: string;                // Health condition
  plantName: string;                // Herb name
  scientificName: string;           // Scientific name
  preparation: string;              // Preparation method
  source: string;                   // Reference source
}
```

**Example Record:**
```json
{
  "_id": "stress-anxiety-ashwagandha",
  "chunk_text": "For the health issue 'Stress & Anxiety', the herb 'Ashwagandha' is recommended. The preparation is: Mix 1 teaspoon powder in warm milk before bedtime.",
  "condition": "Stress & Anxiety",
  "plantName": "Ashwagandha",
  "scientificName": "Withania somnifera",
  "preparation": "Mix 1 teaspoon powder in warm milk...",
  "source": "Ayurvedic Pharmacopoeia of India Vol. 1"
}
```

### Frontend Data Models

**plantData.json:**
```json
{
  "bed-id": {
    "name": "Common Name",
    "scientific": "Scientific name",
    "use": "Brief medicinal uses",
    "preparation": "Preparation method",
    "model": "filename.glb"
  }
}
```

---

## Security Architecture

### Current Security Measures

#### 1. Input Validation

```javascript
// Backend validation
if (!query || typeof query !== 'string' || query.trim().length === 0) {
  return res.status(400).json({ error: 'Invalid query' });
}

// File upload validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

#### 2. CORS Configuration

```javascript
// Currently allowing all origins (development)
app.use(cors());

// Production should restrict:
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};
app.use(cors(corsOptions));
```

#### 3. Environment Variables

```javascript
// Sensitive data in .env (not committed to git)
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('Missing API key');
  process.exit(1);
}
```

### Security Recommendations for Production

#### 1. Authentication & Authorization
```javascript
// JWT-based authentication
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/chat', authMiddleware, chatHandler);
```

#### 2. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/chat', limiter);
app.use('/identify-plant', limiter);
```

#### 3. Content Security Policy
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

#### 4. SQL/NoSQL Injection Prevention
```javascript
// Use parameterized queries
// Validate and sanitize all user input
const sanitize = require('sanitize-html');

const cleanQuery = sanitize(req.body.query, {
  allowedTags: [],
  allowedAttributes: {}
});
```

---

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────────────────────────┐
│                      localhost:5173                         │
│                    (Vite Dev Server)                        │
│  - Hot Module Replacement                                   │
│  - Source maps                                              │
│  - Fast refresh                                             │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP
┌────────────────────────┴────────────────────────────────────┐
│                      localhost:3000                         │
│                    (Express Server)                         │
│  - CORS: Allow all                                          │
│  - Logging: Verbose                                         │
│  - Error stack traces                                       │
└─────────────────────────────────────────────────────────────┘
```

### Production Architecture (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│                      CDN / Cloud Storage                    │
│                    (Static Assets - Frontend)               │
│  - HTML, CSS, JS bundles                                    │
│  - 3D models (.glb files)                                   │
│  - Images                                                   │
│  Examples: Vercel, Netlify, AWS S3 + CloudFront            │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────┴────────────────────────────────────┐
│                      Load Balancer                          │
│                    (SSL Termination)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼────────┐  ┌────▼────────┐  ┌───▼──────────┐
│  Backend       │  │  Backend    │  │  Backend     │
│  Instance 1    │  │  Instance 2 │  │  Instance 3  │
│  (Node.js)     │  │  (Node.js)  │  │  (Node.js)   │
└────────────────┘  └─────────────┘  └──────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
┌───────▼─────────┐            ┌──────────▼────────┐
│  Pinecone       │            │  Google Gemini    │
│  (Managed)      │            │  (Managed)        │
└─────────────────┘            └───────────────────┘
```

### Deployment Checklist

- [ ] Set environment variables
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS for production domain
- [ ] Implement rate limiting
- [ ] Add authentication
- [ ] Set up monitoring and logging
- [ ] Configure CDN for static assets
- [ ] Optimize images and 3D models
- [ ] Enable gzip/brotli compression
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Create backup strategy
- [ ] Document deployment process

---

## Performance Considerations

### Frontend Optimizations

#### 1. 3D Model Optimization
- **File size**: Keep models < 5MB
- **Polygon count**: Reduce unnecessary polygons
- **Texture compression**: Use compressed formats
- **Level of Detail (LOD)**: Future enhancement

#### 2. Code Splitting
```javascript
// Lazy load heavy components
const GalleryPanel = lazy(() => import('./components/GalleryPanel'));
```

#### 3. Asset Loading
```javascript
// Preload critical 3D models
useEffect(() => {
  criticalModels.forEach(model => {
    useGLTF.preload(`/models/${model}`);
  });
}, []);
```

### Backend Optimizations

#### 1. Caching
```javascript
// Frontend cache (in-memory)
const cache = new Map();

// Backend cache (Redis for production)
const redis = require('redis');
const client = redis.createClient();

app.post('/chat', async (req, res) => {
  const cacheKey = `chat:${hashQuery(req.body.query)}`;
  const cached = await client.get(cacheKey);
  
  if (cached) return res.json(JSON.parse(cached));
  
  const response = await generateResponse(req.body.query);
  await client.setex(cacheKey, 3600, JSON.stringify(response));
  
  res.json(response);
});
```

#### 2. Database Query Optimization
- Use Pinecone's integrated embedding (no manual vectorization)
- Implement proper reranking for better accuracy
- Batch upsert operations during ingestion

#### 3. Response Compression
```javascript
const compression = require('compression');
app.use(compression());
```

---

## Monitoring & Observability

### Recommended Tools

#### Application Monitoring
- **New Relic** - APM for Node.js
- **Datadog** - Infrastructure and application monitoring
- **Prometheus + Grafana** - Open-source stack

#### Error Tracking
- **Sentry** - Real-time error tracking
- **LogRocket** - Session replay for frontend

#### Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

app.post('/chat', async (req, res) => {
  logger.info('Chat request', { query: req.body.query });
  // Handle request
});
```

---

## Conclusion

This architecture is designed for:
- **Scalability**: Stateless backend, managed services
- **Maintainability**: Clear separation of concerns, documented APIs
- **Performance**: Optimized rendering, caching, lazy loading
- **Security**: Input validation, environment variables, CORS
- **Extensibility**: Modular components, well-defined interfaces

For questions or improvements, see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

**Architecture Version**: 1.0.2  
**Last Updated**: February 2026
