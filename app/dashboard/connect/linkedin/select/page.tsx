'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Linkedin, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

interface Organization {
  id: string
  name: string
  vanityName: string
  logoUrl?: string
}

export default function SelectLinkedInPages() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const clientId = searchParams.get('client_id')
  const expiresIn = searchParams.get('expires')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadOrganizations() {
      if (!token) {
        setError('No access token provided')
        setLoading(false)
        return
      }

      try {
        // Fetch organizations via our API
        const res = await fetch(`/api/linkedin/organizations?token=${encodeURIComponent(token)}`)
        const data = await res.json()

        if (data.error) {
          setError(data.error)
          setLoading(false)
          return
        }

        setOrganizations(data.organizations || [])
        setLoading(false)
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }

    loadOrganizations()
  }, [token])

  const toggleOrg = (orgId: string) => {
    const newSelected = new Set(selectedOrgs)
    if (newSelected.has(orgId)) {
      newSelected.delete(orgId)
    } else {
      newSelected.add(orgId)
    }
    setSelectedOrgs(newSelected)
  }

  const saveConnections = async () => {
    if (selectedOrgs.size === 0) return
    
    setSaving(true)
    const supabase = createClient()

    try {
      for (const orgId of Array.from(selectedOrgs)) {
        const org = organizations.find(o => o.id === orgId)
        if (!org) continue

        await supabase.from('connected_accounts').upsert({
          client_id: clientId,
          platform: 'linkedin',
          platform_account_id: orgId,
          platform_account_name: org.name,
          platform_account_type: 'company_page',
          access_token: token,
          token_expires_at: expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 1000).toISOString() : null,
          metadata: { vanityName: org.vanityName },
          is_active: true,
          last_synced_at: new Date().toISOString(),
        }, {
          onConflict: 'client_id,platform,platform_account_id'
        })
      }

      router.push(`/dashboard/clients/${clientId}?connected=linkedin`)
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading your organizations...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link 
        href={clientId ? `/dashboard/clients/${clientId}` : '/dashboard/clients'}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Select LinkedIn Pages</h1>
        <p className="text-slate-500 mb-6">Choose which company pages to connect for this client.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {organizations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No LinkedIn company pages found.</p>
            <p className="text-sm text-slate-400 mt-2">Make sure you're an admin of at least one company page.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {organizations.map((org) => (
              <div
                key={org.id}
                onClick={() => toggleOrg(org.id)}
                className={`p-4 border rounded-lg cursor-pointer transition ${
                  selectedOrgs.has(org.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                      {org.logoUrl ? (
                        <img src={org.logoUrl} alt="" className="w-8 h-8 rounded" />
                      ) : (
                        <Linkedin className="w-5 h-5 text-sky-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{org.name}</div>
                      {org.vanityName && (
                        <div className="text-sm text-slate-500">linkedin.com/company/{org.vanityName}</div>
                      )}
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedOrgs.has(org.id)
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-slate-300'
                  }`}>
                    {selectedOrgs.has(org.id) && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={saveConnections}
            disabled={selectedOrgs.size === 0 || saving}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Connecting...' : `Connect ${selectedOrgs.size} Page${selectedOrgs.size !== 1 ? 's' : ''}`}
          </button>
          <Link
            href={clientId ? `/dashboard/clients/${clientId}` : '/dashboard/clients'}
            className="px-6 py-3 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  )
}
