import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { members } from "@/database/schema"
import { and, eq } from "drizzle-orm"

// Add a user to an organization
export async function POST(request: NextRequest) {
  try {
    // Get the current user's session
    const session = await auth.api.getSession(request)
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const { userId, organizationId, role } = body
    
    if (!userId || !organizationId || !role) {
      return new NextResponse(
        JSON.stringify({ error: "User ID, organization ID, and role are required" }),
        { status: 400 }
      )
    }
    
    // Verify current user is authorized
    // For security, ensure the user is either:
    // 1. Adding themselves (from accepting an invitation)
    // 2. An admin
    const isAddingSelf = userId === session.user.id
    const isAdmin = session.user.role === "admin"
    
    if (!isAddingSelf && !isAdmin) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized to add users" }),
        { status: 403 }
      )
    }
    
    // Check if the user is already a member of the organization
    const existingMember = await db?.query.members.findFirst({
      where: and(
        eq(members.userId, userId),
        eq(members.organizationId, organizationId)
      )
    })
    
    if (existingMember) {
      console.log(`User ${userId} is already a member of organization ${organizationId}`);
      return NextResponse.json({ 
        success: true, 
        message: "User is already a member of this organization", 
        existingMember: true
      });
    }
    
    // Generate a unique ID for the member
    const memberId = crypto.randomUUID()
    const now = new Date()
    
    // Log the values we're about to insert
    console.log(`Creating member with values:`, {
      id: memberId,
      userId,
      organizationId,
      role,
      createdAt: now,
      updatedAt: now
    });
    
    try {
      // Add the user as a member of the organization
      await db?.insert(members).values({
        id: memberId,
        userId,
        organizationId,
        role,
        createdAt: now,
        updatedAt: now
      });
      
      console.log(`Successfully added user ${userId} to organization ${organizationId} with role ${role}`);
    } catch (dbError) {
      console.error("Database error adding member:", dbError);
      return new NextResponse(
        JSON.stringify({ 
          error: "Database error when adding member", 
          details: dbError instanceof Error ? dbError.message : String(dbError)
        }),
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: "User added to organization successfully",
      memberId
    })
  } catch (error) {
    console.error("Error adding user to organization:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to add user to organization", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
} 