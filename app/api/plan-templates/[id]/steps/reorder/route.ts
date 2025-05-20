import { NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { steps } = await request.json();

    if (!Array.isArray(steps)) {
      return NextResponse.json(
        { error: 'Invalid request: steps must be an array' },
        { status: 400 }
      );
    }

    // Make the API call to update step order
    await apiClient(`/api/plan-templates/${id}/steps/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ steps }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering steps:', error);
    return NextResponse.json(
      { error: 'Failed to reorder steps' },
      { status: 500 }
    );
  }
} 