export type TrafficLightScore = 'green' | 'yellow' | 'red';
export type ConfidenceLevel = 'verified' | 'limited' | 'untrusted';
export type TabType = 'home' | 'audit' | 'swaps' | 'prefs';

export interface PillarDetail {
  score: TrafficLightScore;
  title: string;
  metric: string;
  detail: string;
  preferenceKey?: keyof UserPreferences;
}

export interface UserPreferences {
  carbonFootprint: boolean;
  zeroPlastic: boolean;
  veganCrueltyFree: boolean;
  ethicalSourcing: boolean;
  localSourcing: boolean;
}

export interface LCASummary {
  carbonPerUnit: string;
  packagingMaterial: string;
  waterFootprint: string;
  recyclabilityRate: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  trafficLight: TrafficLightScore;
  overallScoreNum: number;
  confidence: ConfidenceLevel;
  pillars: {
    packaging: PillarDetail;
    carbon: PillarDetail;
    vegan: PillarDetail;
    ethicalSourcing: PillarDetail;
    local: PillarDetail;
  };
  baseAiExplanation: string;
  sustainabilityFacts: string[];
  greenwashingAlert: string | null;
  alternatives: string[];
  alternativeTags?: { [altId: string]: string[] };
  lcaSummary: LCASummary;
}

export interface LiveAuditSource {
  title: string;
  uri: string;
}

export interface LiveAuditResult {
  text: string;
  sources: LiveAuditSource[];
  searchQueries: string[];
  timestamp: string;
}

export interface PhotoScanResult {
  productName: string;
  brand: string;
  category: string;
  packagingType: string;
  overallScoreNum: number;
  trafficLight: TrafficLightScore;
  confidence: ConfidenceLevel;
  analysisText: string;
  greenwashingWarning?: string | null;
  sustainabilityFacts: string[];
  suggestedSwapId?: string;
  imageUri?: string;
}

/**
 * Structured result from Gemini Search-Grounded product analysis.
 * Returned by /api/analyze-product and analyzeProductGrounded().
 */
export interface GroundedScoreDimension {
  level: 'GREEN' | 'YELLOW' | 'RED';
  summary: string;
}

export interface GroundedAuditResult {
  productName: string;
  brand: string;
  overallScore: 'GREEN' | 'YELLOW' | 'RED';
  overallScoreNum: number;
  scores: {
    carbon: GroundedScoreDimension;
    packaging: GroundedScoreDimension;
    ethics: GroundedScoreDimension;
  };
  sources: string[];
  searchQueries: string[];
  rawAnalysis: string;
  timestamp: string;
  isFromCache: boolean;
}
