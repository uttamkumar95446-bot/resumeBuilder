import { useState, useCallback } from 'react';

export interface AnalyzeResult {
  resume: import('@/types').ResumeProfile;
  jd: import('@/types').JobDescriptionProfile;
  originalScore: import('@/types').MatchScore;
  originalGaps: import('@/types').GapAnalysis;
  warnings: string[];
}

interface UseAnalysisState {
  loading: boolean;
  error: string | null;
  data: AnalyzeResult | null;
}

export function useAnalysis() {
  const [state, setState] = useState<UseAnalysisState>({
    loading: false,
    error: null,
    data: null,
  });

  const analyze = useCallback(async (resumeText: string, jdText: string) => {
    setState({ loading: true, error: null, data: null });

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jdText }),
      });

      const json = await res.json();

      if (!res.ok) {
        setState({ loading: false, error: json.error || 'Analysis failed. Please try again.', data: null });
        return;
      }

      setState({ loading: false, error: null, data: json as AnalyzeResult });
    } catch (err) {
      setState({
        loading: false,
        error: err instanceof Error ? err.message : 'Network error - please check your connection.',
        data: null,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return { ...state, analyze, reset };
}
