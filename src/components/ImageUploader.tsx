import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploaderProps {
  onImagesUploaded: (images: string[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesUploaded }) => {
  const [fileNames, setFileNames] = useState<Array<string>>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
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
      className="w-96 h-32 mx-auto p-6 border-2 border-dashed border-gray-400 rounded-lg 
                text-center bg-gray-900 cursor-pointer hover:bg-gray-800 transition mb-6
                flex items-center justify-center"
    >
      <input {...getInputProps()} />
      <div>
        <p className="text-lightText">
          Drag & drop images here, or click to select images
        </p>
        {fileNames.length > 0 && (
          <p className="text-primary font-medium mt-2">
            {fileNames.length} image{fileNames.length !== 1 ? "s" : ""} selected
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
