import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/database/db";
import { planTemplates, planSteps } from "@/database/schema";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";
import { generateId } from "@/lib/utils";

// Schema for creating a plan step
const createPlanStepSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

// Schema for updating a plan step
const updatePlanStepSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
});

// GET all steps for a specific plan template
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user's session
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    const userId = session.user.id;
    const templateId = params.id;
    
    // Check if the template exists
    const template = await db.query.planTemplates.findFirst({
      where: eq(planTemplates.id, templateId),
    });
    
    if (!template) {
      return new NextResponse(
        JSON.stringify({ error: "Template not found" }),
        { status: 404 }
      );
    }
    
    // Check if the user has access to the template
    if (template.createdById !== userId && 
        (!session.activeOrganizationId || 
          template.organizationId !== session.activeOrganizationId)) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }
    
    // Get all steps for the template
    const steps = await db.query.planSteps.findMany({
      where: eq(planSteps.planTemplateId, templateId),
      orderBy: [asc(planSteps.createdAt)],
      with: {
        planStepItems: {
          with: {
            planItem: true
          }
        }
      }
    });
    
    return NextResponse.json({ steps });
  } catch (error) {
    console.error("Error fetching plan steps:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to fetch plan steps", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}

// POST create a new plan step
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user's session
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    const userId = session.user.id;
    const templateId = params.id;
    
    // Check if the template exists
    const template = await db.query.planTemplates.findFirst({
      where: eq(planTemplates.id, templateId),
    });
    
    if (!template) {
      return new NextResponse(
        JSON.stringify({ error: "Template not found" }),
        { status: 404 }
      );
    }
    
    // Check if the user has access to the template
    if (template.createdById !== userId && 
        (!session.activeOrganizationId || 
          template.organizationId !== session.activeOrganizationId)) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Validate the request body
    const result = createPlanStepSchema.safeParse(body);
    
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Invalid request body", 
          details: result.error.format() 
        }),
        { status: 400 }
      );
    }
    
    const { title, description } = result.data;
    
    // Create a new plan step
    const [newStep] = await db.insert(planSteps).values({
      id: generateId(),
      title,
      description,
      planTemplateId: templateId,
      createdById: userId,
      organizationId: template.organizationId,
    }).returning();
    
    return NextResponse.json({ step: newStep }, { status: 201 });
  } catch (error) {
    console.error("Error creating plan step:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to create plan step", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}

// PUT update a plan step
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const templateId = params.id;
    
    // Parse the request body
    const body = await request.json();
    
    if (!body.id) {
      return new NextResponse(
        JSON.stringify({ error: "Step ID is required" }),
        { status: 400 }
      );
    }
    
    // Validate the request body
    const result = updatePlanStepSchema.safeParse(body);
    
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Invalid request body", 
          details: result.error.format() 
        }),
        { status: 400 }
      );
    }
    
    // Check if the step exists and belongs to the template
    const existingStep = await db.query.planSteps.findFirst({
      where: and(
        eq(planSteps.id, body.id),
        eq(planSteps.planTemplateId, templateId)
      ),
    });
    
    if (!existingStep) {
      return new NextResponse(
        JSON.stringify({ error: "Step not found" }),
        { status: 404 }
      );
    }
    
    // Check if the user has access to the step
    if (existingStep.createdById !== userId && 
        (!session.user.activeOrganizationId || 
          existingStep.organizationId !== session.user.activeOrganizationId)) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }
    
    // Update the step
    const [updatedStep] = await db.update(planSteps)
      .set({
        ...result.data,
        updatedAt: new Date(),
      })
      .where(eq(planSteps.id, body.id))
      .returning();
    
    return NextResponse.json({ step: updatedStep });
  } catch (error) {
    console.error("Error updating plan step:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to update plan step", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}

// DELETE a plan step
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const templateId = params.id;
    
    // Get the step ID from the URL
    const url = new URL(request.url);
    const stepId = url.searchParams.get("stepId");
    
    if (!stepId) {
      return new NextResponse(
        JSON.stringify({ error: "Step ID is required" }),
        { status: 400 }
      );
    }
    
    // Check if the step exists and belongs to the template
    const existingStep = await db.query.planSteps.findFirst({
      where: and(
        eq(planSteps.id, stepId),
        eq(planSteps.planTemplateId, templateId)
      ),
    });
    
    if (!existingStep) {
      return new NextResponse(
        JSON.stringify({ error: "Step not found" }),
        { status: 404 }
      );
    }
    
    // Check if the user has access to the step
    if (existingStep.createdById !== userId && 
        (!session.user.activeOrganizationId || 
          existingStep.organizationId !== session.user.activeOrganizationId)) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }
    
    // Delete the step (cascade will delete related items)
    await db.delete(planSteps)
      .where(eq(planSteps.id, stepId));
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting plan step:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to delete plan step", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
} 