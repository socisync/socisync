'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Check } from 'lucide-react'

export default function Signup() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a1f] text-white flex flex-col">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-[150px]" />
        </div>

        <nav className="relative z-10 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Link href="/" className="text-2xl font-bold">socisync</Link>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
          <div className="w-full max-w-md text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Check your email</h1>
              <p className="text-gray-400 mb-6">
                We&apos;ve sent a confirmation link to <span className="text-white font-medium">{email}</span>. Click the link to activate your account.
              </p>
              <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a1f] text-white flex flex-col">
      {/* Floating Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-600/15 rounded-full blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              socisync
            </Link>
            <Link href="/login" className="text-gray-400 hover:text-white transition">
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Signup Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <h1 className="text-3xl font-bold text-center mb-2">Create your account</h1>
            <p className="text-gray-400 text-center mb-8">Start your 14-day free trial</p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition text-white placeholder-gray-500"
                  placeholder="John Smith"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Work email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition text-white placeholder-gray-500"
                  placeholder="you@agency.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition text-white placeholder-gray-500"
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-violet-400 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-violet-400 hover:underline">Privacy Policy</Link>
              </p>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-500">Already have an account? </span>
              <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
