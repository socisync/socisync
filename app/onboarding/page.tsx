'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function Onboarding() {
  const router = useRouter()
  const [agencyName, setAgencyName] = useState('')
  const [website, setWebsite] = useState('')
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

    // Create slug from agency name
    const slug = agencyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Create agency
    const { data: agency, error: insertError } = await supabase
      .from('agencies')
      .insert({
        name: agencyName,
        slug: slug,
        owner_id: user.id,
        website: website || null,
      })
      .select()
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        setError('An agency with this name already exists. Try a different name.')
      } else {
        setError(insertError.message)
      }
      setLoading(false)
      return
    }

    // Add user as agency member (owner)
    const { error: memberError } = await supabase
      .from('agency_members')
      .insert({
        agency_id: agency.id,
        user_id: user.id,
        role: 'owner',
      })

    if (memberError) {
      setError('Agency created but failed to add membership: ' + memberError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-slate-900">Socisync</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Onboarding Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚀</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Set up your agency</h1>
              <p className="text-slate-500">Let&apos;s get your workspace ready</p>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="agencyName" className="block text-sm font-medium text-slate-700 mb-1">
                  Agency name *
                </label>
                <input
                  type="text"
                  id="agencyName"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  placeholder="Acme Digital Marketing"
                  required
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
                  Website <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  type="url"
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  placeholder="https://acme.agency"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Agency'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
