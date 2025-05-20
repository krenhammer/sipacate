"use client";

import { AssistantList } from "./components/assistant-list";
import { CreateAssistantButton } from "./components/create-assistant-button";
import { YamlImportButton } from "./components/yaml-export-import";

export default function AssistantPage() {
  return (
    <div className="container py-6 space-y-6 p-5 ">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Assistants</h1>
        <div className="flex space-x-2">
          <YamlImportButton />
          <CreateAssistantButton />
        </div>
      </div>
      
      <p className="text-muted-foreground">
        Create and manage AI Assistants to customize your AI interactions.
      </p>
      
      <AssistantList />
    </div>
  );
}