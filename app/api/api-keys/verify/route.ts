import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// Verify API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Verify the provided API key
    const { valid, error, key } = await auth.api.verifyApiKey({
      body: {
        key: body.key,
        permissions: body.permissions
      }
    })
    
    return NextResponse.json({ valid, error, key })
  } catch (error) {
    console.error("Error verifying API key:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to verify API key" }),
      { status: 500 }
    )
  }
} 