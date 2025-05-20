import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "edge";

// Add CORS headers to allow cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 204,
    headers: corsHeaders
  });
}

export async function GET(request: NextRequest) {
  try {
    // Get all cookies for debugging
    const cookies = request.cookies.getAll().map(c => c.name);
    
    // Get the session data from auth
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    // Get auth header if present
    const authHeader = request.headers.get('authorization');
    
    // Return the session data with debug info
    return NextResponse.json({ 
      session,
      isAuthenticated: !!session,
      cookies,
      hasAuthHeader: !!authHeader,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error("Error retrieving session:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to retrieve session", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 