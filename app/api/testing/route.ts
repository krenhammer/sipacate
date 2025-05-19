import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// This endpoint is only for development testing
export async function GET(request: NextRequest) {
  // Ensure this only works in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "This endpoint is only available in development mode" }, { status: 403 })
  }

  try {
    // Try to get the current session
    const session = await auth.getSession()
    
    // User table schema info for debugging
    const userTableInfo = await auth.database.db
      .selectFrom("users")
      .select(["id", "email", "role", "emailVerified"])
      .limit(10)
      .execute()

    return NextResponse.json({
      message: "Development test endpoint",
      session,
      userInfo: session?.user || null,
      userTableInfo
    })
  } catch (error) {
    console.error("Testing endpoint error:", error)
    return NextResponse.json({ error: "Error in test endpoint" }, { status: 500 })
  }
}

// Create a development admin user
export async function POST(request: NextRequest) {
  // Ensure this only works in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "This endpoint is only available in development mode" }, { status: 403 })
  }

  try {
    // Create or update admin user
    const adminEmail = "admin@example.com"
    
    // Check if admin user exists
    const existingUser = await auth.database.db
      .selectFrom("users")
      .where("email", "=", adminEmail)
      .selectAll()
      .executeTakeFirst()

    if (existingUser) {
      // Update role to admin
      await auth.database.db
        .updateTable("users")
        .set({ role: "admin", emailVerified: new Date().toISOString() })
        .where("email", "=", adminEmail)
        .execute()
      
      return NextResponse.json({ 
        success: true, 
        message: "Updated existing user to admin", 
        email: adminEmail
      })
    } else {
      // Create admin user
      const userId = await auth.api.auth.createUser({
        email: adminEmail,
        password: "adminpassword123",
        emailVerified: true,
        name: "Admin User",
        role: "admin"
      })
      
      return NextResponse.json({ 
        success: true, 
        message: "Created new admin user",
        email: adminEmail,
        password: "adminpassword123",
        userId
      })
    }
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json({ 
      error: "Failed to create admin user", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 