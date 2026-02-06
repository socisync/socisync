import Link from 'next/link'
import { ArrowRight, BarChart3, Users, FileText, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-slate-900">Socisync</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/pricing" className="text-slate-600 hover:text-slate-900">Pricing</Link>
              <Link href="/login" className="text-slate-600 hover:text-slate-900">Login</Link>
              <Link href="/signup" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            All your clients.<br />
            <span className="text-primary-600">One dashboard.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Stop switching between platforms. Socisync brings all your social media reporting together — Meta, LinkedIn, YouTube, and TikTok in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/pricing" className="bg-white text-slate-900 px-8 py-4 rounded-lg text-lg font-semibold border border-slate-200 hover:border-slate-300 transition">
              View Pricing
            </Link>
          </div>
          <p className="text-sm text-slate-500 mt-4">No credit card required • Free 14-day trial</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Everything you need to manage client reporting
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Users className="w-6 h-6" />}
              title="Multi-Client Management"
              description="Switch between clients instantly. Each client gets their own workspace."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Unified Analytics"
              description="See all platforms in one dashboard. No more jumping between tabs."
            />
            <FeatureCard 
              icon={<FileText className="w-6 h-6" />}
              title="Beautiful Reports"
              description="Generate professional PDF reports in seconds. Impress your clients."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Ads + Organic"
              description="Track both paid and organic performance across all platforms."
            />
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Connect all major platforms</h2>
          <p className="text-slate-600 mb-12">One click to connect. Automatic data sync.</p>
          <div className="flex flex-wrap justify-center gap-8">
            <PlatformBadge name="Meta" subtitle="Facebook & Instagram" />
            <PlatformBadge name="LinkedIn" subtitle="Pages & Ads" />
            <PlatformBadge name="YouTube" subtitle="Analytics" />
            <PlatformBadge name="TikTok" subtitle="Ads" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to simplify your reporting?
          </h2>
          <p className="text-primary-100 mb-8">
            Join agencies who save hours every week with Socisync.
          </p>
          <Link href="/signup" className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition inline-block">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-white">Socisync</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
            © {new Date().getFullYear()} Socisync. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-6 hover:shadow-lg transition">
      <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  )
}

function PlatformBadge({ name, subtitle }: { name: string, subtitle: string }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 w-40">
      <div className="text-lg font-semibold text-slate-900">{name}</div>
      <div className="text-sm text-slate-500">{subtitle}</div>
    </div>
  )
}
