import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { members, teamMembers, teams, users } from "@/database/schema"
import { and, eq } from "drizzle-orm"

// Define better types
type Member = {
  memberId: string;
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  joinedAt: string;
  teamId?: string;
}

// List team members
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

    // First check if team exists
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
    
    // Get all team members
    // First get the team_member records
    const teamMemberRecords = await db?.query.teamMembers.findMany({
      where: eq(teamMembers.teamId, teamId)
    }) || []
    
    if (teamMemberRecords.length === 0) {
      return NextResponse.json({ members: [] })
    }
    
    // Then get the member details for each team member
    const memberDetails = await Promise.all(
      teamMemberRecords.map(async (record) => {
        const memberRecord = await db?.query.members.findFirst({
          where: eq(members.id, record.memberId)
        })
        
        if (!memberRecord) return null
        
        // Get user data separately
        const user = await db?.query.users.findFirst({
          where: eq(users.id, memberRecord.userId)
        })
        
        return {
          memberId: memberRecord.id,
          userId: memberRecord.userId,
          name: user?.name || null,
          email: user?.email || 'unknown',
          image: user?.image || null,
          role: memberRecord.role,
          joinedAt: memberRecord.createdAt.toISOString()
        }
      })
    )
    
    // Filter out nulls
    const mappedMembers = memberDetails.filter(Boolean) as Member[]
    
    return NextResponse.json({ members: mappedMembers })
  } catch (error) {
    console.error("Error fetching team members:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to fetch team members", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
}

// Add members to team
export async function POST(
  request: NextRequest,
  context: { params: { id: string, teamId: string } }
) {
  try {
    const { id: organizationId, teamId } = await context.params
    
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
    const { memberIds } = body
    
    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: "Member IDs array is required" }),
        { status: 400 }
      )
    }
    
    // Check if team exists
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
    
    // Process each member
    const results = await Promise.all(
      memberIds.map(async (memberId) => {
        try {
          // Check if member exists and belongs to the organization
          const memberRecord = await db?.query.members.findFirst({
            where: and(
              eq(members.id, memberId),
              eq(members.organizationId, organizationId)
            )
          })
          
          if (!memberRecord) {
            return { 
              memberId, 
              success: false, 
              error: "Member not found or not part of this organization" 
            }
          }
          
          // Check if already a team member
          const existingTeamMember = await db?.query.teamMembers.findFirst({
            where: and(
              eq(teamMembers.teamId, teamId),
              eq(teamMembers.memberId, memberId)
            )
          })
          
          if (existingTeamMember) {
            return { 
              memberId, 
              success: false, 
              error: "Member is already part of this team" 
            }
          }
          
          // Add to team
          const now = new Date()
          await db?.insert(teamMembers).values({
            id: crypto.randomUUID(),
            teamId,
            memberId,
            createdAt: now,
            updatedAt: now
          })
          
          return { memberId, success: true }
        } catch (err) {
          console.error(`Error adding member ${memberId} to team:`, err)
          return { 
            memberId, 
            success: false, 
            error: err instanceof Error ? err.message : String(err) 
          }
        }
      })
    )
    
    const failed = results.filter(r => !r.success)
    
    if (failed.length > 0) {
      return NextResponse.json({ 
        partialSuccess: true,
        success: results.filter(r => r.success),
        failed
      }, { status: 207 }) // 207 Multi-Status
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error adding members to team:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to add members to team", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
}

// Remove a member from team
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string, teamId: string } }
) {
  try {
    const { id: organizationId, teamId } = await context.params
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get("memberId")
    
    if (!memberId) {
      return new NextResponse(
        JSON.stringify({ error: "Member ID is required" }),
        { status: 400 }
      )
    }
    
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
    
    // Check if team exists
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
    
    // Check if member is part of the team
    const teamMember = await db?.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.memberId, memberId)
      )
    })
    
    if (!teamMember) {
      return new NextResponse(
        JSON.stringify({ error: "Member is not part of this team" }),
        { status: 404 }
      )
    }
    
    // Remove from team
    await db?.delete(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.memberId, memberId)
        )
      )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing member from team:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to remove member from team", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
} 