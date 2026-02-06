'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Users, CreditCard, Save, Loader2, Palette, Mail, FileText, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

interface Agency {
  id: string
  name: string
  slug: string
  website: string | null
  logo_url: string | null
  subscription_tier: string
  subscription_status: string
  trial_ends_at: string | null
}

interface AgencySettings {
  id?: string
  agency_id: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  email_from_name: string | null
  email_footer_text: string | null
  report_logo_url: string | null
  report_header_text: string | null
  report_footer_text: string | null
}

type TabType = 'general' | 'branding' | 'emails' | 'reports'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [agency, setAgency] = useState<Agency | null>(null)
  const [settings, setSettings] = useState<AgencySettings | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Form states
  const [generalForm, setGeneralForm] = useState({ name: '', website: '' })
  const [brandingForm, setBrandingForm] = useState({
    logo_url: '',
    primary_color: '#3b82f6',
    secondary_color: '#1e293b',
  })
  const [emailForm, setEmailForm] = useState({
    email_from_name: '',
    email_footer_text: '',
  })
  const [reportForm, setReportForm] = useState({
    report_logo_url: '',
    report_header_text: '',
    report_footer_text: '',
  })

  useEffect(() => {
    loadData()
  }, [router])

  const loadData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const { data: membership } = await supabase
      .from('agency_members')
      .select('agency_id, role, agencies(*)')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (!membership?.agencies) {
      router.push('/onboarding')
      return
    }

    const agencyData = membership.agencies as unknown as Agency
    setAgency(agencyData)
    setGeneralForm({
      name: agencyData.name,
      website: agencyData.website || ''
    })

    // Load agency settings
    const { data: settingsData } = await supabase
      .from('agency_settings')
      .select('*')
      .eq('agency_id', agencyData.id)
      .single()

    if (settingsData) {
      setSettings(settingsData)
      setBrandingForm({
        logo_url: settingsData.logo_url || '',
        primary_color: settingsData.primary_color || '#3b82f6',
        secondary_color: settingsData.secondary_color || '#1e293b',
      })
      setEmailForm({
        email_from_name: settingsData.email_from_name || '',
        email_footer_text: settingsData.email_footer_text || '',
      })
      setReportForm({
        report_logo_url: settingsData.report_logo_url || '',
        report_header_text: settingsData.report_header_text || '',
        report_footer_text: settingsData.report_footer_text || '',
      })
    } else {
      // Create default settings
      setSettings({
        agency_id: agencyData.id,
        logo_url: null,
        primary_color: '#3b82f6',
        secondary_color: '#1e293b',
        email_from_name: null,
        email_footer_text: null,
        report_logo_url: null,
        report_header_text: null,
        report_footer_text: null,
      })
    }

    setLoading(false)
  }

  const saveGeneral = async () => {
    if (!agency) return
    setSaving(true)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase
      .from('agencies')
      .update({
        name: generalForm.name,
        website: generalForm.website || null,
      })
      .eq('id', agency.id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Settings saved successfully' })
      setAgency({ ...agency, name: generalForm.name, website: generalForm.website || null })
    }
    setSaving(false)
  }

  const saveBranding = async () => {
    if (!agency) return
    setSaving(true)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase
      .from('agency_settings')
      .upsert({
        agency_id: agency.id,
        logo_url: brandingForm.logo_url || null,
        primary_color: brandingForm.primary_color,
        secondary_color: brandingForm.secondary_color,
      }, { onConflict: 'agency_id' })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Branding saved successfully' })
    }
    setSaving(false)
  }

  const saveEmails = async () => {
    if (!agency) return
    setSaving(true)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase
      .from('agency_settings')
      .upsert({
        agency_id: agency.id,
        email_from_name: emailForm.email_from_name || null,
        email_footer_text: emailForm.email_footer_text || null,
      }, { onConflict: 'agency_id' })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Email settings saved successfully' })
    }
    setSaving(false)
  }

  const saveReports = async () => {
    if (!agency) return
    setSaving(true)
    setMessage(null)

    const supabase = createClient()
    const { error } = await supabase
      .from('agency_settings')
      .upsert({
        agency_id: agency.id,
        report_logo_url: reportForm.report_logo_url || null,
        report_header_text: reportForm.report_header_text || null,
        report_footer_text: reportForm.report_footer_text || null,
      }, { onConflict: 'agency_id' })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Report settings saved successfully' })
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-500">Loading...</div></div>
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'emails', label: 'Email Settings', icon: Mail },
    { id: 'reports', label: 'Reports', icon: FileText },
  ]

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-2 border-b-2 font-medium whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" /> {tab.label}
            </span>
          </button>
        ))}
        <Link 
          href="/dashboard/settings/team" 
          className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap"
        >
          <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Team</span>
        </Link>
        <Link 
          href="/dashboard/settings/billing" 
          className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 whitespace-nowrap"
        >
          <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Billing</span>
        </Link>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Agency Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Agency Name</label>
              <input
                type="text"
                value={generalForm.name}
                onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
              <input
                type="url"
                value={generalForm.website}
                onChange={(e) => setGeneralForm({ ...generalForm, website: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="https://youragency.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Agency Slug</label>
              <input
                type="text"
                value={agency?.slug || ''}
                disabled
                className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
              />
              <p className="text-xs text-slate-500 mt-1">Used in URLs. Contact support to change.</p>
            </div>
            <div className="pt-4">
              <button onClick={saveGeneral} disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Brand Colors</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandingForm.primary_color}
                    onChange={(e) => setBrandingForm({ ...brandingForm, primary_color: e.target.value })}
                    className="w-12 h-10 border border-slate-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingForm.primary_color}
                    onChange={(e) => setBrandingForm({ ...brandingForm, primary_color: e.target.value })}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Used for buttons, links, and accents</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandingForm.secondary_color}
                    onChange={(e) => setBrandingForm({ ...brandingForm, secondary_color: e.target.value })}
                    className="w-12 h-10 border border-slate-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandingForm.secondary_color}
                    onChange={(e) => setBrandingForm({ ...brandingForm, secondary_color: e.target.value })}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Used for headings and dark elements</p>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500 mb-3">Preview</p>
              <div className="flex items-center gap-4">
                <button style={{ backgroundColor: brandingForm.primary_color }} className="text-white px-4 py-2 rounded-lg text-sm">
                  Primary Button
                </button>
                <span style={{ color: brandingForm.primary_color }} className="text-sm font-medium">Primary Link</span>
                <span style={{ color: brandingForm.secondary_color }} className="text-lg font-bold">Heading Text</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Logo</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
              <input
                type="url"
                value={brandingForm.logo_url}
                onChange={(e) => setBrandingForm({ ...brandingForm, logo_url: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-slate-500 mt-1">Enter URL to your logo image. Recommended size: 200x50px</p>
              
              {brandingForm.logo_url && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500 mb-2">Preview</p>
                  <img src={brandingForm.logo_url} alt="Logo preview" className="max-h-12" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <button onClick={saveBranding} disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Branding'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Settings Tab */}
      {activeTab === 'emails' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Email Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">From Name</label>
                <input
                  type="text"
                  value={emailForm.email_from_name}
                  onChange={(e) => setEmailForm({ ...emailForm, email_from_name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder={agency?.name || 'Your Agency Name'}
                />
                <p className="text-xs text-slate-500 mt-1">This name will appear in the "From" field of emails</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Footer Text</label>
                <textarea
                  value={emailForm.email_footer_text}
                  onChange={(e) => setEmailForm({ ...emailForm, email_footer_text: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                  placeholder="© 2024 Your Agency. All rights reserved."
                />
                <p className="text-xs text-slate-500 mt-1">Added to the bottom of all emails</p>
              </div>
              
              <div className="pt-4">
                <button onClick={saveEmails} disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Email Settings'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Email Templates</h2>
              <Link href="/dashboard/settings/email-templates" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Manage Templates →
              </Link>
            </div>
            <p className="text-slate-500 text-sm">Customize the emails sent to your clients for report deliveries, notifications, and more.</p>
          </div>
        </div>
      )}

      {/* Report Settings Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Report Customization</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Report Logo URL</label>
              <input
                type="url"
                value={reportForm.report_logo_url}
                onChange={(e) => setReportForm({ ...reportForm, report_logo_url: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-slate-500 mt-1">Appears at the top of PDF reports. Leave blank to use default.</p>
              
              {reportForm.report_logo_url && (
                <div className="mt-2 p-3 bg-slate-50 rounded-lg inline-block">
                  <img src={reportForm.report_logo_url} alt="Report logo" className="max-h-10" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Report Header Text</label>
              <input
                type="text"
                value={reportForm.report_header_text}
                onChange={(e) => setReportForm({ ...reportForm, report_header_text: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Social Media Performance Report"
              />
              <p className="text-xs text-slate-500 mt-1">Custom title shown at the top of reports</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Report Footer Text</label>
              <input
                type="text"
                value={reportForm.report_footer_text}
                onChange={(e) => setReportForm({ ...reportForm, report_footer_text: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder={`Generated by ${agency?.name || 'Your Agency'}`}
              />
              <p className="text-xs text-slate-500 mt-1">Shown at the bottom of each report page</p>
            </div>

            {/* Preview */}
            <div className="mt-6 p-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-4">Report Preview</p>
              <div className="bg-white rounded-lg shadow-sm p-4 max-w-md">
                {reportForm.report_logo_url && (
                  <img src={reportForm.report_logo_url} alt="" className="h-8 mb-4" onError={(e) => e.currentTarget.style.display = 'none'} />
                )}
                <h3 className="text-lg font-bold text-slate-900">
                  {reportForm.report_header_text || 'Social Media Performance Report'}
                </h3>
                <p className="text-sm text-slate-500">Client Name • Jan 1 - Jan 31, 2024</p>
                <div className="my-4 py-4 border-y border-slate-100 text-center text-slate-400 text-sm">
                  [Report content here]
                </div>
                <p className="text-xs text-slate-400">
                  {reportForm.report_footer_text || `Generated by ${agency?.name || 'Your Agency'} via Socisync`}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button onClick={saveReports} disabled={saving} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Report Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
