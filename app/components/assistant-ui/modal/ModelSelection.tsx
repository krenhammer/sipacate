import { FC } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export const ModelSelection: FC = () => {
  return (
    <div className="flex flex-col p-4 h-full space-y-4">
      <h2 className="text-xl font-bold mb-2">API Provider</h2>
      
      <div>
        <Select defaultValue="openrouter">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select API Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openrouter">OpenRouter</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="api-key">OpenRouter API Key</Label>
        <Input 
          id="api-key" 
          type="password" 
          className="mt-1"
          defaultValue="••••••••••••••••••••••••"
        />
        <p className="text-xs text-gray-500 mt-1">
          This key is stored locally and only used to make API requests from this extension.
        </p>
      </div>
      
      <div className="flex items-center space-x-2 pt-2">
        <Switch id="sort-routing" />
        <Label htmlFor="sort-routing" className="cursor-pointer">
          Sort underlying provider routing
        </Label>
      </div>
      
      <div className="pt-2">
        <Label htmlFor="model-select">Model</Label>
        <Select defaultValue="claude-3.7-sonnet">
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder="Select Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="claude-3.7-sonnet">anthropic/claude-3.7-sonnet</SelectItem>
            <SelectItem value="gpt-4o">openai/gpt-4o</SelectItem>
            <SelectItem value="claude-3-opus">anthropic/claude-3-opus</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2 pt-2">
        <Switch id="extended-thinking" />
        <Label htmlFor="extended-thinking" className="cursor-pointer">
          Enable extended thinking
        </Label>
      </div>
      
      <div className="pt-2 text-sm">
        <p>Claude 3.7 Sonnet is an advanced large language model with improved reasoning, coding, and problem-solving capabilities.</p>
        <p className="text-blue-500 cursor-pointer">See more</p>
        <div className="space-y-1 mt-2">
          <p>✓ Supports images</p>
          <p>✓ Supports browser use</p>
          <p>✓ Supports prompt caching</p>
        </div>
      </div>
    </div>
  );
}; 