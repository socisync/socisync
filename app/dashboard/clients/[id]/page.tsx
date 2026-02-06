import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { ArrowLeft, Plus, Facebook, Linkedin, Youtube, Music2 } from 'lucide-react'

const platformIcons: Record<string, any> = {
  meta: Facebook,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: Music2,
}

const platformColors: Record<string, string> = {
  meta: 'bg-blue-100 text-blue-600',
  linkedin: 'bg-sky-100 text-sky-600',
  youtube: 'bg-red-100 text-red-600',
  tiktok: 'bg-slate-100 text-slate-600',
}

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user's agency
  const { data: membership } = await supabase
    .from('agency_members')
    .select('agency_id')
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    redirect('/onboarding')
  }

  // Get client (ensure it belongs to user's agency)
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .eq('agency_id', membership.agency_id)
    .single()

  if (!client) {
    notFound()
  }

  // Get connected accounts
  const { data: accounts } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('client_id', client.id)
    .order('platform')

  return (
    <div>
      {/* Back link */}
      <Link 
        href="/dashboard/clients"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </Link>

      {/* Client Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-slate-600">
              {client.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
            {client.website && (
              <a 
                href={client.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                {client.website}
              </a>
            )}
            <div className="flex gap-4 mt-2 text-sm text-slate-500">
              {client.industry && (
                <span className="capitalize">{client.industry}</span>
              )}
              <span className={client.is_active ? 'text-green-600' : 'text-slate-400'}>
                {client.is_active ? '● Active' : '○ Inactive'}
              </span>
            </div>
          </div>
        </div>
        {client.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-slate-600 text-sm">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Connected Accounts */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-semibold text-slate-900">Connected Accounts</h2>
          <button 
            className="text-sm bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Connect Account
          </button>
        </div>

        {accounts && accounts.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {accounts.map((account) => {
              const Icon = platformIcons[account.platform] || Facebook
              const colorClass = platformColors[account.platform] || 'bg-slate-100 text-slate-600'
              
              return (
                <div key={account.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {account.platform_account_name || 'Unnamed Account'}
                      </div>
                      <div className="text-sm text-slate-500 capitalize">
                        {account.platform} • {account.platform_account_type || 'Account'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {account.last_synced_at && (
                      <span className="text-sm text-slate-400">
                        Synced {new Date(account.last_synced_at).toLocaleDateString()}
                      </span>
                    )}
                    <span className={`text-sm ${account.is_active ? 'text-green-600' : 'text-red-500'}`}>
                      {account.is_active ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="flex justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Facebook className="w-5 h-5 text-blue-600" />
              </div>
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                <Linkedin className="w-5 h-5 text-sky-600" />
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Youtube className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <h3 className="font-medium text-slate-900 mb-1">No accounts connected</h3>
            <p className="text-slate-500 text-sm mb-4">
              Connect social accounts to start pulling analytics
            </p>
            <button className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
              <Plus className="w-4 h-4" /> Connect First Account
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
