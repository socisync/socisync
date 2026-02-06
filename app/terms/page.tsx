import Link from 'next/link'

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0a0a1f] text-white">
      {/* Floating Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[150px]" />
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
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-gray-500 mb-12">Last Updated: February 2026</p>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-400">
              By accessing or using Socisync, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-gray-400">
              Socisync provides a social media analytics and reporting platform for marketing agencies. Our service allows you to connect client social media accounts, view analytics, and generate reports.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-gray-400">
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="text-gray-400 mb-3">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-400 space-y-2">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Violate any third-party platform terms of service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Intellectual Property</h2>
            <p className="text-gray-400">
              The Socisync platform, including its original content, features, and functionality, is owned by Socisync and is protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Subscription and Payment</h2>
            <p className="text-gray-400">
              Paid subscriptions are billed monthly or annually. You may cancel your subscription at any time. Refunds are provided in accordance with our refund policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-400">
              Socisync shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Changes to Terms</h2>
            <p className="text-gray-400">
              We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Contact</h2>
            <p className="text-gray-400">
              If you have questions about these Terms, please contact us at legal@socisync.com.
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
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link href="/" className="hover:text-white transition">Home</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
