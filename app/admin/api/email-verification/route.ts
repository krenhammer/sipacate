import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { eq } from "drizzle-orm"
import { users } from "@/auth-schema"

export async function POST(request: Request) {
 
  const session = await auth.api.getSession(request)

  try {
    // Get the request body
    const { userId, verificationStatus } = await request.json()

    // Validate required parameters
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (typeof verificationStatus !== 'boolean') {
      return NextResponse.json({ error: "Verification status must be a boolean" }, { status: 400 })
    }

    // Get the session to verify admin access
    // const session = ctx.session;

    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Find the user to ensure they exist
    const user = await db!.query.users.findFirst({
      where: eq(users.id, userId)
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update the email verification status
    await db!.update(users)
      .set({
        emailVerified: verificationStatus,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))

    return NextResponse.json({
      success: true,
      message: `Email ${verificationStatus ? "verified" : "unverified"} successfully`
    })
  } catch (error) {
    console.error("Error updating email verification status:", error)
    return NextResponse.json(
      { error: "Failed to update email verification status" },
      { status: 500 }
    )
  }
} 