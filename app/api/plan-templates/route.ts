import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/database/db";
import { planTemplates, planSteps, planItems, planStepItems } from "@/database/schema";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";
import { generateId } from "@/lib/utils";

// Schema for creating a plan template
const createPlanTemplateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  organizationId: z.string().optional(),
});

// Schema for updating a plan template
const updatePlanTemplateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
});

// GET all plan templates for the current user or organization
export async function GET(request: NextRequest) {
  try {
    // Get the current user's session
    const session = await auth.api.getSession(request);
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const organizationId = session.user.activeOrganizationId;
    
    let templates;
    
    if (organizationId) {
      // Get templates for the organization
      templates = await db.query.planTemplates.findMany({
        where: eq(planTemplates.organizationId, organizationId),
        orderBy: [asc(planTemplates.title)],
        with: {
          steps: {
            orderBy: [asc(planSteps.createdAt)],
          }
        }
      });
    } else {
      // Get templates for the user only
      templates = await db.query.planTemplates.findMany({
        where: eq(planTemplates.createdById, userId),
        orderBy: [asc(planTemplates.title)],
        with: {
          steps: {
            orderBy: [asc(planSteps.createdAt)],
          }
        }
      });
    }
    
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching plan templates:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to fetch plan templates", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}

// POST create a new plan template
export async function POST(request: NextRequest) {
  try {
    // Get the current user's session
    const session = await auth.api.getSession(request);
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Parse the request body
    const body = await request.json();
    
    // Validate the request body
    const result = createPlanTemplateSchema.safeParse(body);
    
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Invalid request body", 
          details: result.error.format() 
        }),
        { status: 400 }
      );
    }
    
    const { title, description, organizationId } = result.data;
    
    // Create a new plan template
    const [newTemplate] = await db.insert(planTemplates).values({
      id: generateId(),
      title,
      description,
      createdById: userId,
      organizationId: organizationId || null,
    }).returning();
    
    return NextResponse.json({ template: newTemplate }, { status: 201 });
  } catch (error) {
    console.error("Error creating plan template:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to create plan template", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}

// PUT update a plan template
export async function PUT(request: NextRequest) {
  try {
    // Get the current user's session
    const session = await auth.api.getSession(request);
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Parse the request body
    const body = await request.json();
    
    if (!body.id) {
      return new NextResponse(
        JSON.stringify({ error: "Template ID is required" }),
        { status: 400 }
      );
    }
    
    // Validate the request body
    const result = updatePlanTemplateSchema.safeParse(body);
    
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Invalid request body", 
          details: result.error.format() 
        }),
        { status: 400 }
      );
    }
    
    // Check if the template exists and belongs to the user
    const existingTemplate = await db.query.planTemplates.findFirst({
      where: eq(planTemplates.id, body.id),
    });
    
    if (!existingTemplate) {
      return new NextResponse(
        JSON.stringify({ error: "Template not found" }),
        { status: 404 }
      );
    }
    
    // Check if the user owns the template or belongs to the organization
    if (existingTemplate.createdById !== userId && (!session.user.activeOrganizationId || existingTemplate.organizationId !== session.user.activeOrganizationId)) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }
    
    // Update the template
    const [updatedTemplate] = await db.update(planTemplates)
      .set({
        ...result.data,
        updatedAt: new Date(),
      })
      .where(eq(planTemplates.id, body.id))
      .returning();
    
    return NextResponse.json({ template: updatedTemplate });
  } catch (error) {
    console.error("Error updating plan template:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to update plan template", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}

// DELETE a plan template
export async function DELETE(request: NextRequest) {
  try {
    // Get the current user's session
    const session = await auth.api.getSession(request);
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get the template ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: "Template ID is required" }),
        { status: 400 }
      );
    }
    
    // Check if the template exists and belongs to the user
    const existingTemplate = await db.query.planTemplates.findFirst({
      where: eq(planTemplates.id, id),
    });
    
    if (!existingTemplate) {
      return new NextResponse(
        JSON.stringify({ error: "Template not found" }),
        { status: 404 }
      );
    }
    
    // Check if the user owns the template or belongs to the organization
    if (existingTemplate.createdById !== userId && (!session.user.activeOrganizationId || existingTemplate.organizationId !== session.user.activeOrganizationId)) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }
    
    // Delete the template (cascade will delete related steps and items)
    await db.delete(planTemplates)
      .where(eq(planTemplates.id, id));
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting plan template:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to delete plan template", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
} 