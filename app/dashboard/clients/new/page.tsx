'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

export default function NewClient() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [industry, setIndustry] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    // Get user's agency (first/oldest if multiple)
    const { data: memberships } = await supabase
      .from('agency_members')
      .select('agency_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)

    if (!memberships || memberships.length === 0) {
      setError('No agency found')
      setLoading(false)
      return
    }

    const membership = memberships[0]

    // Create client
    const { data: client, error: insertError } = await supabase
      .from('clients')
      .insert({
        agency_id: membership.agency_id,
        name,
        website: website || null,
        industry: industry || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/dashboard/clients/${client.id}`)
    router.refresh()
  }

  return (
    <div>
      <div className="mb-6">
        <Link 
          href="/dashboard/clients"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Add New Client</h1>
      </div>

      <div className="max-w-xl">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Client name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                placeholder="Acme Corporation"
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
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                placeholder="https://acme.com"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-1">
                Industry
              </label>
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              >
                <option value="">Select an industry</option>
                <option value="ecommerce">E-commerce</option>
                <option value="saas">SaaS / Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="realestate">Real Estate</option>
                <option value="hospitality">Hospitality</option>
                <option value="education">Education</option>
                <option value="nonprofit">Non-profit</option>
                <option value="retail">Retail</option>
                <option value="professional">Professional Services</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition resize-none"
                placeholder="Any additional notes about this client..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Client'}
              </button>
              <Link
                href="/dashboard/clients"
                className="px-6 py-3 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
