import { useState, useCallback } from 'react';

interface TailorResult {
  tailoredResume: import('@/types').TailoredResume;
  tailoredScore: import('@/types').MatchScore;
  tailoredGaps: import('@/types').GapAnalysis;
  warnings: string[];
}

interface UseTailoringState {
  loading: boolean;
  error: string | null;
  data: TailorResult | null;
}

export function useTailoring() {
  const [state, setState] = useState<UseTailoringState>({
    loading: false,
    error: null,
    data: null,
  });

  const tailor = useCallback(async (resumeText: string, jdText: string) => {
    setState({ loading: true, error: null, data: null });

    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jdText }),
      });

      const json = await res.json();

      if (!res.ok) {
        setState({ loading: false, error: json.error || 'Tailoring failed. Please try again.', data: null });
        return;
      }

      setState({ loading: false, error: null, data: json as TailorResult });
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

  return { ...state, tailor, reset };
}
