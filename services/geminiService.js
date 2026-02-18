import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const SYSTEM_PROMPT = `You are an educational herbal plant information assistant for a virtual herbal garden.

RULES:
- This is for EDUCATIONAL purposes only.
- Do NOT provide medical diagnoses or treatment plans.
- Do NOT give emergency medical advice. If asked, say "Please consult a healthcare professional."
- Always include a disclaimer that the information is educational and not a substitute for professional medical advice.
- Respond ONLY with valid JSON in the exact format specified below. No markdown, no code fences, no extra text.

OUTPUT FORMAT (strict JSON):
{
  "description": "A concise 2-3 sentence description of the plant, its origin, and key characteristics.",
  "cultivation_method": "A brief guide on how to grow this plant including soil, water, sunlight needs.",
  "medical_uses": "Known traditional and Ayurvedic uses. Include disclaimer that this is educational only.",
  "disclaimer": "This information is for educational purposes only. Consult a qualified healthcare professional before using any herbal remedy."
}`

// In-memory cache to avoid repeated API calls for the same plant
const cache = new Map()

/**
 * Fetches AI-generated information about a plant from Gemini.
 * Results are cached in memory.
 */
export async function getPlantInfo(plantName) {
  if (cache.has(plantName)) {
    return cache.get(plantName)
  }

  if (!API_KEY) {
    return {
      error: true,
      message: 'Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.'
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY)
    // Use gemini-3-flash-preview for fast responses
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    const prompt = `${SYSTEM_PROMPT}\n\nProvide educational information about the herbal plant: "${plantName}". Return ONLY the JSON object.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleanText)

    if (!parsed.description || !parsed.cultivation_method || !parsed.medical_uses) {
      throw new Error('Incomplete response from AI')
    }

    cache.set(plantName, parsed)
    return parsed
  } catch (err) {
    const isNetworkError = err.message?.includes('fetch') || err.message?.includes('network')
    const isParseError = err instanceof SyntaxError

    return {
      error: true,
      message: isNetworkError
        ? 'Network error. Please check your internet connection.'
        : isParseError
          ? 'Failed to parse AI response. Please try again.'
          : err.message || 'An unexpected error occurred. Please try again.'
    }
  }
}

/**
 * Extracts location information from geotagged images using Gemini Vision API.
 * Can detect GPS overlay stamps, watermarks, and embedded location text.
 */
export async function extractLocationFromImage(imageFile) {
  if (!API_KEY) {
    return {
      error: true,
      message: 'Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.'
    }
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    // Convert file to base64
    const base64Data = await fileToBase64(imageFile)
    const mimeType = imageFile.type || 'image/jpeg'

    const prompt = `Analyze this image and extract ANY location information visible in it.
Look for:
- GPS overlays or watermarks (like "GPS Map Camera" stamps)
- Address text
- City, state, country names
- Coordinate numbers (latitude/longitude)
- Date/time stamps
- Map thumbnails

Return ONLY valid JSON in this exact format:
{
  "address": "Full address if visible, otherwise null",
  "city": "City name if visible, otherwise null",
  "state": "State/Province if visible, otherwise null",
  "country": "Country if visible, otherwise null",
  "coordinates": "Coordinates as text (e.g., 'Lat 28.997778° Long 77.761522°'), otherwise null",
  "timestamp": "Date/time if visible in image, otherwise null",
  "has_geotag_overlay": true or false
}

Extract text EXACTLY as it appears. If no location information is visible, set all fields to null except has_geotag_overlay which should be false.`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ])

    const response = await result.response
    const text = response.text()

    const cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleanText)

    return parsed
  } catch (err) {
    const isNetworkError = err.message?.includes('fetch') || err.message?.includes('network')
    const isParseError = err instanceof SyntaxError

    return {
      error: true,
      message: isNetworkError
        ? 'Network error. Please check your internet connection.'
        : isParseError
          ? 'Failed to parse AI response. Please try again.'
          : err.message || 'An unexpected error occurred. Please try again.'
    }
  }
}

/**
 * Helper function to convert a File to base64 string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
