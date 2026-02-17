# Virtual Herbal Garden - API Reference

## Version: 1.0.2

**Base URL**: `http://localhost:3000`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Endpoints](#endpoints)
   - [Health Check](#get-health)
   - [Chat Consultation](#post-chat)
   - [Plant Identification](#post-identify-plant)
3. [Data Models](#data-models)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Examples](#examples)

---

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible on localhost.

> **Note**: When deploying to production, implement proper authentication (JWT, API keys, etc.)

---

## Endpoints

### GET /health

Health check endpoint to verify server status and database connectivity.

**Request:**
```http
GET /health HTTP/1.1
Host: localhost:3000
```

**Response:**
```json
{
  "status": "ok",
  "index": "ayurveda-kb-v2"
}
```

**Status Codes:**
- `200` - Service is healthy
- `503` - Service unavailable

**Example (curl):**
```bash
curl http://localhost:3000/health
```

**Example (JavaScript):**
```javascript
const response = await fetch('http://localhost:3000/health');
const data = await response.json();
console.log(data); // { status: 'ok', index: 'ayurveda-kb-v2' }
```

---

### POST /chat

Get Ayurvedic herbal remedy recommendations based on health symptoms or conditions.

**Endpoint:** `/chat`

**Method:** `POST`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "query": "string" // Required: User's health query/symptoms (min: 1 char, max: 1000 chars)
}
```

**Response Body:**
```json
{
  "summary": "string",
  "recommended_herbs": [
    {
      "name": "string",
      "scientific_name": "string",
      "reason": "string"
    }
  ],
  "preparation": "string",
  "disclaimer": "string"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid or missing query)
- `500` - Internal Server Error
- `502` - Bad Gateway (AI parsing error)

**Query Guidelines:**
- Be specific about symptoms
- Mention duration if relevant
- Avoid medical jargon (use plain language)
- One query per request

**Safety Features:**
- Emergency detection (chest pain, difficulty breathing, etc.)
- Medical disclaimer in all responses
- No dosage for vulnerable groups (children, pregnant women)
- No diagnosis or medical advice

**Example Request (curl):**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "I have trouble sleeping and feel anxious"}'
```

**Example Request (JavaScript):**
```javascript
const response = await fetch('http://localhost:3000/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: 'I have trouble sleeping and feel anxious'
  })
});

const data = await response.json();
console.log(data);
```

**Example Response:**
```json
{
  "summary": "Insomnia and anxiety are often interconnected conditions. Ayurveda recommends calming herbs that balance the nervous system and promote restful sleep.",
  "recommended_herbs": [
    {
      "name": "Ashwagandha",
      "scientific_name": "Withania somnifera",
      "reason": "Adaptogenic herb that reduces stress hormones (cortisol) and promotes relaxation"
    },
    {
      "name": "Brahmi",
      "scientific_name": "Bacopa monnieri",
      "reason": "Calms the mind, reduces anxiety, and improves sleep quality"
    }
  ],
  "preparation": "1. Ashwagandha: Mix 1 teaspoon of powder in warm milk before bedtime. 2. Brahmi: Take 500mg capsules twice daily with meals, or brew leaves in hot water for tea.",
  "disclaimer": "This information is for educational purposes only and is based on traditional Ayurvedic texts. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before using any herbal remedy, especially if you are pregnant, nursing, taking medication, or have a pre-existing condition."
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "A non-empty 'query' string is required."
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error. Please try again later."
}
```

**502 Bad Gateway:**
```json
{
  "error": "Failed to parse AI response. Please try again."
}
```

---

### POST /identify-plant

Identify a plant from an uploaded image and get its medicinal value.

**Endpoint:** `/identify-plant`

**Method:** `POST`

**Content-Type:** `multipart/form-data`

**Request Parameters:**
- `image` (file, required) - Image file to identify
  - **Formats**: JPEG, PNG, WEBP
  - **Max size**: 10MB
  - **Recommended**: Clear, well-lit photo with plant in focus

**Response Body:**
```json
{
  "identified_plant": "string", // Format: "Common Name (Scientific name)"
  "medical_value": "string"     // Description of medicinal properties
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (no file or invalid format)
- `413` - Payload Too Large (file > 10MB)
- `500` - Internal Server Error
- `502` - Bad Gateway (AI parsing error)

**Image Guidelines:**
- Take photos in good lighting
- Include leaves, flowers, or distinctive features
- Avoid blurry or dark images
- Single plant per image works best
- Close-up shots preferred

**Example Request (curl):**
```bash
curl -X POST http://localhost:3000/identify-plant \
  -F "image=@/path/to/plant-photo.jpg"
```

**Example Request (JavaScript):**
```javascript
// HTML: <input type="file" id="fileInput" accept="image/*">

const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('image', file);

const response = await fetch('http://localhost:3000/identify-plant', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data);
```

**Example Request (React hook):**
```javascript
const handleIdentify = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch('http://localhost:3000/identify-plant', {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) throw new Error('Identification failed');
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};
```

**Example Response:**
```json
{
  "identified_plant": "Tulsi / Holy Basil (Ocimum tenuiflorum)",
  "medical_value": "Tulsi is revered in Ayurveda as the 'Queen of Herbs' with powerful adaptogenic properties. It boosts immunity, reduces stress and anxiety, supports respiratory health, and has antibacterial and antifungal properties. Commonly used for colds, cough, fever, and as a daily wellness tea. Also beneficial for skin health and digestive issues."
}
```

**Error Responses:**

**400 Bad Request:**
```json
{
  "error": "No image file provided"
}
```

**413 Payload Too Large:**
```json
{
  "error": "File size exceeds 10MB limit"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to identify plant"
}
```

---

## Data Models

### HealthQuery

```typescript
interface HealthQuery {
  query: string; // User's health question/symptoms
}
```

### ChatResponse

```typescript
interface ChatResponse {
  summary: string;                    // 2-4 sentence overview
  recommended_herbs: Herb[];          // Array of recommended herbs
  preparation: string;                // Step-by-step preparation instructions
  disclaimer: string;                 // Safety disclaimer
}
```

### Herb

```typescript
interface Herb {
  name: string;                       // Common name
  scientific_name: string;            // Scientific/Latin name
  reason: string;                     // Why this herb is recommended
}
```

### PlantIdentification

```typescript
interface PlantIdentification {
  identified_plant: string;           // "Common Name (Scientific name)"
  medical_value: string;              // Medicinal properties and uses
}
```

### ErrorResponse

```typescript
interface ErrorResponse {
  error: string;                      // Error message
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Human-readable error message"
}
```

**Common HTTP Status Codes:**

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Missing or invalid parameters |
| 413 | Payload Too Large | File size exceeds limit |
| 500 | Internal Server Error | Server-side processing error |
| 502 | Bad Gateway | AI service response parsing failed |
| 503 | Service Unavailable | Server or database offline |

**Error Handling Best Practices:**

```javascript
// Frontend error handling example
async function queryChatbot(query) {
  try {
    const response = await fetch('http://localhost:3000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Chat error:', error.message);
    
    // Show user-friendly message
    if (error.message.includes('fetch')) {
      return { error: 'Cannot connect to server. Please try again.' };
    }
    
    return { error: error.message };
  }
}
```

---

## Rate Limiting

**Current Status**: No rate limiting implemented

**Recommended for Production**:
- Implement rate limiting (e.g., 100 requests/hour per IP)
- Use middleware like `express-rate-limit`
- Return `429 Too Many Requests` when exceeded

**Example Implementation:**
```javascript
const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour
  message: { error: 'Too many requests. Please try again later.' }
});

app.post('/chat', chatLimiter, chatHandler);
```

---

## Examples

### Complete Chat Integration

```javascript
// ChatService.js
class ChatService {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  async chat(query) {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  async identifyPlant(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${this.baseUrl}/identify-plant`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return await response.json();
    } catch (error) {
      console.error('Identification error:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error' };
    }
  }
}

// Usage
const chatService = new ChatService();

// Check health
const health = await chatService.healthCheck();
console.log('Server status:', health.status);

// Query chatbot
const response = await chatService.chat('I have a headache');
console.log('Recommendation:', response.summary);

// Identify plant
const identification = await chatService.identifyPlant(imageFile);
console.log('Plant:', identification.identified_plant);
```

### React Hook Integration

```javascript
// useAyurvedicChat.js
import { useState } from 'react';

export function useAyurvedicChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const chat = async (query) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { chat, loading, error };
}

// Component usage
function ChatComponent() {
  const { chat, loading, error } = useAyurvedicChat();
  const [response, setResponse] = useState(null);

  const handleSubmit = async (query) => {
    const result = await chat(query);
    if (result) setResponse(result);
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {response && (
        <div>
          <p>{response.summary}</p>
          <ul>
            {response.recommended_herbs.map((herb, i) => (
              <li key={i}>{herb.name} - {herb.reason}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## API Versioning

**Current**: No versioning (v1 implicit)

**Future**: Implement versioning in URL path
- `/v1/chat`
- `/v2/chat`

This ensures backward compatibility when making breaking changes.

---

## CORS Configuration

**Current Development**:
```javascript
app.use(cors()); // Allow all origins
```

**Production Recommendation**:
```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
```

---

## Troubleshooting

### Issue: "Cannot connect to backend"
- Verify backend is running: `http://localhost:3000/health`
- Check CORS configuration
- Ensure correct port in frontend requests

### Issue: 502 Bad Gateway
- AI response format changed
- Check Gemini API status
- Verify system prompt is correctly formatted

### Issue: 400 Bad Request
- Validate request body structure
- Ensure query is non-empty string
- Check Content-Type header

---

## Additional Resources

- [Main Documentation](./DOCUMENTATION.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [README](./README.md)

---

**API Version**: 1.0.2  
**Last Updated**: February 2026  
**Maintained by**: Virtual Herbal Garden Team
