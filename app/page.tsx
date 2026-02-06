import Link from 'next/link'
import { 
  BarChart3, Users, FileText, Zap, Shield, Globe,
  Facebook, Instagram, Linkedin, Youtube, ArrowRight, Check,
  TrendingUp, Clock, Sparkles
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a1f] text-white overflow-hidden">
      {/* Floating Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-[130px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold">socisync</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition">Features</Link>
              <Link href="#platforms" className="text-gray-300 hover:text-white transition">Platforms</Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition">Pricing</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-300 hover:text-white transition">Login</Link>
              <Link 
                href="/signup" 
                className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-full font-medium transition"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-300 text-sm mb-8">
            <Sparkles className="w-4 h-4" />
            Built for Marketing Agencies
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            All your social media<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
              analytics in one place
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Connect all your clients' social accounts, track performance metrics,
            and generate beautiful reports in seconds.
          </p>

          {/* Email Signup */}
          <form className="max-w-md mx-auto mb-8">
            <div className="flex gap-2 p-2 bg-white/5 border border-white/10 rounded-full">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 bg-transparent text-white placeholder-gray-500 outline-none"
              />
              <button 
                type="submit"
                className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-full font-medium transition flex items-center gap-2"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <p className="text-gray-500 text-sm mb-16">
            Free 14-day trial · No credit card required
          </p>

          {/* Hero Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1f] via-transparent to-transparent z-10" />
            <div className="bg-gradient-to-b from-violet-600/20 to-transparent p-1 rounded-2xl">
              <div className="bg-[#12122f] rounded-xl overflow-hidden border border-white/10">
                <div className="p-4 border-b border-white/5 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {['Followers', 'Reach', 'Engagement', 'Growth'].map((label, i) => (
                      <div key={label} className="bg-white/5 rounded-xl p-4">
                        <p className="text-gray-500 text-sm mb-1">{label}</p>
                        <p className="text-2xl font-bold">{['24.5K', '1.2M', '8.4%', '+12%'][i]}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-48 bg-white/5 rounded-xl flex items-end justify-around p-4">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div key={i} className="w-8 bg-gradient-to-t from-violet-600 to-purple-400 rounded-t" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section id="platforms" className="relative z-10 py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-violet-400 font-medium mb-4">INTEGRATIONS</p>
          <h2 className="text-4xl font-bold mb-16">Connect all major platforms</h2>
          
          <div className="flex justify-center gap-8 flex-wrap">
            {[
              { icon: Facebook, name: 'Facebook', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
              { icon: Instagram, name: 'Instagram', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
              { icon: Linkedin, name: 'LinkedIn', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
              { icon: Youtube, name: 'YouTube', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
            ].map(({ icon: Icon, name, color }) => (
              <div key={name} className={`flex items-center gap-3 px-6 py-4 rounded-xl border ${color}`}>
                <Icon className="w-6 h-6" />
                <span className="font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-violet-400 font-medium mb-4">FEATURES</p>
            <h2 className="text-4xl font-bold mb-4">Everything you need to manage<br />social media analytics</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track followers, reach, engagement, and more across all platforms in real-time.' },
              { icon: Users, title: 'Multi-Client Management', desc: 'Manage unlimited clients from a single dashboard. Perfect for agencies.' },
              { icon: FileText, title: 'Automated Reports', desc: 'Generate beautiful PDF reports with one click. Schedule automated delivery.' },
              { icon: Zap, title: 'Lightning Fast', desc: 'Data syncs in seconds. No more waiting for slow dashboards to load.' },
              { icon: Shield, title: 'Enterprise Security', desc: 'Bank-level encryption. Your data and your clients\' data is always safe.' },
              { icon: Globe, title: 'White Label', desc: 'Brand reports and dashboards with your agency logo and colors.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-violet-500/50 transition">
                <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-violet-400 font-medium mb-4">HOW IT WORKS</p>
              <h2 className="text-4xl font-bold mb-6">Get started in minutes,<br />not hours</h2>
              <p className="text-gray-400 text-lg mb-8">
                Connect your clients' social accounts with just a few clicks. 
                Our system automatically syncs data and keeps everything up to date.
              </p>
              
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Connect Accounts', desc: 'Link Facebook, Instagram, LinkedIn, and YouTube accounts' },
                  { step: '02', title: 'View Analytics', desc: 'See all metrics in one unified dashboard' },
                  { step: '03', title: 'Generate Reports', desc: 'Create professional PDF reports for your clients' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center font-bold shrink-0">
                      {step}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{title}</h4>
                      <p className="text-gray-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="space-y-4">
                {[
                  { platform: 'Facebook Page', status: 'Connected', metrics: '24.5K followers' },
                  { platform: 'Instagram Business', status: 'Connected', metrics: '18.2K followers' },
                  { platform: 'LinkedIn Company', status: 'Connected', metrics: '5.1K followers' },
                  { platform: 'YouTube Channel', status: 'Pending', metrics: 'Click to connect' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.platform.includes('Facebook') ? 'bg-blue-500/20' :
                        item.platform.includes('Instagram') ? 'bg-pink-500/20' :
                        item.platform.includes('LinkedIn') ? 'bg-sky-500/20' : 'bg-red-500/20'
                      }`}>
                        {item.platform.includes('Facebook') && <Facebook className="w-5 h-5 text-blue-400" />}
                        {item.platform.includes('Instagram') && <Instagram className="w-5 h-5 text-pink-400" />}
                        {item.platform.includes('LinkedIn') && <Linkedin className="w-5 h-5 text-sky-400" />}
                        {item.platform.includes('YouTube') && <Youtube className="w-5 h-5 text-red-400" />}
                      </div>
                      <div>
                        <p className="font-medium">{item.platform}</p>
                        <p className="text-sm text-gray-500">{item.metrics}</p>
                      </div>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      item.status === 'Connected' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Agencies' },
              { value: '10K+', label: 'Clients Managed' },
              { value: '1M+', label: 'Reports Generated' },
              { value: '99.9%', label: 'Uptime' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400 mb-2">
                  {value}
                </p>
                <p className="text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/20 rounded-3xl p-12">
            <h2 className="text-4xl font-bold mb-4">Ready to streamline your<br />social media reporting?</h2>
            <p className="text-gray-400 text-lg mb-8">
              Join hundreds of agencies already using Socisync to save time and impress clients.
            </p>
            <Link 
              href="/signup"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-full font-medium text-lg transition"
            >
              Start Your Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-gray-500 text-sm mt-4">No credit card required · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">socisync</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms</Link>
              <Link href="/contact" className="hover:text-white transition">Contact</Link>
            </div>
            <p className="text-sm text-gray-500">© 2024 Socisync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
