/**
 * Supabase env helpers — supports new publishable keys (sb_publishable_…)
 * and legacy anon keys during migration.
 * @see https://supabase.com/docs/guides/getting-started/api-keys
 */

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_BASE_URL
  if (!url) {
    // During build time (static rendering), return a mock URL to prevent build failures.
    // At runtime, this will still guide the user to configure their environment variables.
    console.warn('Warning: NEXT_PUBLIC_SUPABASE_URL is missing. Using a fallback for compilation.')
    return 'https://placeholder-project.supabase.co'
  }
  return url
}

/** Client-safe key: prefer new publishable key, fall back to legacy anon key or custom anon key. */
export function getSupabasePublishableKey(): string {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_ANON_KEY ??
    process.env.NEXT_PUBLIC_PUBLISHABLE_KEY

  if (!key) {
    console.warn('Warning: Supabase client key is missing. Using a fallback for compilation.')
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-key'
  }
  return key
}

export function hasSupabaseClientConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_BASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_ANON_KEY ??
    process.env.NEXT_PUBLIC_PUBLISHABLE_KEY
  return Boolean(url && key)
}
