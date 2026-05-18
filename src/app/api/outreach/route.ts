import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const outreachLogs = await db.outreachLog.findMany({
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(outreachLogs)
  } catch (error) {
    console.error('Failed to fetch outreach logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch outreach logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, count, date } = body

    if (!type || !date) {
      return NextResponse.json(
        { error: 'type and date are required' },
        { status: 400 }
      )
    }

    const parsedDate = new Date(date)
    const dateStr = parsedDate.toISOString().split('T')[0]

    // Check if an outreach log with the same type and date already exists
    const existing = await db.outreachLog.findFirst({
      where: {
        type,
        date: {
          gte: new Date(dateStr + 'T00:00:00.000Z'),
          lt: new Date(dateStr + 'T23:59:59.999Z'),
        },
      },
    })

    if (existing) {
      // Update the existing log by incrementing the count
      const updated = await db.outreachLog.update({
        where: { id: existing.id },
        data: {
          count: existing.count + (count ? parseInt(count) : 1),
        },
      })
      return NextResponse.json(updated, { status: 201 })
    }

    // Create a new outreach log
    const outreachLog = await db.outreachLog.create({
      data: {
        type,
        count: count ? parseInt(count) : 1,
        date: parsedDate,
      },
    })

    return NextResponse.json(outreachLog, { status: 201 })
  } catch (error) {
    console.error('Failed to create/update outreach log:', error)
    return NextResponse.json(
      { error: 'Failed to create/update outreach log' },
      { status: 500 }
    )
  }
}
