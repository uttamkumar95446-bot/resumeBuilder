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

  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "210mm";
  container.style.zIndex = "-1";
  container.style.background = "#ffffff";
  document.body.appendChild(container);

  try {
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 300));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: container.scrollWidth,
      height: container.scrollHeight,
      windowWidth: container.scrollWidth,
      windowHeight: container.scrollHeight,
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 15;
    const contentWidth = pdfWidth - margin * 2;
    const contentHeight = pdfHeight - margin * 2;

    const pxPerMm = canvas.width / (container.scrollWidth || 210);
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
    document.body.removeChild(container);
  }
}
