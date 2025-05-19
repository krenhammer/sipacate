import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { members, organizations, teams, teamMembers } from "@/database/schema"
import { eq, and } from "drizzle-orm"

// Get current user's organization memberships with team details
export async function GET(request: NextRequest) {
  try {
    // Get the current user's session
    const session = await auth.api.getSession(request)
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "User ID not found in session" }),
        { status: 400 }
      )
    }
    
    // Get all organizations the user is a member of
    const userMemberships = await db?.query.members.findMany({
      where: eq(members.userId, userId)
    }) || []
    
    // Get the details for each membership
    const membershipsWithDetails = await Promise.all(
      userMemberships.map(async (membership) => {
        // Get organization details
        const organization = await db?.query.organizations.findFirst({
          where: eq(organizations.id, membership.organizationId)
        });
        
        // Get teams that the user is a member of in this organization
        // First, find teamMember records that reference this membership
        const teamMemberRecords = await db?.query.teamMembers.findMany({
          where: eq(teamMembers.memberId, membership.id)
        }) || [];
        
        // Then, get the team details for each teamMember record
        const userTeams = await Promise.all(
          teamMemberRecords.map(async (teamMember) => {
            return await db?.query.teams.findFirst({
              where: eq(teams.id, teamMember.teamId)
            });
          })
        );
        
        // Filter out any null values and ensure uniqueness
        const filteredTeams = userTeams.filter(team => team !== null && team !== undefined);
        
        return {
          membership,
          organization: organization || { 
            id: membership.organizationId, 
            name: "Unknown Organization",
            slug: "unknown",
            logo: null
          },
          teams: filteredTeams
        };
      })
    );
    
    return NextResponse.json({
      memberships: membershipsWithDetails
    });
  } catch (error) {
    console.error("Error fetching organization memberships:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to fetch organization memberships", 
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
} 