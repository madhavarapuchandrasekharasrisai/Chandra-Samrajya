import { db } from '@/lib/db';
import { notification } from '@/db/schema';
import { eq, and, lte, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const now = new Date();

    // Auto-delete read notifications whose remainder date has passed
    await db.delete(notification).where(
      and(
        eq(notification.read, 1),
        lte(notification.dateTime, now)
      )
    );

    const records = await db.select().from(notification).orderBy(desc(notification.dateTime));
    return NextResponse.json(records);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, dateTime } = body;

    if (!title || !dateTime) {
      return NextResponse.json({ error: 'title and dateTime are required' }, { status: 400 });
    }

    const parsedDate = new Date(dateTime);

    const [newRecord] = await db.insert(notification).values({
      title,
      message: message || null,
      dateTime: parsedDate,
      read: 0,
    }).returning();

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, read } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const [updated] = await db.update(notification)
      .set({
        read: read === true || read === 1 ? 1 : 0,
        updatedAt: new Date(),
      })
      .where(eq(notification.id, id))
      .returning();

    // After updating, run the auto-delete check in case the user just marked a past-due item as read
    const now = new Date();
    await db.delete(notification).where(
      and(
        eq(notification.read, 1),
        lte(notification.dateTime, now)
      )
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    await db.delete(notification).where(eq(notification.id, id));
    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
