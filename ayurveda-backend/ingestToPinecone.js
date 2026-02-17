/**
 * ingestToPinecone.js
 * 
 * One-time ingestion script that:
 * 1. Reads Ayurvedic knowledge base from health-issues-kb.json
 * 2. Upserts records with text into Pinecone (integrated embedding)
 *    Pinecone uses the hosted multilingual-e5-large model to generate embeddings automatically
 *
 * Usage:
 *   cd ayurveda-backend
 *   npm install @pinecone-database/pinecone dotenv
 *   node ingestToPinecone.js
 *
 * Required .env:
 *   PINECONE_API_KEY=your_key
 *   PINECONE_INDEX_NAME=ayurveda-kb-v2
 *   PINECONE_NAMESPACE=ayurveda
 */

const { Pinecone } = require("@pinecone-database/pinecone");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });

// ── Config validation ──────────────────────────────────────────────
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "ayurveda-kb-v2";
const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE || "ayurveda";

if (!PINECONE_API_KEY) {
  console.error("❌ Missing PINECONE_API_KEY. Copy .env.example to .env and fill in your key.");
  process.exit(1);
}

// ── Initialize Pinecone ────────────────────────────────────────────
const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

// ── Load knowledge base ────────────────────────────────────────────
function loadKnowledgeBase() {
  const kbPath = path.resolve(__dirname, "health-issues-kb.json");
  if (!fs.existsSync(kbPath)) {
    console.error(`❌ Knowledge base not found at: ${kbPath}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(kbPath, "utf-8");
  return JSON.parse(raw);
}

// ── Main ingestion pipeline ────────────────────────────────────────
async function ingest() {
  console.log("\n🌿 Ayurvedic Knowledge Base → Pinecone Ingestion (Integrated Embedding)\n");
  console.log("─".repeat(55));

  // 1. Load health issues
  const healthIssues = loadKnowledgeBase();
  console.log(`📄 Loaded ${healthIssues.length} health issues from health-issues-kb.json\n`);

  // 2. Get the index namespace
  const namespace = pinecone.index(PINECONE_INDEX_NAME).namespace(PINECONE_NAMESPACE);

  // 3. Transform remedies into records for upsertRecords
  const records = [];
  for (const issue of healthIssues) {
    for (const remedy of issue.remedies) {
      const id = `${issue.condition.toLowerCase().replace(/\s+/g, "-")}-${remedy.plantName.toLowerCase().replace(/\s+/g, "-")}`;
      records.push({
        _id: id,
        chunk_text: `For the health issue '${issue.condition}', the herb '${remedy.plantName}' is recommended. The preparation is: ${remedy.preparation}`,
        condition: issue.condition,
        plantName: remedy.plantName,
        scientificName: remedy.scientificName,
        preparation: remedy.preparation,
        source: remedy.source,
      });
    }
  }
  
  console.log(`ℹ️  Generated ${records.length} total records to upsert.\n`);

  // 4. Upsert records in batches of 4 (Pinecone handles embedding automatically)
  const BATCH_SIZE = 4;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    console.log(`📤 Upserting batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} records)...`);
    
    for (const record of batch) {
      console.log(`   → ${record.plantName} for ${record.condition}`);
    }
    
    await namespace.upsertRecords(batch);
  }

  // 5. Wait briefly for indexing
  console.log("\n⏳ Waiting for records to be indexed...");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // 6. Verify
  const index = pinecone.index(PINECONE_INDEX_NAME);
  const stats = await index.describeIndexStats();

  console.log(`\n✅ Ingestion complete!`);
  console.log("─".repeat(55));
  console.log(`   Index:      ${PINECONE_INDEX_NAME}`);
  console.log(`   Namespace:  ${PINECONE_NAMESPACE}`);
  console.log(`   Records:    ${stats.totalRecordCount || "N/A"}`);
  console.log(`   Embedding:  multilingual-e5-large (integrated)`);
  console.log(`   Metric:     cosine`);
  console.log("─".repeat(55));
  console.log("\n🔍 You can now query this index from your Express backend via POST /chat\n");
}

// ── Run ────────────────────────────────────────────────────────────
ingest().catch((err) => {
  console.error("\n💥 Ingestion failed:", err.message);
  process.exit(1);
});
