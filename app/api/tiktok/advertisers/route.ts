import { NextResponse, type NextRequest } from 'next/server'
import { getAdvertiserAccounts } from '@/lib/tiktok-api'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  try {
    const advertisers = await getAdvertiserAccounts(token)
    return NextResponse.json({ advertisers })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
