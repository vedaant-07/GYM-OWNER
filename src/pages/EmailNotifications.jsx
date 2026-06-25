import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { apiRequest } from '@/lib/api-client';
import { Mail, Send, AlertTriangle, Check, Clock, Eye } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

const NEON_GREEN = '#20c55d';
const NEON_SOFT = 'rgba(32,197,93,0.12)';
const NEON_BORDER = 'rgba(32,197,93,0.35)';

const EMAIL_TEMPLATES = [
  { name: 'payment_due', label: 'Payment Due Reminder', subject: 'Your Membership Payment is Due - SE7EN FIT', body: 'Dear {name},\n\nYour membership payment of ₹{amount} is due on {date}.\n\nPlease visit the gym or pay online to continue your fitness journey without interruption.\n\nBest regards,\nSE7EN FIT Team' },
  { name: 'welcome', label: 'Welcome Email', subject: 'Welcome to SE7EN FIT!', body: 'Dear {name},\n\nWelcome to SE7EN FIT! We are thrilled to have you join our fitness community.\n\nYour membership is now active.\n\nSE7EN FIT Team' },
  { name: 'renewal_reminder', label: 'Renewal Reminder', subject: 'Your Membership Expires Soon - Renew Now!', body: 'Dear {name},\n\nYour SE7EN FIT membership expires on {date}.\n\nRenew now and enjoy uninterrupted access.\n\nSE7EN FIT Team' },
  { name: 'workout_assigned', label: 'Workout Plan Assigned', subject: 'Your New Workout Plan is Ready!', body: 'Dear {name},\n\nYour trainer has assigned a new workout plan: {plan}.\n\nStart your journey today!\n\nSE7EN FIT Team' },
];

const emptyForm = { recipient_name: '', recipient_email: '', subject: '', body: '', template_name: '' };
const emptyProviderStatus = { configured: false, missing: [], from: null, host: null };

export default function EmailNotifications() {
  const [emails, setEmails] = useState([]);
  const [providerStatus, setProviderStatus] = useState(emptyProviderStatus);
  const [loading, setLoading] = useState(true);
  const [showSend, setShowSend] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const providerConfigured = Boolean(providerStatus?.configured);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [emailList, status] = await Promise.all([
        base44.entities.EmailMessage.list(),
        apiRequest('/api/gym-owner/email-notifications/status').catch(() => emptyProviderStatus),
      ]);
      setEmails(Array.isArray(emailList) ? emailList : []);
      setProviderStatus(status || emptyProviderStatus);
    } catch (e) {
      console.error(e);
      setEmails([]);
    }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!form.recipient_email.trim() || !form.subject.trim() || !form.body.trim()) {
      toast({ title: 'Missing details', description: 'Email, subject and body are required.', variant: 'destructive' });
      return;
    }
    try {
      const result = await base44.entities.EmailMessage.create({
        to: form.recipient_email.trim(),
        recipient_email: form.recipient_email.trim(),
        recipient_name: form.recipient_name.trim() || undefined,
        subject: form.subject.trim(),
        message: form.body.trim(),
        template_name: form.template_name || undefined,
      });
      toast(result?.status === 'sent'
        ? { title: 'Email sent', description: 'Message was sent successfully.' }
        : { title: 'Email queued', description: 'Provider is not connected yet, so the email was saved in history.' });
      setShowSend(false);
      setForm(emptyForm);
      load();
    } catch (e) {
      toast({ title: 'Email failed', description: e.message, variant: 'destructive' });
    }
  };

  const selectTemplate = (t) => setForm(f => ({ ...f, template_name: t.name, subject: t.subject, body: t.body }));

  const sent = emails.filter(m => ['sent','delivered','opened'].includes(m.status));
  const opened = emails.filter(m => m.status === 'opened');

  const columns = [
    { key: 'to', label: 'Email', render: (_, row) => row.to || row.recipient_email || '—' },
    { key: 'subject', label: 'Subject', render: v => <span className="max-w-[220px] truncate block text-xs">{v}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Queued', render: (_, row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—' },
  ];

  if (loading) return <div className="space-y-6"><PageHeader title="Email Notifications" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Email Notifications" description="Send and track email communications" actionLabel="Send Email" actionIcon={Send} onAction={() => setShowSend(true)} />

      <div className="glass-card rounded-xl p-4 flex items-start gap-3" style={{ borderColor: NEON_BORDER }}>
        {providerConfigured ? <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: NEON_GREEN }} /> : <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: NEON_GREEN }} />}
        <div>
          <p className="text-sm font-semibold" style={{ color: NEON_GREEN }}>{providerConfigured ? 'Email Provider Connected' : 'Email Provider Setup Pending'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {providerConfigured
              ? `Provider is active${providerStatus.from ? ` from ${providerStatus.from}` : ''}. Emails will be sent from the backend.`
              : `Add the SMTP environment variables in your backend. Missing: ${(providerStatus.missing || []).join(', ') || 'provider settings'}.`}
          </p>
          {!providerConfigured && <Button size="sm" variant="outline" className="mt-2 text-xs" style={{ borderColor: NEON_BORDER, color: NEON_GREEN }} disabled>Configure SMTP in backend →</Button>}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Emails" value={emails.length} icon={Mail} />
        <StatCard title="Sent" value={sent.length} icon={Check} />
        <StatCard title="Opened" value={opened.length} icon={Eye} />
        <StatCard title="Pending" value={emails.filter(m => m.status === 'pending' || m.status === 'queued').length} icon={Clock} />
      </div>

      <Tabs defaultValue="history">
        <TabsList className="bg-secondary border-border">
          <TabsTrigger value="history">Email History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="mt-4">
          <DataTable columns={columns} data={emails} emptyTitle="No emails yet" emptyDescription="Send your first email" emptyIcon={Mail} />
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EMAIL_TEMPLATES.map(t => (
              <div key={t.name} className="glass-card glass-card-hover rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-1">{t.label}</h3>
                <p className="text-xs text-muted-foreground mb-1">Subject: {t.subject}</p>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2 whitespace-pre-line">{t.body.slice(0,100)}...</p>
                <Button size="sm" className="w-full text-xs" style={{ background: NEON_GREEN, color: '#000' }} onClick={() => { selectTemplate(t); setShowSend(true); }}>
                  <Send className="w-3 h-3 mr-1.5" /> Use Template
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showSend} onOpenChange={setShowSend}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">Send Email</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg text-xs text-muted-foreground" style={{ background: NEON_SOFT, border: `1px solid ${NEON_BORDER}` }}>
              {providerConfigured ? 'Email provider is connected. This email will be sent now.' : 'Email provider is not connected. This email will be queued until setup is completed.'}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Recipient Name</Label><Input value={form.recipient_name} onChange={e => setForm({...form, recipient_name: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">Email *</Label><Input type="email" value={form.recipient_email} onChange={e => setForm({...form, recipient_email: e.target.value})} className="bg-secondary border-border" /></div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Template</Label>
              <Select value={form.template_name} onValueChange={v => { const t = EMAIL_TEMPLATES.find(t => t.name === v); if(t) selectTemplate(t); }}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select template" /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="none">No template</SelectItem>
                  {EMAIL_TEMPLATES.map(t => <SelectItem key={t.name} value={t.name}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm text-muted-foreground">Subject *</Label><Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Body *</Label><Textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} className="bg-secondary border-border" rows={6} /></div>
            <Button onClick={handleSend} className="w-full font-semibold" style={{ background: NEON_GREEN, color: '#000' }}><Send className="w-4 h-4 mr-2" /> {providerConfigured ? 'Send Email' : 'Queue Email'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
