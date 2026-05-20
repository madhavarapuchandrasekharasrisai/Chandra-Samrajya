import { db } from '@/lib/db';
import { warRoomOpportunity } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const opportunities = await db.select().from(warRoomOpportunity).orderBy(desc(warRoomOpportunity.createdAt));
    return NextResponse.json(opportunities);
  } catch (error) {
    console.error('Failed to fetch war room opportunities:', error);
    return NextResponse.json({ error: 'Failed to fetch war room opportunities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, projectValue, pipelineStage, closeProbability, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const [newOpp] = await db.insert(warRoomOpportunity).values({
      name,
      projectValue: projectValue ? parseFloat(projectValue) : 0,
      pipelineStage: pipelineStage || 'prospect',
      closeProbability: closeProbability ? parseFloat(closeProbability) : 0,
      notes: notes || null,
      status: 'active',
    }).returning();

    return NextResponse.json(newOpp, { status: 201 });
  } catch (error) {
    console.error('Failed to create war room opportunity:', error);
    return NextResponse.json({ error: 'Failed to create war room opportunity' }, { status: 500 });
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
    if (updateData.projectValue !== undefined) data.projectValue = parseFloat(updateData.projectValue);
    if (updateData.closeProbability !== undefined) data.closeProbability = parseFloat(updateData.closeProbability);

    const [updated] = await db.update(warRoomOpportunity)
      .set(data)
      .where(eq(warRoomOpportunity.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update war room opportunity:', error);
    return NextResponse.json({ error: 'Failed to update war room opportunity' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 });
    }

    await db.delete(warRoomOpportunity).where(eq(warRoomOpportunity.id, id));
    return NextResponse.json({ message: 'War room opportunity deleted' });
  } catch (error) {
    console.error('Failed to delete war room opportunity:', error);
    return NextResponse.json({ error: 'Failed to delete war room opportunity' }, { status: 500 });
  }
}
