import { db } from '@/lib/db';
import { jobApplication } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const records = await db.select().from(jobApplication).orderBy(desc(jobApplication.appliedDate));
    return NextResponse.json(records);
  } catch (error) {
    console.error('Failed to fetch job applications:', error);
    return NextResponse.json({ error: 'Failed to fetch job applications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, role, source, notes, appliedDate } = body;

    if (!company || !role) {
      return NextResponse.json({ error: 'company and role are required' }, { status: 400 });
    }

    const parsedDate = appliedDate ? new Date(appliedDate) : new Date();

    const [newRecord] = await db.insert(jobApplication).values({
      company,
      role,
      source: source || null,
      notes: notes || null,
      appliedDate: parsedDate,
    }).returning();

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Failed to create job application:', error);
    return NextResponse.json({ error: 'Failed to create job application' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      // If no ID is specified, it deletes all records (Clear All functionality)
      await db.delete(jobApplication);
      return NextResponse.json({ message: 'All job applications deleted successfully' });
    }

    await db.delete(jobApplication).where(eq(jobApplication.id, id));
    return NextResponse.json({ message: 'Job application deleted successfully' });
  } catch (error) {
    console.error('Failed to delete job application:', error);
    return NextResponse.json({ error: 'Failed to delete job application' }, { status: 500 });
  }
}
