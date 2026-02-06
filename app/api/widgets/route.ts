import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET widgets for a client/dashboard
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const clientId = searchParams.get('client_id')
  const dashboardId = searchParams.get('dashboard_id')

  if (!clientId && !dashboardId) {
    return NextResponse.json({ error: 'client_id or dashboard_id required' }, { status: 400 })
  }

  try {
    // Get or create default dashboard
    let dashboard = null
    
    if (dashboardId) {
      const { data } = await supabase
        .from('client_dashboards')
        .select('*')
        .eq('id', dashboardId)
        .single()
      dashboard = data
    } else if (clientId) {
      // Get default dashboard or create one
      const { data: existing } = await supabase
        .from('client_dashboards')
        .select('*')
        .eq('client_id', clientId)
        .eq('is_default', true)
        .single()

      if (existing) {
        dashboard = existing
      } else {
        // Create default dashboard
        const { data: created } = await supabase
          .from('client_dashboards')
          .insert({
            client_id: clientId,
            name: 'Main Dashboard',
            is_default: true,
          })
          .select()
          .single()
        dashboard = created
      }
    }

    if (!dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 })
    }

    // Get widgets for this dashboard
    const { data: widgets, error } = await supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('dashboard_id', dashboard.id)
      .order('position', { ascending: true })

    if (error) throw error

    return NextResponse.json({ dashboard, widgets: widgets || [] })
  } catch (err: any) {
    console.error('Widgets GET error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST - Create a new widget
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dashboard_id, widget_type, platform, account_id, metric, size, title, config } = body

    if (!dashboard_id || !widget_type || !platform || !metric) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get max position
    const { data: existing } = await supabase
      .from('dashboard_widgets')
      .select('position')
      .eq('dashboard_id', dashboard_id)
      .order('position', { ascending: false })
      .limit(1)

    const nextPosition = (existing?.[0]?.position || 0) + 1

    const { data: widget, error } = await supabase
      .from('dashboard_widgets')
      .insert({
        dashboard_id,
        widget_type,
        platform,
        account_id,
        metric,
        size: size || 'small',
        title,
        position: nextPosition,
        config: config || {},
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ widget })
  } catch (err: any) {
    console.error('Widget POST error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE - Remove a widget
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const widgetId = searchParams.get('id')

  if (!widgetId) {
    return NextResponse.json({ error: 'Widget id required' }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from('dashboard_widgets')
      .delete()
      .eq('id', widgetId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Widget DELETE error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH - Update widget position or config
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, position, size, title, config } = body

    if (!id) {
      return NextResponse.json({ error: 'Widget id required' }, { status: 400 })
    }

    const updates: any = { updated_at: new Date().toISOString() }
    if (position !== undefined) updates.position = position
    if (size !== undefined) updates.size = size
    if (title !== undefined) updates.title = title
    if (config !== undefined) updates.config = config

    const { data: widget, error } = await supabase
      .from('dashboard_widgets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ widget })
  } catch (err: any) {
    console.error('Widget PATCH error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
