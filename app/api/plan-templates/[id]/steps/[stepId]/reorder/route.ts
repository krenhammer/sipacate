import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/database/db";
import { planSteps, planStepItems } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

// Schema for reordering items
const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    order: z.number()
  }))
});

// POST reorder items in a step
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string, stepId: string } }
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
    const stepId = params.stepId;
    
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
    
    // Parse the request body
    const body = await request.json();
    
    // Validate the request body
    const result = reorderSchema.safeParse(body);
    
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Invalid request body", 
          details: result.error.format() 
        }),
        { status: 400 }
      );
    }
    
    const { items } = result.data;
    
    // Update the order of each item
    for (const item of items) {
      await db.update(planStepItems)
        .set({ order: item.order })
        .where(
          and(
            eq(planStepItems.id, item.id),
            eq(planStepItems.planStepId, stepId)
          )
        );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering items:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to reorder items", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
} 