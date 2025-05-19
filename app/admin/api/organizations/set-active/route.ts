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
    const { userId, organizationId } = body
    
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400 }
      )
    }
    
    // Set active organization through the auth API
    await auth.api.setActiveOrganization({
      body: {
        userId,
        organizationId: organizationId || null // Passing null clears the active organization
      },
      headers: {}
    })
    
    return NextResponse.json({ 
      success: true,
      message: organizationId ? "Active organization set" : "Active organization cleared"
    })
  } catch (error) {
    console.error("Error setting active organization:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to set active organization", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
} 