import React, { useEffect, useRef, useState } from "react";
import Barcode from "./Barcode";
import QRCodeComponent from "./QRCode";
import Moveable from "react-moveable";
import "./moveableOverrides.css";
import Jsbarcode from "jsbarcode";
import QRCode from "qrcode";

interface ItemProps {
  id: string;
  type: "barcode" | "qrcode" | "text" | "image";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onRemove: (id: string) => void;
  values?: string[];
  currentPage?: number;
  canvasWidth: number;
  canvasHeight: number;
}

const NewDraggableResizableItem: React.FC<ItemProps> = ({
  id,
  type,
  content,
  x,
  y,
  width,
  height,
  onRemove,
  values,
  currentPage = 0,
  canvasWidth,
  canvasHeight,
}) => {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const barcodeRef = useRef<HTMLCanvasElement | null>(null);
  const qrRef = useRef<HTMLCanvasElement | null>(null);
  const [position, setPosition] = useState({ x, y });
  const [size, setSize] = useState({ width, height });
  const [displayContent, setDisplayContent] = useState(content);
  const [isSelected, setIsSelected] = useState(false);

  // Barcode & QR Code Rendering
  useEffect(() => {
    if (type === "barcode" && barcodeRef.current) {
      Jsbarcode(barcodeRef.current, displayContent, {
        format: "CODE128",
        lineColor: "#333",
        width: Math.max(size.width / 200, 1),
        height: size.height * 0.8,
        displayValue: true,
        fontSize: size.height * 0.15,
      });
    }
    if (type === "qrcode" && qrRef.current) {
      QRCode.toCanvas(qrRef.current, displayContent, {
        width: size.width,
      });
    }
  }, [displayContent, size, type]);

  // Ensure Excel-based items update their values
  useEffect(() => {
    if (values && values.length > 0) {
      setDisplayContent(values[currentPage] || "");
    } else {
      setDisplayContent(content);
    }
  }, [currentPage, values, content]);

  // Restrict items to stay inside the canvas
  const enforceBounds = (
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    return {
      x: Math.min(Math.max(x, 0), canvasWidth - width),
      y: Math.min(Math.max(y, 0), canvasHeight - height),
      width: Math.min(width, canvasWidth - x),
      height: Math.min(height, canvasHeight - y),
    };
  };

  // Click handler to toggle selection
  const handleSelect = () => {
    setIsSelected(true);
  };

  // Deselect when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
        setIsSelected(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div
        ref={itemRef}
        data-item-id={id}
        className={`canvas-item absolute ${isSelected ? "selected" : ""}`} // Apply CSS class dynamically
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${x}px, ${y}px)`,
        }}
        onClick={handleSelect}
      >
        <div className="item-value  w-full h-full flex  items-center justify-center p-2">
          {type === "barcode" && (
            <canvas ref={barcodeRef} width={size.width} height={size.height} />
          )}
          {type === "qrcode" && (
            <canvas ref={qrRef} width={size.width} height={size.width} />
          )}
          {type === "text" && (
            <div
              className="text-lg text-black font-semibold pointer-events-none"
              style={{
                fontSize: `${size.height * 0.65}px`,
                maxWidth: "100%",
                wordWrap: "break-word",
              }}
            >
              {displayContent}
            </div>
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

      {/* Moveable Component */}
      <Moveable
        target={isSelected ? itemRef.current : null}
        draggable={true}
        resizable={true}
        keepRatio={false}
        throttleResize={1}
        edge={true}
        hideDefaultLines={true}
        origin={false}
        renderDirections={["nw", "ne", "sw", "se"]}
        onDrag={(e) => {
          let newX = position.x + e.delta[0];
          let newY = position.y + e.delta[1];

          // Prevent dragging outside the canvas
          const { x, y } = enforceBounds(newX, newY, size.width, size.height);
          setPosition({ x, y });

          e.target.style.transform = `translate(${x}px, ${y}px)`;
        }}
        onResize={(e) => {
          let newWidth = e.width;
          let newHeight = e.height;
          let newX = position.x;
          let newY = position.y;

          // Adjust position if resizing from left or top
          if (e.direction[0] === -1) {
            newX += e.delta[0];
          }
          if (e.direction[1] === -1) {
            newY += e.delta[1];
          }

          // Ensure resizing doesn't push the element outside the canvas
          const { x, y, width, height } = enforceBounds(
            newX,
            newY,
            newWidth,
            newHeight
          );

          setSize({ width, height });
          setPosition({ x, y });

          e.target.style.width = `${width}px`;
          e.target.style.height = `${height}px`;
          e.target.style.transform = `translate(${x}px, ${y}px)`;
        }}
      />
    </div>
  );
};

export default NewDraggableResizableItem;
