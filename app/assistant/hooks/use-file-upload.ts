import { useState, useCallback } from 'react';
import { FileUpload } from '../types';
import { docxToMarkdown } from '@/app/utils/docxToMarkdown';

export function useFileUpload() {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFile = useCallback((file: FileUpload) => {
    setFiles(prev => [...prev, file]);
  }, []);

  const removeFile = useCallback((filename: string) => {
    setFiles(prev => prev.filter(file => file.filename !== filename));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const handleFileUpload = useCallback(async (file: File): Promise<FileUpload | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      let content = '';
      let fileType = '';
      
      // Handle different file types
      if (file.name.endsWith('.md')) {
        content = await file.text();
        fileType = 'md';
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
      } else {
        throw new Error('Unsupported file type. Please upload .md, .docx, or image files.');
      }
      
      const fileData: FileUpload = {
        filename: file.name,
        content,
        fileType: fileType as "md" | "docx" | "image"
      };
      
      addFile(fileData);
      return fileData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process file';
      setError(message);
      return null;
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
    handleFileUpload
  };
} 