/**
 * ingestPDFToPinecone.js
 *
 * Ingests PDF documents from the pdfs/ folder into Pinecone.
 * 1. Reads all PDFs (or a specific one) from pdfs/
 * 2. Extracts text using pdf-parse
 * 3. Chunks text into manageable pieces
 * 4. Upserts records to Pinecone (integrated embedding via multilingual-e5-large)
 *
 * Usage:
 *   node ingestPDFToPinecone.js                         # ingest all PDFs
 *   node ingestPDFToPinecone.js "specific-file.pdf"     # ingest one PDF
 */

const { Pinecone } = require("@pinecone-database/pinecone");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

dotenv.config({ path: path.resolve(__dirname, ".env") });

// ── Config ─────────────────────────────────────────────────────────
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || "ayurveda-kb-v2";
const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE || "ayurveda";
const PDF_DIR = path.resolve(__dirname, "pdfs");
const CHUNK_SIZE = 800;    // characters per chunk
const CHUNK_OVERLAP = 150; // overlap between chunks

if (!PINECONE_API_KEY) {
  console.error("❌ Missing PINECONE_API_KEY in .env");
  process.exit(1);
}

const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

// ── Text chunking ──────────────────────────────────────────────────
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    if (chunk.length > 50) {
      chunks.push(chunk);
    }
    start += chunkSize - overlap;
  }
  return chunks;
}

// ── Main ingestion ─────────────────────────────────────────────────
async function ingestPDFs(targetFile) {
  console.log("\n📄 PDF → Pinecone Ingestion\n");
  console.log("─".repeat(55));

  // 1. Determine which PDFs to process
  let pdfFiles;
  if (targetFile) {
    const fullPath = path.join(PDF_DIR, targetFile);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ File not found: ${fullPath}`);
      process.exit(1);
    }
    pdfFiles = [targetFile];
  } else {
    pdfFiles = fs.readdirSync(PDF_DIR).filter((f) => f.endsWith(".pdf"));
  }

  console.log(`📂 Found ${pdfFiles.length} PDF(s) to ingest.\n`);

  const namespace = pinecone.index(PINECONE_INDEX_NAME).namespace(PINECONE_NAMESPACE);
  let totalRecords = 0;

  for (const file of pdfFiles) {
    const filePath = path.join(PDF_DIR, file);
    console.log(`\n📖 Processing: ${file}`);

    // 2. Extract text from PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    console.log(`   Pages: ${pdfData.numpages}`);
    console.log(`   Extracted ${text.length} characters of text`);

    if (text.trim().length < 50) {
      console.log(`   ⚠️  Skipping — too little text extracted.`);
      continue;
    }

    // 3. Chunk the text
    const chunks = chunkText(text);
    console.log(`   Chunked into ${chunks.length} segments`);

    // 4. Build records
    const records = chunks.map((chunk, i) => {
      const id = `pdf-${file.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-chunk-${i}`;
      return {
        _id: id,
        chunk_text: chunk,
        source: `PDF: ${file}`,
        condition: "General Medicinal Plants",
        plantName: "Various",
        scientificName: "Various",
        preparation: chunk,
      };
    });

    // 5. Upsert in batches of 4
    const BATCH_SIZE = 4;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      console.log(
        `   📤 Upserting batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(records.length / BATCH_SIZE)} (${batch.length} records)...`
      );
      await namespace.upsertRecords({ records: batch });
    }

    totalRecords += records.length;
    console.log(`   ✅ Ingested ${records.length} records from ${file}`);
  }

  // 6. Wait for indexing
  console.log("\n⏳ Waiting for records to be indexed...");
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // 7. Verify
  const idx = pinecone.index(PINECONE_INDEX_NAME);
  const stats = await idx.describeIndexStats();

  console.log(`\n✅ PDF ingestion complete!`);
  console.log("─".repeat(55));
  console.log(`   Index:         ${PINECONE_INDEX_NAME}`);
  console.log(`   Namespace:     ${PINECONE_NAMESPACE}`);
  console.log(`   New records:   ${totalRecords}`);
  console.log(`   Total records: ${stats.totalRecordCount || "N/A"}`);
  console.log("─".repeat(55));
  console.log("\n🔍 The chatbot can now answer questions based on PDF content.\n");
}

// ── Run ────────────────────────────────────────────────────────────
const targetFile = process.argv[2] || null;
ingestPDFs(targetFile).catch((err) => {
  console.error("\n💥 PDF ingestion failed:", err.message);
  console.error(err);
  process.exit(1);
});
