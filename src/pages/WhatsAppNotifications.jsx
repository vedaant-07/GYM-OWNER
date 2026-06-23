import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Send, AlertTriangle, Check, Clock } from 'lucide-react';
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
import { normalizePhone10 } from '@/lib/phone';

const NEON_GREEN = '#20c55d';
const NEON_SOFT = 'rgba(32,197,93,0.12)';
const NEON_BORDER = 'rgba(32,197,93,0.35)';

const TEMPLATES = [
  { name: 'payment_due', label: 'Payment Due', body: 'Hi {name}, your membership payment of ₹{amount} is due on {date}. Please renew to continue enjoying SE7EN FIT facilities.' },
  { name: 'membership_expiry', label: 'Membership Expiry', body: 'Hi {name}, your membership expires on {date}. Renew now and get {discount}% off! Reply YES to renew.' },
  { name: 'welcome', label: 'Welcome', body: 'Welcome to SE7EN FIT, {name}! Your fitness journey starts now. Your trainer {trainer} will contact you soon.' },
  { name: 'workout_reminder', label: 'Workout Reminder', body: 'Hey {name}! Do not miss your workout today. Your plan: {plan}. Stay consistent, stay fit.' },
  { name: 'attendance_missed', label: 'Missed Attendance', body: 'We missed you today, {name}! Your consistency matters. See you tomorrow at SE7EN FIT.' },
  { name: 'trial_followup', label: 'Trial Follow-up', body: 'Hi {name}! How was your trial session at SE7EN FIT? We would love to have you as a member. Special offer: {offer}' },
];

const emptyForm = { recipient_name: '', recipient_phone: '', message_body: '', message_type: 'individual', template_name: '' };

export default function WhatsAppNotifications() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSend, setShowSend] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setMessages(await base44.entities.WhatsAppMessage.list()); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSend = async () => {
    if (!normalizePhone10(form.recipient_phone) || !form.message_body.trim()) {
      toast({ title: 'Missing details', description: 'Phone number and message are required.', variant: 'destructive' });
      return;
    }
    try {
      await base44.entities.WhatsAppMessage.create({
        to: normalizePhone10(form.recipient_phone),
        message: form.message_body,
        status: 'queued',
      });
      toast({ title: 'Message queued', description: 'WhatsApp provider is not connected yet. Message is saved in queue.' });
      setShowSend(false);
      setForm(emptyForm);
      load();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const selectTemplate = (template) => setForm(f => ({ ...f, template_name: template.name, message_body: template.body }));

  const sent = messages.filter(m => m.status === 'sent' || m.status === 'delivered');
  const pending = messages.filter(m => m.status === 'pending' || m.status === 'queued');
  const failed = messages.filter(m => m.status === 'failed');

  const columns = [
    { key: 'to', label: 'Phone', render: (_, row) => row.to || row.recipient_phone || '—' },
    { key: 'message', label: 'Message', render: (_, row) => <span className="max-w-[240px] truncate block text-xs">{row.message || row.message_body || '—'}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Queued', render: (_, row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—' },
  ];

  if (loading) return <div className="space-y-6"><PageHeader title="WhatsApp Notifications" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="WhatsApp Notifications" description="Send and track WhatsApp messages to members" actionLabel="Send Message" actionIcon={Send} onAction={() => setShowSend(true)} />

      <div className="glass-card rounded-xl p-4 flex items-start gap-3" style={{ borderColor: NEON_BORDER }}>
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: NEON_GREEN }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: NEON_GREEN }}>WhatsApp Provider Setup Pending</p>
          <p className="text-xs text-muted-foreground mt-0.5">Connect WhatsApp Cloud API, Twilio, WATI, or Interakt to enable real message delivery. Messages are currently queued safely.</p>
          <Button size="sm" variant="outline" className="mt-2 text-xs" style={{ borderColor: NEON_BORDER, color: NEON_GREEN }}>Configure Provider →</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Messages" value={messages.length} icon={MessageSquare} />
        <StatCard title="Sent/Delivered" value={sent.length} icon={Check} />
        <StatCard title="Pending" value={pending.length} icon={Clock} />
        <StatCard title="Failed" value={failed.length} icon={AlertTriangle} />
      </div>

      <Tabs defaultValue="messages">
        <TabsList className="bg-secondary border-border">
          <TabsTrigger value="messages">Message History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-4">
          <DataTable columns={columns} data={messages} emptyTitle="No messages yet" emptyDescription="Send your first WhatsApp message" emptyIcon={MessageSquare} />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map(t => (
              <div key={t.name} className="glass-card glass-card-hover rounded-xl p-4">
                <h3 className="font-semibold text-sm mb-2">{t.label}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{t.body}</p>
                <Button size="sm" className="w-full text-xs" style={{ background: NEON_GREEN, color: '#000' }} onClick={() => { selectTemplate(t); setShowSend(true); }}>
                  <Send className="w-3 h-3 mr-1.5" /> Use Template
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showSend} onOpenChange={setShowSend}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">Send WhatsApp Message</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg text-xs text-muted-foreground" style={{ background: NEON_SOFT, border: `1px solid ${NEON_BORDER}` }}>
              WhatsApp provider not connected. This message will be queued for delivery after provider setup.
            </div>
            <div><Label className="text-sm text-muted-foreground">Recipient Name</Label><Input value={form.recipient_name} onChange={e => setForm({...form, recipient_name: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Phone Number *</Label><Input name="recipient_phone" type="tel" value={form.recipient_phone} onChange={e => setForm({...form, recipient_phone: normalizePhone10(e.target.value)})} className="bg-secondary border-border" placeholder="9876543210" /></div>
            <div>
              <Label className="text-sm text-muted-foreground">Template</Label>
              <Select value={form.template_name} onValueChange={v => { const t = TEMPLATES.find(t => t.name === v); if (t) selectTemplate(t); }}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select template" /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="none">No template</SelectItem>
                  {TEMPLATES.map(t => <SelectItem key={t.name} value={t.name}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm text-muted-foreground">Message *</Label><Textarea value={form.message_body} onChange={e => setForm({...form, message_body: e.target.value})} className="bg-secondary border-border" rows={4} /></div>
            <Button onClick={handleSend} className="w-full font-semibold" style={{ background: NEON_GREEN, color: '#000' }}><Send className="w-4 h-4 mr-2" /> Queue Message</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
