import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { generateTailoredResumeHtml } from "./tailored-resume-template";
import { generateComparisonHtml } from "./comparison-template";
import type { ResumeProfile, JobDescriptionProfile, MatchScore, TailoredResume, GapAnalysis } from "@/types";

export interface ClientPdfInput {
  type: "tailored" | "comparison";
  resume: ResumeProfile;
  jd: JobDescriptionProfile;
  originalScore: MatchScore;
  tailoredScore: MatchScore;
  tailoredResume: TailoredResume;
  gaps: GapAnalysis;
}

export async function generateClientPdf(input: ClientPdfInput): Promise<void> {
  const html =
    input.type === "tailored"
      ? generateTailoredResumeHtml(input.tailoredResume)
      : generateComparisonHtml(
          input.resume,
          input.jd,
          input.originalScore,
          input.tailoredScore,
          input.tailoredResume,
          input.gaps,
        );

  // Use a hidden iframe to isolate the template HTML from the page's CSS.
  // This prevents html2canvas from encountering modern CSS color functions
  // (lab(), oklch(), etc.) used by Tailwind v4 / shadcn / base-ui that it
  // cannot parse.
  const iframe = document.createElement("iframe");
  iframe.style.position = "absolute";
  iframe.style.left = "-9999px";
  iframe.style.top = "0";
  iframe.style.width = "210mm";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.zIndex = "-1";
  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument!;
    iframeDoc.open();
    // The template functions already return a complete <!DOCTYPE html> document,
    // so we can write it directly into the iframe.
    iframeDoc.write(html);
    iframeDoc.close();

    // Wait for iframe to fully load, then fonts, before capturing
    if (iframeDoc.readyState !== "complete") {
      await new Promise((resolve) => { iframe.onload = resolve; });
    }
    await iframeDoc.fonts.ready;

    const body = iframeDoc.body;

    // Set body to match A4 dimensions exactly. 15mm padding gives margins equivalent
    // to what the PDF renderer used, keeping content in a 180mm-wide area.
    body.style.margin = "0";
    body.style.padding = "15mm";
    body.style.width = "210mm";
    body.style.minHeight = "297mm";
    body.style.boxSizing = "border-box";
    body.style.background = "#ffffff";

    const canvas = await html2canvas(body, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: body.scrollWidth,
      height: body.scrollHeight,
      windowWidth: body.scrollWidth,
      windowHeight: body.scrollHeight,
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = 297;

    // pxPerMm: since body is exactly 210mm wide (same as A4), the ratio is direct.
    // Fallback 210mm = 794px at 96dpi in case scrollWidth is 0 (shouldn't happen).
    const pxPerMm = canvas.width / (body.scrollWidth || 794);
    const totalHeightMm = canvas.height / pxPerMm;
    const pageCount = Math.max(1, Math.ceil(totalHeightMm / pdfHeight));

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) pdf.addPage();

      const sourceY = page * pdfHeight * pxPerMm;
      const sliceHeight = Math.min(canvas.height - sourceY, pdfHeight * pxPerMm);

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      const ctx = pageCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          canvas,
          0, sourceY, canvas.width, sliceHeight,
          0, 0, canvas.width, sliceHeight,
        );
      }

      const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.95);
      // Place at (0,0) filling the full A4 page — the 15mm padding in the body
      // already provides the margins, so no extra padding needed.
      pdf.addImage(pageImgData, "JPEG", 0, 0, pdfWidth, (sliceHeight / pxPerMm));
    }

    const filename =
      input.type === "tailored" ? "tailored-resume.pdf" : "resume-comparison.pdf";
    pdf.save(filename);
  } finally {
    document.body.removeChild(iframe);
  }
}
