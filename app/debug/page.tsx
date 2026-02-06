'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function DebugPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      const { data: memberships, error: membershipError } = await supabase
        .from('agency_members')
        .select('*')
      
      const { data: agencies, error: agenciesError } = await supabase
        .from('agencies')
        .select('*')
      
      setData({
        user: user ? { id: user.id, email: user.email } : null,
        userError: userError?.message,
        memberships,
        membershipError: membershipError?.message,
        agencies,
        agenciesError: agenciesError?.message,
      })
      setLoading(false)
    }
    
    fetchData()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
      <pre className="bg-slate-100 p-4 rounded overflow-auto text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
