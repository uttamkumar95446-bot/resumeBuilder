"use client";

import { useState, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GapItem from "@/components/GapItem";
import type { GapAnalysis as GapAnalysisType } from "@/types";

interface GapAnalysisProps {
  gaps?: GapAnalysisType;
}

type ImportanceFilter = "all" | "high" | "medium" | "low";

const GapAnalysis = memo(function GapAnalysis({ gaps }: GapAnalysisProps) {
  const [filter, setFilter] = useState<ImportanceFilter>("all");

  if (!gaps || gaps.gaps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gap Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No gaps detected yet. Click &quot;Analyze Match&quot; to identify areas for improvement.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredGaps =
    filter === "all"
      ? gaps.gaps
      : gaps.gaps.filter((g) => g.importance === filter);

  const counts = {
    all: gaps.gaps.length,
    high: gaps.gaps.filter((g) => g.importance === "high").length,
    medium: gaps.gaps.filter((g) => g.importance === "medium").length,
    low: gaps.gaps.filter((g) => g.importance === "low").length,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Gap Analysis</CardTitle>
          <span className="text-sm text-muted-foreground">
            {gaps.gaps.length} gap{gaps.gaps.length !== 1 ? "s" : ""} found
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {(["all", "high", "medium", "low"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === level
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {level === "all"
                ? "All"
                : level.charAt(0).toUpperCase() + level.slice(1)}
              <span>({counts[level]})</span>
            </button>
          ))}
        </div>

        {/* Gap list */}
        {filteredGaps.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No {filter !== "all" ? filter : ""} importance gaps found.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredGaps.map((gap, index) => (
              <GapItem key={index} gap={gap} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default GapAnalysis;
