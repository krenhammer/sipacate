import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { members, users } from "@/database/schema"
import { eq, and } from "drizzle-orm"

// List members for an organization
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get("organizationId")
    
    if (!organizationId) {
      return new NextResponse(
        JSON.stringify({ error: "Organization ID is required" }),
        { status: 400 }
      )
    }
    
    // Verify admin access
    const session = await auth.api.getSession(request)
    
    // Dev-only: bypass auth for testing purposes
    const isDevelopment = process.env.NODE_ENV === "development"
    const hasAccess = isDevelopment || session?.user?.role === "admin"
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      )
    }
    
    if (!hasAccess) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403 }
      )
    }

    // Get all members for this organization from the database
    const organizationMembers = await db?.query.members.findMany({
      where: eq(members.organizationId, organizationId)
    }) || []
    
    // Map the results to the expected format
    const mappedMembers = await Promise.all(organizationMembers.map(async member => {
      // Get user data separately
      const user = await db?.query.users.findFirst({
        where: eq(users.id, member.userId)
      })
      
      return {
        memberId: member.id,
        userId: member.userId,
        name: user?.name || null,
        email: user?.email || 'unknown',
        image: user?.image || null,
        role: member.role,
        joinedAt: member.createdAt.toISOString()
      }
    }))
    
    return NextResponse.json({
      members: mappedMembers
    })
  } catch (error) {
    console.error("Error fetching members:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to fetch members", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
}

// Add a member to an organization
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { email, role, organizationId } = body
    
    if (!email || !role || !organizationId) {
      return new NextResponse(
        JSON.stringify({ error: "Email, role, and organization ID are required" }),
        { status: 400 }
      )
    }
    
    // Verify admin access
    const session = await auth.api.getSession(request)
    
    // Dev-only: bypass auth for testing purposes
    const isDevelopment = process.env.NODE_ENV === "development"
    const hasAccess = isDevelopment || session?.user?.role === "admin"
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      )
    }
    
    if (!hasAccess) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403 }
      )
    }
    
    // First, check if the user exists
    const user = await db?.query.users.findFirst({
      where: eq(users.email, email)
    })
    
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "User not found with this email" }),
        { status: 404 }
      )
    }
    
    // Check if member already exists in organization
    const existingMember = await db?.query.members.findFirst({
      where: and(
        eq(members.userId, user.id),
        eq(members.organizationId, organizationId)
      )
    })
    
    if (existingMember) {
      return new NextResponse(
        JSON.stringify({ error: "User is already a member of this organization" }),
        { status: 400 }
      )
    }
    
    // Create member
    const now = new Date()
    const memberId = crypto.randomUUID()
    
    const [newMember] = await db?.insert(members).values({
      id: memberId,
      userId: user.id,
      organizationId,
      role,
      createdAt: now,
      updatedAt: now
    }).returning() || []
    
    if (!newMember) {
      return new NextResponse(
        JSON.stringify({ error: "Failed to create member" }),
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      member: {
        memberId: newMember.id,
        userId: newMember.userId,
        name: user.name,
        email: user.email,
        image: user.image,
        role: newMember.role,
        joinedAt: newMember.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error("Error adding member:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to add member", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
}

// Update a member's role
export async function PUT(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { memberId, role, organizationId } = body
    
    if (!memberId || !role || !organizationId) {
      return new NextResponse(
        JSON.stringify({ error: "Member ID, role, and organization ID are required" }),
        { status: 400 }
      )
    }
    
    // Verify admin access
    const session = await auth.api.getSession(request)
    
    // Dev-only: bypass auth for testing purposes
    const isDevelopment = process.env.NODE_ENV === "development"
    const hasAccess = isDevelopment || session?.user?.role === "admin"
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      )
    }
    
    if (!hasAccess) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403 }
      )
    }
    
    // Update member in database
    const [updatedMember] = await db?.update(members)
      .set({ 
        role, 
        updatedAt: new Date()
      })
      .where(
        and(
          eq(members.id, memberId),
          eq(members.organizationId, organizationId)
        )
      )
      .returning() || []
    
    if (!updatedMember) {
      return new NextResponse(
        JSON.stringify({ error: "Member not found" }),
        { status: 404 }
      )
    }
    
    // Get user info
    const user = await db?.query.users.findFirst({
      where: eq(users.id, updatedMember.userId)
    })
    
    return NextResponse.json({ 
      success: true,
      member: {
        memberId: updatedMember.id,
        userId: updatedMember.userId,
        name: user?.name || null,
        email: user?.email || 'unknown',
        image: user?.image || null,
        role: updatedMember.role,
        joinedAt: updatedMember.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error("Error updating member role:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to update member role", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
}

// Remove a member from an organization
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get("id")
    const organizationId = searchParams.get("organizationId")
    
    if (!memberId || !organizationId) {
      return new NextResponse(
        JSON.stringify({ error: "Member ID and organization ID are required" }),
        { status: 400 }
      )
    }
    
    // Verify admin access
    const session = await auth.api.getSession(request)
    
    // Dev-only: bypass auth for testing purposes
    const isDevelopment = process.env.NODE_ENV === "development"
    const hasAccess = isDevelopment || session?.user?.role === "admin"
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      )
    }
    
    if (!hasAccess) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403 }
      )
    }
    
    // First verify the member exists
    const memberExists = await db?.query.members.findFirst({
      where: and(
        eq(members.id, memberId),
        eq(members.organizationId, organizationId)
      )
    })
    
    if (!memberExists) {
      return new NextResponse(
        JSON.stringify({ error: "Member not found" }),
        { status: 404 }
      )
    }
    
    // Delete the member
    await db?.delete(members)
      .where(
        and(
          eq(members.id, memberId),
          eq(members.organizationId, organizationId)
        )
      )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing member:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to remove member", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
} 