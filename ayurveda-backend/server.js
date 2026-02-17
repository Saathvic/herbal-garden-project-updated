const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const multer = require("multer");
const { Pinecone } = require("@pinecone-database/pinecone");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config({ path: path.resolve(__dirname, ".env") });

// ── Config ─────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "ayurveda-kb-v2";
const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE || "ayurveda";
const PORT = process.env.PORT || 3000;

const CHAT_MODEL = "gemini-3-flash-preview";

if (!GEMINI_API_KEY || !PINECONE_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY or PINECONE_API_KEY in .env");
  process.exit(1);
}

// ── Initialize clients ─────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const chatModel = genAI.getGenerativeModel({ model: CHAT_MODEL });
// Use same model for vision - Gemini 3 supports both text and images
const visionModel = genAI.getGenerativeModel({ model: CHAT_MODEL});

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

    // 3. Send to Gemini with safety prompt
    const prompt = `${SYSTEM_PROMPT}\n\n--- CONTEXT ---\n${context}\n\n--- USER QUERY ---\n${userQuery}`;

    const result = await chatModel.generateContent(prompt);
    const responseText = result.response.text();

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
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Convert buffer to base64
    const imageBase64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "image/jpeg";

    // Create vision prompt
    const prompt = `Identify this plant and provide its medicinal/herbal value. 
Return ONLY a JSON object with this exact format:
{
  "identified_plant": "Common name (Scientific name)",
  "medical_value": "Brief description of its medicinal properties and traditional uses"
}`;

    // Send to Gemini Vision
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

    // Parse JSON response
    const cleaned = responseText
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return res.json({
      identified_plant: parsed.identified_plant || "Unknown",
      medical_value: parsed.medical_value || "No medicinal information available",
    });
  } catch (err) {
    console.error("❌ /identify-plant error:", err.message);

    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: "Failed to parse AI response" });
    }

    return res.status(500).json({ error: "Failed to identify plant" });
  }
});

// ── Start ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌿 Ayurveda backend running on http://localhost:${PORT}`);
  console.log(`   POST /chat          — symptom-based herb recommendation`);
  console.log(`   POST /identify-plant — AI plant identification from image`);
  console.log(`   GET  /health        — health check\n`);
});
