import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { teams } from "@/database/schema"
import { eq } from "drizzle-orm"

// List teams for an organization
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: organizationId } = await context.params
    
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

    // Get teams from the database
    const organizationTeams = await db?.query.teams.findMany({
      where: eq(teams.organizationId, organizationId)
    }) || []
    
    return NextResponse.json({ teams: organizationTeams })
  } catch (error) {
    console.error("Error fetching teams:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to fetch teams", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
}

// Create a new team
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: organizationId } = await context.params
    
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
    
    // Parse request body
    const body = await request.json()
    const { name } = body
    
    if (!name) {
      return new NextResponse(
        JSON.stringify({ error: "Team name is required" }),
        { status: 400 }
      )
    }
    
    // Create team in database
    const teamId = crypto.randomUUID()
    const now = new Date()
    
    const [team] = await db?.insert(teams).values({
      id: teamId,
      name,
      organizationId,
      createdAt: now,
      updatedAt: now
    }).returning() || []
    
    if (!team) {
      return new NextResponse(
        JSON.stringify({ error: "Failed to create team" }),
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      team
    })
  } catch (error) {
    console.error("Error creating team:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to create team", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
} 