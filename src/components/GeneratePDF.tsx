import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface PdfGeneratorProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  items: any[]; // Array of CanvasItem objects
  canvasSize: { width: number; height: number };
  onGenerateStart?: () => void;
  onGenerateEnd?: () => void;
}

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

    // Filter items that have associated Excel values
    const excelItems = items.filter(
      (item) => item.values && item.values.length > 0
    );
    const maxPages =
      excelItems.length > 0
        ? Math.max(...excelItems.map((item) => item.values?.length || 0))
        : 1;

    // Create a PDF with pixel units and set the format to the canvas dimensions
    const pdf = new jsPDF({
      orientation:
        canvasSize.width > canvasSize.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvasSize.width, canvasSize.height],
    });

    // Loop through each page to render
    for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage([canvasSize.width, canvasSize.height]);
      }

      // Clone the original canvas element
      const tempCanvas = canvasRef.current.cloneNode(true) as HTMLDivElement;
      // Optionally, force the clone to be visible and positioned at (0,0)
      tempCanvas.style.position = "absolute";
      tempCanvas.style.top = "0";
      tempCanvas.style.left = "0";
      tempCanvas.style.zIndex = "-1000"; // place it behind other content

      document.body.appendChild(tempCanvas);

      // Update Excel item values for this page in the cloned canvas
      const itemElements = tempCanvas.getElementsByClassName("canvas-item");
      Array.from(itemElements).forEach((element) => {
        const itemId = element.getAttribute("data-item-id");
        const excelItem = excelItems.find((item) => item.id === itemId);
        if (excelItem && excelItem.values) {
          const valueElement = element.querySelector(".item-value");
          if (valueElement) {
            valueElement.textContent = excelItem.values[pageIndex];
          }
        }
      });

      // Force a reflow to ensure the updated content is rendered
      // This makes sure the browser processes all style changes
      tempCanvas.offsetHeight;

      // Wait briefly to let the DOM finish updating (adjust delay as needed)
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Capture the temporary canvas as an image using html2canvas with no scaling
      const canvasImage = await html2canvas(tempCanvas, {
        scale: 1,
        useCORS: true,
        logging: false,
        backgroundColor: null,
      });
      const imgData = canvasImage.toDataURL("image/png");

      // Add the captured image to the PDF using the canvas dimensions in pixels
      pdf.addImage(imgData, "PNG", 0, 0, canvasSize.width, canvasSize.height);

      // Clean up: remove the temporary canvas from the document
      document.body.removeChild(tempCanvas);
    }

    // Save the generated PDF
    pdf.save("labels.pdf");
    onGenerateEnd?.();
  } catch (error) {
    console.error("Error generating PDF:", error);
    onGenerateEnd?.();
  }
};
