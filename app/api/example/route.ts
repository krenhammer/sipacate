import { NextRequest, NextResponse } from 'next/server';
import { getDbFromContext } from '../../../database/db';

export const runtime = 'edge';
// export const dynamic = 'force-static';
// export const revalidate = 0; // This tells Next.js to regenerate this page on each request

export async function GET(request: NextRequest) {
  try {
    // Example response for static export
    return NextResponse.json({ 
      success: true, 
      data: [],
      message: 'Static API response example'
    });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 