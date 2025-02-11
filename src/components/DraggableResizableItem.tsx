import React, { useEffect, useRef, useState } from "react";
import interact from "interactjs";
import Barcode from "./Barcode";
import QRCodeComponent from "./QRCode";

interface ItemProps {
  id: string;
  type: "barcode" | "qrcode" | "text" | "image";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onRemove: (id: string) => void;
}

const DraggableResizableItem: React.FC<ItemProps> = ({
  id,
  type,
  content,
  x,
  y,
  width,
  height,
  onRemove,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width, height });

  useEffect(() => {
    if (!itemRef.current) return;

    interact(itemRef.current)
      .draggable({
        inertia: true,
        listeners: {
          move(event) {
            const target = event.target as HTMLDivElement;
            const dx = event.dx || 0;
            const dy = event.dy || 0;
            const newX =
              (parseFloat(target.getAttribute("data-x") || "0") || 0) + dx;
            const newY =
              (parseFloat(target.getAttribute("data-y") || "0") || 0) + dy;
            target.style.transform = `translate(${newX}px, ${newY}px)`;
            target.setAttribute("data-x", newX.toString());
            target.setAttribute("data-y", newY.toString());
          },
        },
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          move(event) {
            const { width, height } = event.rect;
            setSize({ width, height });
            event.target.style.width = `${width}px`;
            event.target.style.height = `${height}px`;
          },
        },
      });
  }, []);

  return (
    <div
      ref={itemRef}
      className="absolute text-gray-900 cursor-move overflow-hidden"
      style={{
        width: size.width,
        height: size.height,
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {/* Remove Button */}
      <button
        onClick={() => onRemove(id)}
        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10"
      >
        ×
      </button>
      <div className="w-full h-full flex items-center justify-center p-2">
        {type === "barcode" && (
          <Barcode value={content} width={size.width} height={size.height} />
        )}
        {type === "qrcode" && (
          <QRCodeComponent
            value={content}
            size={Math.min(size.width, size.height)}
          />
        )}
        {type === "text" && (
          <div className="text-lg font-semibold">{content}</div>
        )}
        {type === "image" && (
          <img
            src={content}
            alt="Uploaded"
            className="object-contain w-full h-full"
          />
        )}
      </div>
    </div>
  );
};

export default DraggableResizableItem;
