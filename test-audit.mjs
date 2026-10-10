import fs from 'fs';
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing GEMINI_API_KEY in environment.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Prioritized list of low-latency multimodal models with automatic failover
const candidateModels = [
  'gemini-3.7-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-lite-latest',
];

async function auditImage(imagePath) {
  const start = Date.now();
  console.log(`\n--- Auditing: ${imagePath} ---`);
  
  if (!fs.existsSync(imagePath)) {
    console.error(`File not found: ${imagePath}`);
    return;
  }

  const imageBytes = fs.readFileSync(imagePath).toString("base64");
  const prompt = `
  You are an environmental packaging auditor. Examine this physical product packaging:
  1. Identify exact product name and parent brand.
  2. Detect physical packaging materials (e.g. PET, HDPE, multi-layer plastic film, aluminum, cardboard).
  3. Estimate packaging recyclability (High/Medium/Low) and explain why based on material separation.
  4. Estimate relative carbon footprint category (Low/Medium/High).
  
  Return strictly valid JSON matching this schema:
  {
    "productName": "string",
    "brand": "string",
    "packagingMaterials": ["string"],
    "recyclability": "High" | "Medium" | "Low",
    "recyclabilityReason": "string",
    "carbonEstimate": "Low" | "Medium" | "High",
    "confidenceScore": 0.0 to 1.0
  }
  `;

  let lastError = null;
  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: "application/json" }
      });

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBytes,
            mimeType: "image/jpeg"
          }
        }
      ]);

      const duration = ((Date.now() - start) / 1000).toFixed(2);
      console.log(`Completed in ${duration}s using ${modelName}`);
      console.log(JSON.stringify(JSON.parse(result.response.text()), null, 2));
      return;
    } catch (err) {
      lastError = err;
      console.warn(`Model ${modelName} unavailable (${err.message.split('\n')[0]}). Trying next candidate...`);
    }
  }

  console.error("Audit failed on all models:", lastError?.message);
}

const targetImage = process.argv[2];
if (!targetImage) {
  console.log("Usage: GEMINI_API_KEY=xxx node test-audit.mjs <path-to-photo.jpg>");
} else {
  auditImage(targetImage);
}
