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

    // Configure PDF with proper size
    const pdf = new jsPDF({
      orientation:
        canvasSize.width > canvasSize.height ? "landscape" : "portrait",
      unit: "mm",
      format: [
        (canvasSize.width / 96) * 25.4, // Convert pixels to mm
        (canvasSize.height / 96) * 25.4,
      ],
    });

    // Find Excel-based items to determine page count
    const excelItems = items.filter((item) => item.values?.length);
    const maxPages = excelItems.length
      ? Math.max(...excelItems.map((item) => item.values!.length))
      : 1;

    for (let page = 0; page < maxPages; page++) {
      if (page > 0) pdf.addPage();

      // Clone the canvas element to capture without modifying the UI
      const clone = canvasRef.current.cloneNode(true) as HTMLDivElement;
      clone.style.position = "absolute";
      clone.style.left = "-9999px"; // Hide offscreen
      document.body.appendChild(clone);

      // Update dynamic values for this page
      const updatePromises = Array.from(
        clone.querySelectorAll(".canvas-item")
      ).map(async (element) => {
        const el = element as HTMLElement;
        const itemId = el.dataset.itemId;
        const sourceItem = items.find((item) => item.id === itemId);

        if (!sourceItem?.values?.length) return;

        // Get the correct value for the current page
        const value = sourceItem.values[page] || "";
        const valueElement = el.querySelector(".item-value");
        if (!valueElement) return;

        // Update text content
        const textElement = valueElement.querySelector("div");
        if (textElement) textElement.textContent = value;

        // Handle barcode & QR code updates
        const canvas = valueElement.querySelector("canvas");
        if (!canvas) return;

        try {
          const ctx = canvas.getContext("2d");
          ctx?.clearRect(0, 0, canvas.width, canvas.height);

          if (sourceItem.type === "barcode") {
            jsbarcode(canvas, value, {
              format: "CODE128",
              lineColor: "#000",
              width: sourceItem.width / 200,
              height: sourceItem.height * 0.8,
              displayValue: true,
              fontSize: sourceItem.height * 0.15,
            });
          } else if (sourceItem.type === "qrcode") {
            await QRCode.toCanvas(canvas, value, {
              width: Math.min(sourceItem.width, sourceItem.height),
              margin: 0,
            });
          }
        } catch (error) {
          console.error("Error rendering barcode/QR:", error);
        }
      });

      await Promise.all(updatePromises);

      // Small delay to allow rendering
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Capture high-resolution screenshot
      const canvas = await html2canvas(clone, {
        scale: 5,
        useCORS: true,
        logging: debug,
        backgroundColor: "#FFFFFF",
        onclone: (clonedDoc) => {
          clonedDoc.querySelectorAll("canvas").forEach((c) => {
            c.style.imageRendering = "crisp-edges";
          });
        },
      });

      // Add image to PDF
      pdf.addImage(
        canvas.toDataURL("image/png", 1.0),
        "PNG",
        0,
        0,
        (canvasSize.width / 96) * 25.4,
        (canvasSize.height / 96) * 25.4
      );

      document.body.removeChild(clone);
    }

    pdf.save("labels.pdf");
    onGenerateEnd?.();
  } catch (error) {
    console.error("PDF Generation Error:", error);
    onGenerateEnd?.();
  }
};
