import {
  LiveAuditResult,
  PhotoScanResult,
  UserPreferences,
  GroundedAuditResult,
} from '../types';

/**
 * Configure API Base URL:
 * 1. process.env.EXPO_PUBLIC_API_URL (configurable in Vercel or .env)
 * 2. window.location.origin (if running in a web browser deployment)
 * 3. Default production Vercel / Render deployment endpoint
 */
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ||
  (typeof window !== 'undefined' &&
  window.location?.origin &&
  !window.location.origin.includes('localhost') &&
  !window.location.origin.includes(':8081')
    ? window.location.origin
    : 'https://ecolens-api-nu.vercel.app');

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY: Gemini Search-Grounded Product Analysis (Strict Real-Time Web Data)
// ─────────────────────────────────────────────────────────────────────────────

function cleanErrorMessage(rawError: any): string {
  if (!rawError) return 'Unable to analyze product. Please try again.';
  const str = typeof rawError === 'string' ? rawError : (rawError.message || JSON.stringify(rawError));
  try {
    const parsed = JSON.parse(str);
    if (parsed?.error?.message) {
      if (parsed.error.code === 429 || parsed.error.status === 'RESOURCE_EXHAUSTED') {
        return 'Gemini AI is temporarily busy. Please wait a moment and try again.';
      }
      return parsed.error.message;
    }
  } catch {}
  return str;
}

/**
 * Calls /api/analyze — Gemini Multimodal Vision + Search Grounding.
 * Strictly throws user-friendly error if retrieval fails (zero mock/dummy fallbacks).
 */
export async function analyzeProductGrounded(
  productName: string,
  brand?: string,
  imageBase64?: string
): Promise<GroundedAuditResult> {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productName: productName || undefined,
      brand: brand || undefined,
      imageBase64: imageBase64 || undefined,
    }),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(cleanErrorMessage(errJson.error));
  }

  const data: GroundedAuditResult = await response.json();
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// REAL-TIME: Google Search Grounding Audit
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Real-time Google Search Grounding Audit
 * Calls live search audit to gather up-to-date Indian sustainability facts,
 * CPCB EPR compliance, and ASCI greenwashing reports.
 */
export async function auditProductLive(
  productName: string,
  brand?: string,
  customQuery?: string
): Promise<LiveAuditResult> {
  const response = await fetch(`${API_BASE_URL}/api/audit-live`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productName: productName || customQuery,
      brand: brand || 'Indian Retail Brand',
      query: customQuery || undefined,
    }),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(cleanErrorMessage(errJson.error));
  }

  const data = await response.json();
  return {
    text: data.text || 'No live audit details available.',
    sources: data.sources || [],
    searchQueries: data.searchQueries || [],
    timestamp: data.timestamp || new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA: Multimodal Product Photo Scan Analysis
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Multimodal Product Photo Scan Analysis
 * Analyzes photo captured by camera using real-time Gemini Vision + Search Grounding.
 * Zero dummy/mock fallbacks: strictly returns real-time server analysis or throws error.
 */
export async function analyzeProductPhoto(
  imageUri: string,
  imageBase64?: string,
  preferences?: UserPreferences
): Promise<PhotoScanResult> {
  const response = await fetch(`${API_BASE_URL}/api/scan-photo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUri,
      imageBase64,
      preferences,
    }),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(cleanErrorMessage(errJson.error));
  }

  const data = await response.json();
  return data;
}
