import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { invitations, members, organizations } from "@/database/schema"
import { and, eq } from "drizzle-orm"

// Debug endpoint to check invitation and member status
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
    const userEmail = session.user.email
    
    if (!userId || !userEmail) {
      return new NextResponse(
        JSON.stringify({ error: "User ID or email not found in session" }),
        { status: 400 }
      )
    }
    
    // Get all pending invitations for this user
    const pendingInvitations = await db?.query.invitations.findMany({
      where: and(
        eq(invitations.email, userEmail),
        eq(invitations.status, "pending")
      )
    }) || []
    
    // Get all accepted invitations for this user
    const acceptedInvitations = await db?.query.invitations.findMany({
      where: and(
        eq(invitations.email, userEmail),
        eq(invitations.status, "accepted")
      )
    }) || []
    
    // Get all organizations the user is a member of
    const userMemberships = await db?.query.members.findMany({
      where: eq(members.userId, userId)
    }) || []
    
    // Get the actual organization details
    const organizationDetails = await Promise.all(
      userMemberships.map(async (membership) => {
        const org = await db?.query.organizations.findFirst({
          where: eq(organizations.id, membership.organizationId)
        });
        return {
          membership,
          organization: org || { id: membership.organizationId, name: "Unknown" }
        };
      })
    );
    
    return NextResponse.json({
      user: {
        id: userId,
        email: userEmail
      },
      pendingInvitations,
      acceptedInvitations,
      memberships: organizationDetails
    })
  } catch (error) {
    console.error("Error in debug endpoint:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Debug endpoint error", 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500 }
    )
  }
} 