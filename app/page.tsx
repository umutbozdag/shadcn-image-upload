"use client";
import ImageUpload from "@/components/image-upload";
import SectionCard from "@/components/section-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Toaster } from "sonner";

const DialogTrigger = dynamic(
  () => import("@/components/ui/dialog").then((mod) => mod.DialogTrigger),
  {
    ssr: false,
    loading: () => <div className="text-center h-[40px]">Loading...</div>,
  }
);

export default function Home() {
  const [fileName, setFileName] = useState<string | null>(null);

  const simulateUpload = (
    file: File,
    onProgress: (progress: number) => void,
    onComplete: (imageUrl: string) => void
  ): Promise<string> => {
    return new Promise((resolve) => {
      const fakeUploadTime = 3000; // 3 seconds
      let progress = 0; // Initialize progress

      const interval = setInterval(() => {
        progress += 10; // Increment progress
        onProgress(progress); // Call onProgress with the new progress value

        if (progress >= 100) {
          clearInterval(interval);
          onProgress(100); // Ensure progress is set to 100%
          const imageUrl = URL.createObjectURL(file);
          setFileName(file.name);
          onComplete(imageUrl); // Call onComplete with the image URL
          resolve(imageUrl); // Resolve the promise with the image URL
        }
      }, fakeUploadTime / 10);
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center gap-12 p-24">
      <SectionCard
        title="Usage - In Dialog"
        description="This dialog component serves as an interactive modal for users to upload images."
      >
        <Dialog>
          <DialogTrigger className="flex items-center justify-center w-full h-full">
            <Button>Upload Image</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Image Dialog</DialogTitle>
              <DialogDescription>
                This is a dialog component that can be used to display a modal
                and you can upload an image.
              </DialogDescription>

              <ImageUpload
                id="dialog-upload"
                fileName={fileName}
                className="pt-4"
                onFileUpload={simulateUpload}
                maxImageWidth={1000}
                maxImageHeight={1000}
              />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </SectionCard>

      <SectionCard
        title="Usage - Basic Mode"
        description="This is a basic usage of the ImageUpload component."
      >
        <ImageUpload
          id="basic-upload"
          fileName={fileName}
          maxImageWidth={1920}
          maxImageHeight={1080}
          onFileUpload={simulateUpload}
        />
      </SectionCard>

      <Toaster />
    </main>
  );
}
