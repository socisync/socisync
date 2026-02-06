'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Send, Loader2, FileText, Calendar, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

interface Report {
  id: string
  title: string
  report_type: string
  date_from: string
  date_to: string
  status: string
  created_at: string
  pdf_url: string | null
  client: {
    id: string
    name: string
  }
}

export default function ReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: reportData } = await supabase
        .from('reports')
        .select(`
          *,
          clients (
            id,
            name
          )
        `)
        .eq('id', reportId)
        .single()

      if (!reportData) {
        router.push('/dashboard/reports')
        return
      }

      setReport({
        ...reportData,
        client: reportData.clients
      })
      setLoading(false)
    }

    loadData()
  }, [reportId, router])

  const generatePDF = async () => {
    setGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate PDF')
      }

      // Download the PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report?.title.replace(/[^a-z0-9]/gi, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Update local state
      setReport(prev => prev ? { ...prev, status: 'ready' } : null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-500">Loading...</div></div>
  }

  if (!report) {
    return <div>Report not found</div>
  }

  return (
    <div className="max-w-3xl">
      <Link 
        href="/dashboard/reports"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Reports
      </Link>

      {/* Report Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{report.title}</h1>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                report.status === 'ready' ? 'bg-green-100 text-green-700' :
                report.status === 'generating' ? 'bg-yellow-100 text-yellow-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {report.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 text-slate-500">
            <Building2 className="w-4 h-4" />
            <div>
              <div className="text-xs text-slate-400">Client</div>
              <div className="text-sm font-medium text-slate-700">{report.client.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="w-4 h-4" />
            <div>
              <div className="text-xs text-slate-400">Period</div>
              <div className="text-sm font-medium text-slate-700">
                {new Date(report.date_from).toLocaleDateString()} - {new Date(report.date_to).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <FileText className="w-4 h-4" />
            <div>
              <div className="text-xs text-slate-400">Type</div>
              <div className="text-sm font-medium text-slate-700 capitalize">{report.report_type}</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={generatePDF}
            disabled={generating}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate & Download PDF
              </>
            )}
          </button>
          <button
            disabled={report.status !== 'ready'}
            className="px-6 py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Email to Client
          </button>
        </div>
      </div>

      {/* Preview Placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Report Preview</h2>
        <div className="bg-slate-50 rounded-lg p-8 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 mb-2">PDF preview coming soon</p>
          <p className="text-sm text-slate-400">
            Click "Generate & Download PDF" to create and download the report
          </p>
        </div>
      </div>
    </div>
  )
}
