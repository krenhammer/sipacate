import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Assistant } from '../store';
import { exportAssistantToYAML, downloadYAML, readYAMLFile, importAssistantFromYAML } from '@/app/utils/yaml';
import { Download, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAssistants } from '../hooks/use-assistants';
import { toast } from 'sonner';
import { createAssistantSchema } from '../types';

export function YamlExportButton({ assistant }: { assistant: Assistant }) {
  const handleExport = () => {
    try {
      const yamlContent = exportAssistantToYAML(assistant);
      downloadYAML(yamlContent, `${assistant.name.toLowerCase().replace(/\s+/g, '-')}.yaml`);
      toast.success('Assistant exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export assistant');
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export assistant as YAML</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function YamlImportButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createAssistant } = useAssistants();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName(null);
    }
  };

  // Convert fileType values to match allowed enum values
  const normalizeFileType = (fileType: string): "md" | "docx" | "image" | "pdf" | "txt" => {
    // Map common variations to expected values
    if (fileType === "markdown") return "md";
    if (["doc", "docx"].includes(fileType)) return "docx";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(fileType)) return "image";
    
    // For types already matching our enum, return as is if valid
    if (["md", "docx", "image", "pdf", "txt"].includes(fileType)) {
      return fileType as "md" | "docx" | "image" | "pdf" | "txt";
    }
    
    // Default to txt for unknown types
    return "txt";
  };

  const handleImport = async () => {
    if (!fileInputRef.current?.files?.length) {
      toast.error('Please select a file');
      return;
    }

    try {
      setIsImporting(true);
      const file = fileInputRef.current.files[0];
      const yamlContent = await readYAMLFile(file);
      const assistant = importAssistantFromYAML(yamlContent);
      
      // Process files from the YAML with normalized fileType
      const files = assistant.files?.map(file => ({
        filename: file.filename,
        content: file.content,
        fileType: normalizeFileType(file.fileType),
        size: file.content.length // Approximate size based on content length
      })) || [];
      
      // Make the API call directly with the post body structured according to createAssistantSchema
      const response = await fetch('/api/assistants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: assistant.name,
          description: assistant.description,
          instructions: assistant.instructions,
          knowledge: assistant.knowledge,
          files: files
        })
      });
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast.success('Assistant imported successfully');
      setIsDialogOpen(false);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Import failed:', error);
      toast.error(`Failed to import assistant: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsImporting(false);
    }
  };

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    setFileName(null);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Import Assistant
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetFileInput();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Assistant from YAML</DialogTitle>
            <DialogDescription>
              Select a YAML file to import an AI assistant
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="yaml-file">YAML File</Label>
            <div className="flex items-center gap-2">
              <input
                id="yaml-file"
                type="file"
                accept=".yaml,.yml"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </div>
            {fileName && <p className="text-xs text-muted-foreground">Selected: {fileName}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!fileName || isImporting}>
              {isImporting ? 'Importing...' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 