import React, { useState, useEffect } from "react";
import DraggableResizableItem from "./DraggableResizableItem";

export interface CanvasItem {
  id: string;
  type: "barcode" | "qrcode" | "text" | "image";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isExcelItem?: boolean;
  values?: string[];
}

interface ResizableCanvasProps {
  items: CanvasItem[];
  removeItem: (id: string) => void;
  previewRef: React.RefObject<HTMLDivElement | null>;
}

// Standard label sizes in inches
const STANDARD_SIZES = [
  { name: "3 x 2", width: 3, height: 2 },
  { name: "4 x 6", width: 4, height: 6 },
  { name: "8.5 x 11", width: 8.5, height: 11 },
  { name: "Custom", width: 0, height: 0 },
];

// Convert inches to pixels (assuming 96 DPI)
const inchesToPixels = (inches: number) => Math.round(inches * 96);
const pixelsToInches = (pixels: number) =>
  Math.round((pixels / 96) * 100) / 100;

export default function ResizableCanvas({
  items,
  removeItem,
  previewRef,
}: ResizableCanvasProps) {
  const [selectedSize, setSelectedSize] = useState(STANDARD_SIZES[0].name);
  const [customWidth, setCustomWidth] = useState("3");
  const [customHeight, setCustomHeight] = useState("2");
  const [canvasSize, setCanvasSize] = useState({
    width: inchesToPixels(STANDARD_SIZES[0].width),
    height: inchesToPixels(STANDARD_SIZES[0].height),
  });

  // Handle size selection change
  const handleSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = event.target.value;
    setSelectedSize(newSize);

    if (newSize !== "Custom") {
      const size = STANDARD_SIZES.find((s) => s.name === newSize);
      if (size) {
        setCanvasSize({
          width: inchesToPixels(size.width),
          height: inchesToPixels(size.height),
        });
      }
    }
  };

  // Handle custom size input
  const handleCustomSizeChange = () => {
    const width = parseFloat(customWidth);
    const height = parseFloat(customHeight);

    if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
      setCanvasSize({
        width: inchesToPixels(width),
        height: inchesToPixels(height),
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Label Size Selector */}
      <div className="flex items-center gap-4 bg-gray-100 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <label htmlFor="labelSize" className="text-gray-700 font-medium">
            Label Size:
          </label>
          <select
            id="labelSize"
            value={selectedSize}
            onChange={handleSizeChange}
            className="border rounded px-2 py-1 text-gray-700"
          >
            {STANDARD_SIZES.map((size) => (
              <option key={size.name} value={size.name}>
                {size.name} in
              </option>
            ))}
          </select>
        </div>

        {selectedSize === "Custom" && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(e.target.value)}
              className="border rounded w-20 px-2 py-1 text-gray-700"
              min="0.5"
              step="0.5"
              placeholder="Width"
            />
            <span className="text-gray-700">×</span>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(e.target.value)}
              className="border rounded w-20 px-2 py-1 text-gray-700"
              min="0.5"
              step="0.5"
              placeholder="Height"
            />
            <span className="text-gray-700">inches</span>
            <button
              onClick={handleCustomSizeChange}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Apply
            </button>
          </div>
        )}

        <div className="text-gray-500 text-sm">
          Current size: {pixelsToInches(canvasSize.width)} ×{" "}
          {pixelsToInches(canvasSize.height)} in
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={previewRef}
        className="relative bg-white border border-gray-300 rounded-lg mx-auto"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
        }}
      >
        {items.map((item) => (
          <DraggableResizableItem
            key={item.id}
            {...item}
            onRemove={removeItem}
          />
        ))}
      </div>
    </div>
  );
}
