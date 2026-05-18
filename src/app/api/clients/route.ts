import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const clients = await db.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: { followups: true },
    })
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Failed to fetch clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      business,
      email,
      phone,
      projectValue,
      pipelineStage,
      lastContact,
      urgencyLevel,
      notes,
      closeProbability,
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      )
    }

    const client = await db.client.create({
      data: {
        name,
        business: business || null,
        email: email || null,
        phone: phone || null,
        projectValue: projectValue ? parseFloat(projectValue) : 0,
        pipelineStage: pipelineStage || 'prospect',
        lastContact: lastContact ? new Date(lastContact) : null,
        urgencyLevel: urgencyLevel || 'normal',
        notes: notes || null,
        closeProbability: closeProbability ? parseFloat(closeProbability) : 0,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Failed to create client:', error)
    return NextResponse.json(
      { error: 'Failed to create client' },
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

    const existing = await db.client.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Convert date fields and numeric fields if provided
    const data: Record<string, unknown> = { ...updateData }
    if (updateData.lastContact) {
      data.lastContact = new Date(updateData.lastContact)
    }
    if (updateData.projectValue !== undefined) {
      data.projectValue = parseFloat(updateData.projectValue)
    }
    if (updateData.closeProbability !== undefined) {
      data.closeProbability = parseFloat(updateData.closeProbability)
    }

    const client = await db.client.update({
      where: { id },
      data,
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('Failed to update client:', error)
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'id query parameter is required' },
        { status: 400 }
      )
    }

    const existing = await db.client.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    await db.client.delete({ where: { id } })

    return NextResponse.json({ message: 'Client deleted successfully' })
  } catch (error) {
    console.error('Failed to delete client:', error)
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}
