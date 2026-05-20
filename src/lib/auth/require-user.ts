import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

type AuthSuccess = { user: User; unauthorized: null }
type AuthFailure = { user: null; unauthorized: NextResponse }

/** Validates the session server-side (never trust getSession() alone on the server). */
export async function requireUser(): Promise<AuthSuccess | AuthFailure> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      unauthorized: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { user, unauthorized: null }
}
