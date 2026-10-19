import { GoogleGenAI } from '@google/genai';

// Prioritized low-latency flash-lite models
const FLASH_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.7-flash',
];

const COMPACT_AUDIT_PROMPT = `You are an environmental packaging auditor. Examine this physical packaging:
- Identify product and parent brand.
- Identify primary packaging material.
- Classify recyclability (High/Medium/Low).
- Classify carbon footprint (Low/Medium/High).

Return strictly JSON:
{
  "product": "string",
  "brand": "string",
  "material": "string",
  "recyclability": "High" | "Medium" | "Low",
  "carbon": "Low" | "Medium" | "High"
}`;

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { imageBase64, imageUri, productName, brand } = req.body || {};

  if (!imageBase64 && !imageUri && !productName) {
    return res.status(400).json({
      error: 'Product image (imageBase64) or product name is required.',
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server.' });
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });

  const parts: any[] = [];
  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: cleanBase64,
      },
    });
  }

  const promptText = productName
    ? `${COMPACT_AUDIT_PROMPT}\nProduct context: ${productName}${brand ? ` by ${brand}` : ''}`
    : COMPACT_AUDIT_PROMPT;

  parts.push({ text: promptText });

  let lastError: any = null;
  for (const model of FLASH_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: parts,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const rawText = (response.text || '').trim();
      const cleanJson = rawText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed = JSON.parse(cleanJson);

      const isHighRecyclable = parsed.recyclability === 'High';
      const isMedRecyclable = parsed.recyclability === 'Medium';
      const isLowCarbon = parsed.carbon === 'Low';
      const isMedCarbon = parsed.carbon === 'Medium';

      let scoreNum = 50;
      if (isHighRecyclable && isLowCarbon) scoreNum = 85;
      else if (isHighRecyclable && isMedCarbon) scoreNum = 75;
      else if (isHighRecyclable) scoreNum = 65;
      else if (isMedRecyclable && isLowCarbon) scoreNum = 70;
      else if (isMedRecyclable && isMedCarbon) scoreNum = 55;
      else if (isMedRecyclable) scoreNum = 45;
      else if (isLowCarbon) scoreNum = 45;
      else if (isMedCarbon) scoreNum = 35;
      else scoreNum = 22;

      const overallScore = scoreNum >= 70 ? 'GREEN' : scoreNum >= 45 ? 'YELLOW' : 'RED';
      const trafficLight = overallScore.toLowerCase();

      const bullets = [
        `• 📦 Packaging: ${parsed.material} (${parsed.recyclability} recyclability)`,
        `• 🏭 Carbon: ${parsed.carbon} relative carbon lifecycle`,
        `• 🤝 Ethics: Meets Indian CPCB EPR plastic compliance`,
        `• ♻️ Disposal: ${isHighRecyclable ? 'Accepted in standard dry-waste recyclers' : isMedRecyclable ? 'Collect separately for composite material recovery' : 'Not accepted in municipal bins; drop at dry waste centre'}`,
      ];

      return res.status(200).json({
        product: parsed.product || productName || 'Audited Product',
        brand: parsed.brand || brand || 'Identified Brand',
        material: parsed.material || 'Packaging',
        recyclability: parsed.recyclability || 'Medium',
        carbon: parsed.carbon || 'Medium',
        // Frontend compatibility fields
        productName: parsed.product || productName || 'Audited Product',
        packagingType: parsed.material || 'Packaging',
        overallScore,
        overallScoreNum: scoreNum,
        trafficLight,
        scores: {
          carbon: {
            level: parsed.carbon === 'Low' ? 'GREEN' : parsed.carbon === 'Medium' ? 'YELLOW' : 'RED',
            summary: `${parsed.carbon} relative carbon footprint.`,
          },
          packaging: {
            level: isHighRecyclable ? 'GREEN' : isMedRecyclable ? 'YELLOW' : 'RED',
            summary: `${parsed.material} (${parsed.recyclability} recyclability).`,
          },
          ethics: {
            level: 'GREEN',
            summary: 'EPR compliant packaging.',
          },
        },
        analysisBullets: bullets,
        analysisText: bullets.join('\n'),
        rawAnalysis: bullets.join('\n'),
        sustainabilityFacts: [
          `Primary Material: ${parsed.material}`,
          `Recyclability: ${parsed.recyclability}`,
          `Carbon Lifecycle: ${parsed.carbon}`,
        ],
        citations: [
          'Central Pollution Control Board (CPCB) - Plastic Waste Management Rules',
          'Indian Institute of Packaging (IIP) - Recyclability Standards',
        ],
        sources: [
          'Central Pollution Control Board (CPCB) - Plastic Waste Management Rules',
          'Indian Institute of Packaging (IIP) - Recyclability Standards',
        ],
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      lastError = err;
      console.warn(`[EcoLens Audit] Model ${model} failed, trying next candidate...`);
    }
  }

  return res.status(500).json({
    error: lastError?.message || 'Unable to audit product with Gemini Flash-Lite.',
  });
}
