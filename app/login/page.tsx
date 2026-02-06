'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      if (data.user) {
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 500)
      } else {
        setError('No user returned')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a1f] text-white flex flex-col">
      {/* Floating Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              socisync
            </Link>
            <Link href="/signup" className="text-gray-400 hover:text-white transition">
              Create account
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <h1 className="text-3xl font-bold text-center mb-2">Welcome back</h1>
            <p className="text-gray-400 text-center mb-8">Sign in to your Socisync account</p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition text-white placeholder-gray-500"
                  placeholder="you@agency.com"
                  required
                  disabled={loading}
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
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 bg-white/5 border-white/10 rounded text-violet-600 focus:ring-violet-500" />
                  <span className="ml-2 text-sm text-gray-400">Remember me</span>
                </label>
                <a href="#" className="text-sm text-violet-400 hover:text-violet-300">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-500">Don&apos;t have an account? </span>
              <Link href="/signup" className="text-violet-400 hover:text-violet-300 font-medium">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
