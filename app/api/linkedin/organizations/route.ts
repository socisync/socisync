import { NextResponse, type NextRequest } from 'next/server'
import { getAdministeredOrganizations } from '@/lib/linkedin-api'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  try {
    const organizations = await getAdministeredOrganizations(token)
    return NextResponse.json({ organizations })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
