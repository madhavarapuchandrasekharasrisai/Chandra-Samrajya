import { db } from '@/lib/db';
import { soloLevelingDailyLogs } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const history = await db.select()
      .from(soloLevelingDailyLogs)
      .orderBy(desc(soloLevelingDailyLogs.date))
      .limit(30);

    return NextResponse.json({
      history: history.reverse(), // return in chronological order for graphs
    });
  } catch (error) {
    console.error('Failed to retrieve solo leveling history logs:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve history logs' },
      { status: 500 }
    );
  }
}
