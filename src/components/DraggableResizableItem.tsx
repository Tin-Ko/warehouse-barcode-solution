import React, { useEffect, useRef, useState } from "react";
import interact from "interactjs";
import Barcode from "./Barcode";
import QRCodeComponent from "./QRCode";

interface ItemProps {
  id: string;
  type: "barcode" | "qrcode" | "text";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const DraggableResizableItem: React.FC<ItemProps> = ({
  id,
  type,
  content,
  x,
  y,
  width,
  height,
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
            let { width, height } = event.rect;
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
      className="absolute flex items-center justify-center bg-gray-100 p-3 rounded-md shadow-lg text-gray-900 cursor-move"
      style={{
        width: size.width,
        height: size.height,
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
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
    </div>
  );
};

export default DraggableResizableItem;
