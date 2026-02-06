import Link from 'next/link'

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
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
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-500 mb-8">Last Updated: February 2026</p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Agreement to Terms</h2>
          <p className="text-slate-600 mb-4">
            By accessing or using Socisync (&quot;Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Service.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. Description of Service</h2>
          <p className="text-slate-600 mb-4">
            Socisync is a social media management and reporting platform that allows digital marketing agencies to connect and monitor client social media accounts, view analytics, and generate reports.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. Account Registration</h2>
          <p className="text-slate-600 mb-4">
            To use Socisync, you must register for an account with accurate information, be at least 18 years old, and be authorised to act on behalf of your agency/company.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. Subscription and Payment</h2>
          <p className="text-slate-600 mb-4">
            Subscription fees are based on your selected plan. Subscriptions are billed monthly or annually in advance. You may cancel your subscription at any time.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">5. Acceptable Use</h2>
          <p className="text-slate-600 mb-4">
            You agree not to use the Service for any illegal purpose, violate any third-party platform&apos;s terms of service, or access accounts you are not authorised to manage.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">6. Third-Party Integrations</h2>
          <p className="text-slate-600 mb-4">
            Socisync integrates with Meta, LinkedIn, YouTube, and TikTok. Your use of these integrations is subject to each platform&apos;s Terms of Service.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">7. Intellectual Property</h2>
          <p className="text-slate-600 mb-4">
            The Service, including its design, features, and content, is owned by Socisync and protected by intellectual property laws.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">8. Limitation of Liability</h2>
          <p className="text-slate-600 mb-4">
            The Service is provided &quot;as is&quot; without warranties. We are not liable for indirect, incidental, or consequential damages.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">9. Governing Law</h2>
          <p className="text-slate-600 mb-4">
            These Terms are governed by the laws of England and Wales.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">10. Contact</h2>
          <p className="text-slate-600 mb-4">
            For questions about these Terms, contact us at:<br />
            Email: legal@socisync.com
          </p>
        </div>
      </div>
    </div>
  )
}
