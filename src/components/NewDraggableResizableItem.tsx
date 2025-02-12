import React, { useEffect, useRef, useState } from "react";
import Barcode from "./Barcode";
import QRCodeComponent from "./QRCode";
import Moveable from "react-moveable";
import "./moveableOverrides.css";
import jsbarcode from "jsbarcode";
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
  values?: string[]; // For Excel-based items (multiple values)
  currentPage?: number; // Which page's value to show (default 0)
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
}) => {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const barcodeRef = useRef<HTMLCanvasElement | null>(null);
  const qrRef = useRef<HTMLCanvasElement | null>(null);
  const [position, setPosition] = useState({ x, y });
  const [size, setSize] = useState({ width, height });
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const [displayContent, setDisplayContent] = useState(content);

  // Render barcode/qrcode when content or size changes
  useEffect(() => {
    if (type === "barcode" && barcodeRef.current) {
      jsbarcode(barcodeRef.current, displayContent, {
        width: size.width,
        height: size.height,
        format: "CODE128",
      });
    }
    if (type === "qrcode" && qrRef.current) {
      QRCode.toCanvas(qrRef.current, displayContent, {
        width: Math.min(size.width, size.height),
      });
    }
  }, [displayContent, size, type]);

  // Set the target ref for Moveable once the component mounts.
  useEffect(() => {
    if (itemRef.current) {
      setTarget(itemRef.current);
    }
  }, []);

  // Update the displayed content if the item has Excel values.
  useEffect(() => {
    if (values && values.length > 0) {
      setDisplayContent(values[currentPage] || "");
    } else {
      setDisplayContent(content);
    }
  }, [currentPage, values, content]);

  return (
    <div className="relative">
      <div
        ref={itemRef}
        data-item-id={id}
        className="canvas-item absolute"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        <div className="item-value w-full h-full flex hover:border-2 border-red-500 border-dotted items-center justify-center p-2">
          {type === "barcode" && (
            <canvas ref={barcodeRef} width={size.width} height={size.height} />
          )}
          {type === "qrcode" && (
            <canvas
              ref={qrRef}
              width={Math.min(size.width, size.height)}
              height={Math.min(size.width, size.height)}
            />
          )}
          {type === "text" && (
            <div className="text-lg text-black font-semibold">
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
      {target && (
        <Moveable
          target={target}
          draggable={true}
          resizable={true}
          keepRatio={false}
          throttleResize={1}
          edge={true}
          hideDefaultLines={true} // Hides blue selection box
          origin={false} // Removes the red origin dot
          renderDirections={["nw", "ne", "sw", "se"]} // Removes blue corner handles
          onDrag={(e) => {
            const newX = position.x + e.delta[0];
            const newY = position.y + e.delta[1];
            setPosition({ x: newX, y: newY });
            e.target.style.transform = `translate(${newX}px, ${newY}px)`;
          }}
          onResize={(e) => {
            const newWidth = e.width;
            const newHeight = e.height;
            setSize({ width: newWidth, height: newHeight });
            e.target.style.width = `${newWidth}px`;
            e.target.style.height = `${newHeight}px`;
          }}
        />
      )}
    </div>
  );
};

export default NewDraggableResizableItem;
