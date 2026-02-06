'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { LayoutDashboard, Users, FileText, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import SignOutButton from './sign-out-button'

interface User {
  id: string
  email: string
  user_metadata?: { full_name?: string }
}

interface Agency {
  name: string
  slug: string
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [agency, setAgency] = useState<Agency | null>(null)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user as User)

      // Get agency
      const { data: membership } = await supabase
        .from('agency_members')
        .select('role, agencies(name, slug)')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (membership?.agencies) {
        setAgency(membership.agencies as unknown as Agency)
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 border-b border-slate-200 flex items-center px-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-slate-900">Socisync</span>
          </Link>
        </div>

        {/* Agency Name */}
        {agency && (
          <div className="px-6 py-4 border-b border-slate-200">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Agency</p>
            <p className="font-medium text-slate-900 truncate">{agency.name}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavLink href="/dashboard" active={pathname === '/dashboard'} icon={<LayoutDashboard className="w-5 h-5" />}>
            Dashboard
          </NavLink>
          <NavLink href="/dashboard/clients" active={pathname?.startsWith('/dashboard/clients')} icon={<Users className="w-5 h-5" />}>
            Clients
          </NavLink>
          <NavLink href="/dashboard/reports" active={pathname?.startsWith('/dashboard/reports')} icon={<FileText className="w-5 h-5" />}>
            Reports
          </NavLink>
          <NavLink href="/dashboard/settings" active={pathname?.startsWith('/dashboard/settings')} icon={<Settings className="w-5 h-5" />}>
            Settings
          </NavLink>
        </nav>

        {/* User Section */}
        {user && (
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-slate-600">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, icon, children, active }: { href: string, icon: React.ReactNode, children: React.ReactNode, active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
        active 
          ? 'bg-primary-50 text-primary-700' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}
