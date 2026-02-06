import { NextResponse, type NextRequest } from 'next/server'
import { exchangeCodeForToken, getAdvertiserAccounts } from '@/lib/tiktok-api'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('auth_code')
  const state = searchParams.get('state')

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/clients?error=no_code', request.url))
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/tiktok`
    
    const tokenData = await exchangeCodeForToken(code, redirectUri)

    if (!tokenData) {
      return NextResponse.redirect(new URL('/dashboard/clients?error=token_exchange_failed', request.url))
    }

    const advertisers = await getAdvertiserAccounts(tokenData.accessToken)

    if (advertisers.length === 0) {
      return NextResponse.redirect(new URL('/dashboard/clients?error=no_tiktok_advertisers', request.url))
    }

    const returnUrl = new URL('/dashboard/connect/tiktok/select', request.url)
    returnUrl.searchParams.set('token', tokenData.accessToken)
    returnUrl.searchParams.set('expires', tokenData.expiresIn.toString())
    if (state) returnUrl.searchParams.set('client_id', state)

    return NextResponse.redirect(returnUrl)
  } catch (err) {
    console.error('TikTok OAuth error:', err)
    return NextResponse.redirect(new URL('/dashboard/clients?error=tiktok_auth_error', request.url))
  }
}
