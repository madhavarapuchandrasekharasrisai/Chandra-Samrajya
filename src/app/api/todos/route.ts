import { db } from '@/lib/db';
import { todo } from '@/db/schema';
import { eq, desc, or } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const todos = await db.select().from(todo).orderBy(desc(todo.createdAt));
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task, date } = body;

    if (!task) {
      return NextResponse.json(
        { error: 'task is required' },
        { status: 400 }
      );
    }

    const [newTodo] = await db.insert(todo).values({
      task,
      completed: 0,
      date: date ? new Date(date) : new Date(),
    }).returning();

    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.error('Failed to create todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, completed, task } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const updateValues: any = {};
    if (completed !== undefined) {
      updateValues.completed = completed ? 1 : 0;
    }
    if (task !== undefined) {
      updateValues.task = task;
    }
    updateValues.updatedAt = new Date();

    const [updatedTodo] = await db
      .update(todo)
      .set(updateValues)
      .where(eq(todo.id, id))
      .returning();

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('Failed to update todo:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    await db.delete(todo).where(eq(todo.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete todo:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}
