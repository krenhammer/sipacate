import { db } from "@/database/db"
import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { organizations, members } from "@/database/schema"
import { desc, sql, count, eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)
    const id = searchParams.get("id")
    const slug = searchParams.get("slug")
    const checkSlug = searchParams.get("slug") && searchParams.has("check-slug")
    
    // Verify admin access
    const session = await auth.api.getSession(request)
    
    // Debug logs
    console.log("Session in API:", {
      exists: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      isAdmin: session?.user?.role === "admin"
    })
    
    // Dev-only: bypass auth for testing purposes
    const isDevelopment = process.env.NODE_ENV === "development"
    const isAuthenticated = !!session?.user
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated", debug: "No session found" }),
        { status: 401 }
      )
    }
    
    // In development, we'll allow any authenticated user to access admin routes
    const hasAccess = isDevelopment || session.user?.role === "admin"
    
    if (!hasAccess) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Unauthorized", 
          debug: `User role is ${session.user?.role || "undefined"}, not admin` 
        }),
        { status: 403 }
      )
    }

    console.log("Accessing organizations API:", { 
      isDevelopment, 
      hasAccess, 
      userRole: session.user?.role 
    })

    // Check if slug is available
    if (slug && searchParams.has("check-slug")) {
      const existing = await db!.query.organizations.findFirst({
        where: eq(organizations.slug, slug)
      });
      
      return NextResponse.json({ 
        available: !existing,
        slug
      })
    }

    // Get specific organization by ID
    if (id) {
      const org = await db!.query.organizations.findMany({
        where: eq(organizations.id, id)
      });
      
      return NextResponse.json({ organizations: org })
    }

    // Get all organizations
    const orgs = await db!.query.organizations.findMany({
      limit,
      offset,
      orderBy: [desc(organizations.createdAt)]
    });
    
    // Count total
    const result = await db!.select({
      count: count()
    }).from(organizations);
    
    return NextResponse.json({ 
      organizations: orgs, 
      meta: { 
        total: Number(result[0].count),
        limit,
        offset
      } 
    })
  } catch (error) {
    console.error("Error fetching organizations:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to fetch organizations", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
}

// Create a new organization
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
    const { name, slug, logo } = body
    
    if (!name || !slug) {
      return new NextResponse(
        JSON.stringify({ error: "Name and slug are required" }),
        { status: 400 }
      )
    }
    
    // Check if slug is already taken
    const existingOrg = await db!.query.organizations.findFirst({
      where: eq(organizations.slug, slug)
    })
    
    if (existingOrg) {
      return new NextResponse(
        JSON.stringify({ error: "Slug is already taken" }),
        { status: 400 }
      )
    }
    
    // Generate unique IDs
    const orgId = crypto.randomUUID();
    const memberId = crypto.randomUUID();
    const now = new Date();
    
    // Create the organization record
    const [organization] = await db!.insert(organizations)
      .values({
        id: orgId,
        name,
        slug,
        logo: logo || null,
        createdAt: now,
        updatedAt: now
      })
      .returning();
    
    if (!organization) {
      throw new Error("Failed to create organization");
    }
    
    // Create the owner membership for the admin user
    await db!.insert(members)
      .values({
        id: memberId,
        userId: session.user.id,
        organizationId: organization.id,
        role: "owner",
        createdAt: now,
        updatedAt: now
      });

    return NextResponse.json({ 
      success: true,
      organization: organization
    })
  } catch (error) {
    console.error("Error creating organization:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to create organization", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: "Organization ID is required" }),
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

    // Delete the organization
    await auth.api.deleteOrganization({ body: { organizationId: id }, headers: { } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting organization:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to delete organization" }),
      { status: 500 }
    )
  }
} 