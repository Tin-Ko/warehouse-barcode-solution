import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";

interface FileUploaderProps {
  onDataProcessed: (
    data: { id: string; type: "barcode" | "qrcode" | "text"; content: string }[]
  ) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataProcessed }) => {
  const [fileName, setFileName] = useState("");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);
      const reader = new FileReader();

      reader.onload = (e) => {
        if (!e.target?.result) return;

        // Convert ArrayBuffer to binary string
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const binaryString = Array.from(data)
          .map((byte) => String.fromCharCode(byte))
          .join("");

        const workbook = XLSX.read(binaryString, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Process each row into an object (expecting columns: Type, Content)
        const processedData = jsonData.map((row: any, index: number) => ({
          id: `item-${index}`,
          type: row.Type?.toLowerCase() as "barcode" | "qrcode" | "text",
          content: row.Content || "",
        }));

        onDataProcessed(processedData);
      };

      reader.readAsArrayBuffer(file);
    },
    [onDataProcessed]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="w-full max-w-lg p-6 border-2 border-dashed border-gray-400 rounded-lg text-center bg-gray-900 cursor-pointer hover:bg-gray-800 transition mb-6"
    >
      <input {...getInputProps()} />
      <p className="text-lightText">
        Drag & drop an Excel file here, or click to select
      </p>
      {fileName && (
        <p className="text-primary font-medium mt-2">Uploaded: {fileName}</p>
      )}
    </div>
  );
};

export default FileUploader;
