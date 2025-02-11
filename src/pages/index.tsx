import React, { useState, useRef } from "react";
import ObjectList, { CanvasObject } from "../components/ObjectList";
import ResizableCanvas from "../components/ResizableCanvas";
import FileUploader from "../components/FileUploader";
import ImageUploader from "../components/ImageUploader";
import { generatePDF } from "@/components/GeneratePDF";
import html2canvas from "html2canvas";
import { CanvasItem } from "@/types/ResizableCanvasTypes";

export default function Home() {
  // State for custom objects (from ObjectList)
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  // State for processed Excel data (each column with an array of values)
  const [excelData, setExcelData] = useState<any[]>([]);
  // State for image URLs from the ImageUploader
  const [images, setImages] = useState<string[]>([]);
  // State for preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Create a dedicated ref for the canvas preview container
  const canvasPreviewRef = useRef<HTMLDivElement>(null);

  // Generate canvas items based on objects and images.
  // For objects with Excel data, use the first value for preview.
  const generateCanvasItems = (): CanvasItem[] => {
    const items: CanvasItem[] = [];
    objects.forEach((obj, index) => {
      const baseX = 50 + index * 20;
      const baseY = 50 + index * 20;
      const content =
        obj.values && obj.values.length > 0 ? obj.values[0] : obj.value;
      if (obj.options.qr) {
        items.push({
          id: obj.id + "-qr",
          type: "qrcode",
          content,
          x: baseX,
          y: baseY,
          width: 100,
          height: 100,
          values: obj.values,
        });
      }
      if (obj.options.barcode) {
        items.push({
          id: obj.id + "-barcode",
          type: "barcode",
          content,
          x: baseX + 120,
          y: baseY,
          width: 150,
          height: 60,
          values: obj.values,
        });
      }
      if (obj.options.text) {
        items.push({
          id: obj.id + "-text",
          type: "text",
          content,
          x: baseX,
          y: baseY + 120,
          width: 200,
          height: 50,
          values: obj.values,
        });
      }
    });
    images.forEach((img, idx) => {
      items.push({
        id: "img-" + idx,
        type: "image",
        content: img,
        x: 300 + idx * 10,
        y: 300 + idx * 10,
        width: 200,
        height: 200,
      });
    });
    return items;
  };

  const canvasItems = generateCanvasItems();

  // Remove an item—if it's an image remove it from images,
  // otherwise remove the corresponding object (all its representations).
  const removeItem = (id: string) => {
    if (id.startsWith("img-")) {
      const idx = parseInt(id.split("-")[1], 10);
      setImages((prev) => prev.filter((_, index) => index !== idx));
    } else {
      const objectId = id.split("-")[0];
      setObjects((prev) => prev.filter((obj) => obj.id !== objectId));
    }
  };

  // Compute the label count from the Excel data.
  // (For each imported Excel column, the count is the maximum number of rows.)
  const labelCount = objects.reduce(
    (max, obj) => Math.max(max, obj.values ? obj.values.length : 1),
    1
  );

  // Function to generate a preview image from the canvas preview container.
  const generatePreview = async () => {
    if (canvasPreviewRef.current) {
      const canvas = await html2canvas(canvasPreviewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const imgData = canvas.toDataURL("image/png");
      setPreviewImage(imgData);
    }
  };

  // Handle print by using the canvas preview container.
  const handlePrint = async () => {
    if (canvasPreviewRef.current) {
      const rect = canvasPreviewRef.current.getBoundingClientRect();
      const canvasSize = { width: rect.width, height: rect.height };
      await generatePDF({
        canvasRef: canvasPreviewRef,
        items: canvasItems,
        canvasSize,
      });
    }
  };

  return (
    <div className="min-h-screen bg-darkBg text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        📦 Barcode Generator
      </h1>

      {/* Object List for custom objects */}
      <ObjectList objects={objects} setObjects={setObjects} />

      {/* Excel File Uploader */}
      <FileUploader
        onDataProcessed={(data) => {
          console.log("Processed Excel Data:", data);
          // Map each processed column to a CanvasObject
          const excelObjects: CanvasObject[] = data.map((col) => ({
            id: `excel-${col.columnName}`,
            value: col.columnName, // You could use the header or any identifier here
            custom: false, // This marks it as an Excel-based object
            options: {
              // For example, default these options to true or false
              // Or use col.type to decide which one to default as checked:
              qr: col.type === "qrcode",
              barcode: col.type === "barcode",
              text: col.type === "text",
            },
            values: col.values, // Excel values are kept for further processing/printing
          }));

          // Update the object list by merging in the Excel objects
          setObjects((prev) => [...prev, ...excelObjects]);
        }}
      />

      {/* Image Uploader */}
      <ImageUploader onImagesUploaded={(imgs) => setImages(imgs)} />

      {/* Canvas Container with separate preview ref (excludes the size selector) */}
      <div className="mt-6">
        <ResizableCanvas
          items={canvasItems}
          removeItem={removeItem}
          previewRef={canvasPreviewRef}
        />
      </div>

      {/* Label Count and Preview/Print Buttons */}
      <div className="mt-4 text-center">
        <p className="mb-2">Labels to print: {labelCount}</p>
        <button
          onClick={async () => {
            await generatePreview();
            setShowPreview(true);
          }}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition mr-2"
        >
          Preview Labels
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition"
        >
          Print Labels
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Preview</h2>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[80vh]"
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition mr-2"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition"
              >
                Confirm & Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
