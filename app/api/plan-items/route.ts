import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/database/db";
import { planItems, planStepItems, planSteps } from "@/database/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { generateId } from "@/lib/utils";

// Schema for creating a plan item
const createPlanItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["List", "Document"]),
  instructions: z.string().optional(),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().optional(),
  planStepId: z.string().optional(), // Optional when creating standalone items
  order: z.number().optional(), // For ordering in a step
  organizationId: z.string().optional(),
});

// Schema for updating a plan item
const updatePlanItemSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  type: z.enum(["List", "Document"]).optional(),
  instructions: z.string().optional(),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().optional(),
});

// Schema for adding an item to a step
const addToStepSchema = z.object({
  planItemId: z.string(),
  planStepId: z.string(),
  order: z.number().optional(),
});

// GET all plan items for the current user or organization
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
    
    let items;
    
    if (organizationId) {
      // Get items for the organization
      items = await db.query.planItems.findMany({
        where: eq(planItems.organizationId, organizationId),
      });
    } else {
      // Get items for the user only
      items = await db.query.planItems.findMany({
        where: eq(planItems.createdById, userId),
      });
    }
    
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching plan items:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to fetch plan items", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}

// POST create a new plan item
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
    const result = createPlanItemSchema.safeParse(body);
    
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Invalid request body", 
          details: result.error.format() 
        }),
        { status: 400 }
      );
    }
    
    const { 
      title, 
      description, 
      type, 
      instructions, 
      systemPrompt, 
      userPrompt, 
      planStepId, 
      order, 
      organizationId 
    } = result.data;
    
    // Create transaction
    const itemId = generateId();
    
    // Create a new plan item
    const [newItem] = await db.insert(planItems).values({
      id: itemId,
      title,
      description,
      type,
      instructions,
      systemPrompt,
      userPrompt,
      createdById: userId,
      organizationId: organizationId || null,
    }).returning();
    
    // If planStepId is provided, create a relationship
    if (planStepId) {
      // Check if the step exists
      const step = await db.query.planSteps.findFirst({
        where: eq(planSteps.id, planStepId),
      });
      
      if (!step) {
        return new NextResponse(
          JSON.stringify({ error: "Step not found" }),
          { status: 404 }
        );
      }
      
      // Check permission
      if (step.createdById !== userId && 
          (!session.user.activeOrganizationId || 
            step.organizationId !== session.user.activeOrganizationId)) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 403 }
        );
      }
      
      // Get max order if not provided
      let itemOrder = order;
      if (itemOrder === undefined) {
        const existingItems = await db.query.planStepItems.findMany({
          where: eq(planStepItems.planStepId, planStepId),
        });
        
        itemOrder = existingItems.length > 0 
          ? Math.max(...existingItems.map(item => item.order)) + 1 
          : 0;
      }
      
      // Create relationship
      await db.insert(planStepItems).values({
        id: generateId(),
        planStepId,
        planItemId: itemId,
        order: itemOrder,
      });
    }
    
    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Error creating plan item:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to create plan item", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}

// PUT update a plan item
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
        JSON.stringify({ error: "Item ID is required" }),
        { status: 400 }
      );
    }
    
    // Validate the request body
    const result = updatePlanItemSchema.safeParse(body);
    
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Invalid request body", 
          details: result.error.format() 
        }),
        { status: 400 }
      );
    }
    
    // Check if the item exists and belongs to the user
    const existingItem = await db.query.planItems.findFirst({
      where: eq(planItems.id, body.id),
    });
    
    if (!existingItem) {
      return new NextResponse(
        JSON.stringify({ error: "Item not found" }),
        { status: 404 }
      );
    }
    
    // Check if the user has access to the item
    if (existingItem.createdById !== userId && 
        (!session.user.activeOrganizationId || 
          existingItem.organizationId !== session.user.activeOrganizationId)) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }
    
    // Update the item
    const [updatedItem] = await db.update(planItems)
      .set({
        ...result.data,
        updatedAt: new Date(),
      })
      .where(eq(planItems.id, body.id))
      .returning();
    
    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error("Error updating plan item:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to update plan item", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}

// DELETE a plan item
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
    
    // Get the item ID from the URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: "Item ID is required" }),
        { status: 400 }
      );
    }
    
    // Check if the item exists
    const existingItem = await db.query.planItems.findFirst({
      where: eq(planItems.id, id),
    });
    
    if (!existingItem) {
      return new NextResponse(
        JSON.stringify({ error: "Item not found" }),
        { status: 404 }
      );
    }
    
    // Check if the user has access to the item
    if (existingItem.createdById !== userId && 
        (!session.user.activeOrganizationId || 
          existingItem.organizationId !== session.user.activeOrganizationId)) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }
    
    // Delete all relationships
    await db.delete(planStepItems)
      .where(eq(planStepItems.planItemId, id));
    
    // Delete the item
    await db.delete(planItems)
      .where(eq(planItems.id, id));
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting plan item:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to delete plan item", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}

// POST to add an item to a step
export async function PATCH(request: NextRequest) {
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
    const result = addToStepSchema.safeParse(body);
    
    if (!result.success) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Invalid request body", 
          details: result.error.format() 
        }),
        { status: 400 }
      );
    }
    
    const { planItemId, planStepId, order } = result.data;
    
    // Check if the item exists
    const item = await db.query.planItems.findFirst({
      where: eq(planItems.id, planItemId),
    });
    
    if (!item) {
      return new NextResponse(
        JSON.stringify({ error: "Item not found" }),
        { status: 404 }
      );
    }
    
    // Check if the step exists
    const step = await db.query.planSteps.findFirst({
      where: eq(planSteps.id, planStepId),
    });
    
    if (!step) {
      return new NextResponse(
        JSON.stringify({ error: "Step not found" }),
        { status: 404 }
      );
    }
    
    // Check permission for both item and step
    if ((item.createdById !== userId && 
        (!session.user.activeOrganizationId || 
          item.organizationId !== session.user.activeOrganizationId)) ||
        (step.createdById !== userId && 
         (!session.user.activeOrganizationId || 
           step.organizationId !== session.user.activeOrganizationId))) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }
    
    // Check if the item is already in the step
    const existingRelationship = await db.query.planStepItems.findFirst({
      where: and(
        eq(planStepItems.planItemId, planItemId),
        eq(planStepItems.planStepId, planStepId)
      ),
    });
    
    // Get max order if not provided
    let itemOrder = order;
    if (itemOrder === undefined) {
      const existingItems = await db.query.planStepItems.findMany({
        where: eq(planStepItems.planStepId, planStepId),
      });
      
      itemOrder = existingItems.length > 0 
        ? Math.max(...existingItems.map(item => item.order)) + 1 
        : 0;
    }
    
    if (existingRelationship) {
      // Update the order
      await db.update(planStepItems)
        .set({ order: itemOrder })
        .where(eq(planStepItems.id, existingRelationship.id));
    } else {
      // Create relationship
      await db.insert(planStepItems).values({
        id: generateId(),
        planStepId,
        planItemId,
        order: itemOrder,
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding item to step:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to add item to step", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
} 