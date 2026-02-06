import Link from 'next/link'
import { Check } from 'lucide-react'

export default function Pricing() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-slate-900">Socisync</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-slate-600 hover:text-slate-900">Login</Link>
              <Link href="/signup" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h1>
            <p className="text-xl text-slate-600">No per-user fees. No hidden costs. Just simple pricing that scales.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-lg font-semibold text-slate-900">Starter</h3>
              <p className="text-slate-500 mb-4">For small agencies</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">£29</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <PricingFeature text="Up to 5 clients" />
                <PricingFeature text="All platforms included" />
                <PricingFeature text="Basic reports" />
                <PricingFeature text="Email support" />
              </ul>
              <Link href="/signup" className="block w-full text-center bg-slate-100 text-slate-900 py-3 rounded-lg font-semibold hover:bg-slate-200 transition">
                Start Free Trial
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-primary-600 rounded-2xl shadow-lg p-8 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-yellow-400 text-yellow-900 text-sm font-semibold px-3 py-1 rounded-full">Most Popular</span>
              </div>
              <h3 className="text-lg font-semibold text-white">Pro</h3>
              <p className="text-primary-200 mb-4">For growing agencies</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">£79</span>
                <span className="text-primary-200">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <PricingFeature text="Up to 25 clients" light />
                <PricingFeature text="All platforms included" light />
                <PricingFeature text="Advanced reports" light />
                <PricingFeature text="White-label reports" light />
                <PricingFeature text="Priority support" light />
              </ul>
              <Link href="/signup" className="block w-full text-center bg-white text-primary-600 py-3 rounded-lg font-semibold hover:bg-primary-50 transition">
                Start Free Trial
              </Link>
            </div>

            {/* Agency Plan */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h3 className="text-lg font-semibold text-slate-900">Agency</h3>
              <p className="text-slate-500 mb-4">For large agencies</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">£149</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <PricingFeature text="Unlimited clients" />
                <PricingFeature text="All platforms included" />
                <PricingFeature text="Custom reports" />
                <PricingFeature text="Full white-label" />
                <PricingFeature text="API access" />
                <PricingFeature text="Dedicated support" />
              </ul>
              <Link href="/signup" className="block w-full text-center bg-slate-100 text-slate-900 py-3 rounded-lg font-semibold hover:bg-slate-200 transition">
                Start Free Trial
              </Link>
            </div>
          </div>

          <p className="text-center text-slate-500 mt-8">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>
    </div>
  )
}

function PricingFeature({ text, light = false }: { text: string, light?: boolean }) {
  return (
    <li className={`flex items-center gap-2 ${light ? 'text-white' : 'text-slate-600'}`}>
      <Check className={`w-5 h-5 ${light ? 'text-primary-200' : 'text-primary-600'}`} />
      {text}
    </li>
  )
}
