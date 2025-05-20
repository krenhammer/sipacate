export async function docxToMarkdown(input: File | ArrayBuffer): Promise<string> {
    // Import mammoth and turndown dynamically to ensure compatibility in browser environments
    const mammoth = (await import('mammoth')).default;
    const TurndownService = (await import('turndown')).default;
  
    try {
      let arrayBuffer: ArrayBuffer;
  
      // Handle File input by reading it as ArrayBuffer
      if (input instanceof File) {
        if (!input.name.endsWith('.docx')) {
          throw new Error('Input must be a .docx file');
        }
        arrayBuffer = await input.arrayBuffer();
      } else {
        arrayBuffer = input;
      }
  
      // Convert DOCX to HTML using mammoth
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
  
      // Convert HTML to Markdown using turndown
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
      });
      const markdown = turndownService.turndown(html);
  
      return markdown;
    } catch (error) {
      throw new Error(`Failed to convert DOCX to Markdown: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }