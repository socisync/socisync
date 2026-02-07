'use client'

import * as React from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  UserPlus,
  Search,
  PlusCircle,
  Zap,
  LogOut,
  CreditCard,
  BarChart3,
} from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface Client {
  id: string
  name: string
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clients?: Client[]
}

interface CommandItem {
  id: string
  label: string
  icon: React.ReactNode
  shortcut?: string[]
  action: () => void
  keywords?: string[]
  group: 'navigation' | 'actions' | 'clients' | 'settings'
}

export function CommandPalette({ open, onOpenChange, clients = [] }: CommandPaletteProps) {
  const router = useRouter()
  const [search, setSearch] = React.useState('')

  const navigate = (path: string) => {
    router.push(path)
    onOpenChange(false)
    setSearch('')
  }

  const items: CommandItem[] = React.useMemo(() => [
    // Navigation
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      shortcut: ['G', 'D'],
      action: () => navigate('/dashboard'),
      keywords: ['home', 'overview'],
      group: 'navigation',
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: <Users className="w-4 h-4" />,
      shortcut: ['G', 'C'],
      action: () => navigate('/dashboard/clients'),
      keywords: ['accounts', 'customers'],
      group: 'navigation',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="w-4 h-4" />,
      shortcut: ['G', 'R'],
      action: () => navigate('/dashboard/reports'),
      keywords: ['analytics', 'pdf'],
      group: 'navigation',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      shortcut: ['G', 'S'],
      action: () => navigate('/dashboard/settings'),
      keywords: ['preferences', 'config'],
      group: 'navigation',
    },
    // Actions
    {
      id: 'new-client',
      label: 'Add New Client',
      icon: <UserPlus className="w-4 h-4" />,
      shortcut: ['N', 'C'],
      action: () => navigate('/dashboard/clients/new'),
      keywords: ['create', 'add', 'new'],
      group: 'actions',
    },
    {
      id: 'new-report',
      label: 'Create Report',
      icon: <PlusCircle className="w-4 h-4" />,
      shortcut: ['N', 'R'],
      action: () => navigate('/dashboard/reports/new'),
      keywords: ['generate', 'pdf', 'create'],
      group: 'actions',
    },
    // Settings
    {
      id: 'team',
      label: 'Team Members',
      icon: <Users className="w-4 h-4" />,
      action: () => navigate('/dashboard/settings/team'),
      keywords: ['invite', 'members', 'users'],
      group: 'settings',
    },
    {
      id: 'billing',
      label: 'Billing & Plans',
      icon: <CreditCard className="w-4 h-4" />,
      action: () => navigate('/dashboard/settings/billing'),
      keywords: ['subscription', 'payment', 'upgrade'],
      group: 'settings',
    },
    {
      id: 'credits',
      label: 'Credits & Usage',
      icon: <Zap className="w-4 h-4" />,
      action: () => navigate('/dashboard/settings/credits'),
      keywords: ['ai', 'tokens', 'balance'],
      group: 'settings',
    },
    // Add clients dynamically
    ...clients.map(client => ({
      id: `client-${client.id}`,
      label: client.name,
      icon: <BarChart3 className="w-4 h-4" />,
      action: () => navigate(`/dashboard/clients/${client.id}`),
      keywords: ['client', 'account'],
      group: 'clients' as const,
    })),
  ], [clients])

  const filteredItems = React.useMemo(() => {
    if (!search) return items
    
    const lower = search.toLowerCase()
    return items.filter(item => {
      const matchLabel = item.label.toLowerCase().includes(lower)
      const matchKeywords = item.keywords?.some(k => k.includes(lower))
      return matchLabel || matchKeywords
    })
  }, [items, search])

  const groupedItems = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      navigation: [],
      actions: [],
      clients: [],
      settings: [],
    }
    
    filteredItems.forEach(item => {
      groups[item.group].push(item)
    })
    
    return groups
  }, [filteredItems])

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
      
      if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [onOpenChange, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-2xl">
        <Command
          className="rounded-lg border-0"
          shouldFilter={false}
        >
          <div className="flex items-center border-b px-3">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search or type a command..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {groupedItems.navigation.length > 0 && (
              <Command.Group heading="Navigation">
                {groupedItems.navigation.map(item => (
                  <CommandItemComponent key={item.id} item={item} />
                ))}
              </Command.Group>
            )}

            {groupedItems.actions.length > 0 && (
              <Command.Group heading="Quick Actions">
                {groupedItems.actions.map(item => (
                  <CommandItemComponent key={item.id} item={item} />
                ))}
              </Command.Group>
            )}

            {groupedItems.clients.length > 0 && (
              <Command.Group heading="Clients">
                {groupedItems.clients.slice(0, 5).map(item => (
                  <CommandItemComponent key={item.id} item={item} />
                ))}
              </Command.Group>
            )}

            {groupedItems.settings.length > 0 && (
              <Command.Group heading="Settings">
                {groupedItems.settings.map(item => (
                  <CommandItemComponent key={item.id} item={item} />
                ))}
              </Command.Group>
            )}
          </Command.List>
          <div className="border-t p-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px]">↑↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px]">↵</kbd>
                to select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px]">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px]">K</kbd>
              to toggle
            </span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandItemComponent({ item }: { item: CommandItem }) {
  return (
    <Command.Item
      value={item.id}
      onSelect={item.action}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer",
        "aria-selected:bg-accent aria-selected:text-accent-foreground"
      )}
    >
      <span className="text-muted-foreground">{item.icon}</span>
      <span className="flex-1">{item.label}</span>
      {item.shortcut && (
        <div className="flex items-center gap-1">
          {item.shortcut.map((key, i) => (
            <kbd
              key={i}
              className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono"
            >
              {key}
            </kbd>
          ))}
        </div>
      )}
    </Command.Item>
  )
}

// Hook for command palette
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false)
  
  return {
    open,
    setOpen,
    toggle: () => setOpen(prev => !prev),
  }
}
