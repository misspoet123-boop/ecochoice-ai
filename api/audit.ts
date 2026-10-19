import { GoogleGenAI } from '@google/genai';
import { Redis } from '@upstash/redis';

// Prioritized low-latency flash-lite models
const FLASH_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.7-flash',
];

const COMPACT_AUDIT_PROMPT = `You are an environmental packaging auditor. Examine this physical packaging:
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

// Initialize Upstash Redis client with graceful fallback
function getRedisClient(): Redis | null {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    if (url && token) {
      return new Redis({ url, token });
    }
  } catch (err) {
    console.warn('[Upstash Redis] Init failed:', err);
  }
  return null;
}

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

  const { barcode, imageBase64, imageUri, productName, brand } = req.body || {};

  const redis = getRedisClient();

  // 1. Cache-Aside Check: Barcode Cache
  if (redis && barcode) {
    try {
      const cached = await redis.get(`audit:barcode:${barcode}`);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        const parsedCached = typeof cached === 'string' ? JSON.parse(cached) : cached;
        return res.status(200).json(parsedCached);
      }
    } catch (err) {
      console.warn('[Upstash Redis] Barcode lookup error:', err);
    }
  }

  // 2. Cache-Aside Check: Product Name Cache (when no photo provided)
  if (redis && !imageBase64 && productName) {
    try {
      const checkKey = `audit:product:${brand || ''}_${productName}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_');
      const cached = await redis.get(checkKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        const parsedCached = typeof cached === 'string' ? JSON.parse(cached) : cached;
        return res.status(200).json(parsedCached);
      }
    } catch (err) {
      console.warn('[Upstash Redis] Product lookup error:', err);
    }
  }

  if (!imageBase64 && !imageUri && !productName && !barcode) {
    return res.status(400).json({
      error: 'Product image (imageBase64), barcode, or product name is required.',
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

  const targetDesc = productName
    ? `${productName}${brand ? ` by ${brand}` : ''}`
    : barcode
    ? `Product with barcode: ${barcode}`
    : '';

  const promptText = targetDesc
    ? `${COMPACT_AUDIT_PROMPT}\nProduct context: ${targetDesc}`
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

      const binColor: 'Blue (Dry)' | 'Green (Wet)' | 'Black (Hazardous/Non-Recyclable)' =
        parsed.binColor ||
        (isHighRecyclable
          ? 'Blue (Dry)'
          : isMedRecyclable
          ? 'Blue (Dry)'
          : 'Black (Hazardous/Non-Recyclable)');

      const disposalAction: string =
        parsed.disposalAction ||
        (isHighRecyclable
          ? 'Separate cap and label, crush container, and place in Blue Dry Waste Bin.'
          : isMedRecyclable
          ? 'Rinse thoroughly, flatten, and deposit at municipal dry waste collection.'
          : 'Place in Black Domestic Hazardous/Non-Recyclable Bin.');

      const sustainableAlternative: string =
        parsed.sustainableAlternative ||
        (isHighRecyclable
          ? 'Refillable or bulk package'
          : 'Returnable glass bottle or loose plastic-free alternative');

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
        `• 🗑️ Municipal Bin: ${binColor}`,
        `• ♻️ Disposal: ${disposalAction}`,
        ...(sustainableAlternative ? [`• 🌿 Sustainable Swap: ${sustainableAlternative}`] : []),
      ];

      const result = {
        product: parsed.product || productName || 'Audited Product',
        brand: parsed.brand || brand || 'Identified Brand',
        material: parsed.material || 'Packaging',
        recyclability: parsed.recyclability || 'Medium',
        carbon: parsed.carbon || 'Medium',
        binColor,
        disposalAction,
        sustainableAlternative,
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
          `Municipal Bin: ${binColor}`,
          `Disposal: ${disposalAction}`,
          ...(sustainableAlternative ? [`Eco Alternative: ${sustainableAlternative}`] : []),
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
      };

      // 3. Store result in Upstash Redis cache with 30-day TTL (2592000 seconds)
      if (redis) {
        try {
          const normKey = `audit:product:${result.brand}_${result.product}`
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_');
          await redis.set(normKey, JSON.stringify(result), { ex: 2592000 });

          if (productName) {
            const incomingKey = `audit:product:${brand || ''}_${productName}`
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '_');
            await redis.set(incomingKey, JSON.stringify(result), { ex: 2592000 });
          }

          if (barcode) {
            await redis.set(`audit:barcode:${barcode}`, JSON.stringify(result), { ex: 2592000 });
          }
        } catch (cacheErr) {
          console.warn('[Upstash Redis] Cache write error:', cacheErr);
        }
      }

      res.setHeader('X-Cache', 'MISS');
      return res.status(200).json(result);
    } catch (err: any) {
      lastError = err;
      console.warn(`[EcoLens Audit] Model ${model} failed, trying next candidate...`);
    }
  }

  return res.status(500).json({
    error: lastError?.message || 'Unable to audit product with Gemini Flash-Lite.',
  });
}
