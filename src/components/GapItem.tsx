"use client";

import { Badge } from "@/components/ui/badge";
import type { ResumeGap } from "@/types";

interface GapItemProps {
  gap: ResumeGap;
}

export default function GapItem({ gap }: GapItemProps) {
  const importanceColor =
    gap.importance === "high"
      ? "destructive"
      : gap.importance === "medium"
        ? "default"
        : "secondary";

  const importanceLabel =
    gap.importance === "high"
      ? "High"
      : gap.importance === "medium"
        ? "Medium"
        : "Low";

  return (
    <div className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="font-medium leading-none">{gap.name}</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">JD says:</span>{" "}
            {gap.jdEvidence}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Your resume:</span>{" "}
            {gap.resumeEvidence}
          </p>
          <div className="mt-3 rounded-md bg-muted px-3 py-2">
            <p className="text-sm">
              <span className="font-medium">Suggested action:</span>{" "}
              {gap.suggestedAction}
            </p>
          </div>
        </div>
        <Badge variant={importanceColor as "default" | "destructive" | "secondary"} className="shrink-0">
          {importanceLabel}
        </Badge>
      </div>
    </div>
  );
}
