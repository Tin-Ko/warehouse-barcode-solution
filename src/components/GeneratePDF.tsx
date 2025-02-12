// generatePDF.tsx
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import React from "react";

// Define your canvas item type.
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

// Define the parameters for PDF generation.
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

    // Determine the maximum number of pages based on Excel items.
    const excelItems = items.filter(
      (item) => item.values && item.values.length > 0
    );
    const maxPages =
      excelItems.length > 0
        ? Math.max(...excelItems.map((item) => item.values!.length))
        : 1;

    // Create a jsPDF instance using the canvas dimensions.
    const pdf = new jsPDF({
      orientation:
        canvasSize.width > canvasSize.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvasSize.width, canvasSize.height],
    });

    // Process each page.
    for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage([canvasSize.width, canvasSize.height]);
      }

      // Clone the canvas element.
      const tempCanvas = canvasRef.current.cloneNode(true) as HTMLDivElement;

      // Apply debug styling so we can visually inspect the clone.
      if (debug) {
        tempCanvas.style.position = "fixed";
        tempCanvas.style.top = "10px";
        tempCanvas.style.left = "10px";
        tempCanvas.style.border = "2px dashed red";
        tempCanvas.style.backgroundColor = "rgba(255,255,255,0.9)";
        tempCanvas.style.zIndex = "10000";
      } else {
        tempCanvas.style.position = "absolute";
        tempCanvas.style.top = "0";
        tempCanvas.style.left = "0";
        tempCanvas.style.zIndex = "-1000";
      }

      // Append the cloned canvas to the document so it can be inspected.
      document.body.appendChild(tempCanvas);

      // Log details about the clone for debugging.
      if (debug) {
        console.log("Debug: Cloned canvas appended to DOM.");
        console.log(
          "Cloned canvas dimensions:",
          tempCanvas.getBoundingClientRect()
        );
        console.log(
          "Cloned canvas computed styles:",
          window.getComputedStyle(tempCanvas)
        );
      }

      // Update Excel-based items in the clone.
      const itemElements = tempCanvas.getElementsByClassName("canvas-item");
      Array.from(itemElements).forEach((element) => {
        const el = element as HTMLElement;
        const itemId = el.getAttribute("data-item-id");
        const excelItem = excelItems.find((item) => item.id === itemId);
        if (excelItem && excelItem.values) {
          const valueElement = el.querySelector(".item-value");
          if (valueElement) {
            valueElement.textContent = excelItem.values[pageIndex];
            if (debug) {
              console.log(
                `Debug: Updated item ${itemId} with value:`,
                excelItem.values[pageIndex]
              );
            }
          }
        }
      });

      // Force a reflow so that style changes are applied.
      tempCanvas.offsetHeight;

      // Wait briefly to allow updates to render.
      await new Promise((resolve) => setTimeout(resolve, debug ? 3000 : 100));

      // Capture the clone using html2canvas.
      const capturedCanvas = await html2canvas(tempCanvas, {
        scale: 2, // Increase scale for higher resolution.
        useCORS: true,
        backgroundColor: null,
        logging: debug,
      });
      const imgData = capturedCanvas.toDataURL("image/png");

      // Add the captured image to the PDF.
      pdf.addImage(imgData, "PNG", 0, 0, canvasSize.width, canvasSize.height);

      // Optionally leave the clone on-screen a bit longer in debug mode.
      if (debug) {
        console.log("Debug: Waiting before removing cloned canvas...");
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // Remove the temporary clone.
      document.body.removeChild(tempCanvas);
    }

    // Save the generated PDF.
    pdf.save("labels.pdf");
    onGenerateEnd?.();
  } catch (error) {
    console.error("Error generating PDF:", error);
    onGenerateEnd?.();
  }
};
