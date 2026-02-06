'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function DebugPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [fixing, setFixing] = useState(false)
  const [fixResult, setFixResult] = useState<string | null>(null)

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

  useEffect(() => {
    fetchData()
  }, [])

  const fixMembership = async () => {
    setFixing(true)
    setFixResult(null)
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setFixResult('Error: Not authenticated')
      setFixing(false)
      return
    }

    // Find agency where user is owner
    const { data: agency } = await supabase
      .from('agencies')
      .select('id, name')
      .eq('owner_id', user.id)
      .single()

    if (!agency) {
      setFixResult('Error: No agency found where you are the owner')
      setFixing(false)
      return
    }

    // Check if membership already exists
    const { data: existing } = await supabase
      .from('agency_members')
      .select('id')
      .eq('agency_id', agency.id)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      setFixResult('Membership already exists!')
      setFixing(false)
      await fetchData()
      return
    }

    // Create membership
    const { error } = await supabase
      .from('agency_members')
      .insert({
        agency_id: agency.id,
        user_id: user.id,
        role: 'owner',
      })

    if (error) {
      setFixResult('Error: ' + error.message)
    } else {
      setFixResult(`✅ Fixed! Added you as owner of "${agency.name}"`)
    }
    
    setFixing(false)
    await fetchData()
  }

  if (loading) return <div className="p-8">Loading...</div>

  const needsFix = data?.agencies?.length > 0 && (!data?.memberships || data.memberships.length === 0)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
      
      {needsFix && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 mb-2">⚠️ You have an agency but no membership record. This causes "No agency found" errors.</p>
          <button
            onClick={fixMembership}
            disabled={fixing}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            {fixing ? 'Fixing...' : 'Fix My Membership'}
          </button>
          {fixResult && <p className="mt-2 text-sm">{fixResult}</p>}
        </div>
      )}

      {fixResult && !needsFix && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {fixResult}
        </div>
      )}

      <pre className="bg-slate-100 p-4 rounded overflow-auto text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
