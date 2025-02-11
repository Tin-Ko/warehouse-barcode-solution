import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";

interface FileUploaderProps {
  onDataProcessed: (
    data: {
      columnName: string;
      values: string[];
      type: "barcode" | "qrcode" | "text";
    }[]
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
        // Read the file directly as an array buffer
        const workbook = XLSX.read(e.target.result, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Using header:1 returns an array of arrays (first row being headers)
        const jsonData = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

        // Check if the file contains data
        if (!jsonData || jsonData.length === 0) return;

        // Assume the first row contains headers
        const headers = jsonData[0] as string[];

        // Initialize a map for columns
        const columns = new Map<string, { type: string; values: string[] }>();
        headers.forEach((header) => {
          columns.set(header, { type: "text", values: [] });
        });

        // Process the rest of the rows
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          headers.forEach((header, j) => {
            const value = row[j] !== undefined ? String(row[j]) : "";
            const colData = columns.get(header);
            if (colData) {
              colData.values.push(value);
            }
          });
        }

        // Convert the map into an array
        const processedData = Array.from(columns.entries()).map(
          ([columnName, data]) => ({
            columnName,
            values: data.values,
            type: data.type as "barcode" | "qrcode" | "text",
          })
        );

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
      className="w-96 h-32 mx-auto p-6 border-2 border-dashed border-gray-400 rounded-lg 
                 text-center bg-gray-900 cursor-pointer hover:bg-gray-800 transition mb-6 
                 flex items-center justify-center"
    >
      <input {...getInputProps()} />
      <div>
        <p className="text-lightText">
          Drag & drop an Excel file here, or click to select
        </p>
        {fileName && (
          <p className="text-primary font-medium mt-2">Uploaded: {fileName}</p>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
