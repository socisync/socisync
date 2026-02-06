'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, BarChart3, FileText, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

interface Agency {
  id: string
  name: string
}

interface Client {
  id: string
  name: string
  website: string | null
  created_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [agency, setAgency] = useState<Agency | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [clientsCount, setClientsCount] = useState(0)
  const [accountsCount, setAccountsCount] = useState(0)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      // Check auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get membership
      const { data: membership } = await supabase
        .from('agency_members')
        .select('agency_id, role, agencies(*)')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!membership) {
        router.push('/onboarding')
        return
      }

      const agencyData = membership.agencies as any
      setAgency(agencyData)

      // Get clients
      const { data: clientsData, count } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('agency_id', agencyData.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setClients(clientsData || [])
      setClientsCount(count || 0)

      // Get accounts count
      const { count: acctCount } = await supabase
        .from('connected_accounts')
        .select('*, clients!inner(agency_id)', { count: 'exact', head: true })
        .eq('clients.agency_id', agencyData.id)

      setAccountsCount(acctCount || 0)
      setLoading(false)
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back!</h1>
        <p className="text-slate-500">{agency?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<Users className="w-6 h-6" />}
          label="Total Clients"
          value={clientsCount}
        />
        <StatCard 
          icon={<BarChart3 className="w-6 h-6" />}
          label="Connected Accounts"
          value={accountsCount}
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
        
        {clients.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {clients.map((client) => (
              <Link 
                key={client.id}
                href={`/dashboard/clients/${client.id}`}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition block"
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
