"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface AssistantFileUploadProps {
  onUpload: (files: File[]) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function AssistantFileUpload({ onUpload, isLoading = false, error }: AssistantFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      
      // Only allow text/markdown files for now
      const validFiles = fileList.filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return ['md', 'txt'].includes(extension || '');
      });
      
      if (validFiles.length < fileList.length) {
        toast.warning("Only markdown (.md) and text (.txt) files are currently supported");
      }
      
      if (validFiles.length > 0) {
        onUpload(validFiles);
      }
      
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileList = Array.from(e.dataTransfer.files);
      
      // Only allow text/markdown files for now
      const validFiles = fileList.filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return ['md', 'txt'].includes(extension || '');
      });
      
      if (validFiles.length < fileList.length) {
        toast.warning("Only markdown (.md) and text (.txt) files are currently supported");
      }
      
      if (validFiles.length > 0) {
        onUpload(validFiles);
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept=".md,.txt"
        multiple
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={triggerFileInput}
        disabled={isLoading}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex items-center gap-1.5 ${isDragging ? 'border-primary' : ''}`}
      >
        <Upload className="h-3.5 w-3.5" />
        {isLoading ? "Uploading..." : "Upload File"}
      </Button>
      
      {error && (
        <p className="text-sm text-destructive mt-1">{error}</p>
      )}
    </>
  );
} 