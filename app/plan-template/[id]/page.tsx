"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PlanTemplate, PlanStep, PlanItem } from "../types";
import { usePlanSteps } from "../hooks/usePlanSteps";
import { usePlanItems } from "../hooks/usePlanItems";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, PlusCircle, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { YamlExportButton } from "../components/yaml-export-import";
import { StepCard } from "./components/StepCard";
import { StepDialog } from "./components/StepDialog";
import { ItemDialog } from "./components/ItemDialog";
import { DeleteDialog } from "./components/DeleteDialog";

export default function PlanTemplateDetail() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const { steps, loading: stepsLoading, fetchSteps, createStep, updateStep, deleteStep, reorderItems } = usePlanSteps(templateId);
  const { items, fetchItems, createItem, updateItem, deleteItem } = usePlanItems();

  const [template, setTemplate] = useState<PlanTemplate | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  // Dialog states
  const [showCreateStepDialog, setShowCreateStepDialog] = useState(false);
  const [showEditStepDialog, setShowEditStepDialog] = useState(false);
  const [editingStep, setEditingStep] = useState<PlanStep | null>(null);
  const [deleteStepDialog, setDeleteStepDialog] = useState<PlanStep | null>(null);

  const [showCreateItemDialog, setShowCreateItemDialog] = useState(false);
  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<PlanItem | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [deleteItemDialog, setDeleteItemDialog] = useState<{ item: PlanItem, stepItemId: string } | null>(null);

  // Fetch template data
  const fetchTemplate = async () => {
    try {
      setLoadingTemplate(true);
      const response = await fetch(`/api/plan-templates`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch templates');
      }

      const data = await response.json();
      const foundTemplate = data.templates.find((t: PlanTemplate) => t.id === templateId);

      if (!foundTemplate) {
        toast({
          title: 'Error',
          description: 'Template not found',
          variant: 'destructive',
        });
        router.push('/plan-template');
        return;
      }

      setTemplate(foundTemplate);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to fetch template',
        variant: 'destructive',
      });
    } finally {
      setLoadingTemplate(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchTemplate();
    fetchSteps();
    fetchItems();
  }, [templateId]);

  // Initialize expanded steps when steps are loaded
  useEffect(() => {
    if (steps.length > 0) {
      const initialExpandedState: Record<string, boolean> = {};
      steps.forEach(step => {
        initialExpandedState[step.id] = false;
      });
      setExpandedSteps(initialExpandedState);
    }
  }, [steps]);

  // Handle toggling step expansion
  const toggleStepExpand = (stepId: string) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  // Handle expand/collapse all
  const toggleAllSteps = () => {
    const areAllExpanded = steps.every(step => expandedSteps[step.id]);
    const newExpandedState: Record<string, boolean> = {};
    
    steps.forEach(step => {
      newExpandedState[step.id] = !areAllExpanded;
    });
    
    setExpandedSteps(newExpandedState);
  };

  // Handle step operations
  const handleOpenCreateStepDialog = () => {
    setShowCreateStepDialog(true);
  };

  const handleOpenEditStepDialog = (step: PlanStep) => {
    setEditingStep(step);
    setShowEditStepDialog(true);
  };

  const handleStepSubmit = async (data: any) => {
    try {
      if (editingStep) {
        // Update existing step
        await updateStep(editingStep.id, data.title, data.description);
        setShowEditStepDialog(false);
      } else {
        // Create new step
        await createStep(data.title, data.description);
        setShowCreateStepDialog(false);
      }
    } catch (error) {
      console.error("Error submitting step form:", error);
    }
  };

  const handleDeleteStep = async () => {
    if (deleteStepDialog) {
      await deleteStep(deleteStepDialog.id);
      setDeleteStepDialog(null);
    }
  };

  // Handle item operations
  const handleOpenCreateItemDialog = (stepId: string) => {
    setCurrentStepId(stepId);
    setShowCreateItemDialog(true);
  };

  const handleOpenEditItemDialog = (item: PlanItem, stepId: string) => {
    setEditingItem(item);
    setCurrentStepId(stepId);
    setShowEditItemDialog(true);
  };

  const handleItemSubmit = async (data: any) => {
    try {
      if (editingItem) {
        // Update existing item
        await updateItem(editingItem.id, data);
        setShowEditItemDialog(false);
      } else if (currentStepId) {
        // Create new item
        await createItem({
          ...data,
          planStepId: currentStepId,
        });
        setShowCreateItemDialog(false);
      }
    } catch (error) {
      console.error("Error submitting item form:", error);
    }
  };

  const handleDeleteItem = async () => {
    if (deleteItemDialog) {
      await deleteItem(deleteItemDialog.item.id);
      setDeleteItemDialog(null);
    }
  };

  // Handle drag and drop reordering
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // If dropped in the same droppable and position didn't change
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const stepId = source.droppableId;
    const step = steps.find((s) => s.id === stepId);

    if (!step || !step.planStepItems) return;

    // Create a copy of the items
    const itemsCopy = [...step.planStepItems];

    // Reorder the items
    const [removed] = itemsCopy.splice(source.index, 1);
    itemsCopy.splice(destination.index, 0, removed);

    // Update the order property
    const updatedItems = itemsCopy.map((item, index) => ({
      id: item.id,
      order: index,
    }));

    // Send the reordered items to the server
    await reorderItems(stepId, updatedItems);
  };

  if (loadingTemplate || stepsLoading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse">Loading template...</div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container py-12">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h3 className="text-xl font-semibold mb-4">Template not found</h3>
          <Button asChild>
            <Link href="/plan-template">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Templates
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const areAllExpanded = steps.length > 0 && steps.every(step => expandedSteps[step.id]);

  return (
    <div className="container p-5">
      <div className="flex items-center mb-6">
        <Button variant="outline" asChild className="mr-4">
          <Link href="/plan-template">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="flex-grow">
          <h1 className="text-3xl font-bold">{template.title}</h1>
          <p className="text-muted-foreground">{template.description || "No description"}</p>
        </div>
        <div className="ml-4">
          <YamlExportButton template={template} />
        </div>
      </div>

      <Separator className="my-6" />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Steps</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={toggleAllSteps}>
            {areAllExpanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Collapse All
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Expand All
              </>
            )}
          </Button>
          <Button onClick={handleOpenCreateStepDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        </div>
      </div>

      {steps.length === 0 ? (
        <div className="text-center p-12 border rounded-lg">
          <h3 className="text-lg font-semibold">No steps yet</h3>
          <p className="text-muted-foreground mb-4">Add your first step to get started</p>
          <Button onClick={handleOpenCreateStepDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        </div>
      ) : (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {steps.map((step) => (
            <StepCard
              key={step.id}
              step={step}
              onAddItem={handleOpenCreateItemDialog}
              onEditStep={handleOpenEditStepDialog}
              onDeleteStep={setDeleteStepDialog}
              onEditItem={handleOpenEditItemDialog}
              onRemoveItem={(item, stepItemId) => setDeleteItemDialog({ item, stepItemId })}
              onDragEnd={handleDragEnd}
              isExpanded={expandedSteps[step.id] || false}
              onToggleExpand={toggleStepExpand}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <StepDialog
        open={showCreateStepDialog}
        onOpenChange={setShowCreateStepDialog}
        onSubmit={handleStepSubmit}
        mode="create"
      />

      <StepDialog
        open={showEditStepDialog}
        onOpenChange={setShowEditStepDialog}
        step={editingStep}
        onSubmit={handleStepSubmit}
        mode="edit"
      />

      <ItemDialog
        open={showCreateItemDialog}
        onOpenChange={setShowCreateItemDialog}
        onSubmit={handleItemSubmit}
        mode="create"
      />

      <ItemDialog
        open={showEditItemDialog}
        onOpenChange={setShowEditItemDialog}
        item={editingItem}
        onSubmit={handleItemSubmit}
        mode="edit"
      />

      <DeleteDialog
        open={!!deleteStepDialog}
        onOpenChange={(open) => !open && setDeleteStepDialog(null)}
        title="Delete Step"
        description="Are you sure you want to delete this step? This action cannot be undone and will also delete all associated items."
        onConfirm={handleDeleteStep}
      />

      <DeleteDialog
        open={!!deleteItemDialog}
        onOpenChange={(open) => !open && setDeleteItemDialog(null)}
        title="Remove Item"
        description="Are you sure you want to remove this item from the step?"
        onConfirm={handleDeleteItem}
      />
    </div>
  );
} 