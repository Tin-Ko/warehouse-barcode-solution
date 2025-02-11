import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploaderProps {
  onImagesUploaded: (images: string[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesUploaded }) => {
  const [fileNames, setFileNames] = useState<Array<string>>([]); // Explicit typing

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log("Accepted files:", acceptedFiles);
      const imageUrls = acceptedFiles.map((file) => URL.createObjectURL(file));
      setFileNames(acceptedFiles.map((file) => file.name));
      onImagesUploaded(imageUrls);
    },
    [onImagesUploaded]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  return (
    <div
      {...getRootProps()}
      className="w-full max-w-4xl p-6 border-2 border-dashed border-gray-400 rounded-lg text-center bg-gray-900 cursor-pointer hover:bg-gray-800 transition mb-6"
    >
      <input {...getInputProps()} />
      <p className="text-lightText">
        Drag & drop images here, or click to select images
      </p>
      {Array.isArray(fileNames) && fileNames.length > 0 && (
        <div className="mt-2">
          {fileNames.map((name, index) => (
            <p key={index} className="text-primary">
              {name}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
