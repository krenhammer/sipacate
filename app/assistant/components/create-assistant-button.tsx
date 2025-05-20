"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { AssistantDialog } from "./assistant-dialog";

export function CreateAssistantButton() {
  return (
    <AssistantDialog>
      <Button>
        <PlusIcon className="w-4 h-4 mr-2" />
        Add
      </Button>
    </AssistantDialog>
  );
} 