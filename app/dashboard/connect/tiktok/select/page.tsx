'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Music2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

interface Advertiser {
  advertiser_id: string
  advertiser_name: string
  currency: string
  timezone: string
}

export default function SelectTikTokAdvertisers() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const clientId = searchParams.get('client_id')
  const expiresIn = searchParams.get('expires')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [selectedAds, setSelectedAds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadAdvertisers() {
      if (!token) {
        setError('No access token provided')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/tiktok/advertisers?token=${encodeURIComponent(token)}`)
        const data = await res.json()

        if (data.error) {
          setError(data.error)
          setLoading(false)
          return
        }

        setAdvertisers(data.advertisers || [])
        setLoading(false)
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }

    loadAdvertisers()
  }, [token])

  const toggleAdvertiser = (advId: string) => {
    const newSelected = new Set(selectedAds)
    if (newSelected.has(advId)) {
      newSelected.delete(advId)
    } else {
      newSelected.add(advId)
    }
    setSelectedAds(newSelected)
  }

  const saveConnections = async () => {
    if (selectedAds.size === 0) return
    
    setSaving(true)
    const supabase = createClient()

    try {
      for (const advId of Array.from(selectedAds)) {
        const adv = advertisers.find(a => a.advertiser_id === advId)
        if (!adv) continue

        await supabase.from('connected_accounts').upsert({
          client_id: clientId,
          platform: 'tiktok',
          platform_account_id: advId,
          platform_account_name: adv.advertiser_name,
          platform_account_type: 'ads_account',
          access_token: token,
          token_expires_at: expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 1000).toISOString() : null,
          metadata: { currency: adv.currency, timezone: adv.timezone },
          is_active: true,
          last_synced_at: new Date().toISOString(),
        }, {
          onConflict: 'client_id,platform,platform_account_id'
        })
      }

      router.push(`/dashboard/clients/${clientId}?connected=tiktok`)
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading your ad accounts...</div>
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
        <h1 className="text-xl font-bold text-slate-900 mb-2">Select TikTok Ad Accounts</h1>
        <p className="text-slate-500 mb-6">Choose which ad accounts to connect for this client.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {advertisers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No TikTok ad accounts found.</p>
            <p className="text-sm text-slate-400 mt-2">Make sure you have access to at least one advertiser account.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {advertisers.map((adv) => (
              <div
                key={adv.advertiser_id}
                onClick={() => toggleAdvertiser(adv.advertiser_id)}
                className={`p-4 border rounded-lg cursor-pointer transition ${
                  selectedAds.has(adv.advertiser_id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                      <Music2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{adv.advertiser_name}</div>
                      <div className="text-sm text-slate-500">{adv.currency} • {adv.timezone}</div>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAds.has(adv.advertiser_id)
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-slate-300'
                  }`}>
                    {selectedAds.has(adv.advertiser_id) && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={saveConnections}
            disabled={selectedAds.size === 0 || saving}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Connecting...' : `Connect ${selectedAds.size} Account${selectedAds.size !== 1 ? 's' : ''}`}
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
