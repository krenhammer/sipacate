"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { ChangeEvent, useRef } from "react";

interface AssistantFileUploadProps {
  onUpload: (files: FileList) => void;
  isLoading: boolean;
  error: string | null;
}

export function AssistantFileUpload({ onUpload, isLoading, error }: AssistantFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      e.target.value = ''; // Reset the input
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept=".txt,.md,.pdf,.doc,.docx"
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleButtonClick}
          disabled={isLoading}
          className="flex gap-2 items-center"
        >
          <Upload size={16} />
          {isLoading ? "Uploading..." : "Upload Files"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
} 