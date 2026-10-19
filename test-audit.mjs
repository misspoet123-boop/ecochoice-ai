import fs from 'fs';
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Missing GEMINI_API_KEY in environment.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Low-latency lightweight multimodal models prioritizing flash-lite
const candidateModels = [
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.7-flash',
];

async function auditImage(imagePath) {
  const start = Date.now();
  console.log(`\n--- Auditing: ${imagePath} ---`);
  
  if (!fs.existsSync(imagePath)) {
    console.error(`File not found: ${imagePath}`);
    return;
  }

  const imageBytes = fs.readFileSync(imagePath).toString("base64");
  const prompt = `You are an environmental packaging auditor. Examine this physical packaging:
- Identify product and parent brand.
- Identify primary packaging material.
- Classify recyclability (High/Medium/Low).
- Classify carbon footprint (Low/Medium/High).
- Determine municipal binColor: "Blue (Dry)" | "Green (Wet)" | "Black (Hazardous/Non-Recyclable)".
- Provide disposalAction: concise one-sentence action step (e.g., "Separate cap and label, crush bottle, place in Blue Dry Bin").
- Provide sustainableAlternative: brief sustainable swap if recyclability is Low or Medium (e.g., "Loose grains in cotton produce bags" or "Returnable glass bottle").

Return strictly JSON:
{
  "product": "string",
  "brand": "string",
  "material": "string",
  "recyclability": "High" | "Medium" | "Low",
  "carbon": "Low" | "Medium" | "High",
  "binColor": "Blue (Dry)" | "Green (Wet)" | "Black (Hazardous/Non-Recyclable)",
  "disposalAction": "string",
  "sustainableAlternative": "string"
}`;

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
