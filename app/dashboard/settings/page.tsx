'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Users, CreditCard, Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

interface Agency {
  id: string
  name: string
  slug: string
  website: string | null
  logo_url: string | null
  subscription_tier: string
  subscription_status: string
  trial_ends_at: string | null
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [agency, setAgency] = useState<Agency | null>(null)
  const [formData, setFormData] = useState({ name: '', website: '' })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

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
        .select('agency_id, role, agencies(*)')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!membership?.agencies) {
        router.push('/onboarding')
        return
      }

      const agencyData = membership.agencies as unknown as Agency
      setAgency(agencyData)
      setFormData({
        name: agencyData.name,
        website: agencyData.website || ''
      })
      setLoading(false)
    }

    loadData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agency) return

    setSaving(true)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase
      .from('agencies')
      .update({
        name: formData.name,
        website: formData.website || null,
      })
      .eq('id', agency.id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Settings saved successfully' })
      setAgency({ ...agency, name: formData.name, website: formData.website || null })
    }

    setSaving(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-500">Loading...</div></div>
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <Link 
          href="/dashboard/settings" 
          className="px-4 py-2 border-b-2 border-primary-600 text-primary-600 font-medium -mb-px"
        >
          <span className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Agency</span>
        </Link>
        <Link 
          href="/dashboard/settings/team" 
          className="px-4 py-2 text-slate-500 hover:text-slate-700"
        >
          <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Team</span>
        </Link>
        <Link 
          href="/dashboard/settings/billing" 
          className="px-4 py-2 text-slate-500 hover:text-slate-700"
        >
          <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Billing</span>
        </Link>
      </div>

      {/* Agency Settings Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Agency Details</h2>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Agency Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
              Website
            </label>
            <input
              type="url"
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="https://youragency.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Agency Slug
            </label>
            <input
              type="text"
              value={agency?.slug || ''}
              disabled
              className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
            />
            <p className="text-xs text-slate-500 mt-1">Used in URLs. Contact support to change.</p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Subscription Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mt-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Subscription</h2>
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700 capitalize">
              {agency?.subscription_tier || 'Trial'}
            </span>
            <span className="ml-3 text-sm text-slate-500">
              Status: <span className="capitalize">{agency?.subscription_status || 'Active'}</span>
            </span>
            {agency?.trial_ends_at && agency.subscription_status === 'trialing' && (
              <span className="ml-3 text-sm text-slate-500">
                Trial ends: {new Date(agency.trial_ends_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <Link
            href="/dashboard/settings/billing"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Manage billing →
          </Link>
        </div>
      </div>
    </div>
  )
}
