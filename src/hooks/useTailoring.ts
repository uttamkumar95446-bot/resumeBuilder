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

      // Detect non-JSON responses (e.g. Vercel 504 HTML timeout page)
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response (status ' + res.status + '):', text.slice(0, 200));
        let message = 'Tailoring failed. Please try again.';
        if (res.status >= 500) {
          message = 'The tailoring timed out. If you are on the Vercel Hobby plan, upgrade to Pro or set GROQ_MODEL=llama-3.1-8b-instant for faster processing.';
        }
        setState({ loading: false, error: message, data: null });
        return;
      }

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
