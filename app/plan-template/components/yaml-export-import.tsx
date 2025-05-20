import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PlanTemplate } from '../types';
import { exportPlanTemplateToYAML, downloadYAML, readYAMLFile, importPlanTemplateFromYAML } from '@/app/utils/yaml';
import { Download, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePlanTemplates } from '../hooks/usePlanTemplates';
import { toast } from 'sonner';

export function YamlExportButton({ template }: { template: PlanTemplate }) {
  const handleExport = () => {
    try {
      const yamlContent = exportPlanTemplateToYAML(template);
      downloadYAML(yamlContent, `${template.title.toLowerCase().replace(/\s+/g, '-')}.yaml`);
      toast.success('Template exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export template');
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
          <p>Export template as YAML</p>
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
  const { createTemplateFromYaml } = usePlanTemplates();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName(null);
    }
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
      const template = importPlanTemplateFromYAML(yamlContent);
      
      // Create the template using the API
      await createTemplateFromYaml(template);
      
      toast.success('Template imported successfully');
      setIsDialogOpen(false);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import template');
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
        Import Template
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetFileInput();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Template from YAML</DialogTitle>
            <DialogDescription>
              Select a YAML file to import a plan template
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