# Complete Technical Architecture & Performance Guide

## 3D Herbal Garden with AI Guide & Geo-Tagging

**Target**: 60 FPS on mid-range hardware | <3s initial load | 99.9% uptime

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [System Architecture](#system-architecture)
3. [Frontend Performance](#frontend-performance)
4. [Backend Architecture](#backend-architecture)
5. [Database Design](#database-design)
6. [AI/ML Pipeline](#ai-ml-pipeline)
7. [Deployment Strategy](#deployment-strategy)
8. [Security &amp; Privacy](#security-privacy)
9. [Cost Analysis](#cost-analysis)

---

## Technology Stack

### Frontend

- **Framework**: React 18+ with Vite (faster than CRA, HMR in <100ms)
- **3D Engine**: Three.js v0.160+ via React Three Fiber v8.15+
- **State Management**: Zustand (lightweight, 1KB vs Redux's 10KB)
- **Routing**: React Router v6
- **UI Components**: Tailwind CSS + HeadlessUI (accessible, customizable)
- **3D Utilities**: @react-three/drei, @react-three/postprocessing
- **Forms**: React Hook Form + Zod validation

### Backend

**Node.js (JS/TS full-stack)**

- Express.js or Fastify (2x faster)
- Prisma ORM (type-safe, great DX)
- tRPC (end-to-end typesafety)

### Database

- **Primary**: PostgreSQL 15+ with PostGIS extension
- **Vector Store**: pgvector for embeddings (10x cheaper than Pinecone)
- **Caching**: Redis (session management, rate limiting)
- **File Storage**: AWS S3 or Cloudflare R2 (cheaper egress)

### AI/ML Services

- Gemini - 3 - flash

### DevOps

- **Frontend Hosting**: Vercel (optimal for React) or Cloudflare Pages (free, fast)
- **Backend Hosting**: Railway, Render, or Fly.io

---

## System Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   React UI  │  │ R3F 3D Scene │  │  Mapbox/Leaflet  │   │
│  │  (Tailwind) │  │  (WebGL)     │  │   (Geo Map)      │   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘   │
└─────────┼────────────────┼───────────────────┼─────────────┘
          │                │                   │
          ▼                ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                     CDN (Cloudflare)                         │
│      3D Models (glTF) | Textures (WebP/KTX2) | Assets       │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY (FastAPI/Express)              │
│  ┌──────────┐  ┌─────────────┐  ┌────────────────────────┐ │
│  │   Auth   │  │  Plant API  │  │  AI Chat API (RAG)     │ │
│  │  (JWT)   │  │  (CRUD)     │  │  (Streaming)           │ │
│  └────┬─────┘  └──────┬──────┘  └──────┬─────────────────┘ │
└───────┼───────────────┼────────────────┼────────────────────┘
        │               │                │
        ▼               ▼                ▼
┌──────────────────────────────────────────────────────────────┐
│              DATABASE LAYER                                   │
│  ┌────────────────────┐      ┌──────────────────────────┐   │
│  │   PostgreSQL       │      │   Redis Cache            │   │
│  │   + PostGIS        │      │   (Sessions, Limits)     │   │
│  │   + pgvector       │      └──────────────────────────┘   │
│  └────────────────────┘                                      │
└──────────────────────────────────────────────────────────────┘
        │                                 │
        ▼                                 ▼
┌─────────────────────┐         ┌──────────────────────────────┐
│  External Services  │         │   File Storage (S3/R2)       │
│  - OpenAI API       │         │   - User photos              │
│  - Anthropic API    │         │   - Plant images             │
└─────────────────────┘         └──────────────────────────────┘
```

### Data Flow Examples

**Plant Interaction Flow**

1. User clicks plant in 3D scene → Raycaster detects hit
2. Frontend requests `/api/plants/{id}` with JWT token
3. Backend validates token, queries PostgreSQL
4. Return JSON with plant data + presigned S3 URL for images
5. Frontend displays info panel + loads high-detail glTF model from CDN

**AI Chat Flow (RAG)**

1. User sends herbal query → POST `/api/chat` with message + context
2. Backend generates embedding for query (OpenAI API)
3. pgvector similarity search finds top 5 relevant plant documents
4. Construct prompt: system rules + retrieved context + user query
5. Stream LLM response chunks back to frontend (Server-Sent Events)
6. Frontend renders markdown with medical disclaimers

**Geo-Tagging Flow**

1. User fills form → Browser captures GPS (navigator.geolocation)
2. Upload photo to S3 (presigned POST URL from backend)
3. POST `/api/sightings` with coordinates, photo URL, plant ID
4. Backend stores in PostgreSQL with PostGIS GEOGRAPHY(Point, 4326)
5. Leaflet map queries `/api/sightings/nearby?lat=X&lng=Y&radius=10km`
6. Display markers with privacy fuzzing for rare species

---

## Frontend Performance

### Architecture Patterns

**Component Structure**

```
src/
├── components/
│   ├── Scene/
│   │   ├── Garden.jsx           // Main 3D scene container
│   │   ├── ChunkManager.jsx     // Spatial partitioning
│   │   ├── Plants/
│   │   │   ├── PlantInstance.jsx   // Individual plant
│   │   │   ├── GrassField.jsx      // InstancedMesh for grass
│   │   │   └── TreeLOD.jsx         // LOD system
│   │   ├── Environment/
│   │   │   ├── Ground.jsx
│   │   │   ├── SkyBox.jsx
│   │   │   └── Lighting.jsx
│   │   └── Player/
│   │       ├── FPSControls.jsx
│   │       └── CameraRig.jsx
│   ├── UI/
│   │   ├── PlantInfoPanel.jsx
│   │   ├── ChatInterface.jsx
│   │   └── MapOverlay.jsx
│   └── Forms/
│       ├── ReportSighting.jsx
│       └── AuthForms.jsx
├── hooks/
│   ├── useChunkedScene.js
│   ├── usePlayerMovement.js
│   ├── usePlantData.js
│   └── useChat.js
├── store/
│   └── useStore.js           // Zustand global state
├── utils/
│   ├── api.js                // API client
│   ├── spatial.js            // Chunk calculations
│   └── performance.js        // FPS monitoring
└── assets/
    ├── models/               // glTF files
    ├── textures/             // Compressed images
    └── data/
        └── plants.json       // Plant metadata
```

---

## Core Performance Strategies

### 1. Rendering Optimization

**Instanced Rendering**

- Use `InstancedMesh` for repeated plants (grass, common herbs, flowers)
- Target: Render 1000+ instances with single draw call
- Share materials across instances to reduce GPU state changes
- Maximum instances per mesh: 10,000 for best performance

**Draw Call Reduction**

- Target: <100 draw calls per frame
- Merge static geometry (paths, fences, rocks)
- Use texture atlases for common plants (reduces texture binds)
- Share materials wherever possible
- Frustum culling enabled by default in Three.js

**Level of Detail (LOD) System**

```
Distance ranges:
- 0-15 units: High poly (8k-10k triangles)
- 15-30 units: Medium poly (2k-3k triangles)  
- 30-60 units: Low poly (500-1k triangles)
- 60+ units: Billboard sprite or culled
```

**Adaptive Quality**

- Dynamic pixel ratio based on FPS
- Drop to 0.75-1.0 DPR if FPS < 30
- Use `r3f-perf` to monitor performance in dev
- Implement quality presets (Low/Medium/High/Ultra)

---

### 2. Spatial Chunking & Memory Management

**Grid-Based Chunking**

```
Chunk size: 50×50 units
Active radius: 2 chunks from camera
Preload radius: 3 chunks (optional background loading)
```

**Loading Strategy**

- React Suspense for lazy chunk loading
- Unload chunks >150 units from camera
- Keep maximum 9-16 chunks in memory
- Dispose geometries/textures on unload to prevent memory leaks

**Memory Budget**

```
Target total memory: <500MB
- Textures: ~200MB (compressed)
- Geometry: ~100MB
- Overhead: ~200MB
```

---

### 3. Lighting & Shadows

**Baked Lighting (Recommended)**

- Bake ambient occlusion and indirect lighting in Blender
- Use lightmap texture on ground/paths (2048×2048 max)
- Saves real-time calculation cost

**Dynamic Lighting (Minimal)**

```jsx
<Canvas shadows>
  <ambientLight intensity={0.3} />
  <hemisphereLight intensity={0.4} args={['#87ceeb', '#228b22']} />
  <directionalLight 
    castShadow 
    intensity={0.8}
    position={[50, 100, 50]}
    shadow-mapSize={[2048, 2048]}
    shadow-camera-far={200}
  />
</Canvas>
```

**Shadow Optimization**

- Disable `renderer.shadowMap.autoUpdate` for static objects
- Update manually only when needed
- Use `PCFSoftShadowMap` for quality/performance balance
- Limit shadow-casting objects to player and interactive items

---

### 4. Asset Optimization

**3D Models**

- Format: glTF/GLB with Draco compression (60-90% size reduction)
- UV unwrap efficiently for texture atlases
- Remove unnecessary vertices/edges
- Bake normals from high-poly to low-poly models

**Textures**

```
Format: KTX2 with Basis Universal (best compression)
Fallback: WebP or compressed PNG

Resolution guidelines:
- Ground/paths: 2048×2048
- Large plants: 1024×1024
- Small plants: 512×512
- UI elements: 256×256 or SVG
```

**Compression Settings**

```bash
# glTF Draco compression
gltf-pipeline -i model.gltf -o model.glb -d

# Texture compression (KTX2)
toktx --bcmp --genmipmap texture.ktx2 source.png
```

---

### 5. React Three Fiber Configuration

**Canvas Setup**

```jsx
<Canvas
  dpr={[0.75, 2]} // Adaptive pixel ratio
  gl={{
    powerPreference: 'high-performance',
    antialias: false, // Use FXAA post-processing instead
    stencil: false,
    depth: true,
  }}
  frameloop="demand" // Only render when needed (or 'always' for movement)
  performance={{ min: 0.5 }} // Auto-scale quality
  shadows
>
```

**Drei Components for Performance**

```jsx
import { PerformanceMonitor, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'

<AdaptiveDpr pixelated /> // Automatically adjusts DPR
<AdaptiveEvents /> // Reduces event listener overhead
<PerformanceMonitor
  onIncline={() => setDpr(2)} 
  onDecline={() => setDpr(1)}
/>
```

---

### 6. Player Movement Optimization

**FPS Controls**

```jsx
import { PointerLockControls } from '@react-three/drei'

// WASD movement with frame-rate independent delta
useFrame((state, delta) => {
  const speed = 5 * delta // 5 units per second
  if (keys.w) position.z -= speed
  if (keys.s) position.z += speed
  if (keys.a) position.x -= speed
  if (keys.d) position.x += speed
})
```

**Camera Frustum Optimization**

- Far plane: 200 units (limit render distance)
- Near plane: 0.1
- FOV: 75 (good balance)
- Use fog to hide pop-in at distance

---

### 7. Interaction System

**Raycasting Optimization**

```jsx
// Only raycast on click, not every frame
const onPlantClick = (event) => {
  const intersect = event.intersections[0]
  if (intersect) {
    loadHighDetailModel(intersect.object.plantId)
    showInfoPanel(intersect.object.plantData)
  }
}

// Limit raycasting to interactive layer
<mesh onClick={onPlantClick} raycast={interactiveMeshes} />
```

**Conditional High-Detail Loading**

- Load full-detail model only when plant is selected
- Keep LOD system for background plants
- Cache loaded models for reselection

---

### 8. Mobile Optimization

**Quality Presets**

```javascript
const presets = {
  mobile: {
    shadowMapSize: 512,
    maxChunks: 6,
    lodDistances: [10, 20, 40],
    maxDpr: 1,
    antialias: false,
  },
  desktop: {
    shadowMapSize: 2048,
    maxChunks: 16,
    lodDistances: [15, 30, 60],
    maxDpr: 2,
    antialias: true,
  }
}
```

**Device Detection**

```javascript
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
const preset = isMobile ? presets.mobile : presets.desktop
```

---

### 9. Profiling Tools

**Development**

```jsx
import { Perf } from 'r3f-perf'

<Perf position="top-left" />
```

**Production Monitoring**

```javascript
useFrame(({ gl }) => {
  const info = gl.info
  console.log('Draw calls:', info.render.calls)
  console.log('Triangles:', info.render.triangles)
  console.log('Textures:', info.memory.textures)
})
```

---

### 10. Advanced Techniques

**Occlusion Culling**

- Manually cull chunks behind terrain/buildings
- Use simplified collision boxes for culling checks

**Geometry Instancing Beyond InstancedMesh**

```jsx
// For plants with slight variations
<Instances limit={1000}>
  <planeGeometry />
  <meshStandardMaterial />
  {positions.map((pos, i) => (
    <Instance key={i} position={pos} rotation={randomRotation()} />
  ))}
</Instances>
```

**Texture Streaming**

- Load low-res textures first
- Progressively enhance with high-res on idle frames

**Web Workers**

- Offload chunk generation/plant positioning to workers
- Parse JSON data in background thread

---

## Backend Architecture

### FastAPI Structure (Recommended)

```python
backend/
├── app/
│   ├── main.py                    # FastAPI app + CORS
│   ├── config.py                  # Environment variables
│   ├── database.py                # SQLAlchemy engine
│   ├── models/
│   │   ├── user.py
│   │   ├── plant.py
│   │   └── sighting.py
│   ├── schemas/
│   │   ├── auth.py                # Pydantic models
│   │   ├── plant.py
│   │   └── chat.py
│   ├── routers/
│   │   ├── auth.py                # /auth/register, /auth/login
│   │   ├── plants.py              # /plants CRUD
│   │   ├── sightings.py           # /sightings + geo queries
│   │   └── chat.py                # /chat (streaming)
│   ├── services/
│   │   ├── auth_service.py        # JWT, bcrypt
│   │   ├── rag_service.py         # Embeddings, vector search
│   │   └── geo_service.py         # PostGIS queries
│   ├── middleware/
│   │   ├── auth_middleware.py
│   │   └── rate_limit.py
│   └── utils/
│       ├── s3.py                  # File upload helpers
│       └── openai_client.py
├── alembic/                       # Database migrations
├── tests/
└── requirements.txt
```

### Database Schema (PostgreSQL + PostGIS)

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Plants table
CREATE TABLE plants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    scientific_name VARCHAR(200),
    description TEXT,
    uses TEXT[],
    preparations JSONB,  -- Store recipes as JSON
    safety_notes TEXT,
    model_url VARCHAR(500),  -- CDN path to glTF
    image_urls TEXT[],
    metadata JSONB,  -- Custom fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plant embeddings for RAG
CREATE TABLE plant_embeddings (
    id SERIAL PRIMARY KEY,
    plant_id INTEGER REFERENCES plants(id) ON DELETE CASCADE,
    content TEXT,  -- Chunked text for embedding
    embedding vector(1536),  -- OpenAI text-embedding-3-small
    metadata JSONB
);

-- Create index for vector similarity search
CREATE INDEX ON plant_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Sightings table with PostGIS
CREATE TABLE sightings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    plant_id INTEGER REFERENCES plants(id),
    location GEOGRAPHY(Point, 4326) NOT NULL,  -- WGS84 coords
    photo_url VARCHAR(500),
    notes TEXT,
    verified BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index for geo queries
CREATE INDEX sightings_location_idx ON sightings USING GIST (location);

-- Chat history
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(20) NOT NULL,  -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

**Authentication**

```
POST   /auth/register         { email, password, username }
POST   /auth/login            { email, password } → JWT tokens
POST   /auth/refresh          { refresh_token } → new access token
GET    /auth/me               → current user info (requires JWT)
```

**Plants**

```
GET    /plants                List all plants (paginated)
GET    /plants/{id}           Get plant details
GET    /plants/search?q=      Search by name/use
POST   /plants                Create plant (admin only)
PUT    /plants/{id}           Update plant
DELETE /plants/{id}           Delete plant
```

**Sightings**

```
POST   /sightings             Create sighting with photo upload
GET    /sightings/nearby      ?lat=X&lng=Y&radius=10 (km)
GET    /sightings/{id}        Get sighting details
GET    /sightings/user/{id}   User's sightings
DELETE /sightings/{id}        Delete own sighting
```

**AI Chat**

```
POST   /chat                  { message, conversation_id? }
                              → Server-Sent Events stream
GET    /chat/history          Get past conversations
```

**Media**

```
GET    /media/upload-url      Get presigned S3 URL for upload
POST   /media/process         Process uploaded image
```

---

## AI/ML Pipeline (RAG System)

### Architecture

```
User Query → Embedding → Vector Search → Context Retrieval → LLM → Response
```

### Implementation Steps

**1. Document Processing & Embedding**

```python
from openai import OpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Chunk plant documents
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50
)

for plant in plants:
    # Combine name, description, uses, preparations
    text = f"{plant.name}\n{plant.description}\nUses: {', '.join(plant.uses)}\n..."
    chunks = splitter.split_text(text)
  
    for chunk in chunks:
        # Generate embedding
        embedding = client.embeddings.create(
            model="text-embedding-3-small",
            input=chunk
        ).data[0].embedding
      
        # Store in database
        save_embedding(plant.id, chunk, embedding)
```

**2. Similarity Search**

```python
async def search_similar_plants(query: str, top_k: int = 5):
    # Embed user query
    query_embedding = client.embeddings.create(
        model="text-embedding-3-small",
        input=query
    ).data[0].embedding
  
    # pgvector cosine similarity
    results = await db.execute(
        """
        SELECT plant_id, content, 1 - (embedding <=> :query_emb) AS similarity
        FROM plant_embeddings
        ORDER BY embedding <=> :query_emb
        LIMIT :top_k
        """,
        {"query_emb": query_embedding, "top_k": top_k}
    )
  
    return results.fetchall()
```

**3. LLM Prompt Construction**

```python
SYSTEM_PROMPT = """You are a knowledgeable but cautious herbal medicine guide.

CRITICAL SAFETY RULES:
1. ALWAYS include disclaimer: "This is educational information only. Consult a qualified healthcare provider before use."
2. REFUSE to diagnose conditions or treat serious symptoms (chest pain, severe bleeding, difficulty breathing, etc.)
3. If user mentions emergency symptoms, respond: "Please seek immediate medical attention. Call emergency services."
4. Emphasize proper identification and sourcing of plants
5. Warn about potential interactions with medications
6. Never recommend herbs for pregnancy/children without expert consultation

Use the provided plant context to answer questions about traditional uses, preparations, and safety considerations."""

async def generate_response(user_message: str, conversation_history: list):
    # Get relevant context
    context_chunks = await search_similar_plants(user_message, top_k=5)
    context = "\n\n".join([chunk.content for chunk in context_chunks])
  
    # Build messages
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": f"Relevant plant information:\n{context}"},
        *conversation_history,
        {"role": "user", "content": user_message}
    ]
  
    # Stream response
    stream = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        stream=True,
        temperature=0.7,
        max_tokens=800
    )
  
    for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
```

**4. Safety Layer**

```python
EMERGENCY_KEYWORDS = [
    "chest pain", "can't breathe", "severe bleeding", "unconscious",
    "overdose", "poisoning", "allergic reaction", "anaphylaxis"
]

def check_safety(message: str) -> tuple[bool, str]:
    message_lower = message.lower()
  
    for keyword in EMERGENCY_KEYWORDS:
        if keyword in message_lower:
            return False, "⚠️ EMERGENCY: Please call emergency services immediately (911 in US, 112 in EU). Do not rely on herbal remedies for life-threatening conditions."
  
    # Check for medical diagnosis requests
    if any(word in message_lower for word in ["diagnose", "do i have", "is this"]):
        return True, "Note: I cannot diagnose medical conditions. Please consult a healthcare provider for proper diagnosis."
  
    return True, None
```

### Cost Optimization

- Cache embeddings (don't regenerate for same queries)
- Use `text-embedding-3-small` ($0.02/1M tokens) vs `ada-002` ($0.10/1M)
- Implement rate limiting per user (10 requests/minute)
- Use GPT-4o-mini for simple queries, GPT-4o for complex (~90% cost savings)

---

## Database Design

### PostGIS Geo Queries

**Find Nearby Sightings**

```sql
SELECT 
    s.id, 
    s.plant_id, 
    p.name,
    ST_AsGeoJSON(s.location) as coords,
    ST_Distance(s.location::geography, ST_SetSRID(ST_Point(:lng, :lat), 4326)::geography) as distance_meters
FROM sightings s
JOIN plants p ON s.plant_id = p.id
WHERE ST_DWithin(
    s.location::geography,
    ST_SetSRID(ST_Point(:lng, :lat), 4326)::geography,
    :radius_meters
)
AND s.is_public = TRUE
ORDER BY distance_meters ASC
LIMIT 50;
```

**Privacy Fuzzing for Rare Plants**

```python
def fuzz_location(lat: float, lng: float, rare: bool) -> tuple:
    """Add random offset to protect rare plant locations"""
    if rare:
        # Offset by 1-5km randomly
        offset = random.uniform(0.01, 0.05)  # ~1-5km in degrees
        lat += random.choice([-1, 1]) * offset
        lng += random.choice([-1, 1]) * offset
    return lat, lng
```

### pgvector Best Practices

- Use `ivfflat` index for datasets <1M vectors
- Use `hnsw` index for >1M vectors (more accurate, faster)
- Rebuild index after bulk inserts
- Monitor index size (can grow large)

---

## Deployment Strategy

### Frontend (Vercel - Recommended)

```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**Alternative: Cloudflare Pages**

- Unlimited bandwidth (vs Vercel's 100GB on free tier)
- Edge network (faster global delivery)
- Free SSL, DDoS protection

### Backend (Railway - Recommended)

**Dockerfile**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install PostGIS dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Environment Variables**

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
REDIS_URL=redis://host:6379
OPENAI_API_KEY=sk-...
JWT_SECRET=<random-256-bit-key>
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=herbal-garden-uploads
FRONTEND_URL=https://your-app.vercel.app
```

### Database (Neon or Supabase)

**Neon** (Serverless Postgres)

- Auto-scaling (scale to zero on inactivity)
- Built-in PostGIS + pgvector
- Free tier: 0.5GB storage, 512MB RAM
- Paid: $19/month for 10GB

**Supabase** (Firebase alternative)

- Includes PostgreSQL + PostGIS + Auth + Storage
- Free tier: 500MB database, 1GB storage
- Paid: $25/month for 8GB

### CDN for 3D Assets (Cloudflare R2)

```javascript
// Upload glTF models to R2 bucket
// Serve via Cloudflare CDN (free egress)

const MODEL_BASE_URL = 'https://cdn.yourapp.com/models/'

function getModelUrl(plantId, lod) {
  return `${MODEL_BASE_URL}${plantId}_lod${lod}.glb`
}
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## Security & Privacy

### Authentication (JWT)

```python
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=1)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password):
    return pwd_context.hash(password)
```

### Rate Limiting

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/chat")
@limiter.limit("10/minute")  # 10 requests per minute
async def chat_endpoint(request: Request, message: ChatMessage):
    # ...
```

### Input Validation

```python
from pydantic import BaseModel, Field, validator

class PlantCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    uses: list[str] = Field(default_factory=list, max_items=20)
  
    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()
```

### CORS Configuration

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",
        "http://localhost:5173"  # Dev only
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Privacy Controls

- Hash user emails before storing in logs
- Fuzz GPS coordinates for rare/endangered plants
- Allow users to make sightings private
- Implement GDPR-compliant data export/deletion

---

## Cost Analysis (Monthly)

### Free Tier (Hobby Project)

- **Frontend**: Vercel Free (100GB bandwidth) - $0
- **Backend**: Railway Free (500 hours) or Render Free - $0
- **Database**: Neon Free (0.5GB) - $0
- **Storage**: Cloudflare R2 (10GB, 1M requests) - $0
- **AI**: OpenAI Pay-as-you-go (~100 chat sessions) - ~$5
- **Total**: ~$5/month

### Production Tier (1000+ users)

- **Frontend**: Vercel Pro (1TB bandwidth) - $20
- **Backend**: Railway Starter (8GB RAM, 100GB storage) - $20
- **Database**: Neon Scale (10GB) - $19
- **Storage**: R2 (100GB, 10M requests) - $1
- **Redis**: Upstash (1GB) - $10
- **AI**: OpenAI (~10k messages, embeddings) - $50-100
- **CDN**: Cloudflare (unlimited bandwidth) - $0
- **Monitoring**: Sentry Developer - $26
- **Total**: ~$150-180/month

### Optimization Tips

- Cache LLM responses for common questions (save 70% AI costs)
- Use CDN for all static assets
- Compress 3D models aggressively (Draco + KTX2)
- Implement lazy loading everywhere
- Use serverless functions for infrequent tasks

---

## Implementation Checklist

### Phase 1: Foundation (Week 1-2)

- [ ] Initialize Vite + React project with TypeScript
- [ ] Install R3F, drei, zustand, react-router
- [ ] Set up Tailwind CSS + component library
- [ ] Configure ESLint + Prettier
- [ ] Create project folder structure
- [ ] Set up Git repo + GitHub Actions
- [ ] Deploy "Hello World" to Vercel

### Phase 2: 3D Scene (Week 2-3)

- [ ] Configure Canvas with performance settings
- [ ] Create ground plane with baked lightmap texture
- [ ] Add fog, skybox, lighting setup
- [ ] Implement PointerLockControls + WASD movement
- [ ] Build chunking system (50×50 unit grid)
- [ ] Create useChunkedScene hook
- [ ] Add 5-10 placeholder plant models (low-poly glTF)
- [ ] Implement LOD system with `<Detailed>` component
- [ ] Set up r3f-perf monitoring

### Phase 3: Plant System (Week 3-4)

- [ ] Create plants.json with metadata (name, uses, preparations)
- [ ] Build PlantInfoPanel UI component
- [ ] Implement raycasting for plant selection
- [ ] Add camera focus animation
- [ ] Create InstancedMesh for repeated plants (grass)
- [ ] Optimize materials (shared cache)
- [ ] Compress models with Draco
- [ ] Compress textures (WebP/KTX2)
- [ ] Test FPS on target hardware (>30fps minimum)

### Phase 4: Backend Setup (Week 4-5)

- [ ] Initialize FastAPI project
- [ ] Set up PostgreSQL + PostGIS + pgvector (Neon/Supabase)
- [ ] Create database schema (users, plants, sightings, embeddings)
- [ ] Implement JWT authentication (register/login)
- [ ] Build Plant CRUD API endpoints
- [ ] Set up CORS middleware
- [ ] Configure environment variables
- [ ] Deploy to Railway/Render
- [ ] Test API with Postman/Thunder Client

### Phase 5: AI Chat (Week 5-6)

- [ ] Process plant documents into chunks
- [ ] Generate embeddings with OpenAI API
- [ ] Store in pgvector with HNSW index
- [ ] Build RAG similarity search function
- [ ] Implement safety prompt + refusal logic
- [ ] Create streaming chat endpoint (SSE)
- [ ] Build chat UI with markdown rendering
- [ ] Add conversation history
- [ ] Implement rate limiting (10/min)
- [ ] Test with medical edge cases

### Phase 6: Geo-Tagging (Week 6-7)

- [ ] Create ReportSighting form component
- [ ] Implement browser geolocation API
- [ ] Set up S3/R2 bucket for photo uploads
- [ ] Build presigned URL endpoint
- [ ] Create sightings POST endpoint
- [ ] Implement PostGIS nearby query
- [ ] Add Leaflet/Mapbox map component
- [ ] Display sighting markers
- [ ] Implement privacy fuzzing for rare plants
- [ ] Add photo upload progress indicator

### Phase 7: Optimization & Testing (Week 7-8)

- [ ] Profile with r3f-perf (target <100 draw calls)
- [ ] Implement adaptive DPR
- [ ] Add mobile quality preset
- [ ] Test on low-end devices
- [ ] Optimize bundle size (code splitting)
- [ ] Set up Sentry error tracking
- [ ] Add Vercel Analytics
- [ ] Load testing with k6/Artillery
- [ ] Security audit (OWASP Top 10)
- [ ] Accessibility testing (WCAG AA)

### Phase 8: Polish & Launch (Week 8-9)

- [ ] Create landing page
- [ ] Write documentation (README, API docs)
- [ ] Add loading states & error boundaries
- [ ] Implement toast notifications
- [ ] Create user onboarding flow
- [ ] Add keyboard shortcuts guide
- [ ] Set up monitoring dashboards
- [ ] Final QA testing
- [ ] Soft launch to small user group
- [ ] Gather feedback & iterate

---

## Technical Decisions & Alternatives

### 3D Model Sourcing

**Option 1: Custom Models (Blender)**

- Pros: Complete control, optimized for performance
- Cons: Time-intensive, requires 3D skills
- **Recommendation**: For 5-10 unique plants

**Option 2: Free Assets (Sketchfab CC0, Poly Haven)**

- Pros: Fast, high quality available
- Cons: May need optimization, licensing varies
- **Recommendation**: For initial prototype

**Option 3: Paid Marketplaces (TurboSquid, CGTrader)**

- Pros: Professional quality, rigged models
- Cons: $5-50 per model
- **Recommendation**: For hero plants only

### LLM Provider Comparison

| Feature            | OpenAI GPT-4o      | Anthropic Claude 3.5 | Groq Llama 3 70B     |
| ------------------ | ------------------ | -------------------- | -------------------- |
| Cost (1M tokens)   | $2.50 in / $10 out | $3 in / $15 out      | $0.59 in / $0.79 out |
| Speed              | 80 tok/sec         | 60 tok/sec           | 250+ tok/sec         |
| Safety             | Good               | Excellent            | Moderate             |
| Context            | 128k               | 200k                 | 8k                   |
| **Best for** | Balanced           | Safety-critical      | Budget/speed         |

**Recommendation**: Start with GPT-4o, add Claude 3.5 for safety-critical queries

### Database Hosting

| Provider           | Free Tier | Paid      | PostGIS | pgvector | Notes                  |
| ------------------ | --------- | --------- | ------- | -------- | ---------------------- |
| **Neon**     | 0.5GB     | $19/10GB  | ✅      | ✅       | Serverless, auto-scale |
| **Supabase** | 500MB     | $25/8GB   | ✅      | ✅       | Includes auth, storage |
| **Railway**  | 1GB       | $5/GB     | ✅      | Manual   | Easy deployment        |
| **AWS RDS**  | None      | $15/month | ✅      | Manual   | Enterprise-grade       |

**Recommendation**: Neon for production, Railway for prototyping

### Frontend Hosting

| Provider                   | Free Tier   | Performance | DX    | Notes                    |
| -------------------------- | ----------- | ----------- | ----- | ------------------------ |
| **Vercel**           | 100GB/month | Excellent   | Best  | Optimal for React        |
| **Cloudflare Pages** | Unlimited   | Excellent   | Good  | Free unlimited bandwidth |
| **Netlify**          | 100GB/month | Good        | Great | Generous free tier       |
| **GitHub Pages**     | Unlimited   | Moderate    | Basic | Static only, no SSR      |

**Recommendation**: Vercel (best DX) or Cloudflare Pages (cost-effective)

---

## Performance Benchmarks

### Target Metrics

- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3.0s
- **FPS (Desktop)**: 60fps sustained
- **FPS (Mobile)**: 30fps minimum
- **Draw Calls**: <100 per frame
- **Memory Usage**: <500MB desktop, <200MB mobile
- **Bundle Size**: <500KB initial JS (gzipped)

### Monitoring Setup

```javascript
// Track Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  // Send to Vercel Analytics or Google Analytics
  console.log(metric)
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)

// Track 3D performance
useFrame(() => {
  const fps = 1 / state.clock.getDelta()
  if (fps < 30) {
    console.warn('Low FPS:', fps)
    // Reduce quality automatically
  }
})
```

---

## Common Pitfalls & Solutions

### Problem: Low FPS (<30)

**Causes**:

- Too many draw calls
- High-poly models without LOD
- Unoptimized textures
- No frustum culling

**Solutions**:

- Use InstancedMesh for repeated objects
- Implement LOD system (3 levels minimum)
- Compress textures with KTX2
- Enable adaptive DPR

### Problem: High Memory Usage

**Causes**:

- Memory leaks (undisposed geometries)
- Loading all chunks simultaneously
- Large textures

**Solutions**:

- Dispose geometries on chunk unload
- Limit active chunks (9-16 max)
- Use texture atlases
- Monitor with Chrome DevTools Memory Profiler

### Problem: Slow Initial Load

**Causes**:

- Large bundle size
- Uncompressed assets
- No code splitting

**Solutions**:

- Lazy load routes with React.lazy()
- Code split by chunk (dynamic imports)
- Compress with Brotli/Gzip
- Use CDN for 3D assets

### Problem: AI Chat Latency

**Causes**:

- Large context (too many retrieved documents)
- Slow embedding generation
- No caching

**Solutions**:

- Limit retrieved context to top 3-5 chunks
- Cache embeddings in Redis
- Use streaming responses
- Pre-generate embeddings for all plants

### Problem: Geo Query Slow

**Causes**:

- No spatial index
- Querying entire table

**Solutions**:

- Create GIST index on PostGIS column
- Use ST_DWithin with radius limit
- Paginate results (max 50 per request)

---

## Resources & References

### Official Documentation

- [Three.js Performance Tips](https://threejs.org/docs/#manual/en/introduction/Performance-tips)
- [React Three Fiber Performance](https://docs.pmnd.rs/react-three-fiber/advanced/performance)
- [FastAPI Best Practices](https://fastapi.tiangolo.com/tutorial/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [pgvector GitHub](https://github.com/pgvector/pgvector)

### Learning Resources

- [Three.js Journey](https://threejs-journey.com/) - Comprehensive 3D course
- [Discover Three.js](https://discoverthreejs.com/) - Free ebook
- [LangChain RAG Tutorial](https://python.langchain.com/docs/use_cases/question_answering/)
- [FastAPI + PostgreSQL](https://testdriven.io/blog/fastapi-postgres/)

### Tools & Libraries

- **3D Assets**: Sketchfab, Poly Haven, Quixel Megascans
- **Optimization**: gltf-pipeline, Draco, KTX-Software
- **Testing**: k6, Lighthouse, WebPageTest
- **Monitoring**: Sentry, Vercel Analytics, PostHog

### Community

- [Poimandres Discord](https://discord.gg/poimandres) - R3F community
- [Three.js Forum](https://discourse.threejs.org/)
- [FastAPI Discord](https://discord.gg/VQjSZaeJmf)

---

## License & Attribution

### Recommended Licenses

- **Code**: MIT License (permissive, widely used)
- **Plant Data**: CC BY-SA 4.0 (attribution, share-alike)
- **3D Models**: Check individual asset licenses (CC0, CC BY)

### Attribution Template

```markdown
## Credits

- 3D Models: [Artist Name] (CC BY 4.0) - https://sketchfab.com/...
- Plant Data: [Herbal Database] (CC BY-SA 4.0)
- Icons: Heroicons (MIT)
- AI: Powered by OpenAI GPT-4
```

---

**Document Version**: 2.0
**Last Updated**: 2026-02-03
**Maintained by**: [Your Name/Team]

For questions or contributions, open an issue on GitHub.
