import { db } from '@/lib/db';
import { outreachLog } from '@/db/schema';
import { eq, and, gte, lt, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const outreachLogs = await db.select().from(outreachLog).orderBy(desc(outreachLog.date));
    return NextResponse.json(outreachLogs);
  } catch (error) {
    console.error('Failed to fetch outreach logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outreach logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, count, date } = body;

    if (!type || !date) {
      return NextResponse.json(
        { error: 'type and date are required' },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);
    const dateStr = parsedDate.toISOString().split('T')[0];

    // Check if an outreach log with the same type and date already exists
    const existing = await db.select().from(outreachLog).where(and(
      eq(outreachLog.type, type),
      gte(outreachLog.date, new Date(dateStr + 'T00:00:00.000Z')),
      lt(outreachLog.date, new Date(dateStr + 'T23:59:59.999Z'))
    )).limit(1);

    if (existing.length > 0) {
      // Update the existing log by incrementing the count
      const [updated] = await db.update(outreachLog)
        .set({
          count: existing[0].count + (count ? parseInt(count) : 1),
        })
        .where(eq(outreachLog.id, existing[0].id))
        .returning();

      return NextResponse.json(updated, { status: 201 });
    }

    // Create a new outreach log
    const [newLog] = await db.insert(outreachLog).values({
      type,
      count: count ? parseInt(count) : 1,
      date: parsedDate,
    }).returning();

    return NextResponse.json(newLog, { status: 201 });
  } catch (error) {
    console.error('Failed to create/update outreach log:', error);
    return NextResponse.json(
      { error: 'Failed to create/update outreach log' },
      { status: 500 }
    );
  }
}
