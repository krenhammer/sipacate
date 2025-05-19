import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { organizations } from "@/database/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")
    
    if (!slug) {
      return new NextResponse(
        JSON.stringify({ error: "Slug parameter is required" }),
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

    // Check if slug is already taken
    const existingOrg = await db!.query.organizations.findFirst({
      where: eq(organizations.slug, slug)
    })
    
    return NextResponse.json({
      slug,
      available: !existingOrg
    })
  } catch (error) {
    console.error("Error checking slug availability:", error)
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to check slug availability", 
        debug: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    )
  }
} 