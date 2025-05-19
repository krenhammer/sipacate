import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSessionFromCtx } from "better-auth/api"
import { db } from "@/database/db"
import { desc, eq } from "drizzle-orm"
import { subscriptions, users } from "@/auth-schema"

export async function GET(request: Request) {

  const session = await auth.api.getSession(request)

  console.log("session", session)

  // Get URL parameters
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    // Get the session to verify admin access
    const requestWithCookies = request.clone()
    // const session = ctx.session;

    console.log("session", session)

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

    // Get all subscriptions for this user (including historical data)
    const subscriptionData = await db!.query.subscriptions.findMany({
      where: eq(subscriptions.referenceId, userId),
      orderBy: [desc(subscriptions.updatedAt)]
    })

    return NextResponse.json(subscriptionData)
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription data" },
      { status: 500 }
    )
  }
}
