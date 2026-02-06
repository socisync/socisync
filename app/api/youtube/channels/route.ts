import { NextResponse, type NextRequest } from 'next/server'
import { getChannels } from '@/lib/youtube-api'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  try {
    const channels = await getChannels(token)
    return NextResponse.json({ channels })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
