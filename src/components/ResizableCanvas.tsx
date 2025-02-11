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
    <div className="relative w-[800px] h-[500px] bg-white border border-gray-600 rounded-lg p-4">
      {items.map((item) => (
        <DraggableResizableItem key={item.id} {...item} onRemove={removeItem} />
      ))}
    </div>
  );
}
