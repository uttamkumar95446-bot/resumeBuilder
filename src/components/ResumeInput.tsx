"use client";

import { forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/FileUpload";

interface ResumeInputProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}

const ResumeInput = forwardRef<HTMLTextAreaElement, ResumeInputProps>(
  function ResumeInput({ value, onChange, error }, ref) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="resume-input" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Your Resume
        </label>
        <span className="text-xs text-muted-foreground">
          {value.length > 0 ? `${value.length} characters` : ""}
        </span>
      </div>
      <Textarea
        ref={ref}
        id="resume-input"
        placeholder="Paste your resume text here... (PDF/DOCX upload coming soon)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[250px] sm:min-h-[300px] resize-y"
      />
      <div className="flex items-center gap-3">
        <FileUpload onFileContent={onChange} />
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

export default ResumeInput;
