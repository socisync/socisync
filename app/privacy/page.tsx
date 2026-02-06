import Link from 'next/link'

export default function Privacy() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-500 mb-8">Last Updated: February 2026</p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">1. Introduction</h2>
          <p className="text-slate-600 mb-4">
            Socisync (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates the Socisync platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">2. Information We Collect</h2>
          <p className="text-slate-600 mb-4">
            <strong>Account Information:</strong> Name, email address, company/agency name, and billing information.
          </p>
          <p className="text-slate-600 mb-4">
            <strong>Connected Social Media Accounts:</strong> When you connect social media accounts, we access page insights, post data, and ad performance metrics as necessary to provide our reporting services.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">3. How We Use Your Information</h2>
          <p className="text-slate-600 mb-4">
            We use the information we collect to provide and maintain our service, generate social media reports and analytics, process transactions, and improve our platform.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">4. Data Sharing</h2>
          <p className="text-slate-600 mb-4">
            We do not sell your personal information or your clients&apos; data. We may share information with service providers who assist in operating our platform.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">5. Data Security</h2>
          <p className="text-slate-600 mb-4">
            We implement appropriate technical and organisational measures to protect your data, including encryption of data in transit and at rest.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">6. Your Rights</h2>
          <p className="text-slate-600 mb-4">
            You have the right to access, correct, or delete your personal data. Contact us at privacy@socisync.com to exercise these rights.
          </p>

          <h2 className="text-xl font-semibold text-slate-900 mt-8 mb-4">7. Contact Us</h2>
          <p className="text-slate-600 mb-4">
            If you have questions about this Privacy Policy, contact us at:<br />
            Email: privacy@socisync.com
          </p>
        </div>
      </div>
    </div>
  )
}
