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

      // Detect non-JSON responses (e.g. Vercel 504 HTML timeout page)
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response (status ' + res.status + '):', text.slice(0, 200));
        let message = 'Analysis failed. Please try again.';
        if (res.status >= 500) {
          message = 'The analysis timed out. If you are on the Vercel Hobby plan, upgrade to Pro or set GROQ_MODEL=llama-3.1-8b-instant for faster processing.';
        }
        setState({ loading: false, error: message, data: null });
        return;
      }

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
