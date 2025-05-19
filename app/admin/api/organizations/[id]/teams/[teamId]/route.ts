import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { teams } from "@/database/schema"
import { and, eq } from "drizzle-orm"

// Get team details
export async function GET(
  request: NextRequest,
  context: { params: { id: string, teamId: string } }
) {
  try {
    const { id: organizationId, teamId } = await context.params
    
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

    // Get team from database
    const team = await db?.query.teams.findFirst({
      where: and(
        eq(teams.id, teamId),
        eq(teams.organizationId, organizationId)
      )
    })
    
    if (!team) {
      return new NextResponse(
        JSON.stringify({ error: "Team not found" }),
        { status: 404 }
      )
    }
    
    return NextResponse.json({ team })
  } catch (error) {
    console.error("Error fetching team:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to fetch team", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
}

// Update team
export async function PUT(
  request: NextRequest,
  context: { params: { id: string, teamId: string } }
) {
  try {
    const { id: organizationId, teamId } = await context.params
    
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
    
    // Check if team exists
    const existingTeam = await db?.query.teams.findFirst({
      where: and(
        eq(teams.id, teamId),
        eq(teams.organizationId, organizationId)
      )
    })
    
    if (!existingTeam) {
      return new NextResponse(
        JSON.stringify({ error: "Team not found" }),
        { status: 404 }
      )
    }
    
    // Update team in database
    const [updatedTeam] = await db?.update(teams)
      .set({ 
        name, 
        updatedAt: new Date() 
      })
      .where(
        and(
          eq(teams.id, teamId),
          eq(teams.organizationId, organizationId)
        )
      )
      .returning() || []
    
    if (!updatedTeam) {
      return new NextResponse(
        JSON.stringify({ error: "Failed to update team" }),
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      success: true,
      team: updatedTeam
    })
  } catch (error) {
    console.error("Error updating team:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to update team", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
}

// Delete team
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string, teamId: string } }
) {
  try {
    const { id: organizationId, teamId } = await context.params
    
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
    
    // Check if team exists
    const existingTeam = await db?.query.teams.findFirst({
      where: and(
        eq(teams.id, teamId),
        eq(teams.organizationId, organizationId)
      )
    })
    
    if (!existingTeam) {
      return new NextResponse(
        JSON.stringify({ error: "Team not found" }),
        { status: 404 }
      )
    }
    
    // Delete team from database
    await db?.delete(teams)
      .where(
        and(
          eq(teams.id, teamId),
          eq(teams.organizationId, organizationId)
        )
      )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting team:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to delete team", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
} 