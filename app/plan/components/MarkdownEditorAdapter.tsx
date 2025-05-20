import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { TiptapMarkdownEditor, TiptapMarkdownEditorRef } from './TiptapMarkdownEditor';
import type { Marktion, ReactEditorRef } from 'marktion';

interface MarkdownEditorAdapterProps {
  content: string;
  onChange?: (editor: any) => void;
  className?: string;
  render?: 'WYSIWYG' | 'SOURCE';
}

// This adapter implements the same interface as ReactEditor from marktion
const MarkdownEditorAdapter = forwardRef<ReactEditorRef, MarkdownEditorAdapterProps>(
  ({ content, onChange, className, render }, ref) => {
    const editorRef = useRef<TiptapMarkdownEditorRef>(null);
    
    // Update content when it changes from props
    useEffect(() => {
      if (editorRef.current && content !== undefined) {
        editorRef.current.setContent(content);
      }
    }, [content]);
    
    // Create a mock Marktion instance with the necessary methods
    const createMockMarktionInstance = () => {
      return {
        getContent: () => editorRef.current?.getContent() || '',
        setContent: (newContent: string) => {
          if (editorRef.current) {
            editorRef.current.setContent(newContent);
          }
        }
      } as Marktion;
    };

    // Expose the same interface as ReactEditorRef
    useImperativeHandle(ref, () => ({
      editor: createMockMarktionInstance()
    }));

    // Handle content change and pass it to the onChange handler in the format expected by the original component
    const handleChange = (newContent: string) => {
      if (onChange) {
        onChange(createMockMarktionInstance());
      }
    };

    return (
      <TiptapMarkdownEditor
        ref={editorRef}
        content={content}
        onChange={handleChange}
        className={className}
      />
    );
  }
);

MarkdownEditorAdapter.displayName = 'MarkdownEditorAdapter';

export default MarkdownEditorAdapter; 