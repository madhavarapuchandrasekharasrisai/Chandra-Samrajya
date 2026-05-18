import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    await db.income.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete income:', error)
    return NextResponse.json(
      { error: 'Failed to delete income' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const incomes = await db.income.findMany({
      orderBy: { date: 'desc' },
    })
    return NextResponse.json(incomes)
  } catch (error) {
    console.error('Failed to fetch incomes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch incomes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, source, clientName, description, date, status } = body

    if (!amount || !source || !date) {
      return NextResponse.json(
        { error: 'amount, source, and date are required' },
        { status: 400 }
      )
    }

    const income = await db.income.create({
      data: {
        amount: parseFloat(amount),
        source,
        clientName: clientName || null,
        description: description || null,
        date: new Date(date),
        status: status || 'received',
      },
    })

    return NextResponse.json(income, { status: 201 })
  } catch (error) {
    console.error('Failed to create income:', error)
    return NextResponse.json(
      { error: 'Failed to create income' },
      { status: 500 }
    )
  }
}
