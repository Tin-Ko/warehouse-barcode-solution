import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import React from "react";
import jsbarcode from "jsbarcode";
import QRCode from "qrcode";

export interface CanvasItem {
  id: string;
  type: "barcode" | "qrcode" | "text" | "image";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  values?: string[];
}

interface GeneratePDFParams {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  items: CanvasItem[];
  canvasSize: { width: number; height: number };
  onGenerateStart?: () => void;
  onGenerateEnd?: () => void;
  debug?: boolean;
}

export const generatePDF = async ({
  canvasRef,
  items,
  canvasSize,
  onGenerateStart,
  onGenerateEnd,
  debug = false,
}: GeneratePDFParams): Promise<void> => {
  if (!canvasRef.current) return;

  try {
    onGenerateStart?.();

    // Configure PDF for print-quality output
    const pdf = new jsPDF({
      orientation:
        canvasSize.width > canvasSize.height ? "landscape" : "portrait",
      unit: "mm",
      format: [
        (canvasSize.width / 96) * 25.4, // Convert pixels to mm
        (canvasSize.height / 96) * 25.4,
      ],
    });

    // Get Excel-based items and determine page count
    const excelItems = items.filter((item) => item.values?.length);
    const maxPages = excelItems.length
      ? Math.max(...excelItems.map((item) => item.values!.length))
      : 1;

    for (let page = 0; page < maxPages; page++) {
      if (page > 0) pdf.addPage();

      // Clone and prepare canvas
      const clone = canvasRef.current.cloneNode(true) as HTMLDivElement;
      clone.style.position = "absolute";
      clone.style.left = "-9999px"; // Hide offscreen
      document.body.appendChild(clone);

      // Update dynamic values
      const updatePromises = Array.from(
        clone.querySelectorAll(".canvas-item")
      ).map(async (element) => {
        const el = element as HTMLElement;
        const itemId = el.dataset.itemId;
        const sourceItem = items.find((item) => item.id === itemId);

        if (!sourceItem?.values?.length) return;

        // Get value for current page
        const value = sourceItem.values[page] || "";
        const valueElement = el.querySelector(".item-value");
        if (!valueElement) return;

        // Update text content
        const textElement = valueElement.querySelector("div");
        if (textElement) textElement.textContent = value;

        // Handle canvas elements
        const canvas = valueElement.querySelector("canvas");
        if (!canvas) return;

        try {
          // Clear and redraw canvas
          const ctx = canvas.getContext("2d");
          ctx?.clearRect(0, 0, canvas.width, canvas.height);

          if (sourceItem.type === "barcode") {
            await new Promise((resolve) => {
              jsbarcode(canvas, value, {
                width: sourceItem.width,
                height: sourceItem.height,
                format: "CODE128",
              });
            });
          } else if (sourceItem.type === "qrcode") {
            await QRCode.toCanvas(canvas, value, {
              width: Math.min(sourceItem.width, sourceItem.height),
              margin: 0,
            });
          }
        } catch (error) {
          console.error("Error rendering code:", error);
        }
      });

      await Promise.all(updatePromises);

      // Add rendering delay for canvas operations
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Capture with high-resolution settings
      const canvas = await html2canvas(clone, {
        scale: 4,
        useCORS: true,
        logging: debug,
        backgroundColor: "#FFFFFF",
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll("canvas").forEach((c) => {
            c.style.imageRendering = "crisp-edges";
          });
        },
      });

      // Add to PDF with proper dimensions
      pdf.addImage(
        canvas.toDataURL("image/png", 1.0),
        "PNG",
        0,
        0,
        (canvasSize.width / 96) * 25.4,
        (canvasSize.height / 96) * 25.4
      );

      // Cleanup
      document.body.removeChild(clone);
    }

    pdf.save("labels.pdf");
    onGenerateEnd?.();
  } catch (error) {
    console.error("PDF Generation Error:", error);
    onGenerateEnd?.();
  }
};
