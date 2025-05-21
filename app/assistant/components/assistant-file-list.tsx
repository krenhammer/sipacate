"use client";

import { useState } from "react";
import { 
  File, 
  Trash2, 
  FileText, 
  FileImage, 
  FileType,
  X,
  Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TiptapMarkdownEditor } from "@/app/plan/components/TiptapMarkdownEditor";
import { toast } from "sonner";
import { DeleteFileDialog } from "./delete-file-dialog";

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
    
    if (extension === 'pdf') return <FileType className="h-4 w-4 text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) 
      return <FileImage className="h-4 w-4 text-blue-500" />;
    if (['md', 'txt', 'doc', 'docx'].includes(extension || '')) 
      return <FileText className="h-4 w-4 text-green-500" />;
    
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const isEditable = (file: FileItem) => {
    const extension = file.filename.split('.').pop()?.toLowerCase();
    return ['md', 'txt'].includes(extension || '');
  };

  const handleFileEdit = (file: FileItem) => {
    if (!isEditable(file)) {
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
      <div className="space-y-2">
        {files.map((file) => (
          <div 
            key={file.filename}
            className="flex items-center justify-between py-2 px-3 border rounded-md group hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {getFileIcon(file)}
              <span className="text-sm font-medium truncate">
                {file.filename}
              </span>
              <span className="text-xs text-muted-foreground">
                ({formatFileSize(file.size)})
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {isEditable(file) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-70 hover:opacity-100"
                  onClick={() => handleFileEdit(file)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit</span>
                </Button>
              )}
              
              <DeleteFileDialog 
                filename={file.filename} 
                onDelete={onRemove}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-70 hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  <span className="sr-only">Delete</span>
                </Button>
              </DeleteFileDialog>
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