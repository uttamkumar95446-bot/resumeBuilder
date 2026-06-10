"use client";

import { Button } from "@/components/ui/button";

interface TailorButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function TailorButton({ onClick, disabled, loading }: TailorButtonProps) {
  return (
    <div className="flex justify-center">
      <Button
        size="lg"
        onClick={onClick}
        disabled={disabled || loading}
        className="min-w-[250px] text-base"
      >
        {loading ? (
          <>
            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Tailoring...
          </>
        ) : (
          "Generate Tailored Resume"
        )}
      </Button>
    </div>
  );
}
