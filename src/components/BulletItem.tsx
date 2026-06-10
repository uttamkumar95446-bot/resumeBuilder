"use client";

import { Badge } from "@/components/ui/badge";
import type { TailoredBullet } from "@/types";

interface BulletItemProps {
  bullet: TailoredBullet;
  index: number;
}

export default function BulletItem({ bullet, index }: BulletItemProps) {
  const confidenceColor =
    bullet.confidence === "high"
      ? "default"
      : bullet.confidence === "medium"
        ? "secondary"
        : "destructive";

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          #{index + 1}
        </span>
        <Badge variant={confidenceColor as "default" | "secondary" | "destructive"}>
          {bullet.confidence} confidence
        </Badge>
        {bullet.riskFlag && (
          <Badge variant="destructive" className="ml-auto">
            ⚠ Review needed
          </Badge>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Original */}
        <div className="rounded-md bg-muted/50 p-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Original</p>
          <p className="text-sm">{bullet.original}</p>
        </div>

        {/* Tailored */}
        <div className="rounded-md bg-green-50 p-3 dark:bg-green-950/20">
          <p className="mb-1 text-xs font-medium text-green-700 dark:text-green-400">
            Tailored
          </p>
          <p className="text-sm">{bullet.tailored}</p>
        </div>
      </div>

      {bullet.changeReason && (
        <p className="mt-2 text-xs italic text-muted-foreground">
          {bullet.changeReason}
        </p>
      )}

      {bullet.keywordsAddressed.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {bullet.keywordsAddressed.map((kw, i) => (
            <Badge key={i} variant="outline" className="text-[10px]">
              {kw}
            </Badge>
          ))}
        </div>
      )}

      {bullet.riskFlag && (
        <div className="mt-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2">
          <p className="text-xs text-destructive">{bullet.riskFlag}</p>
          <p className="mt-1 text-[10px] text-destructive/70">
            ⚠ Please verify this change before submitting.
          </p>
        </div>
      )}
    </div>
  );
}
