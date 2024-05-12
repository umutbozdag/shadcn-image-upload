"use client";

import React, { useState } from "react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Input } from "./ui/input";
import NextImage from "next/image";
import RadialProgress from "./ui/radial-progress";
import { Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ImageUploadAreaProps {
  isDragActive: boolean;
  children: React.ReactNode;
  labelClassName?: string;
  id: string;
  disabled?: boolean;
}

const ImageUploadArea = ({
  isDragActive,
  children,
  labelClassName,
  id,
  disabled,
}: ImageUploadAreaProps) => (
  <label
    htmlFor={id}
    className={cn(
      "relative flex flex-col items-center justify-center min-h-[200px] w-full border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100",
      disabled && "cursor-not-allowed",
      labelClassName,
      isDragActive
        ? "border-zinc-600 dark:border-zinc-500 transition-colors duration-300"
        : "border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
    )}
  >
    {children}
  </label>
);

interface UploadingIndicatorProps {
  progress: number;
}
const UploadingIndicator = ({ progress }: UploadingIndicatorProps) => (
  <div className="text-center max-w-md">
    <RadialProgress progress={progress} />
    <p className="text-sm font-semibold">Uploading image...</p>
    <p className="px-2 text-xs text-gray-400">
      Do not refresh or perform any other action while the image is being
      uploaded
    </p>
  </div>
);

interface UploadPromptProps {
  maxImageWidth: number;
  maxImageHeight: number;
  maxSize: number;
}

const UploadPrompt = ({
  maxImageWidth,
  maxImageHeight,
  maxSize,
}: UploadPromptProps) => (
  <div className="text-center">
    <div className="border p-2 rounded-md max-w-min mx-auto">
      <Upload size="1.6em" />
    </div>
    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
      <span className="font-semibold">Click or drag an image</span>
    </p>
    <p className="text-xs text-gray-400 dark:text-gray-400">
      (image should be {maxImageWidth}x{maxImageHeight} and under{" "}
      {maxSize / 1024 / 1024} MB).
    </p>
  </div>
);

interface UploadedImageDisplayProps {
  uploadedImagePath: string;
  fileName?: string | null;
  removeSelectedImage: () => void;
}

const UploadedImageDisplay = ({
  uploadedImagePath,
  fileName,
  removeSelectedImage,
}: UploadedImageDisplayProps) => (
  <div className="text-center">
    <div className="relative group">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <NextImage
          width={1000}
          height={1000}
          src={uploadedImagePath}
          className="w-full object-contain max-h-16 mx-auto mt-2 mb-3 opacity-90 min-h-[100px]"
          alt={fileName || "Uploaded image"}
        />
        <div
          aria-label="Remove image"
          className="absolute inset-0 flex items-center justify-center bg-opacity-100 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            removeSelectedImage();
          }}
        >
          <Trash2 className="text-red-500" size="2em" />
        </div>
      </motion.div>
    </div>
    <p className="text-zinc-700 truncate max-w-xs">{fileName}</p>
    <p className="text-xs text-zinc-400">
      You can remove the image by clicking on the trash icon
    </p>
  </div>
);

interface ImageUploadProps {
  onFileUpload: (
    file: File,
    onProgress: (progress: number) => void,
    onComplete: (imageUrl: string) => void
  ) => Promise<string>;
  className?: string;
  fileName?: string | null;
  onRemove?: () => void;
  maxImageWidth?: number;
  maxImageHeight?: number;
  maxSize?: number;
  id: string;
}

export default function ImageUpload({
  onFileUpload,
  className,
  fileName,
  onRemove,
  maxImageHeight = 500,
  maxImageWidth = 500,
  maxSize = 10 * 1024 * 1024,
  id,
}: ImageUploadProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(
    null
  );

  const handleUpload = async (
    file: File,
    event?:
      | React.ChangeEvent<HTMLInputElement>
      | React.DragEvent<HTMLDivElement>
  ) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = async () => {
      if (image.width > maxImageWidth || image.height > maxImageHeight) {
        toast.error(
          `Image must be ${maxImageWidth}x${maxImageHeight} pixels or smaller.`
        );
        URL.revokeObjectURL(image.src);
        return;
      }
      setLoading(true);
      await onFileUpload(file, setProgress, (imageUrl: string) => {
        setUploadedImagePath(imageUrl);
        setLoading(false);
      });
      URL.revokeObjectURL(image.src);
    };
    image.onerror = () => {
      toast.error(
        "There was an error processing your image. It can be wrong format or too large."
      );
      setLoading(false);
      URL.revokeObjectURL(image.src);
    };
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        handleUpload(file);
      }
    },
    [maxImageHeight, maxImageWidth, handleUpload]
  );

  const removeSelectedImage = () => {
    onRemove?.();
    setLoading(false);
    setUploadedImagePath(null);
    setProgress(0);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    noClick: true,
    noKeyboard: true,
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      const file = event.target.files[0];
      handleUpload(file, event);
    }
  };

  return (
    <div
      {...getRootProps()}
      className={cn("flex items-center justify-center w-full", className)}
    >
      <ImageUploadArea disabled={loading} id={id} isDragActive={isDragActive}>
        {loading && <UploadingIndicator progress={progress} />}
        {!loading && !uploadedImagePath && (
          <UploadPrompt
            maxImageWidth={maxImageWidth}
            maxImageHeight={maxImageHeight}
            maxSize={maxSize}
          />
        )}
        {uploadedImagePath && !loading && (
          <UploadedImageDisplay
            uploadedImagePath={uploadedImagePath}
            fileName={fileName}
            removeSelectedImage={removeSelectedImage}
          />
        )}
      </ImageUploadArea>

      <Input
        {...getInputProps({
          onChange: handleImageChange,
        })}
        id={id}
        accept="image/*"
        type="file"
        className="hidden"
        disabled={loading}
      />
    </div>
  );
}
