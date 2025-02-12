import React, { useEffect, useRef, useState } from "react";
import Barcode from "./Barcode";
import QRCodeComponent from "./QRCode";
import Moveable from "react-moveable";

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
}) => {
    const itemRef = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState({ width, height });
    const [item, setItem] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!itemRef.current) return;

        setItem(itemRef.current);
        //
        // interact(itemRef.current)
        //   .draggable({
        //     listeners: {
        //       move(event) {
        //         const target = event.target;
        //         const dx = event.dx || 0;
        //         const dy = event.dy || 0;
        //         const currentX = parseFloat(target.getAttribute("data-x") || "0");
        //         const currentY = parseFloat(target.getAttribute("data-y") || "0");
        //         const newX = currentX + dx;
        //         const newY = currentY + dy;
        //         target.style.transform = `translate(${newX}px, ${newY}px)`;
        //         target.setAttribute("data-x", newX.toString());
        //         target.setAttribute("data-y", newY.toString());
        //       },
        //     },
        //   })
        //   .resizable({
        //     edges: { left: true, right: true, bottom: true, top: true },
        //     listeners: {
        //       move(event) {
        //         // Update the element's size based on the resized rectangle.
        //         const { width, height } = event.rect;
        //         setSize({ width, height });
        //         event.target.style.width = `${width}px`;
        //         event.target.style.height = `${height}px`;
        //
        //         // Get current translation from data attributes.
        //         const currentX = parseFloat(
        //           event.target.getAttribute("data-x") || "0"
        //         );
        //         const currentY = parseFloat(
        //           event.target.getAttribute("data-y") || "0"
        //         );
        //
        //         // Adjust position when resizing from the left or top.
        //         // event.deltaRect.left/top tells you how much the position changed.
        //         const newX = currentX + event.deltaRect.left;
        //         const newY = currentY + event.deltaRect.top;
        //
        //         // Apply the updated translation.
        //         event.target.style.transform = `translate(${newX}px, ${newY}px)`;
        //
        //         // Save the new translation in data attributes.
        //         event.target.setAttribute("data-x", newX.toString());
        //         event.target.setAttribute("data-y", newY.toString());
        //       },
        //     },
        //   });

    }, []);
  return (
    <div>

        <div ref={itemRef}>
            <QRCodeComponent
            value={content}
            size={Math.min(size.width, size.height)}
            />
        </div>

      <Moveable
        target={item}
        draggable={true}
        resizable={true}
        onDrag={(e) => {
          e.target.style.transform = e.transform;
        }}
        onResize={(e) => {
          e.target.style.width = `${e.width}px`;
          e.target.style.height = `${e.height}px`;
        }}
      />
    </div>
  );


    // return (
      //   <div
      //     ref={itemRef}
      //     data-item-id={id}
      //     className="canvas-item absolute text-gray-900 cursor-move overflow-hidden"
      //     style={{
      //       width: size.width,
      //       height: size.height,
      //       transform: `translate(${x}px, ${y}px)`,
      //     }}
      //   >
      //     <div className="w-full h-full flex items-center hover:border-2 border-dotted border-red-600 justify-center p-2 item-value">
      //       {type === "barcode" && (
      //         <Barcode value={content} width={size.width} height={size.height} />
      //       )}
      //       {type === "qrcode" && (
      //         <QRCodeComponent
      //           value={content}
      //           size={Math.min(size.width, size.height)}
      //         />
      //       )}
      //       {type === "text" && (
      //         <div className="text-lg font-semibold">{content}</div>
      //       )}
      //       {type === "image" && (
      //         <img
      //           src={content}
      //           alt="Uploaded"
      //           className="object-contain w-full h-full"
      //         />
      //       )}
      //     </div>
      //   </div>
      // );

    // )
}

export default NewDraggableResizableItem;
