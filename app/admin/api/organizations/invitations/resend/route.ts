import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
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
    const { invitationId, organizationId } = body
    
    if (!invitationId || !organizationId) {
      return new NextResponse(
        JSON.stringify({ error: "Invitation ID and organization ID are required" }),
        { status: 400 }
      )
    }
    
    // Resend invitation through the auth API
    await auth.api.resendInvitation({
      body: {
        invitationId,
        organizationId
      },
      headers: {}
    })
    
    return NextResponse.json({ 
      success: true,
      message: "Invitation resent successfully"
    })
  } catch (error) {
    console.error("Error resending invitation:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to resend invitation", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
} 