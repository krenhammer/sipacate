import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { PlanStep } from "../../types";

// Schema for step form
const stepFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
});

// Types for form data
type StepFormData = z.infer<typeof stepFormSchema>;

interface StepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  step?: PlanStep | null;
  onSubmit: (data: StepFormData) => Promise<void>;
  mode: 'create' | 'edit';
}

export function StepDialog({
  open,
  onOpenChange,
  step = null,
  onSubmit,
  mode,
}: StepDialogProps) {
  // Step form
  const stepForm = useForm<StepFormData>({
    resolver: zodResolver(stepFormSchema),
    defaultValues: {
      title: step?.title || "",
      description: step?.description || "",
    },
  });

  // Reset form when step changes
  useEffect(() => {
    if (step) {
      stepForm.reset({
        title: step.title,
        description: step.description || "",
      });
    } else {
      stepForm.reset({
        title: "",
        description: "",
      });
    }
  }, [step, stepForm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Step' : 'Edit Step'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Add a new step to your plan template' : 'Update the step details'}
          </DialogDescription>
        </DialogHeader>
        <Form {...stepForm}>
          <form onSubmit={stepForm.handleSubmit(onSubmit)} className="space-y-4">
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
              <Button type="submit">{mode === 'create' ? 'Add Step' : 'Update Step'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 