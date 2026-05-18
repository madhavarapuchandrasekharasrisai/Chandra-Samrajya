import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const followups = await db.followup.findMany({
      orderBy: { dueDate: 'desc' },
      include: { client: true },
    })
    return NextResponse.json(followups)
  } catch (error) {
    console.error('Failed to fetch followups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch followups' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, type, note, dueDate, status } = body

    if (!clientId || !type || !dueDate) {
      return NextResponse.json(
        { error: 'clientId, type, and dueDate are required' },
        { status: 400 }
      )
    }

    const followup = await db.followup.create({
      data: {
        clientId,
        type,
        note: note || null,
        dueDate: new Date(dueDate),
        status: status || 'pending',
      },
      include: { client: true },
    })

    return NextResponse.json(followup, { status: 201 })
  } catch (error) {
    console.error('Failed to create followup:', error)
    return NextResponse.json(
      { error: 'Failed to create followup' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id is required in request body' },
        { status: 400 }
      )
    }

    const existing = await db.followup.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Followup not found' },
        { status: 404 }
      )
    }

    // Convert date field if provided
    const data: Record<string, unknown> = { ...updateData }
    if (updateData.dueDate) {
      data.dueDate = new Date(updateData.dueDate)
    }

    const followup = await db.followup.update({
      where: { id },
      data,
      include: { client: true },
    })

    return NextResponse.json(followup)
  } catch (error) {
    console.error('Failed to update followup:', error)
    return NextResponse.json(
      { error: 'Failed to update followup' },
      { status: 500 }
    )
  }
}
