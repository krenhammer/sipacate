"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PlanTemplate, PlanStep, PlanItem, PlanStepItem } from "../types";
import { usePlanSteps } from "../hooks/usePlanSteps";
import { usePlanItems } from "../hooks/usePlanItems";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, PlusCircle, Trash2, Edit, GripVertical } from "lucide-react";
import Link from "next/link";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// Schema for step form
const stepFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
});

// Schema for item form
const itemFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  type: z.enum(["List", "Document"], {
    required_error: "Please select an item type",
  }),
  instructions: z.string().optional(),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().optional(),
});

// Types for form data
type StepFormData = z.infer<typeof stepFormSchema>;
type ItemFormData = z.infer<typeof itemFormSchema>;

export default function PlanTemplateDetail() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;
  
  const { steps, loading: stepsLoading, fetchSteps, createStep, updateStep, deleteStep, reorderItems } = usePlanSteps(templateId);
  const { items, fetchItems, createItem, updateItem, deleteItem, addItemToStep } = usePlanItems();
  
  const [template, setTemplate] = useState<PlanTemplate | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  
  const [showCreateStepDialog, setShowCreateStepDialog] = useState(false);
  const [showEditStepDialog, setShowEditStepDialog] = useState(false);
  const [editingStep, setEditingStep] = useState<PlanStep | null>(null);
  const [deleteStepDialog, setDeleteStepDialog] = useState<PlanStep | null>(null);
  
  const [showCreateItemDialog, setShowCreateItemDialog] = useState(false);
  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<PlanItem | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [deleteItemDialog, setDeleteItemDialog] = useState<{item: PlanItem, stepItemId: string} | null>(null);

  // Step form
  const stepForm = useForm<StepFormData>({
    resolver: zodResolver(stepFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Item form
  const itemForm = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "List",
      instructions: "",
      systemPrompt: "",
      userPrompt: "",
    },
  });

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

  // Reset form when opening create step dialog
  const handleOpenCreateStepDialog = () => {
    stepForm.reset({ title: "", description: "" });
    setShowCreateStepDialog(true);
  };

  // Set form values when opening edit step dialog
  const handleOpenEditStepDialog = (step: PlanStep) => {
    setEditingStep(step);
    stepForm.reset({
      title: step.title,
      description: step.description || "",
    });
    setShowEditStepDialog(true);
  };

  // Reset form when opening create item dialog
  const handleOpenCreateItemDialog = (stepId: string) => {
    setCurrentStepId(stepId);
    itemForm.reset({
      title: "",
      description: "",
      type: "List",
      instructions: "",
      systemPrompt: "",
      userPrompt: "",
    });
    setShowCreateItemDialog(true);
  };

  // Set form values when opening edit item dialog
  const handleOpenEditItemDialog = (item: PlanItem, stepId: string) => {
    setEditingItem(item);
    setCurrentStepId(stepId);
    itemForm.reset({
      title: item.title,
      description: item.description || "",
      type: item.type,
      instructions: item.instructions || "",
      systemPrompt: item.systemPrompt || "",
      userPrompt: item.userPrompt || "",
    });
    setShowEditItemDialog(true);
  };

  // Handle step form submission
  const onStepSubmit = async (data: StepFormData) => {
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

  // Handle item form submission
  const onItemSubmit = async (data: ItemFormData) => {
    try {
      if (editingItem) {
        // Update existing item
        await updateItem(editingItem.id, data);
        setShowEditItemDialog(false);
      } else if (currentStepId) {
        // Create new item
        const newItem = await createItem({
          ...data,
          planStepId: currentStepId,
        });
        setShowCreateItemDialog(false);
      }
    } catch (error) {
      console.error("Error submitting item form:", error);
    }
  };

  // Handle step deletion
  const handleDeleteStep = async () => {
    if (deleteStepDialog) {
      await deleteStep(deleteStepDialog.id);
      setDeleteStepDialog(null);
    }
  };

  // Handle item deletion
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
    
    if (!step || !step.planStepItems || step.planStepItems.length === 0) return;
    
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

  return (
    <div className="container py-6">
      <div className="flex items-center mb-6">
        <Button variant="outline" asChild className="mr-4">
          <Link href="/plan-template">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{template.title}</h1>
          <p className="text-muted-foreground">{template.description || "No description"}</p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Steps</h2>
        <Button onClick={handleOpenCreateStepDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Step
        </Button>
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
        <div className="space-y-6">
          {steps.map((step) => (
            <Card key={step.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription>{step.description || "No description"}</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleOpenEditStepDialog(step)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDeleteStepDialog(step)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button
                    variant="outline"
                    onClick={() => handleOpenCreateItemDialog(step.id)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                {step.planStepItems && step.planStepItems.length > 0 ? (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId={step.id}>
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-4"
                        >
                          {step.planStepItems?.length > 0 &&
                            step.planStepItems
                              .sort((a, b) => a.order - b.order)
                              .map((stepItem, index) => {
                                const item = stepItem.planItem;
                                if (!item) return null;
                                
                                return (
                                  <Draggable
                                    key={stepItem.id}
                                    draggableId={stepItem.id}
                                    index={index}
                                  >
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className="border rounded-md p-4 bg-card"
                                      >
                                        <div className="flex justify-between items-start">
                                          <div className="flex items-center">
                                            <div
                                              {...provided.dragHandleProps}
                                              className="mr-2 cursor-grab"
                                            >
                                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                              <h4 className="font-medium">{item.title}</h4>
                                              <p className="text-sm text-muted-foreground">
                                                {item.type}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex space-x-2">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleOpenEditItemDialog(item, step.id)}
                                            >
                                              Edit
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => setDeleteItemDialog({item, stepItemId: stepItem.id})}
                                            >
                                              Remove
                                            </Button>
                                          </div>
                                        </div>

                                        <Accordion type="single" collapsible className="mt-2">
                                          <AccordionItem value="details">
                                            <AccordionTrigger>Details</AccordionTrigger>
                                            <AccordionContent>
                                              <div className="space-y-2">
                                                <div>
                                                  <h5 className="font-medium">Description</h5>
                                                  <p className="text-sm">
                                                    {item.description || "No description"}
                                                  </p>
                                                </div>
                                                <div>
                                                  <h5 className="font-medium">Instructions</h5>
                                                  <p className="text-sm">
                                                    {item.instructions || "No instructions"}
                                                  </p>
                                                </div>
                                                {item.type === "Document" && (
                                                  <>
                                                    <div>
                                                      <h5 className="font-medium">System Prompt</h5>
                                                      <p className="text-sm">
                                                        {item.systemPrompt || "No system prompt"}
                                                      </p>
                                                    </div>
                                                    <div>
                                                      <h5 className="font-medium">User Prompt</h5>
                                                      <p className="text-sm">
                                                        {item.userPrompt || "No user prompt"}
                                                      </p>
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            </AccordionContent>
                                          </AccordionItem>
                                        </Accordion>
                                      </div>
                                    )}
                                  </Draggable>
                                );
                              })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                ) : (
                  <div className="text-center p-6 border border-dashed rounded-md">
                    <p className="text-muted-foreground">No items in this step</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Step Dialog */}
      <Dialog open={showCreateStepDialog} onOpenChange={setShowCreateStepDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Step</DialogTitle>
            <DialogDescription>
              Add a new step to your plan template
            </DialogDescription>
          </DialogHeader>
          <Form {...stepForm}>
            <form onSubmit={stepForm.handleSubmit(onStepSubmit)} className="space-y-4">
              <FormField
                control={stepForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter step title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={stepForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter step description (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Add Step</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Step Dialog */}
      <Dialog open={showEditStepDialog} onOpenChange={setShowEditStepDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Step</DialogTitle>
            <DialogDescription>
              Update the step details
            </DialogDescription>
          </DialogHeader>
          <Form {...stepForm}>
            <form onSubmit={stepForm.handleSubmit(onStepSubmit)} className="space-y-4">
              <FormField
                control={stepForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter step title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={stepForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter step description (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Update Step</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Item Dialog */}
      <Dialog open={showCreateItemDialog} onOpenChange={setShowCreateItemDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
            <DialogDescription>
              Add a new item to this step
            </DialogDescription>
          </DialogHeader>
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit(onItemSubmit)} className="space-y-4">
              <FormField
                control={itemForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter item title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={itemForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter item description (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={itemForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="List">List</SelectItem>
                        <SelectItem value="Document">Document</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={itemForm.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter instructions (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {itemForm.watch("type") === "Document" && (
                <>
                  <FormField
                    control={itemForm.control}
                    name="systemPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter system prompt (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={itemForm.control}
                    name="userPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter user prompt (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <DialogFooter>
                <Button type="submit">Add Item</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditItemDialog} onOpenChange={setShowEditItemDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update the item details
            </DialogDescription>
          </DialogHeader>
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit(onItemSubmit)} className="space-y-4">
              <FormField
                control={itemForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter item title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={itemForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter item description (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={itemForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="List">List</SelectItem>
                        <SelectItem value="Document">Document</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={itemForm.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter instructions (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {itemForm.watch("type") === "Document" && (
                <>
                  <FormField
                    control={itemForm.control}
                    name="systemPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter system prompt (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={itemForm.control}
                    name="userPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Prompt</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter user prompt (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <DialogFooter>
                <Button type="submit">Update Item</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Step Dialog */}
      <AlertDialog
        open={!!deleteStepDialog}
        onOpenChange={(open) => !open && setDeleteStepDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Step</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this step? This action cannot be undone and will also delete all associated items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStep}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Item Dialog */}
      <AlertDialog
        open={!!deleteItemDialog}
        onOpenChange={(open) => !open && setDeleteItemDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this item from the step?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 