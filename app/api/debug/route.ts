import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    // Get the session data from auth
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    // Get the request headers for debugging
    const headerEntries = Array.from(request.headers.entries());
    const headers = Object.fromEntries(headerEntries);
    
    // Get cookies from the request
    const cookies = request.cookies.getAll().map(cookie => ({
      name: cookie.name,
      value: cookie.value.substring(0, 8) + '...',
    }));
    
    // Return the debug data
    return NextResponse.json({ 
      session,
      isAuthenticated: !!session,
      headers,
      cookies,
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in debug route:", error);
    
    return NextResponse.json(
      { 
        error: "Debug route error", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 