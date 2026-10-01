import { useState, useCallback, useRef } from 'react';
import { GroundedAuditResult } from '../types';
import { analyzeProductGrounded } from '../services/geminiService';

interface UseGroundedAuditReturn {
  /** The live grounded result for the currently selected product, if fetched. */
  groundedResult: GroundedAuditResult | null;
  /** True while the API call is in-flight. */
  isLoading: boolean;
  /** Error message if the last fetch failed (null otherwise). */
  error: string | null;
  /**
   * Trigger a fresh grounded analysis for a product.
   * Respects an in-memory cache: if the same productKey was already fetched
   * during this session and `force` is false, the cached result is returned.
   */
  triggerAnalysis: (
    productName: string,
    brand: string,
    productKey: string,
    force?: boolean
  ) => Promise<void>;
  /** Clear the current grounded result (e.g. when navigating away). */
  clearResult: () => void;
}

/**
 * useGroundedAudit
 *
 * Manages per-product Gemini Search-Grounded analysis state.
 * Includes an in-session cache keyed by productKey (usually product.id or name).
 * This prevents re-fetching the same product twice in one session.
 */
export function useGroundedAudit(): UseGroundedAuditReturn {
  const [groundedResult, setGroundedResult] = useState<GroundedAuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In-session cache — persists for the lifetime of the hook (session)
  const cache = useRef<Record<string, GroundedAuditResult>>({});

  const triggerAnalysis = useCallback(
    async (
      productName: string,
      brand: string,
      productKey: string,
      force: boolean = false
    ) => {
      // Serve from cache if available and not forced
      if (!force && cache.current[productKey]) {
        setGroundedResult({ ...cache.current[productKey], isFromCache: true });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await analyzeProductGrounded(productName, brand);
        cache.current[productKey] = result;
        setGroundedResult(result);
      } catch (err: any) {
        console.warn('[useGroundedAudit] Analysis failed:', err.message);
        setError(err.message || 'Failed to fetch live sustainability data');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearResult = useCallback(() => {
    setGroundedResult(null);
    setError(null);
  }, []);

  return { groundedResult, isLoading, error, triggerAnalysis, clearResult };
}
