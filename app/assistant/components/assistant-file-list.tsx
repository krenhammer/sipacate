"use client";

import { FileIcon, XIcon } from "lucide-react";
import { FileUpload } from "../types";
import { Button } from "@/components/ui/button";

interface AssistantFileListProps {
  files: FileUpload[];
  onRemove: (filename: string) => void;
}

export function AssistantFileList({ files, onRemove }: AssistantFileListProps) {
  if (!files.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Uploaded Files</p>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.filename}
            className="flex items-center justify-between rounded-md border p-2"
          >
            <div className="flex items-center space-x-2">
              <FileIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{file.filename}</span>
              <span className="text-xs text-muted-foreground">
                ({file.fileType})
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(file.filename)}
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 