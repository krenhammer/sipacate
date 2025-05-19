import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = params.id
    const body = await request.json()
    const { name, slug, logo } = body
    
    if (!organizationId) {
      return new NextResponse(
        JSON.stringify({ error: "Organization ID is required" }),
        { status: 400 }
      )
    }
    
    if (!name || !slug) {
      return new NextResponse(
        JSON.stringify({ error: "Name and slug are required" }),
        { status: 400 }
      )
    }
    
    // Verify admin access
    const session = await auth.getSession()
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      )
    }

    // Allow any authenticated user in development mode
    const isDevelopment = process.env.NODE_ENV === "development"
    const hasAccess = isDevelopment || session.user?.role === "admin"
    
    console.log("[DEBUG] Org API [id] - PUT session:", { 
      userId: session.user?.id,
      userRole: session.user?.role,
      isDevelopment,
      hasAccess
    })

    if (!hasAccess) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        { status: 403 }
      )
    }

    // Check if organization exists
    const organization = await auth.database.db
      .selectFrom("organization")
      .where("id", "=", organizationId)
      .selectAll()
      .executeTakeFirst()
    
    if (!organization) {
      return new NextResponse(
        JSON.stringify({ error: "Organization not found" }),
        { status: 404 }
      )
    }

    // Check if slug is already taken by another organization
    if (slug !== organization.slug) {
      const existingOrg = await auth.database.db
        .selectFrom("organization")
        .where("slug", "=", slug)
        .where("id", "!=", organizationId)
        .selectAll()
        .executeTakeFirst()
      
      if (existingOrg) {
        return new NextResponse(
          JSON.stringify({ error: "Slug is already taken" }),
          { status: 400 }
        )
      }
    }

    // Update organization
    await auth.database.db
      .updateTable("organization")
      .set({
        name,
        slug,
        logo: logo || null
      })
      .where("id", "=", organizationId)
      .execute()
    
    // Get updated organization
    const updatedOrganization = await auth.database.db
      .selectFrom("organization")
      .where("id", "=", organizationId)
      .selectAll()
      .executeTakeFirst()
    
    return NextResponse.json({ organization: updatedOrganization })
  } catch (error) {
    console.error("Error updating organization:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to update organization" }),
      { status: 500 }
    )
  }
} 