import { NextResponse, type NextRequest } from 'next/server'
import { exchangeCodeForToken, getAdministeredOrganizations } from '@/lib/linkedin-api'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state') // Contains client_id we're connecting for
  const error = searchParams.get('error')

  if (error) {
    console.error('LinkedIn OAuth error:', error)
    return NextResponse.redirect(new URL('/dashboard/clients?error=linkedin_auth_failed', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/clients?error=no_code', request.url))
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/linkedin`
    
    // Exchange code for token
    const tokenData = await exchangeCodeForToken(code, redirectUri)

    if (!tokenData) {
      return NextResponse.redirect(new URL('/dashboard/clients?error=token_exchange_failed', request.url))
    }

    // Get organizations user can admin
    const organizations = await getAdministeredOrganizations(tokenData.accessToken)

    if (organizations.length === 0) {
      return NextResponse.redirect(new URL('/dashboard/clients?error=no_linkedin_pages', request.url))
    }

    // Store token temporarily and redirect to page selection
    // In production, you'd want to encrypt this or use a session
    const returnUrl = new URL('/dashboard/connect/linkedin/select', request.url)
    returnUrl.searchParams.set('token', tokenData.accessToken)
    returnUrl.searchParams.set('expires', tokenData.expiresIn.toString())
    if (state) returnUrl.searchParams.set('client_id', state)

    return NextResponse.redirect(returnUrl)
  } catch (err) {
    console.error('LinkedIn OAuth error:', err)
    return NextResponse.redirect(new URL('/dashboard/clients?error=linkedin_auth_error', request.url))
  }
}
