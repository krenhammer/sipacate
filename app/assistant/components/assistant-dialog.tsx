"use client"

import { useState, ReactNode, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAssistants } from "../hooks/use-assistants";
import { Assistant } from "../store";
import { useFileUpload } from "../hooks/use-file-upload";
import { toast } from "sonner";
import { AssistantFileUpload } from "./assistant-file-upload";
import { AssistantFileList } from "./assistant-file-list";

interface AssistantDialogProps {
  children: ReactNode;
  assistant?: Assistant;
}

export function AssistantDialog({ children, assistant }: AssistantDialogProps) {
  const [open, setOpen] = useState(false);
  const { createAssistant, updateAssistant, isLoading } = useAssistants();
  const { 
    files, 
    handleFileUpload, 
    removeFile, 
    clearFiles,
    isLoading: isFileLoading,
    error: fileError
  } = useFileUpload();
  
  const [name, setName] = useState(assistant?.name || "");
  const [description, setDescription] = useState(assistant?.description || "");
  const [instructions, setInstructions] = useState(assistant?.instructions || "");
  const [knowledge, setKnowledge] = useState(assistant?.knowledge || "");
  
  // Initialize files if editing
  useEffect(() => {
    if (assistant?.files) {
      // Clone files to avoid references to the original
      assistant.files.forEach(file => {
        const { id, assistantId, createdAt, updatedAt, ...rest } = file;
        removeFile(rest.filename);
      });
    }
  }, [assistant, removeFile]);
  
  const isEdit = !!assistant;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Assistant name is required");
      return;
    }
    
    try {
      const assistantData = {
        id: assistant?.id,
        name,
        description,
        instructions,
        knowledge,
        files
      };
      
      if (isEdit) {
        await updateAssistant(assistantData as any);
        toast.success("Assistant updated successfully");
      } else {
        await createAssistant(assistantData);
        toast.success("Assistant created successfully");
      }
      
      resetForm();
      setOpen(false);
    } catch (error) {
      toast.error(`Failed to ${isEdit ? "update" : "create"} assistant`);
    }
  };
  
  const resetForm = () => {
    if (!isEdit) {
      setName("");
      setDescription("");
      setInstructions("");
      setKnowledge("");
      clearFiles();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit" : "Create"} Assistant</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update your AI assistant settings and knowledge."
                : "Create a new AI assistant with customized knowledge."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name*</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Assistant"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description || ""}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of this assistant"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={instructions || ""}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Custom instructions for how the assistant should behave"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="knowledge">Knowledge</Label>
              <Textarea
                id="knowledge"
                value={knowledge || ""}
                onChange={(e) => setKnowledge(e.target.value)}
                placeholder="Specialized knowledge for the assistant"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Knowledge Files</Label>
              <AssistantFileUpload onUpload={handleFileUpload} isLoading={isFileLoading} error={fileError} />
              <AssistantFileList files={files} onRemove={removeFile} />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 