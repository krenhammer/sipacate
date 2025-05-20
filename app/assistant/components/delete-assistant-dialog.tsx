"use client";

import { useState, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAssistants } from "../hooks/use-assistants";
import { toast } from "sonner";

interface DeleteAssistantDialogProps {
  children: ReactNode;
  assistantId: string;
  assistantName: string;
}

export function DeleteAssistantDialog({
  children,
  assistantId,
  assistantName,
}: DeleteAssistantDialogProps) {
  const [open, setOpen] = useState(false);
  const { deleteAssistant, isLoading } = useAssistants();

  const handleDelete = async () => {
    try {
      const success = await deleteAssistant(assistantId);
      if (success) {
        toast.success(`Assistant "${assistantName}" deleted successfully`);
      } else {
        toast.error("Failed to delete assistant");
      }
    } catch (error) {
      toast.error("Failed to delete assistant");
    } finally {
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Assistant</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{assistantName}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 