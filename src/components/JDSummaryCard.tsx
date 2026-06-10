"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { JobDescriptionProfile } from "@/types";

interface JDSummaryCardProps {
  jd?: JobDescriptionProfile;
}

const JDSummaryCard = memo(function JDSummaryCard({ jd }: JDSummaryCardProps) {
  if (!jd) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Description Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Paste a job description and click &quot;Analyze Match&quot; to see the summary.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{jd.jobTitle}</CardTitle>
            {jd.company && (
              <p className="text-sm text-muted-foreground">{jd.company}</p>
            )}
          </div>
          {jd.seniorityLevel && (
            <Badge variant="default" className="shrink-0">
              {jd.seniorityLevel.charAt(0).toUpperCase() + jd.seniorityLevel.slice(1)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Required Skills */}
        {jd.requiredSkills.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium">Required Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {jd.requiredSkills.map((skill, i) => (
                <Badge key={i} variant="default">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Preferred Skills */}
        {jd.preferredSkills.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium">Preferred Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {jd.preferredSkills.map((skill, i) => (
                <Badge key={i} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Responsibilities */}
        {jd.responsibilities.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium">Responsibilities</h4>
            <ul className="list-inside list-disc space-y-1">
              {jd.responsibilities.map((resp, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {resp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Qualifications */}
        {jd.qualifications.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium">Qualifications</h4>
            <ul className="list-inside list-disc space-y-1">
              {jd.qualifications.map((qual, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {qual}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tools */}
        {jd.tools.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium">Tools &amp; Technologies</h4>
            <div className="flex flex-wrap gap-1.5">
              {jd.tools.map((tool, i) => (
                <Badge key={i} variant="outline">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default JDSummaryCard;
