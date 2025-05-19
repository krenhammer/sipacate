import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

// List API keys
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request)
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      )
    }
    
    // Get API keys for the authenticated user
    const apiKeys = await auth.api.listApiKeys({
      headers: request.headers
    })
    
    return NextResponse.json(apiKeys)
  } catch (error) {
    console.error("Error listing API keys:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to list API keys" }),
      { status: 500 }
    )
  }
}

// Create API key
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request)
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Create a new API key for the authenticated user
    const apiKey = await auth.api.createApiKey({
      body,
      headers: request.headers
    })
    
    return NextResponse.json(apiKey)
  } catch (error) {
    console.error("Error creating API key:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to create API key" }),
      { status: 500 }
    )
  }
}

// Update API key
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request)
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Update an API key
    const apiKey = await auth.api.updateApiKey({
      body,
      headers: request.headers
    })
    
    return NextResponse.json(apiKey)
  } catch (error) {
    console.error("Error updating API key:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to update API key" }),
      { status: 500 }
    )
  }
}

// Delete API key
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request)
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      )
    }
    
    // Get keyId from search params
    const { searchParams } = new URL(request.url)
    const keyId = searchParams.get("keyId")
    
    if (!keyId) {
      return new NextResponse(
        JSON.stringify({ error: "API key ID is required" }),
        { status: 400 }
      )
    }
    
    // Delete the API key
    const result = await auth.api.deleteApiKey({
      body: { keyId },
      headers: request.headers
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error deleting API key:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to delete API key" }),
      { status: 500 }
    )
  }
} 