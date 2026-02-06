import { NextResponse, type NextRequest } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@supabase/supabase-js'
import { ReportDocument, type ReportData } from '@/lib/pdf/report-template'
import { getPageInsights, getInstagramInsights } from '@/lib/meta-api'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { report_id } = await request.json()

    if (!report_id) {
      return NextResponse.json({ error: 'report_id required' }, { status: 400 })
    }

    // Get report with client and agency info
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select(`
        *,
        clients (
          id,
          name,
          agency_id,
          agencies (
            name
          )
        )
      `)
      .eq('id', report_id)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Update status to generating
    await supabase
      .from('reports')
      .update({ status: 'generating' })
      .eq('id', report_id)

    // Get connected accounts for this client
    const { data: accounts } = await supabase
      .from('connected_accounts')
      .select('*')
      .eq('client_id', report.client_id)
      .eq('is_active', true)

    // Fetch metrics from each platform
    const metrics: ReportData['metrics'] = []
    
    if (accounts) {
      for (const account of accounts) {
        if (account.platform === 'meta' && account.access_token) {
          if (account.platform_account_type === 'facebook_page') {
            const insights = await getPageInsights(
              account.platform_account_id,
              account.access_token,
              new Date(report.date_from),
              new Date(report.date_to)
            )
            if (insights) {
              metrics.push(
                { label: 'Facebook Followers', value: insights.followers, platform: 'facebook' },
                { label: 'Page Views', value: insights.pageViews, platform: 'facebook' },
                { label: 'Post Reach', value: insights.postReach, platform: 'facebook' },
                { label: 'Post Engagement', value: insights.postEngagement, platform: 'facebook' }
              )
            }
          } else if (account.platform_account_type === 'instagram_business') {
            const insights = await getInstagramInsights(
              account.platform_account_id,
              account.access_token,
              new Date(report.date_from),
              new Date(report.date_to)
            )
            if (insights) {
              metrics.push(
                { label: 'Instagram Followers', value: insights.followers, platform: 'instagram' },
                { label: 'Profile Views', value: insights.profileViews, platform: 'instagram' },
                { label: 'Instagram Reach', value: insights.reach, platform: 'instagram' },
                { label: 'Impressions', value: insights.impressions, platform: 'instagram' }
              )
            }
          }
        }
      }
    }

    // If no metrics from API, add placeholder data
    if (metrics.length === 0) {
      metrics.push(
        { label: 'Total Followers', value: 'Connect accounts to view', platform: 'general' },
        { label: 'Total Reach', value: 'Connect accounts to view', platform: 'general' },
        { label: 'Total Engagement', value: 'Connect accounts to view', platform: 'general' },
        { label: 'Total Impressions', value: 'Connect accounts to view', platform: 'general' }
      )
    }

    // Build report data
    const reportData: ReportData = {
      title: report.title,
      clientName: report.clients.name,
      agencyName: report.clients.agencies.name,
      dateRange: `${new Date(report.date_from).toLocaleDateString()} - ${new Date(report.date_to).toLocaleDateString()}`,
      generatedAt: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      metrics,
      summary: `This report covers social media performance for ${report.clients.name} during the period ${new Date(report.date_from).toLocaleDateString()} to ${new Date(report.date_to).toLocaleDateString()}.`,
      highlights: metrics.length > 0 ? [
        `${metrics.length} metrics tracked across connected platforms`,
        'Data pulled directly from platform APIs',
      ] : undefined
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(ReportDocument({ data: reportData }))

    // Upload to Supabase Storage (if configured) or return buffer
    // For now, we'll store as base64 in the response and update the report

    // Update report status
    await supabase
      .from('reports')
      .update({ 
        status: 'ready',
        // In production, store PDF URL from storage
        // pdf_url: uploadedUrl 
      })
      .eq('id', report_id)

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer)

    // Return PDF as download
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${report.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
