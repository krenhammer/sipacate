import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlanItem, PlanStep } from "../../types";

interface StepCardProps {
  step: PlanStep;
  onAddItem: (stepId: string) => void;
  onEditStep: (step: PlanStep) => void;
  onDeleteStep: (step: PlanStep) => void;
  onEditItem: (item: PlanItem, stepId: string) => void;
  onRemoveItem: (item: PlanItem, stepItemId: string) => void;
  onDragEnd: (result: any) => void;
}

export function StepCard({
  step,
  onAddItem,
  onEditStep,
  onDeleteStep,
  onEditItem,
  onRemoveItem,
  onDragEnd,
}: StepCardProps) {
  // Ensure planStepItems is an array and sort it by order
  const planStepItems = step.planStepItems ? 
    [...step.planStepItems].sort((a, b) => a.order - b.order) : 
    [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">{step.title}</CardTitle>
          <CardDescription>{step.description || "No description"}</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => onAddItem(step.id)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Item
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEditStep(step)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDeleteStep(step)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {planStepItems.length > 0 ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={step.id}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {planStepItems.map((stepItem, index) => {
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
                                  onClick={() => onEditItem(item, step.id)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onRemoveItem(item, stepItem.id)}
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
  );
} 