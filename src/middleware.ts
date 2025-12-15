import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { env } from '@/config/env'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create client to manage session
    const supabase = createServerClient(
        env.SUPABASE_URL || 'https://placeholder.supabase.co',
        env.SUPABASE_ANON_KEY || 'placeholder',
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // Refresh session if expired
    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes
    const protectedPaths = ['/dashboard', '/my-network', '/companies', '/contacts', '/opportunities', '/settings']
    const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

    // Auth routes (redirect to dashboard if logged in)
    const isAuthRoute = ['/login', '/signup'].includes(request.nextUrl.pathname)

    if (isProtected && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
