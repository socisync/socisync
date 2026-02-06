import { Plus, Search, MoreVertical } from 'lucide-react'

export default function Clients() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500">Manage your client accounts and connections.</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search clients..."
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ClientCard 
          name="Acme Corp"
          platforms={['Meta', 'LinkedIn']}
          accounts={4}
          status="active"
        />
        <ClientCard 
          name="TechStart Ltd"
          platforms={['Meta', 'YouTube', 'TikTok']}
          accounts={5}
          status="active"
        />
        <ClientCard 
          name="Local Bakery"
          platforms={['Meta']}
          accounts={2}
          status="active"
        />
        <ClientCard 
          name="Fitness Pro"
          platforms={['Meta', 'TikTok']}
          accounts={3}
          status="active"
        />
        <ClientCard 
          name="City Plumbers"
          platforms={['Meta', 'LinkedIn']}
          accounts={3}
          status="pending"
        />
        
        {/* Add New Client Card */}
        <button className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-primary-400 hover:bg-primary-50 transition flex flex-col items-center justify-center text-slate-400 hover:text-primary-600 min-h-[200px]">
          <Plus className="w-8 h-8 mb-2" />
          <span className="font-medium">Add New Client</span>
        </button>
      </div>
    </div>
  )
}

function ClientCard({ name, platforms, accounts, status }: { 
  name: string, 
  platforms: string[], 
  accounts: number,
  status: 'active' | 'pending' 
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
          {name.charAt(0)}
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      
      <h3 className="font-semibold text-slate-900 mb-1">{name}</h3>
      <p className="text-sm text-slate-500 mb-4">{platforms.join(' • ')}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{accounts} accounts connected</span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          status === 'active' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {status === 'active' ? 'Active' : 'Pending'}
        </span>
      </div>
    </div>
  )
}
