import { db } from '@/lib/db';
import { outreachRecord } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const records = await db.select().from(outreachRecord).orderBy(desc(outreachRecord.date));
    return NextResponse.json(records);
  } catch (error) {
    console.error('Failed to fetch outreach records:', error);
    return NextResponse.json({ error: 'Failed to fetch outreach records' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contactName, platform, type, status, notes, date, projectValue } = body;

    if (!contactName || !type) {
      return NextResponse.json({ error: 'contactName and type are required' }, { status: 400 });
    }

    const parsedDate = date ? new Date(date) : new Date();
    // Auto-set reopen date to 30 days later
    const reopenDate = new Date(parsedDate);
    reopenDate.setDate(reopenDate.getDate() + 30);

    const [newRecord] = await db.insert(outreachRecord).values({
      contactName,
      platform: platform || 'instagram',
      type,
      status: status || 'pending',
      notes: notes || null,
      date: parsedDate,
      reopenDate,
      projectValue: projectValue ? parseFloat(projectValue) : 0,
    }).returning();

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Failed to create outreach record:', error);
    return NextResponse.json({ error: 'Failed to create outreach record' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const data: Record<string, unknown> = { ...updateData, updatedAt: new Date() };
    if (updateData.date) data.date = new Date(updateData.date);
    if (updateData.reopenDate) data.reopenDate = new Date(updateData.reopenDate);
    if (updateData.projectValue !== undefined) data.projectValue = parseFloat(updateData.projectValue);

    const [updated] = await db.update(outreachRecord)
      .set(data)
      .where(eq(outreachRecord.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update outreach record:', error);
    return NextResponse.json({ error: 'Failed to update outreach record' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    await db.delete(outreachRecord).where(eq(outreachRecord.id, id));
    return NextResponse.json({ message: 'Outreach record deleted successfully' });
  } catch (error) {
    console.error('Failed to delete outreach record:', error);
    return NextResponse.json({ error: 'Failed to delete outreach record' }, { status: 500 });
  }
}
