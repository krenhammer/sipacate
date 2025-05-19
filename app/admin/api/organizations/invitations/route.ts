import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { invitations } from "@/database/schema"
import { and, eq } from "drizzle-orm"

// List invitations for an organization
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

    // Get invitations from database
    const organizationInvitations = await db?.query.invitations.findMany({
      where: eq(invitations.organizationId, organizationId)
    }) || []
    
    return NextResponse.json({ invitations: organizationInvitations })
  } catch (error) {
    console.error("Error fetching invitations:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch invitations" }),
      { status: 500 }
    )
  }
}

// Send an invitation
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { email, role, organizationId } = body
    
    if (!email || !role || !organizationId) {
      return new NextResponse(
        JSON.stringify({ error: "Email, role, and organizationId are required" }),
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
    
    // Generate an invitation token and expiration date (e.g., 7 days from now)
    const invitationId = crypto.randomUUID()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    // Check if there's an existing invitation for this email in this organization
    const existingInvitation = await db?.query.invitations.findFirst({
      where: and(
        eq(invitations.email, email),
        eq(invitations.organizationId, organizationId),
        eq(invitations.status, "pending")
      )
    })
    
    if (existingInvitation) {
      return new NextResponse(
        JSON.stringify({ 
          error: "An invitation has already been sent to this email address" 
        }),
        { status: 400 }
      )
    }
    
    // Create invitation in database
    const [invitation] = await db?.insert(invitations).values({
      id: invitationId,
      email,
      role,
      organizationId,
      inviterId: session.user.id,
      inviterName: session.user.name || null,
      inviterEmail: session.user.email || null,
      status: "pending",
      expiresAt,
      createdAt: now,
      updatedAt: now
    }).returning() || []
    
    if (!invitation) {
      return new NextResponse(
        JSON.stringify({ error: "Failed to create invitation" }),
        { status: 500 }
      )
    }
    
    console.log("Created invitation:", invitation)
    
    // In a production app, you would send an email with the invitation link here
    
    return NextResponse.json({ 
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt.toISOString(),
      }
    })
  } catch (error) {
    console.error("Error creating invitation:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to create invitation",
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
}

// Delete/cancel an invitation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get("invitationId")
    const organizationId = searchParams.get("organizationId")
    
    if (!invitationId || !organizationId) {
      return new NextResponse(
        JSON.stringify({ error: "Invitation ID and Organization ID are required" }),
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

    // Check if invitation exists
    const invitation = await db?.query.invitations.findFirst({
      where: and(
        eq(invitations.id, invitationId),
        eq(invitations.organizationId, organizationId)
      )
    })
    
    if (!invitation) {
      return new NextResponse(
        JSON.stringify({ error: "Invitation not found" }),
        { status: 404 }
      )
    }
    
    // Delete invitation
    await db?.delete(invitations)
      .where(
        and(
          eq(invitations.id, invitationId),
          eq(invitations.organizationId, organizationId)
        )
      )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting invitation:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to delete invitation" }),
      { status: 500 }
    )
  }
}

// Resend an invitation
export async function PUT(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const { invitationId, organizationId } = body
    
    if (!invitationId || !organizationId) {
      return new NextResponse(
        JSON.stringify({ error: "Invitation ID and Organization ID are required" }),
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

    // Find invitation
    const invitation = await db?.query.invitations.findFirst({
      where: and(
        eq(invitations.id, invitationId),
        eq(invitations.organizationId, organizationId)
      )
    })
    
    if (!invitation) {
      return new NextResponse(
        JSON.stringify({ error: "Invitation not found" }),
        { status: 404 }
      )
    }
    
    // Generate new expiration date
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    // Update invitation
    await db?.update(invitations)
      .set({
        expiresAt,
        updatedAt: now
      })
      .where(
        and(
          eq(invitations.id, invitationId),
          eq(invitations.organizationId, organizationId)
        )
      )
    
    // In a production app, you would send a new email with the invitation link here
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error resending invitation:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to resend invitation" }),
      { status: 500 }
    )
  }
} 