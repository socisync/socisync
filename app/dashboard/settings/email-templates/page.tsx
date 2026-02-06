'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Mail, FileText, Bell, Sparkles, Pencil, Trash2, Copy, X, Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

interface EmailTemplate {
  id: string
  agency_id: string
  name: string
  subject: string
  body_html: string
  body_text: string | null
  template_type: 'report_delivery' | 'welcome' | 'notification' | 'custom'
  is_default: boolean
  created_at: string
}

const TEMPLATE_TYPES = [
  { id: 'report_delivery', label: 'Report Delivery', icon: FileText, description: 'Sent when sharing reports with clients' },
  { id: 'welcome', label: 'Welcome', icon: Sparkles, description: 'Sent when adding a new client' },
  { id: 'notification', label: 'Notification', icon: Bell, description: 'General notifications' },
  { id: 'custom', label: 'Custom', icon: Mail, description: 'Custom templates' },
]

const DEFAULT_TEMPLATES = {
  report_delivery: {
    name: 'Report Delivery',
    subject: 'Your {{period}} Social Media Report is Ready',
    body_html: `<h2>Hi {{client_name}},</h2>
<p>Your social media performance report for {{period}} is now ready.</p>
<p><strong>Highlights:</strong></p>
<ul>
  <li>Total Reach: {{total_reach}}</li>
  <li>Total Engagement: {{total_engagement}}</li>
  <li>Follower Growth: {{follower_growth}}</li>
</ul>
<p>View the full report in the attachment or click the link below.</p>
<p><a href="{{report_link}}">View Full Report</a></p>
<p>Best regards,<br>{{agency_name}}</p>`,
  },
  welcome: {
    name: 'Welcome Email',
    subject: 'Welcome to {{agency_name}}!',
    body_html: `<h2>Welcome, {{client_name}}!</h2>
<p>We're excited to have you on board. Your social media accounts are now being tracked.</p>
<p>Here's what happens next:</p>
<ol>
  <li>We'll start collecting your social media data</li>
  <li>You'll receive regular performance reports</li>
  <li>Our team will provide insights and recommendations</li>
</ol>
<p>If you have any questions, don't hesitate to reach out.</p>
<p>Best regards,<br>{{agency_name}}</p>`,
  },
  notification: {
    name: 'Notification',
    subject: '{{subject}}',
    body_html: `<p>Hi {{client_name}},</p>
<p>{{message}}</p>
<p>Best regards,<br>{{agency_name}}</p>`,
  },
}

export default function EmailTemplatesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<Partial<EmailTemplate> | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

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
      .select('agency_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (!membership) {
      router.push('/onboarding')
      return
    }

    setAgencyId(membership.agency_id)

    const { data: templatesData } = await supabase
      .from('email_templates')
      .select('*')
      .eq('agency_id', membership.agency_id)
      .order('template_type')

    setTemplates(templatesData || [])
    setLoading(false)
  }

  const createTemplate = (type: string) => {
    const defaultTemplate = DEFAULT_TEMPLATES[type as keyof typeof DEFAULT_TEMPLATES]
    setEditingTemplate({
      name: defaultTemplate?.name || 'New Template',
      subject: defaultTemplate?.subject || '',
      body_html: defaultTemplate?.body_html || '',
      template_type: type as EmailTemplate['template_type'],
      is_default: false,
    })
  }

  const saveTemplate = async () => {
    if (!editingTemplate || !agencyId) return
    setSaving(true)
    setMessage(null)

    const supabase = createClient()

    if (editingTemplate.id) {
      // Update
      const { error } = await supabase
        .from('email_templates')
        .update({
          name: editingTemplate.name,
          subject: editingTemplate.subject,
          body_html: editingTemplate.body_html,
          body_text: editingTemplate.body_text,
        })
        .eq('id', editingTemplate.id)

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Template updated' })
        loadData()
        setEditingTemplate(null)
      }
    } else {
      // Create
      const { error } = await supabase
        .from('email_templates')
        .insert({
          agency_id: agencyId,
          name: editingTemplate.name,
          subject: editingTemplate.subject,
          body_html: editingTemplate.body_html,
          body_text: editingTemplate.body_text,
          template_type: editingTemplate.template_type,
          is_default: false,
        })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Template created' })
        loadData()
        setEditingTemplate(null)
      }
    }

    setSaving(false)
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('Delete this template?')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setTemplates(templates.filter(t => t.id !== id))
      setMessage({ type: 'success', text: 'Template deleted' })
    }
  }

  const duplicateTemplate = (template: EmailTemplate) => {
    setEditingTemplate({
      name: `${template.name} (Copy)`,
      subject: template.subject,
      body_html: template.body_html,
      body_text: template.body_text,
      template_type: template.template_type,
      is_default: false,
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-500">Loading...</div></div>
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/settings" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Email Templates</h1>
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

      {/* Template Types */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {TEMPLATE_TYPES.map(type => {
          const existingCount = templates.filter(t => t.template_type === type.id).length
          return (
            <button
              key={type.id}
              onClick={() => createTemplate(type.id)}
              className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition text-left"
            >
              <type.icon className="w-6 h-6 text-slate-600 mb-2" />
              <h3 className="font-medium text-slate-900">{type.label}</h3>
              <p className="text-xs text-slate-500 mt-1">{existingCount} template{existingCount !== 1 ? 's' : ''}</p>
            </button>
          )
        })}
      </div>

      {/* Existing Templates */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Your Templates</h2>
        </div>

        {templates.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {templates.map(template => {
              const typeConfig = TEMPLATE_TYPES.find(t => t.id === template.template_type)
              const Icon = typeConfig?.icon || Mail
              return (
                <div key={template.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{template.name}</h3>
                      <p className="text-sm text-slate-500">{template.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {template.is_default && (
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">Default</span>
                    )}
                    <button
                      onClick={() => setEditingTemplate(template)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => duplicateTemplate(template)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-medium text-slate-900 mb-2">No templates yet</h3>
            <p className="text-slate-500 text-sm">Click a template type above to create your first template</p>
          </div>
        )}
      </div>

      {/* Variables Reference */}
      <div className="mt-6 p-4 bg-slate-50 rounded-xl">
        <h3 className="font-medium text-slate-900 mb-2">Available Variables</h3>
        <div className="flex flex-wrap gap-2">
          {['{{client_name}}', '{{agency_name}}', '{{period}}', '{{report_link}}', '{{total_reach}}', '{{total_engagement}}', '{{follower_growth}}'].map(v => (
            <code key={v} className="px-2 py-1 bg-white text-slate-600 text-xs rounded border border-slate-200">{v}</code>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingTemplate.id ? 'Edit Template' : 'Create Template'}
              </h2>
              <button onClick={() => setEditingTemplate(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
                <input
                  type="text"
                  value={editingTemplate.name || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject Line</label>
                <input
                  type="text"
                  value={editingTemplate.subject || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Your {{period}} Report is Ready"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Body (HTML)</label>
                <textarea
                  value={editingTemplate.body_html || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body_html: e.target.value })}
                  rows={12}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plain Text Version (optional)</label>
                <textarea
                  value={editingTemplate.body_text || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body_text: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm"
                  placeholder="Plain text fallback for email clients that don't support HTML"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setEditingTemplate(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                disabled={saving || !editingTemplate.name || !editingTemplate.subject || !editingTemplate.body_html}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
