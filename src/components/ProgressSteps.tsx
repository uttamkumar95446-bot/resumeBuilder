"use client";

import { Check } from "lucide-react";

type Step = "input" | "analysis" | "tailor" | "export";

interface ProgressStepsProps {
  currentStep: Step;
}

const STEPS: { id: Step; label: string }[] = [
  { id: "input", label: "Input" },
  { id: "analysis", label: "Analysis" },
  { id: "tailor", label: "Tailor" },
  { id: "export", label: "Export" },
];

const STEP_ORDER: Step[] = ["input", "analysis", "tailor", "export"];

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const currentIdx = STEP_ORDER.indexOf(currentStep);

  return (
    <nav aria-label="Progress" className="w-full py-4">
      <ol className="flex items-center justify-center gap-0">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isLast = idx === STEPS.length - 1;

          return (
            <li key={step.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2"
                        : "bg-muted text-muted-foreground"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium leading-none ${
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mx-1 mb-5 h-0.5 w-8 sm:w-12 md:w-16 transition-colors duration-300 ${
                    idx < currentIdx ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
