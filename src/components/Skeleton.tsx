"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted ${className}`}
      aria-hidden="true"
    />
  );
}

export function ScoreCardSkeleton() {
  return (
    <div className="rounded-lg border border-border p-6 space-y-6">
      <div className="flex items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-[120px] w-[120px] rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-16 w-full rounded-lg" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GapAnalysisSkeleton() {
  return (
    <div className="rounded-lg border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-7 w-16 rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
              <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SideBySideDiffSkeleton() {
  return (
    <div className="rounded-lg border border-border p-6 space-y-4">
      <div className="grid w-full grid-cols-3 rounded-lg bg-muted p-1">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-8 rounded-md" />
        ))}
      </div>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md bg-muted/50 p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
          <div className="rounded-md bg-green-50/50 p-4 space-y-2 dark:bg-green-950/10">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-muted/50 p-3 space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
              <div className="rounded-md bg-green-50 p-3 space-y-1 dark:bg-green-950/20">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function JDSummaryCardSkeleton() {
  return (
    <div className="rounded-lg border border-border p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <div className="flex flex-wrap gap-1.5">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-md" />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  );
}
