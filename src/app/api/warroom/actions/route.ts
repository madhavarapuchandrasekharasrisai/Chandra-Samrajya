import { db } from '@/lib/db';
import { warRoomAction } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const actions = await db.select().from(warRoomAction).orderBy(desc(warRoomAction.createdAt));
    return NextResponse.json(actions);
  } catch (error) {
    console.error('Failed to fetch war room actions:', error);
    return NextResponse.json({ error: 'Failed to fetch war room actions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, subtitle, actionLabel, urgency } = body;

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const [newAction] = await db.insert(warRoomAction).values({
      title,
      subtitle: subtitle || null,
      actionLabel: actionLabel || 'Execute',
      urgency: urgency || 'high-urgency',
      status: 'pending',
    }).returning();

    return NextResponse.json(newAction, { status: 201 });
  } catch (error) {
    console.error('Failed to create war room action:', error);
    return NextResponse.json({ error: 'Failed to create war room action' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const [updated] = await db.update(warRoomAction)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(warRoomAction.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update war room action:', error);
    return NextResponse.json({ error: 'Failed to update war room action' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    await db.delete(warRoomAction).where(eq(warRoomAction.id, id));
    return NextResponse.json({ message: 'War room action deleted' });
  } catch (error) {
    console.error('Failed to delete war room action:', error);
    return NextResponse.json({ error: 'Failed to delete war room action' }, { status: 500 });
  }
}
