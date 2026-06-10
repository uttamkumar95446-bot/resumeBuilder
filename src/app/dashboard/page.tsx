"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import ResumeInput from "@/components/ResumeInput";
import JDInput from "@/components/JDInput";
import ProgressSteps from "@/components/ProgressSteps";

export default function DashboardPage() {
  const router = useRouter();
  const resumeRef = useRef<HTMLTextAreaElement>(null);
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [jdError, setJdError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-focus resume textarea on mount
  useEffect(() => {
    const timer = setTimeout(() => resumeRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const canAnalyze = resumeText.trim().length >= 50 && jdText.trim().length >= 50;

  const loadSampleData = useCallback(async () => {
    try {
      const [resumeRes, jdRes] = await Promise.all([
        fetch("/samples/sample-resume.txt"),
        fetch("/samples/sample-jd.txt"),
      ]);
      const [resumeSample, jdSample] = await Promise.all([
        resumeRes.text(),
        jdRes.text(),
      ]);
      setResumeText(resumeSample);
      setJdText(jdSample);
      setResumeError(null);
      setJdError(null);
    } catch {
      // Silently fail - user can paste manually
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    let hasError = false;

    if (resumeText.trim().length < 50) {
      setResumeError("Resume must be at least 50 characters");
      hasError = true;
    } else {
      setResumeError(null);
    }

    if (jdText.trim().length < 50) {
      setJdError("Job description must be at least 50 characters");
      hasError = true;
    } else {
      setJdError(null);
    }

    if (hasError) return;

    setLoading(true);
    try {
      sessionStorage.setItem("resumeText", resumeText);
      sessionStorage.setItem("jdText", jdText);
      router.push("/dashboard/results");
    } finally {
      setLoading(false);
    }
  }, [resumeText, jdText, router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (canAnalyze && !loading) handleAnalyze();
      }
    },
    [canAnalyze, loading, handleAnalyze]
  );

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <ProgressSteps currentStep="input" />

          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Start Tailoring Your Resume</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Paste your resume and a job description below to get started.
            </p>
          </div>

          {/* Load Sample Button */}
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={loadSampleData}
              className="gap-2"
              disabled={loading}
            >
              <Sparkles className="h-4 w-4" />
              Load Sample Data
            </Button>
          </div>

          <div className="mt-6 grid gap-8 md:grid-cols-2" onKeyDown={handleKeyDown}>
            <ResumeInput
              ref={resumeRef}
              value={resumeText}
              onChange={(val) => {
                setResumeText(val);
                if (val.trim().length >= 50) setResumeError(null);
              }}
              error={resumeError}
            />
            <JDInput
              value={jdText}
              onChange={(val) => {
                setJdText(val);
                if (val.trim().length >= 50) setJdError(null);
              }}
              error={jdError}
            />
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={!canAnalyze || loading}
              className="min-w-[200px] text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Match"
              )}
            </Button>

            {!canAnalyze && !loading && (
              <p className="text-sm text-muted-foreground">
                Both inputs must be at least 50 characters to analyze.
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Press Ctrl+Enter to analyze
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
