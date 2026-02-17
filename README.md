# Herbal Garden 3D Ayurveda Project

This project is a 3D interactive herbal garden built with React Three Fiber and Vite, featuring:
- 3D plant beds and CommunityBox cubes
- AI-powered plant info and identification (Gemini 3 Flash Preview)
- Gallery with image upload and EXIF GPS extraction
- Backend with Express for AI chat and plant identification

## Features
- 🌱 Click plant beds for AI insights
- 🖼️ Upload plant images and identify them with AI
- 💬 Ayurveda chatbot

## Getting Started

### 1. Install dependencies
```sh
npm install
cd ayurveda-backend
npm install
cd ..
```

### 2. Set up API keys
- Create a `.env` file in the root:
  ```
  VITE_GEMINI_API_KEY=your_google_gemini_api_key
  ```
- In `ayurveda-backend/.env`:
  ```
  GEMINI_API_KEY=your_google_gemini_api_key
  ```

### 3. Start the backend
```sh
cd ayurveda-backend
node server.js
```

### 4. Start the frontend
```sh
npx vite --port 5173
```

### 5. Open in browser
Go to [http://localhost:5173](http://localhost:5173)

## Project Structure
- `App.jsx` — Main React app
- `services/` — Frontend Gemini API service
- `ayurveda-backend/` — Express backend
- `public/models/` — 3D plant models
- `plantData.json` — Plant info

## License
MIT
