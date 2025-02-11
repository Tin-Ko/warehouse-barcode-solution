import React, { useState, useEffect } from "react";
import ObjectList, { CanvasObject } from "@/components/ObjectList";
import ResizableCanvas, { CanvasItem } from "@/components/ResizableCanvas";
import FileUploader from "@/components/FileUploader";
import ImageUploader from "@/components/ImageUploader";

export default function Home() {
  const [objectList, setObjectList] = useState<CanvasObject[]>([]);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [excelLabelCount, setExcelLabelCount] = useState<number>(0);

  // When the object list changes, update the canvas items based on each object's selected options.
  useEffect(() => {
    const newItems: CanvasItem[] = [];
    objectList.forEach((obj) => {
      // For each option checked, add a corresponding canvas item with default position/size.
      if (obj.options.qr) {
        newItems.push({
          id: `${obj.id}-qr`,
          type: "qrcode",
          content: obj.value,
          x: 50,
          y: 50,
          width: 100,
          height: 100,
        });
      }
      if (obj.options.barcode) {
        newItems.push({
          id: `${obj.id}-barcode`,
          type: "barcode",
          content: obj.value,
          x: 100,
          y: 100,
          width: 150,
          height: 60,
        });
      }
      if (obj.options.text) {
        newItems.push({
          id: `${obj.id}-text`,
          type: "text",
          content: obj.value,
          x: 150,
          y: 150,
          width: 200,
          height: 50,
        });
      }
    });
    // Keep existing image items (whose id starts with "img-")
    const imageItems = canvasItems.filter((item) => item.type === "image");
    setCanvasItems([...newItems, ...imageItems]);
  }, [objectList]);

  // Handler for Excel file uploader – processes rows into Excel variable objects.
  const handleExcelData = (
    data: { id: string; type: "barcode" | "qrcode" | "text"; content: string }[]
  ) => {
    const excelObjects = data.map((item) => ({
      id: `excel-${item.id}`,
      value: item.content,
      custom: false,
      options: {
        qr: item.type === "qrcode",
        barcode: item.type === "barcode",
        text: item.type === "text",
      },
    }));
    setObjectList((prev) => [...prev, ...excelObjects]);
    // Set the label count based on the number of rows in the Excel file.
    setExcelLabelCount(data.length);
  };

  // Handler for images.
  const handleImages = (images: string[]) => {
    const imageItems: CanvasItem[] = images.map((img, index) => ({
      id: `img-${index}-${Date.now()}`,
      type: "image",
      content: img,
      x: 50,
      y: 50,
      width: 150,
      height: 150,
    }));
    setCanvasItems((prev) => [...prev, ...imageItems]);
  };

  // Remove a canvas item.
  const removeCanvasItem = (id: string) => {
    setCanvasItems((prev) => prev.filter((item) => item.id !== id));
    // Optionally, update objectList if removal should affect checkbox state.
  };

  // Print handler – here we simply trigger window.print()
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-darkBg text-white p-6">
      <h1 className="text-3xl font-bold mb-6">📦 Barcode Generator</h1>

      {/* Main container */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Flex container left side */}
        <div>
          {/* Object List */}
          <ObjectList objects={objectList} setObjects={setObjectList} />

          {/* Image Uploader */}
          <ImageUploader onImagesUploaded={handleImages} />

          {/* Excel File Uploader */}
          <FileUploader onDataProcessed={handleExcelData} />
        </div>

        <div className="flex flex-col mr-4">
          {/* Canvas */}
          <ResizableCanvas items={canvasItems} removeItem={removeCanvasItem} />

          {/* Label Count and Print Button */}
          <div className="mt-4 flex items-center justify-between max-w-4xl mx-auto">
            <div>
              <p className="text-lg">
                {excelLabelCount > 0
                  ? `Printing ${excelLabelCount} label${
                      excelLabelCount > 1 ? "s" : ""
                    }`
                  : "Printing 1 label"}
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition"
            >
              Print Labels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
