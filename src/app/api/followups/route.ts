import { db } from '@/lib/db';
import { followup } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const followups = await db.query.followup.findMany({
      orderBy: [desc(followup.dueDate)],
      with: { client: true },
    });
    return NextResponse.json(followups);
  } catch (error) {
    console.error('Failed to fetch followups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch followups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, type, note, dueDate, status } = body;

    if (!clientId || !type || !dueDate) {
      return NextResponse.json(
        { error: 'clientId, type, and dueDate are required' },
        { status: 400 }
      );
    }

    const [newFollowup] = await db.insert(followup).values({
      clientId,
      type,
      note: note || null,
      dueDate: new Date(dueDate),
      status: status || 'pending',
    }).returning();

    const followupWithClient = await db.query.followup.findFirst({
      where: eq(followup.id, newFollowup.id),
      with: { client: true },
    });

    return NextResponse.json(followupWithClient, { status: 201 });
  } catch (error) {
    console.error('Failed to create followup:', error);
    return NextResponse.json(
      { error: 'Failed to create followup' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required in request body' },
        { status: 400 }
      );
    }

    const existing = await db.select().from(followup).where(eq(followup.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Followup not found' },
        { status: 404 }
      );
    }

    // Convert date field if provided
    const data: Record<string, unknown> = { ...updateData };
    if (updateData.dueDate) {
      data.dueDate = new Date(updateData.dueDate);
    }

    const [updatedFollowup] = await db.update(followup)
      .set(data)
      .where(eq(followup.id, id))
      .returning();

    const followupWithClient = await db.query.followup.findFirst({
      where: eq(followup.id, updatedFollowup.id),
      with: { client: true },
    });

    return NextResponse.json(followupWithClient);
  } catch (error) {
    console.error('Failed to update followup:', error);
    return NextResponse.json(
      { error: 'Failed to update followup' },
      { status: 500 }
    );
  }
}
