import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { Users, BarChart3, FileText, Plus } from 'lucide-react'

export default async function Dashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user's agency
  const { data: membership } = await supabase
    .from('agency_members')
    .select('agency_id, role, agencies(*)')
    .eq('user_id', user.id)
    .single()

  // No agency? Send to onboarding
  if (!membership) {
    redirect('/onboarding')
  }

  const agency = membership.agencies as any

  // Get clients count
  const { count: clientsCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agency.id)

  // Get connected accounts count
  const { count: accountsCount } = await supabase
    .from('connected_accounts')
    .select('*, clients!inner(agency_id)', { count: 'exact', head: true })
    .eq('clients.agency_id', agency.id)

  // Get recent clients
  const { data: recentClients } = await supabase
    .from('clients')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back!</h1>
        <p className="text-slate-500">{agency.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<Users className="w-6 h-6" />}
          label="Total Clients"
          value={clientsCount || 0}
        />
        <StatCard 
          icon={<BarChart3 className="w-6 h-6" />}
          label="Connected Accounts"
          value={accountsCount || 0}
        />
        <StatCard 
          icon={<FileText className="w-6 h-6" />}
          label="Reports Generated"
          value={0}
        />
      </div>

      {/* Recent Clients */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-semibold text-slate-900">Recent Clients</h2>
          <Link 
            href="/dashboard/clients/new"
            className="text-sm bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Client
          </Link>
        </div>
        
        {recentClients && recentClients.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {recentClients.map((client) => (
              <Link 
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-semibold text-slate-600">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{client.name}</div>
                    {client.website && (
                      <div className="text-sm text-slate-500">{client.website}</div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-slate-400">
                  {new Date(client.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-medium text-slate-900 mb-1">No clients yet</h3>
            <p className="text-slate-500 text-sm mb-4">Add your first client to get started</p>
            <Link 
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="w-4 h-4" /> Add Your First Client
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <div className="text-sm text-slate-500">{label}</div>
        </div>
      </div>
    </div>
  )
}
