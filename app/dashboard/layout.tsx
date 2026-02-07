'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Users, FileText, Settings, Search, 
  ChevronLeft, ChevronRight, Bell, Zap 
} from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import SignOutButton from './sign-out-button'
import { CommandPalette, useCommandPalette } from '@/components/ui/command-palette'
import { CreditBalanceMini } from '@/components/credits/credit-balance'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface User {
  id: string
  email: string
  user_metadata?: { full_name?: string }
}

interface Agency {
  name: string
  slug: string
}

interface Client {
  id: string
  name: string
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
  const [clients, setClients] = useState<Client[]>([])
  const [collapsed, setCollapsed] = useState(false)
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette()

  // Credit balance (demo values - would come from API)
  const [credits] = useState({ current: 377, total: 500 })

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
        .select('role, agency_id, agencies(name, slug)')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (membership?.agencies) {
        setAgency(membership.agencies as unknown as Agency)

        // Get clients for command palette
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, name')
          .eq('agency_id', membership.agency_id)
          .order('name')
          .limit(20)

        setClients(clientsData || [])
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  // Keyboard shortcut for sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '\\' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCollapsed(prev => !prev)
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        "bg-card border-r flex flex-col transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}>
        {/* Logo */}
        <div className="h-16 border-b flex items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-lg">S</span>
            </div>
            {!collapsed && <span className="text-xl font-bold">Socisync</span>}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-muted rounded transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Agency Name */}
        {agency && !collapsed && (
          <div className="px-4 py-3 border-b">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Agency</p>
            <p className="font-medium truncate">{agency.name}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          <NavLink 
            href="/dashboard" 
            active={pathname === '/dashboard'} 
            icon={<LayoutDashboard className="w-5 h-5" />}
            collapsed={collapsed}
          >
            Dashboard
          </NavLink>
          <NavLink 
            href="/dashboard/clients" 
            active={pathname?.startsWith('/dashboard/clients')} 
            icon={<Users className="w-5 h-5" />}
            collapsed={collapsed}
          >
            Clients
          </NavLink>
          <NavLink 
            href="/dashboard/reports" 
            active={pathname?.startsWith('/dashboard/reports')} 
            icon={<FileText className="w-5 h-5" />}
            collapsed={collapsed}
          >
            Reports
          </NavLink>
          <NavLink 
            href="/dashboard/settings" 
            active={pathname?.startsWith('/dashboard/settings')} 
            icon={<Settings className="w-5 h-5" />}
            collapsed={collapsed}
          >
            Settings
          </NavLink>
        </nav>

        {/* Credits indicator */}
        {!collapsed && (
          <div className="px-3 pb-3">
            <CreditBalanceMini current={credits.current} total={credits.total} />
          </div>
        )}

        {/* User Section */}
        {user && (
          <div className="border-t p-3">
            <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-muted-foreground">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              )}
            </div>
            {!collapsed && <SignOutButton />}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {/* Breadcrumb would go here */}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search trigger */}
            <Button
              variant="outline"
              className="hidden md:flex items-center gap-2 text-muted-foreground"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="w-4 h-4" />
              <span>Search...</span>
              <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setCommandOpen(true)}>
              <Search className="w-5 h-5" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>

            {/* Quick credit status */}
            <Link 
              href="/dashboard/settings/credits"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{credits.current}</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette 
        open={commandOpen} 
        onOpenChange={setCommandOpen} 
        clients={clients}
      />
    </div>
  )
}

interface NavLinkProps {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  active?: boolean
  collapsed?: boolean
}

function NavLink({ href, icon, children, active, collapsed }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition",
        active 
          ? 'bg-primary/10 text-primary' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? String(children) : undefined}
    >
      {icon}
      {!collapsed && <span>{children}</span>}
    </Link>
  )
}
