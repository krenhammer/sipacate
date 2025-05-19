import React, { useCallback, useRef, useState } from 'react';
import { ImageIcon, X, Paperclip } from 'lucide-react';
import { 
  MessagePrimitive, 
  ComposerPrimitive
} from '@assistant-ui/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Properly typed file attachment interface
interface FileAttachment {
  id: string;
  file: File;
  type: string;
  name?: string;
}

// Message attachment interface
interface MessageAttachment {
  id: string;
  type: string;
  content: string;
  alt?: string;
}

// Component to display attachments in the composer (before sending)
export const ComposerAttachments: React.FC<{
  attachments?: FileAttachment[];
  removeAttachment?: (id: string) => void;
}> = React.memo(({ attachments = [], removeAttachment }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap pb-2 pl-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="relative h-20 w-20 rounded overflow-hidden border border-border bg-muted"
        >
          {attachment.type.startsWith('image/') ? (
            <img
              src={URL.createObjectURL(attachment.file)}
              alt="Attachment preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          {removeAttachment && (
            <button
              onClick={() => removeAttachment(attachment.id)}
              className="absolute right-1 top-1 rounded-full bg-background/80 p-1 hover:bg-background"
              aria-label="Remove attachment"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
});

// Simple paperclip button using ComposerPrimitive.AddAttachment
export const ComposerAddAttachment: React.FC = React.memo(() => {
  return (
    <ComposerPrimitive.AddAttachment asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-muted my-2.5"
        aria-label="Attach file"
      >
        <Paperclip className="h-5 w-5 text-muted-foreground" />
      </Button>
    </ComposerPrimitive.AddAttachment>
  );
});

// Component to display attachments in user messages (after sending)
export const UserMessageAttachments: React.FC<{
  attachments: Array<any>; // Use 'any' to be compatible with assistant-ui's attachment type
}> = React.memo(({ attachments = [] }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {attachments.map((attachment, idx) => {
        // Handle image attachments
        if (attachment.type === 'image' || (attachment.image)) {
          return (
            <div
              key={attachment.id || `img-${idx}`}
              className={cn(
                "relative rounded-lg overflow-hidden border border-border",
                "max-w-[200px] max-h-[200px]"
              )}
            >
              <img
                src={attachment.image || attachment.content}
                alt={attachment.alt || "Uploaded image"}
                className="object-contain max-w-full max-h-full"
              />
            </div>
          );
        }
        
        // Handle text attachments or unknown types
        return (
          <div
            key={attachment.id || `txt-${idx}`}
            className="p-2 rounded-lg bg-muted text-muted-foreground text-sm"
          >
            {attachment.type === 'text' 
              ? (attachment.text || attachment.content)
              : `Attachment: ${attachment.id || idx}`}
          </div>
        );
      })}
    </div>
  );
});

// Attachment support for assistant messages
export const AssistantMessageAttachments: React.FC<{
  attachments: Array<any>; // Use 'any' to be compatible with assistant-ui's attachment type
}> = React.memo(({ attachments = [] }) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {attachments.map((attachment, idx) => {
        // Handle image attachments
        if (attachment.type === 'image' || (attachment.image)) {
          return (
            <div
              key={attachment.id || `img-${idx}`}
              className={cn(
                "relative rounded-lg overflow-hidden border border-border",
                "max-w-[200px] max-h-[200px]"
              )}
            >
              <img
                src={attachment.image || attachment.content}
                alt={attachment.alt || "Assistant image"}
                className="object-contain max-w-full max-h-full"
              />
            </div>
          );
        }
        
        return (
          <div
            key={attachment.id || `txt-${idx}`}
            className="p-2 rounded-lg bg-muted text-muted-foreground text-sm"
          >
            {attachment.type === 'text' 
              ? (attachment.text || attachment.content)
              : `Attachment: ${attachment.id || idx}`}
          </div>
        );
      })}
    </div>
  );
}); 