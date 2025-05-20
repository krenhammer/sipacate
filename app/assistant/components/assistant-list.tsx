"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAssistants } from "../hooks/use-assistants";
import { PencilIcon, TrashIcon, PlusIcon, FileIcon } from "lucide-react";
import { AssistantDialog } from "./assistant-dialog";
import { DeleteAssistantDialog } from "./delete-assistant-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { YamlExportButton } from "./yaml-export-import";

export function AssistantList() {
  const { assistants, isLoading, error, fetchAssistants } = useAssistants();

  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants]);

  if (isLoading) {
    return <AssistantListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-500">Error loading assistants</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => fetchAssistants()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (assistants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-lg border-dashed">
        <h3 className="mb-2 text-lg font-semibold">No assistants found</h3>
        <p className="mb-6 text-sm text-center text-muted-foreground">
          Create your first AI assistant to get started
        </p>
        <AssistantDialog>
          <Button>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Assistant
          </Button>
        </AssistantDialog>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assistants.map((assistant) => (
        <Card key={assistant.id}>
          <CardHeader>
            <CardTitle>{assistant.name}</CardTitle>
            <CardDescription>{assistant.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2">
              {assistant.instructions && (
                <div>
                  <p className="text-sm font-medium">Instructions</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {assistant.instructions}
                  </p>
                </div>
              )}
              
              {assistant.files && assistant.files.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Files</p>
                  <div className="flex flex-wrap gap-2">
                    {assistant.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center text-xs px-2 py-1 rounded-full bg-muted"
                      >
                        <FileIcon className="w-3 h-3 mr-1" />
                        {file.filename}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end gap-2">
            <YamlExportButton assistant={assistant} />
            
            <DeleteAssistantDialog assistantId={assistant.id} assistantName={assistant.name}>
              <Button variant="outline" size="icon">
                <TrashIcon className="w-4 h-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </DeleteAssistantDialog>
            
            <AssistantDialog assistant={assistant}>
              <Button variant="outline" size="icon">
                <PencilIcon className="w-4 h-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </AssistantDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function AssistantListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 