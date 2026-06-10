"use client";

import { memo } from "react";
import ScoreGauge from "@/components/ScoreGauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MatchScore } from "@/types";

interface ScoreCardProps {
  original?: MatchScore;
  tailored?: MatchScore;
}

const ScoreCard = memo(function ScoreCard({ original, tailored }: ScoreCardProps) {
  if (!original) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Match Score</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click &quot;Analyze Match&quot; to see your resume score.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Match Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center gap-8">
          <ScoreGauge score={original.overallScore} label="Original" />
          {tailored && (
            <>
              <div className="text-2xl text-muted-foreground">→</div>
              <ScoreGauge score={tailored.overallScore} label="Tailored" />
            </>
          )}
        </div>

        {original.explanation && (
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {tailored ? tailored.explanation : original.explanation}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Score Breakdown</h4>
          <div className="grid gap-2 sm:grid-cols-2">
            <ScoreBar
              label="Skill Coverage"
              score={tailored ? tailored.skillCoverageScore : original.skillCoverageScore}
              originalScore={original.skillCoverageScore}
            />
            <ScoreBar
              label="Responsibility Alignment"
              score={tailored ? tailored.responsibilityAlignmentScore : original.responsibilityAlignmentScore}
              originalScore={original.responsibilityAlignmentScore}
            />
            <ScoreBar
              label="Keyword Alignment"
              score={tailored ? tailored.keywordScore : original.keywordScore}
              originalScore={original.keywordScore}
            />
            <ScoreBar
              label="Seniority Alignment"
              score={tailored ? tailored.seniorityScore : original.seniorityScore}
              originalScore={original.seniorityScore}
            />
          </div>
        </div>

        {original.criticalMissingRequirements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-destructive">
              Critical Missing Requirements
            </h4>
            <ul className="list-inside list-disc space-y-1">
              {original.criticalMissingRequirements.map((req, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default ScoreCard;

const ScoreBar = memo(function ScoreBar({
  label,
  score,
  originalScore,
}: {
  label: string;
  score: number;
  originalScore: number;
}) {
  const color =
    score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(score)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {score !== originalScore && (
        <p className="text-[10px] text-muted-foreground">
          Was {Math.round(originalScore)}%
        </p>
      )}
    </div>
  );
});
