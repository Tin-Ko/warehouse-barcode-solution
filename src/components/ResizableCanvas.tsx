import React from "react";
import DraggableResizableItem from "./DraggableResizableItem";

export interface CanvasItem {
  id: string;
  type: "barcode" | "qrcode" | "text" | "image";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ResizableCanvasProps {
  items: CanvasItem[];
  removeItem: (id: string) => void;
}

export default function ResizableCanvas({
  items,
  removeItem,
}: ResizableCanvasProps) {
  return (
    <div className="relative w-full max-w-4xl h-[500px] bg-gray-800 border border-gray-600 rounded-lg p-4 mt-6">
      {items.map((item) => (
        <DraggableResizableItem key={item.id} {...item} onRemove={removeItem} />
      ))}
    </div>
  );
}
