"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft, Download, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import ProgressSteps from "@/components/ProgressSteps";
import { Separator } from "@/components/ui/separator";
import { generateClientPdf, type ClientPdfInput } from "@/lib/pdf/client-pdf";
import type { ResumeProfile, JobDescriptionProfile, MatchScore, TailoredResume, GapAnalysis } from "@/types";

export default function ExportPage() {
  const router = useRouter();
  const [loadingTailored, setLoadingTailored] = useState(false);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedAccuracy, setConfirmedAccuracy] = useState(false);
  const [confirmedNoGuarantee, setConfirmedNoGuarantee] = useState(false);
  const [confirmedLowConfidence, setConfirmedLowConfidence] = useState(false);

  const allConfirmed = confirmedAccuracy && confirmedNoGuarantee && confirmedLowConfidence;

  const [data, setData] = useState<{
    resume: ResumeProfile;
    jd: JobDescriptionProfile;
    originalScore: MatchScore;
    tailoredScore: MatchScore;
    tailoredResume: TailoredResume;
    gaps: GapAnalysis;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem("exportData") : null;
      if (raw) {
        setData(JSON.parse(raw));
      }
    } catch {
      setError("Failed to load export data. Please go back and try again.");
    }
  }, []);

  const handleDownload = useCallback(async (type: "tailored" | "comparison") => {
    if (!data) return;
    const setLoading = type === "tailored" ? setLoadingTailored : setLoadingComparison;
    setError(null);
    setLoading(true);

    try {
      const input: ClientPdfInput = { ...data, type };
      await generateClientPdf(input);
    } catch (err) {
      const message = err instanceof Error ? err.message : "PDF generation failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [data]);

  const handleBack = useCallback(() => {
    router.push("/dashboard/results");
  }, [router]);

  if (!data) {
    return (
      <>
        <Header />
        <main className="mx-auto flex max-w-7xl items-center justify-center px-4 py-24">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <h2 className="mt-6 text-xl font-semibold">Loading export data...</h2>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8">
          <ProgressSteps currentStep="export" />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Export PDF</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Download your tailored resume or the full comparison report.
              </p>
            </div>
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Export Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Review Required</AlertTitle>
            <AlertDescription className="space-y-4">
              <p className="text-sm">
                Before exporting, please review and confirm the following:
              </p>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={confirmedAccuracy}
                  onChange={(e) => setConfirmedAccuracy(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300"
                />
                <span>
                  <strong>I have reviewed all changes</strong> and confirm they accurately reflect my skills, experience, and qualifications.
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={confirmedNoGuarantee}
                  onChange={(e) => setConfirmedNoGuarantee(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300"
                />
                <span>
                  <strong>I understand this tool does not guarantee</strong> ATS performance, interview calls, or job offers.
                </span>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={confirmedLowConfidence}
                  onChange={(e) => setConfirmedLowConfidence(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300"
                />
                <span>
                  <strong>I will verify all low-confidence changes</strong> and risk-flagged items before submitting.
                </span>
              </label>
            </AlertDescription>
          </Alert>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border p-6">
              <FileText className="mb-3 h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">Tailored Resume</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                A clean, ATS-friendly single-column PDF of your tailored resume.
              </p>
              <Button
                size="lg"
                onClick={() => handleDownload("tailored")}
                disabled={!allConfirmed || loadingTailored}
                className="mt-4 w-full gap-2"
              >
                {loadingTailored ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {loadingTailored ? "Generating..." : "Download Tailored Resume"}
              </Button>
            </div>

            <div className="rounded-lg border p-6">
              <FileText className="mb-3 h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">Comparison Report</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Full side-by-side report with scores, JD summary, gap analysis, original vs tailored comparison, and disclaimers.
              </p>
              <Button
                size="lg"
                onClick={() => handleDownload("comparison")}
                disabled={!allConfirmed || loadingComparison}
                className="mt-4 w-full gap-2"
              >
                {loadingComparison ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {loadingComparison ? "Generating..." : "Download Comparison Report"}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Important Disclaimers</h2>
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              <p className="mb-2"><strong className="text-foreground">1. Truthfulness:</strong> AI suggestions preserve your actual experience. <strong className="text-destructive">Do not include skills you do not have.</strong></p>
              <p className="mb-2"><strong className="text-foreground">2. No ATS Guarantee:</strong> This tool optimizes for common ATS patterns but cannot guarantee performance with any specific system.</p>
              <p className="mb-2"><strong className="text-foreground">3. AI Content:</strong> You are responsible for reviewing and verifying all changes before submission.</p>
              <p><strong className="text-foreground">4. Low-Confidence:</strong> Risk-flagged items require extra verification.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
