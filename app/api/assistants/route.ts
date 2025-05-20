import { NextRequest, NextResponse } from "next/server";
import { createId } from "@paralleldrive/cuid2";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { db, getDb } from "@/database/db";
import { assistants, assistantFiles } from "@/database/schema";
import { createAssistantSchema, updateAssistantSchema } from "@/app/assistant/types";

// GET all assistants
export async function GET(req: NextRequest) {
  try {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    
    if (!sessionResult) {
      // Get debug info
      const headerEntries = Array.from(req.headers.entries());
      const headers = Object.fromEntries(headerEntries);
      
      // Get cookies for debugging (but mask values)
      const cookies = req.cookies.getAll().map(cookie => ({
        name: cookie.name,
        // Only show first few chars of value for security
        value: cookie.value.substring(0, 4) + '...',
      }));
      
      console.warn('Authentication failed - session info:', { 
        headers,
        cookieNames: cookies.map(c => c.name),
        url: req.url
      });
      
      return new NextResponse(
        JSON.stringify({ 
          error: "Not authenticated", 
          debug: {
            hasHeaders: Object.keys(headers).length > 0,
            hasCookies: cookies.length > 0,
            cookieNames: cookies.map(c => c.name)
          }
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const userId = sessionResult.user.id;
    const organizationId = sessionResult.session.activeOrganizationId;
    const database = getDb();
    
    // Query database for assistants, either organization-specific or user-specific
    const userAssistants = await database.query.assistants.findMany({
      where: organizationId 
        ? eq(assistants.organizationId, organizationId) 
        : eq(assistants.createdById, userId),
      with: {
        files: true
      }
    });

    return NextResponse.json({ data: userAssistants });
  } catch (error) {
    console.error("Error fetching assistants:", error);
    return NextResponse.json({ error: "Failed to fetch assistants" }, { status: 500 });
  }
}

// POST create a new assistant
export async function POST(req: NextRequest) {
  try {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    
    if (!sessionResult) {
      // Get debug info
      const headerEntries = Array.from(req.headers.entries());
      const headers = Object.fromEntries(headerEntries);
      
      // Get cookies for debugging
      const cookies = req.cookies.getAll().map(cookie => ({
        name: cookie.name,
        value: cookie.value.substring(0, 4) + '...',
      }));
      
      console.warn('Authentication failed - session info:', { 
        headers,
        cookieNames: cookies.map(c => c.name),
        url: req.url
      });
      
      return new NextResponse(
        JSON.stringify({ 
          error: "Not authenticated", 
          debug: {
            hasHeaders: Object.keys(headers).length > 0,
            hasCookies: cookies.length > 0,
            cookieNames: cookies.map(c => c.name)
          }
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const userId = sessionResult.user.id;
    const organizationId = sessionResult.session.activeOrganizationId;

    const body = await req.json();
    const validatedData = createAssistantSchema.parse(body);

    const assistantId = createId();
    const database = getDb();
    
    // Create the assistant
    await database.insert(assistants).values({
      id: assistantId,
      name: validatedData.name,
      description: validatedData.description,
      instructions: validatedData.instructions,
      knowledge: validatedData.knowledge,
      organizationId: organizationId || null,
      createdById: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Create files if provided
    if (validatedData.files && validatedData.files.length > 0) {
      const filesToInsert = validatedData.files.map(file => ({
        id: createId(),
        assistantId: assistantId,
        content: file.content,
        filename: file.filename,
        fileType: file.fileType,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      await database.insert(assistantFiles).values(filesToInsert);
    }
    
    // Fetch the newly created assistant with its files
    const newAssistant = await database.query.assistants.findFirst({
      where: eq(assistants.id, assistantId),
      with: {
        files: true
      }
    });

    return NextResponse.json({ data: newAssistant }, { status: 201 });
  } catch (error) {
    console.error("Error creating assistant:", error);
    return NextResponse.json({ error: "Failed to create assistant" }, { status: 500 });
  }
}

// PUT update an existing assistant
export async function PUT(req: NextRequest) {
  try {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    
    if (!sessionResult) {
      // Get debug info
      const headerEntries = Array.from(req.headers.entries());
      const headers = Object.fromEntries(headerEntries);
      
      // Get cookies for debugging
      const cookies = req.cookies.getAll().map(cookie => ({
        name: cookie.name,
        value: cookie.value.substring(0, 4) + '...',
      }));
      
      console.warn('Authentication failed - session info:', { 
        headers,
        cookieNames: cookies.map(c => c.name),
        url: req.url
      });
      
      return new NextResponse(
        JSON.stringify({ 
          error: "Not authenticated", 
          debug: {
            hasHeaders: Object.keys(headers).length > 0,
            hasCookies: cookies.length > 0,
            cookieNames: cookies.map(c => c.name)
          }
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const userId = sessionResult.user.id;
    const organizationId = sessionResult.session.activeOrganizationId;

    const body = await req.json();
    const validatedData = updateAssistantSchema.parse(body);
    const database = getDb();
    
    // Check if assistant exists and belongs to the user/org
    const existingAssistant = await database.query.assistants.findFirst({
      where: eq(assistants.id, validatedData.id as string),
    });
    
    if (!existingAssistant) {
      return NextResponse.json({ error: "Assistant not found" }, { status: 404 });
    }
    
    if (existingAssistant.createdById !== userId && 
        existingAssistant.organizationId !== organizationId) {
      return NextResponse.json({ error: "Not authorized to update this assistant" }, { status: 403 });
    }
    
    // Update assistant
    await database.update(assistants)
      .set({
        name: validatedData.name,
        description: validatedData.description,
        instructions: validatedData.instructions,
        knowledge: validatedData.knowledge,
        updatedAt: new Date()
      })
      .where(eq(assistants.id, validatedData.id as string));
    
    // Handle files - delete existing and replace with new ones if provided
    if (validatedData.files) {
      // Delete existing files
      await database.delete(assistantFiles)
        .where(eq(assistantFiles.assistantId, validatedData.id as string));
      
      // Insert new files
      if (validatedData.files.length > 0) {
        const filesToInsert = validatedData.files.map(file => ({
          id: createId(),
          assistantId: validatedData.id as string,
          content: file.content,
          filename: file.filename,
          fileType: file.fileType,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        
        await database.insert(assistantFiles).values(filesToInsert);
      }
    }
    
    // Fetch the updated assistant with its files
    const updatedAssistant = await database.query.assistants.findFirst({
      where: eq(assistants.id, validatedData.id as string),
      with: {
        files: true
      }
    });

    return NextResponse.json({ data: updatedAssistant });
  } catch (error) {
    console.error("Error updating assistant:", error);
    return NextResponse.json({ error: "Failed to update assistant" }, { status: 500 });
  }
}

// DELETE an assistant
export async function DELETE(req: NextRequest) {
  try {
    const sessionResult = await auth.api.getSession({
      headers: req.headers,
    });
    
    if (!sessionResult) {
      // Get debug info
      const headerEntries = Array.from(req.headers.entries());
      const headers = Object.fromEntries(headerEntries);
      
      // Get cookies for debugging
      const cookies = req.cookies.getAll().map(cookie => ({
        name: cookie.name,
        value: cookie.value.substring(0, 4) + '...',
      }));
      
      console.warn('Authentication failed - session info:', { 
        headers,
        cookieNames: cookies.map(c => c.name),
        url: req.url
      });
      
      return new NextResponse(
        JSON.stringify({ 
          error: "Not authenticated", 
          debug: {
            hasHeaders: Object.keys(headers).length > 0,
            hasCookies: cookies.length > 0,
            cookieNames: cookies.map(c => c.name)
          }
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    const userId = sessionResult.user.id;
    const organizationId = sessionResult.session.activeOrganizationId;
    
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const database = getDb();
    
    if (!id) {
      return NextResponse.json({ error: "Assistant ID is required" }, { status: 400 });
    }
    
    // Check if assistant exists and belongs to the user/org
    const existingAssistant = await database.query.assistants.findFirst({
      where: eq(assistants.id, id),
    });
    
    if (!existingAssistant) {
      return NextResponse.json({ error: "Assistant not found" }, { status: 404 });
    }
    
    if (existingAssistant.createdById !== userId && 
        existingAssistant.organizationId !== organizationId) {
      return NextResponse.json({ error: "Not authorized to delete this assistant" }, { status: 403 });
    }
    
    // Delete files first (cascade should handle this, but being explicit)
    await database.delete(assistantFiles)
      .where(eq(assistantFiles.assistantId, id));
    
    // Delete the assistant
    await database.delete(assistants)
      .where(eq(assistants.id, id));
    
    return NextResponse.json({ data: { id, deleted: true } });
  } catch (error) {
    console.error("Error deleting assistant:", error);
    return NextResponse.json({ error: "Failed to delete assistant" }, { status: 500 });
  }
} 