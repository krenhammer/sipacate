"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface FallbackEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

export function FallbackEditor({ content, onChange, className }: FallbackEditorProps) {
  return (
    <Textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      rows={10}
      placeholder="Enter content here..."
    />
  );
} 