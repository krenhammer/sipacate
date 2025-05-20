"use client";

import { useState } from "react";
import { 
  File, 
  Trash2, 
  FileText, 
  FileImage, 
  FileType,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TiptapMarkdownEditor } from "@/app/plan/components/TiptapMarkdownEditor";
import { toast } from "sonner";

interface FileItem {
  id?: string;
  filename: string;
  content?: string;
  type: string;
  size: number;
}

interface AssistantFileListProps {
  files: FileItem[];
  onRemove: (filename: string) => void;
  onUpdateContent?: (filename: string, content: string) => void;
}

export function AssistantFileList({ files, onRemove, onUpdateContent }: AssistantFileListProps) {
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const getFileIcon = (file: FileItem) => {
    const extension = file.filename.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') return <FileType className="h-5 w-5 text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) 
      return <FileImage className="h-5 w-5 text-blue-500" />;
    if (['md', 'txt', 'doc', 'docx'].includes(extension || '')) 
      return <FileText className="h-5 w-5 text-green-500" />;
    
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleFileClick = (file: FileItem) => {
    // Only allow editing text-based files
    const extension = file.filename.split('.').pop()?.toLowerCase();
    if (!['md', 'txt'].includes(extension || '')) {
      toast.error("Only markdown and text files can be edited");
      return;
    }

    setEditingFile(file);
    setFileContent(file.content || "");
    setIsEditorOpen(true);
  };

  const handleSaveContent = () => {
    if (editingFile && onUpdateContent) {
      onUpdateContent(editingFile.filename, fileContent);
      toast.success("File content updated");
      setIsEditorOpen(false);
    }
  };

  const handleContentChange = (content: string) => {
    setFileContent(content);
  };

  if (files.length === 0) {
    return <p className="text-sm text-muted-foreground">No files uploaded</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {files.map((file) => (
          <div 
            key={file.filename}
            className="flex flex-col items-center justify-center p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleFileClick(file)}
          >
            <div className="flex flex-col items-center text-center gap-1">
              {getFileIcon(file)}
              <span className="text-xs font-medium truncate w-full">
                {file.filename}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(file.filename);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {editingFile && getFileIcon(editingFile)}
              <span>Editing {editingFile?.filename}</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditorOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto min-h-[40vh]">
            <TiptapMarkdownEditor 
              content={fileContent} 
              onChange={handleContentChange}
              className="border rounded-md p-2 min-h-full"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditorOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveContent}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 