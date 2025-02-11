import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
}

const Barcode: React.FC<BarcodeProps> = ({
  value,
  width = 120,
  height = 60,
}) => {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current) {
      JsBarcode(barcodeRef.current, value, {
        format: "CODE128",
        lineColor: "#333",
        width: 2,
        height: height / 2,
        displayValue: true,
        fontSize: 14,
      });
    }
  }, [value, width, height]);

  return (
    <div className="flex flex-col items-center">
      <svg ref={barcodeRef} className="w-full" />
    </div>
  );
};

export default Barcode;
