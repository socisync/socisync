import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

export default async function ClientsPage() {
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

  // Get all clients
  const { data: clients } = await supabase
    .from('clients')
    .select(`
      *,
      connected_accounts(count)
    `)
    .eq('agency_id', membership.agency_id)
    .order('name')

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500">{clients?.length || 0} total clients</p>
        </div>
        <Link 
          href="/dashboard/clients/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Client
        </Link>
      </div>

      {/* Clients Grid */}
      {clients && clients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-semibold text-slate-600">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{client.name}</h3>
                  {client.website && (
                    <p className="text-sm text-slate-500 truncate">{client.website}</p>
                  )}
                  {client.industry && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full capitalize">
                      {client.industry}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-sm">
                <span className="text-slate-500">
                  {(client.connected_accounts as any)?.[0]?.count || 0} connected accounts
                </span>
                <span className={client.is_active ? 'text-green-600' : 'text-slate-400'}>
                  {client.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">No clients yet</h3>
          <p className="text-slate-500 mb-6">Add your first client to start managing their social accounts</p>
          <Link 
            href="/dashboard/clients/new"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="w-4 h-4" /> Add Your First Client
          </Link>
        </div>
      )}
    </div>
  )
}
