import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    // Get the session data from auth
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    // Return the session data
    return NextResponse.json({ 
      session,
      isAuthenticated: !!session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error retrieving session:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to retrieve session", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 