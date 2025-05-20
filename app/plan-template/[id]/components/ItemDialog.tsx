import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect } from "react";
import { PlanItem } from "../../types";

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
type ItemFormData = z.infer<typeof itemFormSchema>;

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: PlanItem | null;
  onSubmit: (data: ItemFormData) => Promise<void>;
  mode: 'create' | 'edit';
}

export function ItemDialog({
  open,
  onOpenChange,
  item = null,
  onSubmit,
  mode,
}: ItemDialogProps) {
  // Item form
  const itemForm = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      title: item?.title || "",
      description: item?.description || "",
      type: item?.type || "List",
      instructions: item?.instructions || "",
      systemPrompt: item?.systemPrompt || "",
      userPrompt: item?.userPrompt || "",
    },
  });

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      itemForm.reset({
        title: item.title,
        description: item.description || "",
        type: item.type,
        instructions: item.instructions || "",
        systemPrompt: item.systemPrompt || "",
        userPrompt: item.userPrompt || "",
      });
    } else {
      itemForm.reset({
        title: "",
        description: "",
        type: "List",
        instructions: "",
        systemPrompt: "",
        userPrompt: "",
      });
    }
  }, [item, itemForm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Item' : 'Edit Item'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Add a new item to this step' : 'Update the item details'}
          </DialogDescription>
        </DialogHeader>
        <Form {...itemForm}>
          <form onSubmit={itemForm.handleSubmit(onSubmit)} className="space-y-4">
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
              <Button type="submit">{mode === 'create' ? 'Add Item' : 'Update Item'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 