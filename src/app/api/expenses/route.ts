import { db } from '@/lib/db';
import { expense } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const expenses = await db.select().from(expense).orderBy(desc(expense.date));
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, category, description, paymentMethod, date } = body;

    if (!amount || !category || !description || !date) {
      return NextResponse.json(
        { error: 'amount, category, description, and date are required' },
        { status: 400 }
      );
    }

    const [newExpense] = await db.insert(expense).values({
      amount: parseFloat(amount),
      category,
      description,
      paymentMethod: paymentMethod || null,
      date: new Date(date),
    }).returning();

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error('Failed to create expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id query parameter is required' },
        { status: 400 }
      );
    }

    const existing = await db.select().from(expense).where(eq(expense.id, id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    await db.delete(expense).where(eq(expense.id, id));

    return NextResponse.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Failed to delete expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
