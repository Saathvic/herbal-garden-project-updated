const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const { Pinecone } = require("@pinecone-database/pinecone");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

dotenv.config({ path: path.resolve(__dirname, ".env") });

// ── Config ─────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "ayurveda-kb-v2";
const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE || "ayurveda";
const PORT = process.env.PORT || 3000;

const GEMINI_CHAT_MODEL = "gemini-3-flash-preview";
const GROQ_CHAT_MODEL = "llama-3.3-70b-versatile";

if (!GEMINI_API_KEY || !PINECONE_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY or PINECONE_API_KEY in .env");
  process.exit(1);
}
if (!GROQ_API_KEY) {
  console.warn("⚠️  GROQ_API_KEY not set — Groq fallback will be unavailable");
}

// ── Initialize clients ─────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const chatModel = genAI.getGenerativeModel({ model: GEMINI_CHAT_MODEL });
// Use same model for vision - Gemini 3 supports both text and images
const visionModel = genAI.getGenerativeModel({ model: GEMINI_CHAT_MODEL });

// Groq client (fallback when Gemini rate-limits)
const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const index = pinecone.index(PINECONE_INDEX_NAME);

// ── Multer config for image uploads ────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// ── Express app ────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// Serve the chat HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"));
});

// ── Safety-aware system prompt ─────────────────────────────────────
const SYSTEM_PROMPT = `You are an Ayurvedic wellness assistant powered by a verified knowledge base focused on health issues and herbal remedies.
Your role is to provide educational information about traditional Ayurvedic herbs and their specific preparations for various health conditions.

SAFETY INSTRUCTIONS — you MUST follow these at all times:
1. NEVER diagnose any medical condition.
2. NEVER recommend stopping or replacing prescribed medication.
3. NEVER provide dosage for children, pregnant women, or nursing mothers — instead tell them to consult a doctor.
4. If the user describes a medical EMERGENCY (chest pain, difficulty breathing, severe bleeding, poisoning, allergic reaction), respond ONLY with: "Please call emergency services or visit the nearest hospital immediately."
5. Always remind the user that this is educational information, NOT medical advice.
6. Only recommend herbs that appear in the provided context documents. Do NOT invent or hallucinate herbs.
7. If the context does not contain relevant information for the query, say so honestly.

You will receive CONTEXT (retrieved health-issue-focused Ayurvedic remedies) and a USER QUERY.
Based ONLY on the provided context, respond with a JSON object in this exact format:

{
  "summary": "A clear 2-4 sentence explanation addressing the user's health concern and how Ayurveda traditionally approaches it.",
  "recommended_herbs": [
    {
      "name": "Herb name",
      "scientific_name": "Scientific name",
      "reason": "Why this herb is relevant to the symptoms"
    }
  ],
  "preparation": "Detailed step-by-step preparation instructions based on the context. If multiple herbs are recommended, provide preparation for each.",
  "disclaimer": "This information is for educational purposes only and is based on traditional Ayurvedic texts. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before using any herbal remedy, especially if you are pregnant, nursing, taking medication, or have a pre-existing condition."
}

Return ONLY the JSON object. No markdown fences, no extra text.`;

// ── Helpers ─────────────────────────────────────────────────────────

/**
 * Search Pinecone using integrated embedding (no manual embedding needed).
 * Pinecone converts the query text to a vector automatically using the
 * hosted multilingual-e5-large model, then reranks with bge-reranker-v2-m3.
 */
async function searchPinecone(queryText, topK = 5) {
  const namespace = index.namespace(PINECONE_NAMESPACE);
  const results = await namespace.searchRecords({
    query: {
      topK,
      inputs: { text: queryText },
    },
    rerank: {
      model: "bge-reranker-v2-m3",
      topN: topK,
      rankFields: ["chunk_text"],
    },
  });
  return results.result?.hits || [];
}

function buildContext(hits) {
  return hits
    .map(
      (hit, i) =>
        `[Remedy ${i + 1} — Score: ${hit._score?.toFixed(3) || "N/A"}]\n` +
        `Health Condition: ${hit.fields?.condition || "Unknown"}\n` +
        `Herb: ${hit.fields?.plantName || "Unknown"} (${hit.fields?.scientificName || "Unknown"})\n` +
        `Preparation: ${hit.fields?.preparation || "N/A"}\n` +
        `Source: ${hit.fields?.source || "N/A"}\n` +
        `Details: ${hit.fields?.chunk_text || "N/A"}`
    )
    .join("\n\n");
}

/**
 * Generate text with automatic fallback: Gemini → Groq.
 * Returns { text, model } so the caller knows which model answered.
 */
async function generateWithFallback(prompt) {
  // ── Try Gemini first ──
  try {
    const result = await chatModel.generateContent(prompt);
    const text = result.response.text();
    console.log(`✅ Response from Gemini (${GEMINI_CHAT_MODEL})`);
    return { text, model: GEMINI_CHAT_MODEL };
  } catch (geminiErr) {
    const is429 = geminiErr.message?.includes("429") ||
                  geminiErr.message?.includes("quota") ||
                  geminiErr.message?.includes("rate");
    console.warn(`⚠️  Gemini failed${is429 ? " (rate-limited)" : ""}: ${geminiErr.message}`);

    if (!groq) {
      // No Groq key configured — rethrow original error
      throw geminiErr;
    }

    // ── Fallback to Groq ──
    console.log(`🔄 Falling back to Groq (${GROQ_CHAT_MODEL})...`);
    const groqResult = await groq.chat.completions.create({
      model: GROQ_CHAT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt.replace(SYSTEM_PROMPT, "").trim() },
      ],
      temperature: 0.4,
      max_tokens: 2048,
    });
    const text = groqResult.choices?.[0]?.message?.content || "";
    console.log(`✅ Response from Groq (${GROQ_CHAT_MODEL})`);
    return { text, model: GROQ_CHAT_MODEL };
  }
}

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", index: PINECONE_INDEX_NAME });
});

// ── POST /chat ─────────────────────────────────────────────────────
app.post("/chat", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({ error: "A non-empty 'query' string is required." });
    }

    const userQuery = query.trim();

    // 1. Search Pinecone using integrated embedding + reranking
    const hits = await searchPinecone(userQuery, 5);

    if (hits.length === 0) {
      return res.json({
        summary: "No relevant Ayurvedic information was found for your query.",
        recommended_herbs: [],
        preparation: "N/A",
        disclaimer:
          "This information is for educational purposes only. Consult a qualified healthcare provider for medical advice.",
      });
    }

    // 2. Build context from retrieved documents
    const context = buildContext(hits);

    // 3. Send to LLM with safety prompt (Gemini → Groq fallback)
    const prompt = `${SYSTEM_PROMPT}\n\n--- CONTEXT ---\n${context}\n\n--- USER QUERY ---\n${userQuery}`;

    const { text: responseText, model: usedModel } = await generateWithFallback(prompt);

    // 4. Parse and return structured response
    const cleaned = responseText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return res.json({
      summary: parsed.summary,
      recommended_herbs: parsed.recommended_herbs,
      preparation: parsed.preparation,
      disclaimer: parsed.disclaimer,
      _model: usedModel, // so you can see which model responded
    });
  } catch (err) {
    console.error("❌ /chat error:", err.message);

    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: "Failed to parse AI response. Please try again." });
    }

    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

// ── POST /identify-plant ───────────────────────────────────────────
app.post("/identify-plant", upload.single("image"), async (req, res) => {
  console.log("📸 Received plant identification request");
  try {
    if (!req.file) {
      console.log("❌ No image file in request");
      return res.status(400).json({ error: "No image file provided" });
    }

    // Extract GPS coordinates from form data (EXIF)
    const latitude = req.body.latitude ? parseFloat(req.body.latitude) : null;
    const longitude = req.body.longitude ? parseFloat(req.body.longitude) : null;
    const plantId = req.body.plantId || "unknown";

    console.log(`🔍 Identifying plant for ${plantId}, GPS: ${latitude}, ${longitude}`);

    // Convert buffer to base64
    const imageBase64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "image/jpeg";
    console.log(`📄 Image size: ${(req.file.buffer.length / 1024).toFixed(2)} KB`);

    // Enhanced vision prompt to extract both plant info and location from image
    const prompt = `Analyze this image carefully and identify:
1. The plant species and its medicinal/herbal value
2. Any location information visible in the image (GPS coordinates, address, city, country, timestamp overlays, watermarks, or geotag stamps)

Return ONLY a JSON object with this exact format:
{
  "identified_plant": "Common name (Scientific name)",
  "medical_value": "Brief description of its medicinal properties and traditional uses",
  "location_from_image": {
    "address": "Full address if visible in image, otherwise null",
    "city": "City name if visible, otherwise null",
    "state": "State/Province if visible, otherwise null",
    "country": "Country if visible, otherwise null",
    "coordinates": "Coordinates as shown in image (e.g., 'Lat 28.997778° Long 77.761522°'), otherwise null",
    "timestamp": "Date/time if visible in image, otherwise null",
    "has_geotag_overlay": true or false
  }
}

Important: Extract text EXACTLY as it appears in any GPS overlay, watermark, or stamp. If no location information is visible, set all location fields to null.`;

    // Send to Gemini Vision
    console.log("🤖 Sending image to Gemini Vision API...");
    const result = await visionModel.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);

    const responseText = result.response.text();
    console.log("✅ Received response from Gemini");

    // Parse JSON response
    const cleaned = responseText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // Prepare location data - prioritize EXIF GPS, fallback to extracted location
    let finalLatitude = latitude;
    let finalLongitude = longitude;
    let locationSource = "exif";
    
    // If no EXIF GPS but we have location from image overlay, try to extract coordinates
    if (latitude === null && parsed.location_from_image?.coordinates) {
      locationSource = "image_overlay";
      // Note: We keep coordinates as text since parsing would require more complex logic
      // The coordinates text will be displayed to the user
    }

    // Store in Pinecone if we have GPS coordinates from EXIF
    if (finalLatitude !== null && finalLongitude !== null && parsed.identified_plant) {
      try {
        const namespace = index.namespace(PINECONE_NAMESPACE);
        const recordId = `plant-location-${Date.now()}`;
        
        await namespace.upsertRecords({
          records: [{
            id: recordId,
            fields: {
              plantId: plantId,
              identified_plant: parsed.identified_plant,
              medical_value: parsed.medical_value || "No medicinal information available",
              latitude: finalLatitude,
              longitude: finalLongitude,
              address: parsed.location_from_image?.address || null,
              city: parsed.location_from_image?.city || null,
              state: parsed.location_from_image?.state || null,
              country: parsed.location_from_image?.country || null,
              timestamp: new Date().toISOString(),
              type: "plant_location"
            }
          }]
        });
        
        console.log(`✅ Stored plant location: ${parsed.identified_plant} at ${finalLatitude}, ${finalLongitude}`);
      } catch (storeErr) {
        console.error("⚠️  Failed to store location in Pinecone:", storeErr.message);
        // Don't fail the request if storage fails
      }
    }

    console.log("✅ Plant identified:", parsed.identified_plant);
    return res.json({
      identified_plant: parsed.identified_plant || "Unknown",
      medical_value: parsed.medical_value || "No medicinal information available",
      location_stored: finalLatitude !== null && finalLongitude !== null,
      location_from_image: parsed.location_from_image || null,
      location_source: locationSource,
    });
  } catch (err) {
    console.error("❌ /identify-plant error:", err.message);
    console.error("Full error:", err);

    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: "Failed to parse AI response" });
    }

    return res.status(500).json({ error: err.message || "Failed to identify plant" });
  }
});

// ── GET /plant-locations/:plantId ──────────────────────────────────
app.get("/plant-locations/:plantId", async (req, res) => {
  try {
    const { plantId } = req.params;
    
    const namespace = index.namespace(PINECONE_NAMESPACE);
    
    // Query for plant locations by plantId
    const results = await namespace.queryRecords({
      filter: {
        plantId: { $eq: plantId },
        type: { $eq: "plant_location" }
      },
      topK: 100,
      includeFields: ["plantId", "identified_plant", "medical_value", "latitude", "longitude", "address", "city", "state", "country", "timestamp"]
    });

    const locations = (results.records || []).map(record => ({
      id: record.id,
      identified_plant: record.fields?.identified_plant,
      medical_value: record.fields?.medical_value,
      latitude: record.fields?.latitude,
      longitude: record.fields?.longitude,
      address: record.fields?.address,
      city: record.fields?.city,
      state: record.fields?.state,
      country: record.fields?.country,
      timestamp: record.fields?.timestamp
    }));

    return res.json({
      plantId,
      count: locations.length,
      locations
    });
  } catch (err) {
    console.error("❌ /plant-locations error:", err.message);
    return res.status(500).json({ error: "Failed to retrieve plant locations" });
  }
});

// ── Start ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌿 Ayurveda backend running on http://localhost:${PORT}`);
  console.log(`   POST /chat          — symptom-based herb recommendation`);
  console.log(`   POST /identify-plant — AI plant identification from image`);
  console.log(`   GET  /plant-locations/:plantId — retrieve stored plant locations`);
  console.log(`   GET  /health        — health check\n`);
});
