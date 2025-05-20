import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import './tiptap-editor.css';

export interface TiptapMarkdownEditorProps {
  content: string;
  onChange?: (content: string) => void;
  className?: string;
}

export interface TiptapMarkdownEditorRef {
  setContent: (content: string) => void;
  getContent: () => string;
}

export const TiptapMarkdownEditor = forwardRef<TiptapMarkdownEditorRef, TiptapMarkdownEditorProps>(
  ({ content, onChange, className }, ref) => {
    const [initialContent, setInitialContent] = useState(content || '');

    const editor = useEditor({
      extensions: [
        StarterKit,
        Markdown.configure({
          transformPastedText: true,
          transformCopiedText: true,
          breaks: true,
        }),
      ],
      content: initialContent,
      onUpdate: ({ editor }) => {
        const markdown = editor.storage.markdown.getMarkdown();
        onChange?.(markdown);
      },
      editorProps: {
        attributes: {
          class: 'tiptap',
        },
      },
      autofocus: 'end',
      immediatelyRender: true,
    });

    useEffect(() => {
      if (editor && content !== undefined) {
        const currentContent = editor.storage.markdown.getMarkdown();
        if (content !== currentContent) {
          editor.commands.setContent(content, false, { preserveWhitespace: 'full' });
        }
      }
    }, [content, editor]);

    useImperativeHandle(ref, () => ({
      setContent: (newContent: string) => {
        if (editor) {
          editor.commands.setContent(newContent, false, { preserveWhitespace: 'full' });
        } else {
          setInitialContent(newContent);
        }
      },
      getContent: () => {
        if (editor) {
          return editor.storage.markdown.getMarkdown();
        }
        return initialContent;
      },
    }));

    if (!editor) {
      return <div className={className}>Loading editor...</div>;
    }

    return (
      <div className={className}>
        <EditorContent editor={editor} />
      </div>
    );
  }
);

TiptapMarkdownEditor.displayName = 'TiptapMarkdownEditor'; 