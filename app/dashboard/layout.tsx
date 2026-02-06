import Link from 'next/link'
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold">Socisync</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <SidebarLink href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} text="Dashboard" active />
            <SidebarLink href="/dashboard/clients" icon={<Users className="w-5 h-5" />} text="Clients" />
            <SidebarLink href="/dashboard/reports" icon={<FileText className="w-5 h-5" />} text="Reports" />
            <SidebarLink href="/dashboard/settings" icon={<Settings className="w-5 h-5" />} text="Settings" />
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center space-x-2 text-slate-400 hover:text-white transition w-full">
            <LogOut className="w-5 h-5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}

function SidebarLink({ href, icon, text, active = false }: { href: string, icon: React.ReactNode, text: string, active?: boolean }) {
  return (
    <li>
      <Link 
        href={href} 
        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
          active 
            ? 'bg-primary-600 text-white' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        {icon}
        <span>{text}</span>
      </Link>
    </li>
  )
}
