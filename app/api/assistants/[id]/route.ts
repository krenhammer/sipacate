import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { db, getDb } from "@/database/db";
import { assistants } from "@/database/schema";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession(req);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const database = getDb();
    
    // Fetch the assistant with its files
    const assistant = await database.query.assistants.findFirst({
      where: eq(assistants.id, id),
      with: {
        files: true
      }
    });
    
    if (!assistant) {
      return NextResponse.json({ error: "Assistant not found" }, { status: 404 });
    }
    
    // Check if the user has access to this assistant
    if (assistant.createdById !== session.userId && 
        assistant.organizationId !== session.orgId) {
      return NextResponse.json({ error: "Not authorized to access this assistant" }, { status: 403 });
    }

    return NextResponse.json({ data: assistant });
  } catch (error) {
    console.error("Error fetching assistant:", error);
    return NextResponse.json({ error: "Failed to fetch assistant" }, { status: 500 });
  }
} 