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

const getComposerUrl = (phone, message) => {
  const phone10 = normalizePhone10(phone);
  const encodedMessage = encodeURIComponent(message.trim());
  return `https://api.whatsapp.com/send?phone=91${phone10}&text=${encodedMessage}`;
};

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
    const phone10 = normalizePhone10(form.recipient_phone);
    const message = form.message_body.trim();

    if (phone10.length !== 10 || !message) {
      toast({ title: 'Missing details', description: 'Enter a valid 10-digit phone number and message.', variant: 'destructive' });
      return;
    }

    const composerUrl = getComposerUrl(phone10, message);
    const composerWindow = window.open(composerUrl, '_blank', 'noopener,noreferrer');

    if (!composerWindow) {
      toast({ title: 'Popup blocked', description: 'Allow popups for this site, then try again.', variant: 'destructive' });
      return;
    }

    try {
      await base44.entities.WhatsAppMessage.create({
        to: phone10,
        recipient_name: form.recipient_name,
        message,
        message_body: message,
        template_name: form.template_name,
        status: 'opened',
      });
      toast({ title: 'WhatsApp opened', description: 'Review the message and press Send inside WhatsApp.' });
      setShowSend(false);
      setForm(emptyForm);
      load();
    } catch (e) {
      toast({ title: 'WhatsApp opened', description: 'Message history could not be saved.' });
      console.error(e);
    }
  };

  const selectTemplate = (template) => setForm(f => ({ ...f, template_name: template.name, message_body: template.body }));

  const opened = messages.filter(m => m.status === 'opened' || m.status === 'sent' || m.status === 'delivered');
  const pending = messages.filter(m => m.status === 'pending' || m.status === 'queued');
  const failed = messages.filter(m => m.status === 'failed');

  const columns = [
    { key: 'to', label: 'Phone', render: (_, row) => row.to || row.recipient_phone || '—' },
    { key: 'message', label: 'Message', render: (_, row) => <span className="max-w-[240px] truncate block text-xs">{row.message || row.message_body || '—'}</span> },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Opened', render: (_, row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—' },
  ];

  if (loading) return <div className="space-y-6"><PageHeader title="WhatsApp Notifications" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="WhatsApp Notifications" description="Open WhatsApp messages for members" actionLabel="Send Message" actionIcon={Send} onAction={() => setShowSend(true)} />

      <div className="glass-card rounded-xl p-4 flex items-start gap-3" style={{ borderColor: NEON_BORDER }}>
        <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: NEON_GREEN }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: NEON_GREEN }}>WhatsApp Composer Enabled</p>
          <p className="text-xs text-muted-foreground mt-0.5">Messages now open in WhatsApp with the number and text pre-filled. You still press Send manually inside WhatsApp.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Messages" value={messages.length} icon={MessageSquare} />
        <StatCard title="Opened" value={opened.length} icon={Check} />
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
              This opens WhatsApp with your message ready. Check the message and press Send inside WhatsApp.
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
            <Button onClick={handleSend} className="w-full font-semibold" style={{ background: NEON_GREEN, color: '#000' }}><Send className="w-4 h-4 mr-2" /> Open WhatsApp</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
