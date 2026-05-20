/** Routes that do not require an authenticated Supabase session. */

const PUBLIC_PAGE_PATHS = ['/login'] as const

const PUBLIC_PAGE_PREFIXES = ['/solo-leveling/profile/'] as const

const PUBLIC_API_PREFIXES = ['/api/solo-leveling/profile/'] as const

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PAGE_PATHS.includes(pathname as (typeof PUBLIC_PAGE_PATHS)[number])) {
    return true
  }

  return (
    PUBLIC_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  )
}

export function isApiPath(pathname: string): boolean {
  return pathname.startsWith('/api')
}
