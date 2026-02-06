'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Youtube, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

interface Channel {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  subscriberCount: number
}

export default function SelectYouTubeChannels() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const refreshToken = searchParams.get('refresh')
  const clientId = searchParams.get('client_id')
  const expiresIn = searchParams.get('expires')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadChannels() {
      if (!token) {
        setError('No access token provided')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/youtube/channels?token=${encodeURIComponent(token)}`)
        const data = await res.json()

        if (data.error) {
          setError(data.error)
          setLoading(false)
          return
        }

        setChannels(data.channels || [])
        setLoading(false)
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }

    loadChannels()
  }, [token])

  const toggleChannel = (channelId: string) => {
    const newSelected = new Set(selectedChannels)
    if (newSelected.has(channelId)) {
      newSelected.delete(channelId)
    } else {
      newSelected.add(channelId)
    }
    setSelectedChannels(newSelected)
  }

  const formatSubscribers = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M subscribers`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K subscribers`
    return `${count} subscribers`
  }

  const saveConnections = async () => {
    if (selectedChannels.size === 0) return
    
    setSaving(true)
    const supabase = createClient()

    try {
      for (const channelId of Array.from(selectedChannels)) {
        const channel = channels.find(c => c.id === channelId)
        if (!channel) continue

        await supabase.from('connected_accounts').upsert({
          client_id: clientId,
          platform: 'youtube',
          platform_account_id: channelId,
          platform_account_name: channel.title,
          platform_account_type: 'channel',
          access_token: token,
          refresh_token: refreshToken,
          token_expires_at: expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 1000).toISOString() : null,
          metadata: { thumbnailUrl: channel.thumbnailUrl },
          is_active: true,
          last_synced_at: new Date().toISOString(),
        }, {
          onConflict: 'client_id,platform,platform_account_id'
        })
      }

      router.push(`/dashboard/clients/${clientId}?connected=youtube`)
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading your channels...</div>
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
        <h1 className="text-xl font-bold text-slate-900 mb-2">Select YouTube Channels</h1>
        <p className="text-slate-500 mb-6">Choose which channels to connect for this client.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {channels.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No YouTube channels found.</p>
            <p className="text-sm text-slate-400 mt-2">Make sure you have at least one channel on your account.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {channels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => toggleChannel(channel.id)}
                className={`p-4 border rounded-lg cursor-pointer transition ${
                  selectedChannels.has(channel.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {channel.thumbnailUrl ? (
                        <img src={channel.thumbnailUrl} alt="" className="w-10 h-10 object-cover" />
                      ) : (
                        <Youtube className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{channel.title}</div>
                      <div className="text-sm text-slate-500">{formatSubscribers(channel.subscriberCount)}</div>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedChannels.has(channel.id)
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-slate-300'
                  }`}>
                    {selectedChannels.has(channel.id) && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={saveConnections}
            disabled={selectedChannels.size === 0 || saving}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Connecting...' : `Connect ${selectedChannels.size} Channel${selectedChannels.size !== 1 ? 's' : ''}`}
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
