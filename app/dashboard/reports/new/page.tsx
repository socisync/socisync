'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

interface Client {
  id: string
  name: string
}

export default function NewReportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    report_type: 'monthly',
    date_from: '',
    date_to: ''
  })
  const [error, setError] = useState<string | null>(null)

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

      // Get clients with connected accounts
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name')
        .eq('agency_id', membership.agency_id)
        .eq('is_active', true)
        .order('name')

      setClients(clientsData || [])

      // Set default dates (last month)
      const now = new Date()
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      
      setFormData(prev => ({
        ...prev,
        date_from: lastMonth.toISOString().split('T')[0],
        date_to: lastMonthEnd.toISOString().split('T')[0]
      }))

      setLoading(false)
    }

    loadData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCreating(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: report, error: insertError } = await supabase
      .from('reports')
      .insert({
        client_id: formData.client_id,
        created_by: user?.id,
        title: formData.title,
        report_type: formData.report_type,
        date_from: formData.date_from,
        date_to: formData.date_to,
        platforms: ['meta'], // For now, just Meta
        status: 'draft'
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setCreating(false)
      return
    }

    // In the future, this would trigger PDF generation
    // For now, redirect to report view
    router.push(`/dashboard/reports/${report.id}`)
  }

  const selectedClient = clients.find(c => c.id === formData.client_id)

  // Auto-generate title when client and dates change
  useEffect(() => {
    if (selectedClient && formData.date_from) {
      const date = new Date(formData.date_from)
      const monthName = date.toLocaleString('default', { month: 'long' })
      const year = date.getFullYear()
      setFormData(prev => ({
        ...prev,
        title: `${selectedClient.name} - ${monthName} ${year} Report`
      }))
    }
  }, [formData.client_id, formData.date_from, selectedClient])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-500">Loading...</div></div>
  }

  return (
    <div className="max-w-2xl">
      <Link 
        href="/dashboard/reports"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Reports
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Create Report</h1>

      {clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-900 mb-2">No clients available</h3>
          <p className="text-slate-500 mb-4">Add a client and connect their social accounts first</p>
          <Link
            href="/dashboard/clients/new"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Add your first client →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Client *
              </label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                required
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Report Type
              </label>
              <select
                value={formData.report_type}
                onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  From Date *
                </label>
                <input
                  type="date"
                  value={formData.date_from}
                  onChange={(e) => setFormData({ ...formData, date_from: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  To Date *
                </label>
                <input
                  type="date"
                  value={formData.date_to}
                  onChange={(e) => setFormData({ ...formData, date_to: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="e.g. January 2026 Social Media Report"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={creating || !formData.client_id}
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                {creating ? 'Creating...' : 'Create Report'}
              </button>
              <Link
                href="/dashboard/reports"
                className="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
