import { NextResponse, type NextRequest } from 'next/server'
import { exchangeCodeForToken, getChannels } from '@/lib/youtube-api'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    console.error('YouTube OAuth error:', error)
    return NextResponse.redirect(new URL('/dashboard/clients?error=youtube_auth_failed', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/clients?error=no_code', request.url))
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/youtube`
    
    const tokenData = await exchangeCodeForToken(code, redirectUri)

    if (!tokenData) {
      return NextResponse.redirect(new URL('/dashboard/clients?error=token_exchange_failed', request.url))
    }

    const channels = await getChannels(tokenData.accessToken)

    if (channels.length === 0) {
      return NextResponse.redirect(new URL('/dashboard/clients?error=no_youtube_channels', request.url))
    }

    const returnUrl = new URL('/dashboard/connect/youtube/select', request.url)
    returnUrl.searchParams.set('token', tokenData.accessToken)
    returnUrl.searchParams.set('refresh', tokenData.refreshToken)
    returnUrl.searchParams.set('expires', tokenData.expiresIn.toString())
    if (state) returnUrl.searchParams.set('client_id', state)

    return NextResponse.redirect(returnUrl)
  } catch (err) {
    console.error('YouTube OAuth error:', err)
    return NextResponse.redirect(new URL('/dashboard/clients?error=youtube_auth_error', request.url))
  }
}
