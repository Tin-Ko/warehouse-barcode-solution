import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface PdfGeneratorProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  items: any[]; // Array of CanvasItem objects
  canvasSize: { width: number; height: number };
  onGenerateStart?: () => void;
  onGenerateEnd?: () => void;
}

// Constants for PDF generation
const PIXELS_PER_INCH = 96;
const PDF_DPI = 72;

export const generatePDF = async ({
  canvasRef,
  items,
  canvasSize,
  onGenerateStart,
  onGenerateEnd,
}: PdfGeneratorProps) => {
  if (!canvasRef.current) return;

  try {
    onGenerateStart?.();

    // Find Excel items (assumed to be items with a "values" property)
    const excelItems = items.filter(
      (item) => item.values && item.values.length > 0
    );
    const maxPages =
      excelItems.length > 0
        ? Math.max(...excelItems.map((item) => item.values?.length || 0))
        : 1;

    // Convert canvas size from pixels to PDF points (72 DPI)
    const pdfWidth = (canvasSize.width / PIXELS_PER_INCH) * PDF_DPI;
    const pdfHeight = (canvasSize.height / PIXELS_PER_INCH) * PDF_DPI;

    // Initialize PDF with the correct page size
    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
      unit: "pt",
      format: [pdfWidth, pdfHeight],
    });

    // Generate each page
    for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage([pdfWidth, pdfHeight]);
      }

      // Clone the canvas for this page
      const tempCanvas = canvasRef.current.cloneNode(true) as HTMLDivElement;
      document.body.appendChild(tempCanvas);

      // Update Excel items with the correct values for this page
      const itemElements = tempCanvas.getElementsByClassName("canvas-item");
      Array.from(itemElements).forEach((element) => {
        const itemId = element.getAttribute("data-item-id");
        // Find the corresponding excel item (if any)
        const excelItem = excelItems.find((item) => item.id === itemId);
        if (excelItem && excelItem.values) {
          const valueElement = element.querySelector(".item-value");
          if (valueElement) {
            // Update the text content to the value for the current page
            valueElement.textContent = excelItem.values[pageIndex];
          }
        }
      });

      // Render the temporary canvas to an image
      const canvas = await html2canvas(tempCanvas, {
        scale: PDF_DPI / PIXELS_PER_INCH,
        useCORS: true,
        logging: false,
        backgroundColor: null,
      });
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Clean up the temporary node
      document.body.removeChild(tempCanvas);
    }

    // Save the PDF
    pdf.save("labels.pdf");
    onGenerateEnd?.();
  } catch (error) {
    console.error("Error generating PDF:", error);
    onGenerateEnd?.();
  }
};
