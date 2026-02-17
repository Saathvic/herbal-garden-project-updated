/**
 * generatePDFs.js
 * 
 * Generates synthetic Ayurvedic PDF documents from the health-issues knowledge base.
 * Each PDF focuses on a specific health condition and its herbal remedies.
 * 
 * Usage: node generatePDFs.js
 */

const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const PDF_DIR = path.resolve(__dirname, "pdfs");

async function generatePDF(healthIssue) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();
  const margin = 50;
  let y = height - margin;

  // Title
  page.drawText("AYURVEDIC HEALTH REMEDY GUIDE", {
    x: margin,
    y,
    size: 11,
    font: italicFont,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= 30;

  page.drawText(healthIssue.condition.toUpperCase(), {
    x: margin,
    y,
    size: 20,
    font: boldFont,
    color: rgb(0.13, 0.37, 0.15),
  });
  y -= 10;

  // Line separator
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1.5,
    color: rgb(0.13, 0.37, 0.15),
  });
  y -= 25;

  // Helper to draw wrapped text
  function drawWrappedText(text, x, maxWidth, size, fontToUse) {
    const words = text.split(" ");
    let line = "";
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const testWidth = fontToUse.widthOfTextAtSize(testLine, size);
      if (testWidth > maxWidth && line) {
        page.drawText(line, { x, y, size, font: fontToUse, color: rgb(0.1, 0.1, 0.1) });
        y -= size + 4;
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      page.drawText(line, { x, y, size, font: fontToUse, color: rgb(0.1, 0.1, 0.1) });
      y -= size + 4;
    }
  }

  // Introduction
  page.drawText("Traditional Ayurvedic Remedies", { x: margin, y, size: 12, font: boldFont, color: rgb(0.13, 0.37, 0.15) });
  y -= 18;
  drawWrappedText(
    `This document outlines traditional Ayurvedic herbal remedies for ${healthIssue.condition}. Each remedy includes specific preparation instructions based on classical Ayurvedic texts.`,
    margin,
    width - 2 * margin,
    10,
    font
  );
  y -= 15;

  // Remedies
  for (let i = 0; i < healthIssue.remedies.length; i++) {
    const remedy = healthIssue.remedies[i];
    
    // Check if we need a new page
    if (y < 150) {
      const newPage = pdfDoc.addPage([595, 842]);
      y = height - margin;
    }

    page.drawText(`${i + 1}. ${remedy.plantName} (${remedy.scientificName})`, {
      x: margin,
      y,
      size: 13,
      font: boldFont,
      color: rgb(0.13, 0.37, 0.15),
    });
    y -= 18;

    page.drawText("Preparation:", { x: margin + 10, y, size: 11, font: boldFont, color: rgb(0.2, 0.2, 0.2) });
    y -= 14;
    drawWrappedText(remedy.preparation, margin + 10, width - 2 * margin - 10, 10, font);
    y -= 10;

    page.drawText(`Source: ${remedy.source}`, {
      x: margin + 10,
      y,
      size: 9,
      font: italicFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    y -= 20;
  }

  // Footer
  y = margin + 20;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.5,
    color: rgb(0.6, 0.6, 0.6),
  });
  y -= 15;
  page.drawText("DISCLAIMER", { x: margin, y, size: 9, font: boldFont, color: rgb(0.3, 0.3, 0.3) });
  y -= 12;
  drawWrappedText(
    "This information is for educational purposes only. It is NOT a substitute for professional medical advice. Always consult a qualified healthcare provider before using any herbal remedy.",
    margin,
    width - 2 * margin,
    8,
    italicFont
  );

  return pdfDoc.save();
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true });
  }

  // Load health issues data
  const data = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "health-issues-kb.json"), "utf-8")
  );

  console.log("\n📄 Generating Ayurvedic Health Remedy PDFs...\n");

  for (const healthIssue of data) {
    const fileName = `${healthIssue.condition.toLowerCase().replace(/\s+/g, "-").replace(/,/g, "")}-remedies.pdf`;
    const filePath = path.join(PDF_DIR, fileName);
    const pdfBytes = await generatePDF(healthIssue);
    fs.writeFileSync(filePath, pdfBytes);
    console.log(`  ✅ ${fileName} (${(pdfBytes.length / 1024).toFixed(1)} KB)`);
  }

  console.log(`\n📁 ${data.length} PDFs generated in: ${PDF_DIR}\n`);
}

main().catch(console.error);
