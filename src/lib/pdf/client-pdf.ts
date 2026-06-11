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
    body.style.margin = "0";
    body.style.padding = "0";
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
    const margin = 15;
    const contentWidth = pdfWidth - margin * 2;
    const contentHeight = pdfHeight - margin * 2;

    const pxPerMm = canvas.width / (body.scrollWidth || 794); // 794px ≈ 210mm at 96dpi fallback
    const totalHeightMm = canvas.height / pxPerMm;
    const pageCount = Math.max(1, Math.ceil(totalHeightMm / contentHeight));

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) pdf.addPage();

      const sourceY = page * contentHeight * pxPerMm;
      const sliceHeight = Math.min(canvas.height - sourceY, contentHeight * pxPerMm);

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
      pdf.addImage(pageImgData, "JPEG", margin, margin, contentWidth, (sliceHeight / pxPerMm));
    }

    const filename =
      input.type === "tailored" ? "tailored-resume.pdf" : "resume-comparison.pdf";
    pdf.save(filename);
  } finally {
    document.body.removeChild(iframe);
  }
}
