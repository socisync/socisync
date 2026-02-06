import Link from 'next/link'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0a0a1f] text-white">
      {/* Floating Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">socisync</Link>
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-gray-400 hover:text-white transition">Login</Link>
              <Link href="/signup" className="bg-violet-600 text-white px-5 py-2.5 rounded-full hover:bg-violet-700 transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-500 mb-12">Last Updated: February 2026</p>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-400">
              Socisync (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates the Socisync platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="text-gray-400 mb-3">
              <strong className="text-white">Account Information:</strong> Name, email address, company/agency name, and billing information.
            </p>
            <p className="text-gray-400">
              <strong className="text-white">Connected Social Media Accounts:</strong> When you connect social media accounts, we access page insights, post data, and ad performance metrics as necessary to provide our reporting services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-400">
              We use the information we collect to provide and maintain our service, generate social media reports and analytics, process transactions, and improve our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Data Sharing</h2>
            <p className="text-gray-400">
              We do not sell your personal information or your clients&apos; data. We may share information with service providers who assist in operating our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-gray-400">
              We use industry-standard encryption and security measures to protect your data. Access to your connected social media accounts is secured via OAuth and we never store your social media passwords.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-gray-400">
              You may access, update, or delete your account information at any time. You can disconnect any connected social media accounts through your dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Contact</h2>
            <p className="text-gray-400">
              If you have questions about this Privacy Policy, please contact us at privacy@socisync.com.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-xl font-bold">socisync</span>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/terms" className="hover:text-white transition">Terms</Link>
              <Link href="/" className="hover:text-white transition">Home</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
