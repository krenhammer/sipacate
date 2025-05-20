import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { logger as defaultLogger } from '../../utils/logger';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
    defaultLogger.error('OPENROUTER_API_KEY is not set in environment variables.');
  throw new Error('Missing OpenRouter API key');
}


export async function POST(request: NextRequest) {
    try {
      const session = await auth.api.getSession(request)
      
      if (!session) {
        return new NextResponse(
          JSON.stringify({ error: "Not authenticated" }),
          { status: 401 }
        )
      }
      
      const body = await request.json()
      
      try {
        const openrouter = createOpenRouter({ apiKey: OPENROUTER_API_KEY });
        const response = await generateText({
          model: openrouter('google/gemini-2.5-flash-preview'), // Consider more capable models for complex analysis if needed
          prompt: prompt()!,
        });
        console.info('LLM call complete. Parsing response...');
        console.debug('Raw LLM response (first 2000 chars):', response.text.slice(0, 2000));
    
        const jsonStart = response.text.indexOf('{');
        const jsonEnd = response.text.lastIndexOf('}');
        if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
            console.error('LLM response does not appear to contain a valid JSON object.', {text: response.text});
          throw new Error('LLM response does not contain valid JSON (delimiters not found).');
        }
        const jsonString = response.text.slice(jsonStart, jsonEnd + 1);
        
        let data: string;
        try {
            data = JSON.parse(jsonString);
        } catch(parseError) {
            console.error('Failed to parse JSON from LLM response:', parseError, {jsonString});
            throw new Error('Failed to parse JSON from LLM response.');
        }
      
      return NextResponse.json(data)

    } catch (error) {
      console.error("Error creating response:", error)
      return new NextResponse(
        JSON.stringify({ error: "Failed to create respons" }),
        { status: 500 }
      )
    }
  }