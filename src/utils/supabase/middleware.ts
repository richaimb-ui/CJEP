import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = (
    process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.NEXT_PUB_SUPABASE_URL || 
    'https://azglvgxpxwrhnunrvuof.supabase.co'
  ).trim();

  const supabaseAnonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.NEXT_PUB_SUPABASE_ANON_KEY || 
    'sb_publishable_gFZvoJCUY8EN7d9qzheWAQ_RTTZt24H'
  ).trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Fetch the user using the cookies
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes pattern (app routes in our case)
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/tableau-de-bord') ||
                           request.nextUrl.pathname.startsWith('/contributeurs') ||
                           request.nextUrl.pathname.startsWith('/etudiants') ||
                           request.nextUrl.pathname.startsWith('/entrees') ||
                           request.nextUrl.pathname.startsWith('/depenses') ||
                           request.nextUrl.pathname.startsWith('/cotisations') ||
                           request.nextUrl.pathname.startsWith('/rapports') ||
                           request.nextUrl.pathname.startsWith('/parametres');
                           
  if (isProtectedRoute && !user) {
    // If trying to access protected route and not logged in, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from auth pages
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/tableau-de-bord'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
