import Link from 'next/link'
import { Check } from 'lucide-react'

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#0a0a1f] text-white">
      {/* Floating Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-[130px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              socisync
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-gray-400 hover:text-white transition">Login</Link>
              <Link href="/signup" className="bg-violet-600 text-white px-5 py-2.5 rounded-full hover:bg-violet-700 transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 font-medium mb-4">PRICING</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h1>
            <p className="text-xl text-gray-400">No per-user fees. No hidden costs. Just simple pricing that scales.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Starter Plan */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
              <h3 className="text-lg font-semibold">Starter</h3>
              <p className="text-gray-500 mb-4">For small agencies</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">£29</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <PricingFeature text="Up to 5 clients" />
                <PricingFeature text="All platforms included" />
                <PricingFeature text="Basic reports" />
                <PricingFeature text="Email support" />
              </ul>
              <Link href="/signup" className="block w-full text-center bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition border border-white/10">
                Start Free Trial
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-b from-violet-600/20 to-purple-600/20 rounded-2xl border border-violet-500/30 p-8 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-violet-500 text-white text-sm font-semibold px-4 py-1 rounded-full">Most Popular</span>
              </div>
              <h3 className="text-lg font-semibold">Pro</h3>
              <p className="text-gray-400 mb-4">For growing agencies</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">£79</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <PricingFeature text="Up to 25 clients" />
                <PricingFeature text="All platforms included" />
                <PricingFeature text="Advanced reports" />
                <PricingFeature text="White-label reports" />
                <PricingFeature text="Priority support" />
              </ul>
              <Link href="/signup" className="block w-full text-center bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition">
                Start Free Trial
              </Link>
            </div>

            {/* Agency Plan */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
              <h3 className="text-lg font-semibold">Agency</h3>
              <p className="text-gray-500 mb-4">For large agencies</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">£149</span>
                <span className="text-gray-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <PricingFeature text="Unlimited clients" />
                <PricingFeature text="All platforms included" />
                <PricingFeature text="Custom reports" />
                <PricingFeature text="Full white-label" />
                <PricingFeature text="API access" />
                <PricingFeature text="Dedicated support" />
              </ul>
              <Link href="/signup" className="block w-full text-center bg-white/10 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition border border-white/10">
                Start Free Trial
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-12">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-xl font-bold">socisync</span>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms</Link>
              <Link href="/" className="hover:text-white transition">Home</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function PricingFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-gray-300">
      <Check className="w-5 h-5 text-violet-400" />
      {text}
    </li>
  )
}
