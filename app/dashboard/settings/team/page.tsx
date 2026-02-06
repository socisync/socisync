'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Users, CreditCard, UserPlus, Mail, MoreVertical, Shield, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

interface TeamMember {
  id: string
  user_id: string
  role: string
  joined_at: string
  user_email?: string
  user_name?: string
}

interface Invite {
  id: string
  invited_email: string
  invited_at: string
  role: string
}

export default function TeamSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [inviting, setInviting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setCurrentUserId(user.id)

      const { data: membership } = await supabase
        .from('agency_members')
        .select('agency_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!membership) {
        router.push('/onboarding')
        return
      }

      setAgencyId(membership.agency_id)

      // Get all team members
      const { data: membersData } = await supabase
        .from('agency_members')
        .select('*')
        .eq('agency_id', membership.agency_id)
        .order('joined_at')

      // For now, we'll just show the member data we have
      // In production, you'd join with auth.users or a profiles table
      setMembers(membersData || [])
      setLoading(false)
    }

    loadData()
  }, [router])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agencyId) return

    setInviting(true)
    setMessage(null)

    // In production, this would:
    // 1. Create an invite record
    // 2. Send an email with invite link
    // 3. When accepted, add user to agency_members

    // For now, show a placeholder message
    setMessage({ 
      type: 'success', 
      text: `Invite functionality coming soon! Would invite ${inviteEmail} as ${inviteRole}.` 
    })
    
    setInviting(false)
    setShowInviteModal(false)
    setInviteEmail('')
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-500">Loading...</div></div>
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <Link 
          href="/dashboard/settings" 
          className="px-4 py-2 text-slate-500 hover:text-slate-700"
        >
          <span className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Agency</span>
        </Link>
        <Link 
          href="/dashboard/settings/team" 
          className="px-4 py-2 border-b-2 border-primary-600 text-primary-600 font-medium -mb-px"
        >
          <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Team</span>
        </Link>
        <Link 
          href="/dashboard/settings/billing" 
          className="px-4 py-2 text-slate-500 hover:text-slate-700"
        >
          <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Billing</span>
        </Link>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Team Members */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-semibold text-slate-900">Team Members</h2>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition flex items-center gap-1"
          >
            <UserPlus className="w-4 h-4" /> Invite Member
          </button>
        </div>

        <div className="divide-y divide-slate-200">
          {members.map((member) => (
            <div key={member.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600">
                    {member.user_id.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-slate-900">
                    {member.user_id === currentUserId ? 'You' : `User ${member.user_id.slice(0, 8)}...`}
                  </div>
                  <div className="text-sm text-slate-500">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  member.role === 'owner' 
                    ? 'bg-purple-100 text-purple-700'
                    : member.role === 'admin'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {member.role}
                </span>
                {member.user_id !== currentUserId && member.role !== 'owner' && (
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Invite Team Member</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="colleague@agency.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Admins can manage team members and billing.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
