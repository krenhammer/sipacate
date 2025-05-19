import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function PUT(request: NextRequest) {
  try {
    // Verify admin access
    const session = await auth.api.getSession(request)
    
    // Dev-only: bypass auth for testing purposes
    const isDevelopment = process.env.NODE_ENV === "development"
    const hasAccess = isDevelopment || (session?.user?.role === "admin")
    
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

    // Parse request body
    const body = await request.json()
    const { invitationId, organizationId, status } = body
    
    if (!invitationId || !organizationId || !status) {
      return new NextResponse(
        JSON.stringify({ error: "Invitation ID, organization ID, and status are required" }),
        { status: 400 }
      )
    }
    
    if (!["pending", "accepted", "rejected", "expired"].includes(status)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid status. Must be one of: pending, accepted, rejected, expired" }),
        { status: 400 }
      )
    }
    
    // Update invitation status through the auth API
    await auth.api.updateInvitationStatus({
      body: {
        invitationId,
        organizationId,
        status
      },
      headers: {}
    })
    
    return NextResponse.json({ 
      success: true,
      message: `Invitation status updated to ${status}`
    })
  } catch (error) {
    console.error("Error updating invitation status:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to update invitation status", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
} 