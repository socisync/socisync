import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state') // Contains client_id we're connecting for
  const error = searchParams.get('error')

  if (error) {
    console.error('Meta OAuth error:', error)
    return NextResponse.redirect(new URL('/dashboard/clients?error=meta_auth_failed', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/clients?error=no_code', request.url))
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }.toString() + `?client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&code=${code}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL + '/auth/callback/meta')}`)

    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    tokenUrl.searchParams.set('client_id', process.env.META_APP_ID!)
    tokenUrl.searchParams.set('client_secret', process.env.META_APP_SECRET!)
    tokenUrl.searchParams.set('code', code)
    tokenUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/meta`)

    const tokenRes = await fetch(tokenUrl.toString())
    const tokenData = await tokenRes.json()

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData.error)
      return NextResponse.redirect(new URL('/dashboard/clients?error=token_exchange_failed', request.url))
    }

    const { access_token, expires_in } = tokenData

    // Get long-lived token
    const longLivedUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token')
    longLivedUrl.searchParams.set('client_id', process.env.META_APP_ID!)
    longLivedUrl.searchParams.set('client_secret', process.env.META_APP_SECRET!)
    longLivedUrl.searchParams.set('fb_exchange_token', access_token)

    const longLivedRes = await fetch(longLivedUrl.toString())
    const longLivedData = await longLivedRes.json()

    const longLivedToken = longLivedData.access_token || access_token
    const tokenExpiry = longLivedData.expires_in || expires_in

    // Get user's pages
    const pagesRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedToken}`)
    const pagesData = await pagesRes.json()

    // Store in session/temp storage for user to select which page to connect
    // For now, redirect to a page selection screen
    const returnUrl = new URL('/dashboard/connect/meta/select', request.url)
    returnUrl.searchParams.set('token', longLivedToken)
    returnUrl.searchParams.set('expires', tokenExpiry?.toString() || '')
    if (state) returnUrl.searchParams.set('client_id', state)

    return NextResponse.redirect(returnUrl)
  } catch (err) {
    console.error('Meta OAuth error:', err)
    return NextResponse.redirect(new URL('/dashboard/clients?error=meta_auth_error', request.url))
  }
}
