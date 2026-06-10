"use client";

import { useState, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BulletItem from "@/components/BulletItem";
import type { ResumeProfile, TailoredResume } from "@/types";

interface SideBySideDiffProps {
  original?: ResumeProfile;
  tailored?: TailoredResume;
}

type SectionTab = "summary" | "skills" | "experience";

const SideBySideDiff = memo(function SideBySideDiff({ original, tailored }: SideBySideDiffProps) {
  const [activeTab, setActiveTab] = useState<SectionTab>("experience");

  if (!original) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Side-by-Side Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click &quot;Analyze Match&quot; and then generate a tailored resume to see the comparison.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Side-by-Side Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SectionTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md bg-muted/50 p-4">
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">Original</h4>
                <p className="text-sm">{original.summary || "No summary provided"}</p>
              </div>
              <div className="rounded-md bg-green-50 p-4 dark:bg-green-950/20">
                <h4 className="mb-2 text-sm font-medium text-green-700 dark:text-green-400">
                  Tailored
                </h4>
                <p className="text-sm">
                  {tailored?.tailoredSummary || "Generate tailored resume to see the rewritten summary"}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md bg-muted/50 p-4">
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">Original</h4>
                <div className="flex flex-wrap gap-1.5">
                  {original.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-md bg-green-50 p-4 dark:bg-green-950/20">
                <h4 className="mb-2 text-sm font-medium text-green-700 dark:text-green-400">
                  Tailored
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(tailored?.tailoredSkills || original.skills).map((skill, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                        !original.skills.includes(skill) && tailored
                          ? "bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience" className="mt-4 space-y-6">
            {!tailored ? (
              <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Click &quot;Generate Tailored Resume&quot; to see bullet-level rewrites.
                </p>
              </div>
            ) : (
              tailored.tailoredExperience.map((exp, companyIdx) => (
                <div key={companyIdx}>
                  <h4 className="mb-3 text-sm font-semibold">
                    {exp.company} — {exp.title}
                  </h4>
                  <div className="space-y-3">
                    {exp.bullets.map((bullet, bulletIdx) => (
                      <BulletItem
                        key={bulletIdx}
                        bullet={bullet}
                        index={bulletIdx}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

export default SideBySideDiff;
