"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import JDSummaryCard from "@/components/JDSummaryCard";
import ScoreCard from "@/components/ScoreCard";
import GapAnalysis from "@/components/GapAnalysis";
import SideBySideDiff from "@/components/SideBySideDiff";
import TailorButton from "@/components/TailorButton";
import ExportButton from "@/components/ExportButton";
import ProgressSteps from "@/components/ProgressSteps";
import { ScoreCardSkeleton, GapAnalysisSkeleton, SideBySideDiffSkeleton, JDSummaryCardSkeleton } from "@/components/Skeleton";
import { Separator } from "@/components/ui/separator";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useTailoring } from "@/hooks/useTailoring";
import { mockAnalysisResult } from "@/lib/mock/mock-analysis-result";
import type { ResumeProfile, JobDescriptionProfile, MatchScore, TailoredResume, GapAnalysis as GapAnalysisType } from "@/types";

export default function ResultsPage() {
  const router = useRouter();
  const { loading: analyzing, error: analysisError, data: analysisData, analyze } = useAnalysis();
  const { loading: tailoring, error: tailoringError, data: tailoringData, tailor } = useTailoring();
  const [hasTailored, setHasTailored] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [hasStorageInput, setHasStorageInput] = useState(false);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    const resumeText = typeof window !== "undefined" ? sessionStorage.getItem("resumeText") : null;
    const jdText = typeof window !== "undefined" ? sessionStorage.getItem("jdText") : null;

    if (resumeText && jdText) {
      setHasStorageInput(true);
      analyze(resumeText, jdText);
    }
  }, [analyze, initialized]);

  const handleTailor = useCallback(async () => {
    if (typeof window === "undefined") return;
    const resumeText = sessionStorage.getItem("resumeText");
    const jdText = sessionStorage.getItem("jdText");
    if (resumeText && jdText) {
      await tailor(resumeText, jdText);
      setHasTailored(true);
    }
  }, [tailor]);

  const handleBack = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  // Sync export data to sessionStorage whenever it changes
  // MUST be placed before any early returns to avoid React hooks ordering violations
  useEffect(() => {
    if (typeof window === "undefined") return;
    const tailoredScoreValue = (tailoringData?.tailoredScore ?? mockAnalysisResult.tailoredScore) as MatchScore;
    const gapsValue = (analysisData?.originalGaps ?? mockAnalysisResult.gaps) as GapAnalysisType;
    const data = {
      resume: (analysisData?.resume ?? mockAnalysisResult.resume) as ResumeProfile,
      jd: (analysisData?.jd ?? mockAnalysisResult.jd) as JobDescriptionProfile,
      originalScore: (analysisData?.originalScore ?? mockAnalysisResult.originalScore) as MatchScore,
      tailoredScore: tailoredScoreValue,
      tailoredResume: (tailoringData?.tailoredResume ?? mockAnalysisResult.tailoredResume) as TailoredResume,
      gaps: gapsValue,
    };
    sessionStorage.setItem("exportData", JSON.stringify(data));
  }, [analysisData, tailoringData]);

  // Loading state with skeletons
  if (analyzing) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <ProgressSteps currentStep="analysis" />
            <div className="text-center mb-8">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <h2 className="mt-4 text-xl font-semibold">Analyzing your resume...</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Our AI is parsing your resume and job description to find the best match.
              </p>
            </div>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <JDSummaryCardSkeleton />
              <div className="grid gap-6 md:grid-cols-2">
                <ScoreCardSkeleton />
              </div>
              <GapAnalysisSkeleton />
            </div>
          </div>
        </main>
      </>
    );
  }

  // Error state — fall back to mock data
  if (analysisError) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Analysis Failed</AlertTitle>
              <AlertDescription>
                {analysisError}. Showing sample data instead.
              </AlertDescription>
            </Alert>

            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </main>
      </>
    );
  }

  // Use API data if available, otherwise mock data
  const resume = (analysisData?.resume ?? mockAnalysisResult.resume) as ResumeProfile;
  const jd = (analysisData?.jd ?? mockAnalysisResult.jd) as JobDescriptionProfile;
  const originalScore = (analysisData?.originalScore ?? mockAnalysisResult.originalScore) as MatchScore;
  const tailoredScore = (tailoringData?.tailoredScore ?? mockAnalysisResult.tailoredScore) as MatchScore;
  const gaps = (analysisData?.originalGaps ?? mockAnalysisResult.gaps) as GapAnalysisType;
  const tailoredResume = (tailoringData?.tailoredResume ?? mockAnalysisResult.tailoredResume) as TailoredResume;
  const warnings: string[] = analysisData?.warnings ?? [];

  // Show mock data if no inputs were provided (direct navigation or SSR)
  if (!hasStorageInput) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-8">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Sample Data</AlertTitle>
              <AlertDescription>
                No resume or job description provided. Showing sample analysis.
              </AlertDescription>
            </Alert>

            {/* JD Summary */}
            <JDSummaryCard jd={jd} />

            {/* Score Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              <ScoreCard original={originalScore} />
              {hasTailored && (
                <ScoreCard original={originalScore} tailored={tailoredScore} />
              )}
            </div>

            {/* Gap Analysis */}
            <GapAnalysis gaps={gaps} />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              {!hasTailored && (
                <TailorButton onClick={handleTailor} loading={tailoring} />
              )}
            </div>

            {/* Side-by-Side Comparison */}
            {hasTailored && (
              <>
                <Separator />
                <SideBySideDiff original={resume} tailored={tailoredResume} />
              </>
            )}

            {/* Export Section */}
            {hasTailored && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Export</h2>
                  <ExportButton />
                </div>
              </>
            )}
          </div>
        </main>
      </>
    );
  }

  // Tailoring loading state with skeletons
  if (tailoring && !hasTailored) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <ProgressSteps currentStep="tailor" />
            <div className="text-center mb-8">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <h2 className="mt-4 text-xl font-semibold">Tailoring your resume...</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Rewriting your experience to better match the job description.
              </p>
            </div>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SideBySideDiffSkeleton />
            </div>
          </div>
        </main>
      </>
    );
  }

  // Tailoring error
  if (tailoringError && hasTailored) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Tailoring Failed</AlertTitle>
              <AlertDescription>
                {tailoringError}. Showing original analysis instead.
              </AlertDescription>
            </Alert>

            <JDSummaryCard jd={jd} />
            <div className="grid gap-6 md:grid-cols-2">
              <ScoreCard original={originalScore} />
            </div>
            <GapAnalysis gaps={gaps} />

            <Button variant="outline" onClick={handleTailor} className="gap-2">
              Retry Tailoring
            </Button>
          </div>
        </main>
      </>
    );
  }

  // Live results view
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProgressSteps currentStep={hasTailored ? "tailor" : "analysis"} />
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Analysis Results</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review how your resume matches the job description and tailor it for a better fit.
              </p>
            </div>
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warnings</AlertTitle>
              <AlertDescription>
                <ul className="list-inside list-disc">
                  {warnings.map((w: string, i: number) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* JD Summary */}
          <JDSummaryCard jd={jd} />

          {/* Score Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <ScoreCard original={originalScore} />
            {hasTailored && (
              <ScoreCard original={originalScore} tailored={tailoredScore} />
            )}
          </div>

          {/* Gap Analysis */}
          <GapAnalysis gaps={gaps} />

          {/* Tailor Button */}
          {!hasTailored && (
            <TailorButton
              onClick={handleTailor}
              loading={tailoring}
            />
          )}

          {/* Side-by-Side Comparison */}
          {hasTailored && (
            <>
              <Separator />
              <SideBySideDiff
                original={resume}
                tailored={tailoredResume}
              />
            </>
          )}

          {/* Export Section */}
          {hasTailored && (
            <>
              <Separator />
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Export</h2>
                <ExportButton />
              </div>
            </>
          )}

          {/* Disclaimers */}
          <Separator />
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground space-y-2">
            <h2 className="text-base font-semibold text-foreground">Important Disclaimers</h2>
            <p><strong className="text-foreground">1. Truthfulness:</strong> AI-suggested changes preserve your actual experience. <strong className="text-destructive">Do not include skills you do not have.</strong></p>
            <p><strong className="text-foreground">2. No ATS Guarantee:</strong> This tool optimizes for common ATS patterns but cannot guarantee performance with any specific system.</p>
            <p><strong className="text-foreground">3. AI Content:</strong> You are solely responsible for reviewing and verifying all changes before submission.</p>
            <p><strong className="text-foreground">4. Low-Confidence Items:</strong> Changes flagged with risk warnings require extra verification.</p>
          </div>
        </div>
      </main>
    </>
  );
}
