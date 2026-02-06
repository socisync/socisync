import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react'
import SignOutButton from './sign-out-button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's agency for the sidebar
  const { data: membership } = await supabase
    .from('agency_members')
    .select('role, agencies(name, slug)')
    .eq('user_id', user.id)
    .single()

  const agency = membership?.agencies as any

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
          <NavLink href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />}>
            Dashboard
          </NavLink>
          <NavLink href="/dashboard/clients" icon={<Users className="w-5 h-5" />}>
            Clients
          </NavLink>
          <NavLink href="/dashboard/reports" icon={<FileText className="w-5 h-5" />}>
            Reports
          </NavLink>
          <NavLink href="/dashboard/settings" icon={<Settings className="w-5 h-5" />}>
            Settings
          </NavLink>
        </nav>

        {/* User Section */}
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, icon, children }: { href: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition"
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}
