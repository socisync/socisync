'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Facebook, Instagram, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

interface Page {
  id: string
  name: string
  access_token: string
  category: string
  instagram_business_account?: {
    id: string
    username: string
  }
}

export default function SelectMetaPages() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const clientId = searchParams.get('client_id')
  const expiresIn = searchParams.get('expires')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pages, setPages] = useState<Page[]>([])
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadPages() {
      if (!token) {
        setError('No access token provided')
        setLoading(false)
        return
      }

      try {
        // Fetch user's pages
        const res = await fetch(
          `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,category,instagram_business_account{id,username}&access_token=${token}`
        )
        const data = await res.json()

        if (data.error) {
          setError(data.error.message)
          setLoading(false)
          return
        }

        setPages(data.data || [])
        setLoading(false)
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }

    loadPages()
  }, [token])

  const togglePage = (pageId: string) => {
    const newSelected = new Set(selectedPages)
    if (newSelected.has(pageId)) {
      newSelected.delete(pageId)
    } else {
      newSelected.add(pageId)
    }
    setSelectedPages(newSelected)
  }

  const saveConnections = async () => {
    if (selectedPages.size === 0) return
    
    setSaving(true)
    const supabase = createClient()

    try {
      for (const pageId of selectedPages) {
        const page = pages.find(p => p.id === pageId)
        if (!page) continue

        // Save Facebook Page
        await supabase.from('connected_accounts').upsert({
          client_id: clientId,
          platform: 'meta',
          platform_account_id: page.id,
          platform_account_name: page.name,
          platform_account_type: 'facebook_page',
          access_token: page.access_token,
          token_expires_at: expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 1000).toISOString() : null,
          metadata: { category: page.category },
          is_active: true,
          last_synced_at: new Date().toISOString(),
        }, {
          onConflict: 'client_id,platform,platform_account_id'
        })

        // Save Instagram if connected
        if (page.instagram_business_account) {
          await supabase.from('connected_accounts').upsert({
            client_id: clientId,
            platform: 'meta',
            platform_account_id: page.instagram_business_account.id,
            platform_account_name: `@${page.instagram_business_account.username}`,
            platform_account_type: 'instagram_business',
            access_token: page.access_token, // Use page token for IG
            token_expires_at: expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 1000).toISOString() : null,
            metadata: { linked_facebook_page: page.id },
            is_active: true,
            last_synced_at: new Date().toISOString(),
          }, {
            onConflict: 'client_id,platform,platform_account_id'
          })
        }
      }

      router.push(`/dashboard/clients/${clientId}?connected=meta`)
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading your pages...</div>
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
        <h1 className="text-xl font-bold text-slate-900 mb-2">Select Pages to Connect</h1>
        <p className="text-slate-500 mb-6">Choose which Facebook Pages and Instagram accounts to connect for this client.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {pages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No Facebook Pages found on your account.</p>
            <p className="text-sm text-slate-400 mt-2">Make sure you have admin access to at least one Facebook Page.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {pages.map((page) => (
              <div
                key={page.id}
                onClick={() => togglePage(page.id)}
                className={`p-4 border rounded-lg cursor-pointer transition ${
                  selectedPages.has(page.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Facebook className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{page.name}</div>
                      <div className="text-sm text-slate-500">{page.category}</div>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedPages.has(page.id)
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-slate-300'
                  }`}>
                    {selectedPages.has(page.id) && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
                
                {page.instagram_business_account && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    <span className="text-sm text-slate-600">
                      @{page.instagram_business_account.username} will also be connected
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={saveConnections}
            disabled={selectedPages.size === 0 || saving}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Connecting...' : `Connect ${selectedPages.size} Page${selectedPages.size !== 1 ? 's' : ''}`}
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
