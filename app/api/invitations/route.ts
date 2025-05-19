import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { invitations, members, organizations } from "@/database/schema"
import { and, eq } from "drizzle-orm"

// Get pending invitations for the current user
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

    const userEmail = session.user.email
    
    if (!userEmail) {
      return new NextResponse(
        JSON.stringify({ error: "User email not found" }),
        { status: 400 }
      )
    }
    
    // Get all invitations for the current user's email with organization names
    const userInvitations = await db?.query.invitations.findMany({
      where: eq(invitations.email, userEmail),
      with: {
        organization: {
          columns: {
            name: true
          }
        }
      }
    }) || []
    
    // Format invitations to include organization name
    const formattedInvitations = await Promise.all(userInvitations.map(async invitation => {
      // If organization is available from the relation, use it
      if (invitation.organization?.name) {
        return {
          ...invitation,
          organizationName: invitation.organization.name,
          organization: undefined // Remove the nested organization object
        };
      }
      
      // Otherwise, manually fetch the organization name
      try {
        const org = await db?.query.organizations.findFirst({
          where: eq(organizations.id, invitation.organizationId),
          columns: {
            name: true
          }
        });
        return {
          ...invitation,
          organizationName: org?.name || "Unknown Organization",
          organization: undefined
        };
      } catch (err) {
        console.error("Error fetching organization name:", err);
        return {
          ...invitation,
          organizationName: "Unknown Organization",
          organization: undefined
        };
      }
    }))
    
    console.log("Formatted invitations:", JSON.stringify(formattedInvitations, null, 2));
    
    return NextResponse.json({ invitations: formattedInvitations })
  } catch (error) {
    console.error("Error fetching user invitations:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch invitations" }),
      { status: 500 }
    )
  }
}

// Accept an invitation
export async function POST(request: NextRequest) {
  try {
    // Get the current user's session
    const session = await auth.api.getSession(request)
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const { invitationId, organizationId, action } = body
    
    if (!invitationId || !organizationId || !action) {
      return new NextResponse(
        JSON.stringify({ error: "Invitation ID, organization ID, and action are required" }),
        { status: 400 }
      )
    }
    
    if (!["accept", "reject"].includes(action)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid action. Must be either 'accept' or 'reject'" }),
        { status: 400 }
      )
    }
    
    // Verify invitation belongs to current user
    const invitation = await db?.query.invitations.findFirst({
      where: and(
        eq(invitations.id, invitationId),
        eq(invitations.organizationId, organizationId),
        eq(invitations.email, session.user.email || ""),
        eq(invitations.status, "pending")
      )
    })
    
    if (!invitation) {
      return new NextResponse(
        JSON.stringify({ error: "Invitation not found or not pending" }),
        { status: 404 }
      )
    }
    
    // Update invitation status in the database
    const status = action === "accept" ? "accepted" : "rejected"
    const now = new Date()
    
    // Update the invitation status
    await db?.update(invitations)
      .set({
        status,
        updatedAt: now
      })
      .where(
        and(
          eq(invitations.id, invitationId),
          eq(invitations.organizationId, organizationId)
        )
      )
    
    // If the invitation was accepted, add the user as a member of the organization
    if (action === "accept" && session.user.id) {
      try {
        // Add the user to the organization directly through the API
        const response = await fetch('/api/organizations/members', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id,
            organizationId,
            role: invitation.role
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error adding user to organization:", errorData);
          
          // If the error is that user is already a member, this is okay
          if (errorData.existingMember) {
            console.log("User is already a member, continuing with success response");
          } else {
            throw new Error(errorData.error || "Failed to add user to organization");
          }
        }
        
        // Log successful member creation
        console.log(`User ${session.user.id} added to organization ${organizationId} with role ${invitation.role}`);
      } catch (err) {
        console.error("Error adding user to organization:", err);
        
        // Fallback: Try to create the member record directly
        try {
          console.log("Attempting direct member creation as fallback...");
          const memberId = crypto.randomUUID();
          const now = new Date();
          
          // Check if the user is already a member
          const existingMember = await db?.query.members.findFirst({
            where: and(
              eq(members.userId, session.user.id),
              eq(members.organizationId, organizationId)
            )
          });
          
          if (!existingMember) {
            await db?.insert(members).values({
              id: memberId,
              userId: session.user.id,
              organizationId,
              role: invitation.role,
              createdAt: now,
              updatedAt: now
            });
            console.log("Fallback member creation successful");
          } else {
            console.log("User is already a member (detected in fallback)");
          }
        } catch (fallbackErr) {
          console.error("Fallback member creation failed:", fallbackErr);
          return new NextResponse(
            JSON.stringify({ 
              error: "Invitation was accepted but failed to add you as a member",
              details: `Original error: ${err instanceof Error ? err.message : String(err)}. Fallback error: ${fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)}`
            }),
            { status: 500 }
          );
        }
      }
    }
    
    return NextResponse.json({ 
      success: true,
      message: action === "accept" 
        ? "Invitation accepted successfully" 
        : "Invitation rejected successfully"
    })
  } catch (error) {
    console.error("Error handling invitation:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to handle invitation", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
} 