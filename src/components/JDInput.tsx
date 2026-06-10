"use client";

import { forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";

interface JDInputProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}

const JDInput = forwardRef<HTMLTextAreaElement, JDInputProps>(
  function JDInput({ value, onChange, error }, ref) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="jd-input" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Job Description
        </label>
        <span className="text-xs text-muted-foreground">
          {value.length > 0 ? `${value.length} characters` : ""}
        </span>
      </div>
      <Textarea
        ref={ref}
        id="jd-input"
        placeholder="Paste the job description here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[250px] sm:min-h-[300px] resize-y"
      />
      <div className="flex items-center gap-3">
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {value.length > 0 && value.length < 50 && (
        <p className="text-xs text-muted-foreground">
          {50 - value.length} more characters needed
        </p>
      )}
    </div>
  );
}
);

export default JDInput;
