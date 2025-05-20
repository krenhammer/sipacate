"use client";

import { useCallback } from "react";
import { UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileUpload } from "../types";

interface AssistantFileUploadProps {
  onUpload: (file: File) => Promise<FileUpload | null>;
  isLoading: boolean;
  error: string | null;
}

export function AssistantFileUpload({
  onUpload,
  isLoading,
  error
}: AssistantFileUploadProps) {
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      await onUpload(file);
      
      // Reset the input
      e.target.value = "";
    },
    [onUpload]
  );

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center",
          "hover:bg-muted/50 transition-colors cursor-pointer"
        )}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="rounded-full bg-primary/10 p-2">
            <UploadIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              Supports .md, .docx, and image files
            </p>
          </div>
        </div>
        
        <input
          id="file-upload"
          type="file"
          accept=".md,.docx,image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
} 