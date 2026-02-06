'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Users, CreditCard, Check, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

interface Agency {
  id: string
  name: string
  subscription_tier: string
  subscription_status: string
  trial_ends_at: string | null
}

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    description: 'For small agencies getting started',
    features: [
      'Up to 10 clients',
      '3 team members',
      'Meta integration',
      'Basic reports',
      'Email support'
    ],
    highlighted: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 99,
    description: 'For growing agencies',
    features: [
      'Up to 50 clients',
      '10 team members',
      'All integrations',
      'Advanced reports',
      'White-label option',
      'Priority support'
    ],
    highlighted: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 249,
    description: 'For large agencies',
    features: [
      'Unlimited clients',
      'Unlimited team members',
      'All integrations',
      'Custom reports',
      'Full white-label',
      'Dedicated support',
      'API access'
    ],
    highlighted: false
  }
]

export default function BillingSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [agency, setAgency] = useState<Agency | null>(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: membership } = await supabase
        .from('agency_members')
        .select('agency_id, agencies(*)')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!membership?.agencies) {
        router.push('/onboarding')
        return
      }

      setAgency(membership.agencies as unknown as Agency)
      setLoading(false)
    }

    loadData()
  }, [router])

  const handleSelectPlan = (planId: string) => {
    // In production, this would redirect to Stripe Checkout
    alert(`Stripe checkout for ${planId} plan coming soon!`)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-500">Loading...</div></div>
  }

  const daysRemaining = agency?.trial_ends_at 
    ? Math.max(0, Math.ceil((new Date(agency.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <Link 
          href="/dashboard/settings" 
          className="px-4 py-2 text-slate-500 hover:text-slate-700"
        >
          <span className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Agency</span>
        </Link>
        <Link 
          href="/dashboard/settings/team" 
          className="px-4 py-2 text-slate-500 hover:text-slate-700"
        >
          <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Team</span>
        </Link>
        <Link 
          href="/dashboard/settings/billing" 
          className="px-4 py-2 border-b-2 border-primary-600 text-primary-600 font-medium -mb-px"
        >
          <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Billing</span>
        </Link>
      </div>

      {/* Current Plan */}
      {agency?.subscription_status === 'trialing' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <span className="font-medium text-amber-800">Free Trial</span>
            <span className="text-amber-700 ml-2">
              {daysRemaining > 0 
                ? `${daysRemaining} days remaining`
                : 'Trial expired'}
            </span>
          </div>
          <span className="text-sm text-amber-600">
            Choose a plan below to continue after your trial
          </span>
        </div>
      )}

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`bg-white rounded-xl border-2 p-6 relative ${
              plan.highlighted 
                ? 'border-primary-500 shadow-lg' 
                : 'border-slate-200'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                Most Popular
              </div>
            )}
            
            <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
            <p className="text-slate-500 text-sm mt-1">{plan.description}</p>
            
            <div className="mt-4 mb-6">
              <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
              <span className="text-slate-500">/month</span>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan.id)}
              disabled={agency?.subscription_tier === plan.id}
              className={`w-full py-2 rounded-lg font-medium transition ${
                agency?.subscription_tier === plan.id
                  ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                  : plan.highlighted
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {agency?.subscription_tier === plan.id ? 'Current Plan' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* Billing History Placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Billing History</h2>
        <div className="text-center py-8 text-slate-500">
          <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>No billing history yet</p>
          <p className="text-sm">Invoices will appear here after your first payment</p>
        </div>
      </div>
    </div>
  )
}
