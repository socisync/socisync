'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText, Calendar, Download, Send, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

interface Report {
  id: string
  title: string
  client_name: string
  report_type: string
  date_from: string
  date_to: string
  status: string
  created_at: string
  pdf_url: string | null
}

export default function ReportsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<Report[]>([])
  const [agencyId, setAgencyId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: membership } = await supabase
        .from('agency_members')
        .select('agency_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!membership) {
        router.push('/onboarding')
        return
      }

      setAgencyId(membership.agency_id)

      // Get reports through clients
      const { data: reportsData } = await supabase
        .from('reports')
        .select(`
          *,
          clients!inner(name, agency_id)
        `)
        .eq('clients.agency_id', membership.agency_id)
        .order('created_at', { ascending: false })

      if (reportsData) {
        setReports(reportsData.map(r => ({
          ...r,
          client_name: (r.clients as any).name
        })))
      }

      setLoading(false)
    }

    loadData()
  }, [router])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-500">Loading...</div></div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500">{reports.length} reports generated</p>
        </div>
        <Link
          href="/dashboard/reports/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Report
        </Link>
      </div>

      {reports.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Report</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Period</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Created</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{report.title}</div>
                        <div className="text-sm text-slate-500 capitalize">{report.report_type} report</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{report.client_name}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">
                    {new Date(report.date_from).toLocaleDateString()} - {new Date(report.date_to).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      report.status === 'ready' ? 'bg-green-100 text-green-700' :
                      report.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                      report.status === 'generating' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {new Date(report.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {report.pdf_url && (
                        <a
                          href={report.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      <button className="text-slate-400 hover:text-slate-600">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">No reports yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            Create your first report to showcase your client's social media performance
          </p>
          <Link
            href="/dashboard/reports/new"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="w-4 h-4" /> Create Your First Report
          </Link>
        </div>
      )}
    </div>
  )
}
