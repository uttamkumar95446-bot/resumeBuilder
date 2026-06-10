"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  disabled?: boolean;
}

export default function ExportButton({ disabled }: ExportButtonProps) {
  const router = useRouter();

  return (
    <div className="flex justify-center">
      <Button
        size="lg"
        disabled={disabled}
        variant="default"
        onClick={() => router.push("/export")}
        className="min-w-[250px] text-base gap-2"
        title={disabled ? "Generate a tailored resume first" : "View and download PDF exports"}
      >
        <Download className="h-4 w-4" />
        Export PDF
      </Button>
    </div>
  );
}
