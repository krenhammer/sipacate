import { useState, useCallback } from 'react';
import { FileUpload } from '../types';
import { docxToMarkdown } from '@/app/utils/docxToMarkdown';

export function useFileUpload() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFile = useCallback((file: FileUpload) => {
    console.log("Adding file with size:", file.filename, file.content?.length, file.size);
    setFiles(prev => [...prev, file]);
  }, []);

  const removeFile = useCallback((filename: string) => {
    setFiles(prev => prev.filter(file => file.filename !== filename));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const updateFileContent = useCallback((filename: string, content: string) => {
    setFiles(prev => 
      prev.map(file => 
        file.filename === filename 
          ? { ...file, content } 
          : file
      )
    );
  }, []);

  const handleFileUpload = useCallback(async (files: FileList): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let content = '';
        let fileType = '';
        
        // Handle different file types
        if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
          content = await file.text();
          fileType = file.name.endsWith('.md') ? 'md' : 'txt';
        } else if (file.name.endsWith('.docx')) {
          content = await docxToMarkdown(file);
          fileType = 'docx';
        } else if (file.type.startsWith('image/')) {
          // Convert image to base64
          const reader = new FileReader();
          content = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          fileType = 'image';
        } else if (file.name.endsWith('.pdf')) {
          // Just store reference for PDF files
          content = 'PDF content';
          fileType = 'pdf';
        } else {
          throw new Error('Unsupported file type. Please upload .txt, .md, .docx, .pdf, or image files.');
        }
        
        const fileData: FileUpload = {
          filename: file.name,
          content,
          fileType: fileType as "md" | "docx" | "image" | "pdf" | "txt",
          size: file.size
        };
        
        addFile(fileData);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process file';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [addFile]);

  return {
    files,
    isLoading,
    error,
    addFile,
    removeFile,
    clearFiles,
    updateFileContent,
    handleFileUpload
  };
} 