import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { eq } from "drizzle-orm"
import { db } from "@/database/db"
import { sessions, organizations } from "@/database/schema"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id
    
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

    // Get the user's session to find their active organization
    const userSession = await db!.query.sessions.findFirst({
      where: eq(sessions.userId, userId)
    })
    
    if (!userSession?.activeOrganizationId) {
      return NextResponse.json({ 
        activeOrganization: null
      })
    }
    
    // Get the organization details
    const organization = await db!.query.organizations.findFirst({
      where: eq(organizations.id, userSession.activeOrganizationId)
    })
    
    return NextResponse.json({ 
      activeOrganization: organization
    })
  } catch (error) {
    console.error("Error getting active organization:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to get active organization", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
} 