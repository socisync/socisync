import { BarChart3, Users, Eye, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back! Here&apos;s an overview of your clients.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<Users className="w-6 h-6 text-blue-600" />}
          label="Total Clients"
          value="12"
          change="+2 this month"
          positive
        />
        <StatCard 
          icon={<BarChart3 className="w-6 h-6 text-green-600" />}
          label="Connected Accounts"
          value="38"
          change="Across 4 platforms"
        />
        <StatCard 
          icon={<Eye className="w-6 h-6 text-purple-600" />}
          label="Total Reach"
          value="2.4M"
          change="+12% vs last month"
          positive
        />
        <StatCard 
          icon={<TrendingUp className="w-6 h-6 text-orange-600" />}
          label="Engagement Rate"
          value="4.2%"
          change="+0.3% vs last month"
          positive
        />
      </div>

      {/* Recent Clients */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recent Clients</h2>
        </div>
        <div className="divide-y divide-slate-200">
          <ClientRow 
            name="Acme Corp"
            platforms={['Meta', 'LinkedIn']}
            lastReport="2 days ago"
          />
          <ClientRow 
            name="TechStart Ltd"
            platforms={['Meta', 'YouTube', 'TikTok']}
            lastReport="5 days ago"
          />
          <ClientRow 
            name="Local Bakery"
            platforms={['Meta']}
            lastReport="1 week ago"
          />
          <ClientRow 
            name="Fitness Pro"
            platforms={['Meta', 'TikTok']}
            lastReport="1 week ago"
          />
        </div>
        <div className="p-4 bg-slate-50 rounded-b-xl">
          <a href="/dashboard/clients" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            View all clients →
          </a>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, change, positive = false }: { 
  icon: React.ReactNode, 
  label: string, 
  value: string, 
  change: string,
  positive?: boolean 
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`text-xs mt-2 ${positive ? 'text-green-600' : 'text-slate-400'}`}>
        {change}
      </div>
    </div>
  )
}

function ClientRow({ name, platforms, lastReport }: { name: string, platforms: string[], lastReport: string }) {
  return (
    <div className="p-4 hover:bg-slate-50 transition flex items-center justify-between">
      <div>
        <div className="font-medium text-slate-900">{name}</div>
        <div className="text-sm text-slate-500">{platforms.join(' • ')}</div>
      </div>
      <div className="text-sm text-slate-400">
        Last report: {lastReport}
      </div>
    </div>
  )
}
