import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, Plus, Trash2, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SkeletonCard from '@/components/ui/SkeletonCard';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const NEON_GREEN = '#20c55d';
const NEON_SOFT = 'rgba(32,197,93,0.12)';
const NEON_BORDER = 'rgba(32,197,93,0.35)';
const STORAGE_KEY = 'se7enfit_notification_automations';

const TRIGGERS = [
  { value: 'payment_due', label: 'Payment Due' },
  { value: 'membership_expiry', label: 'Membership Expiry' },
  { value: 'trial_followup', label: 'Trial Follow-up' },
  { value: 'missed_attendance', label: 'Missed Attendance' },
  { value: 'workout_missed', label: 'Workout Missed' },
  { value: 'diet_compliance', label: 'Diet Compliance' },
  { value: 'birthday', label: 'Birthday / Anniversary' },
  { value: 'offer_campaign', label: 'Offer Campaign' },
  { value: 'referred_followup', label: 'Referred User Follow-up' },
];

const CHANNELS = [
  { value: 'whatsapp', label: 'WhatsApp only' },
  { value: 'email', label: 'Email only' },
  { value: 'both', label: 'Both WhatsApp + Email' },
];

const AUDIENCES = [
  { value: 'all_members', label: 'All Members' },
  { value: 'active_members', label: 'Active Members' },
  { value: 'expiring_members', label: 'Expiring Members' },
  { value: 'payment_due', label: 'Payment Due Members' },
  { value: 'trial_leads', label: 'Trial Leads' },
  { value: 'referred_users', label: 'SE7EN FIT Referred Users' },
  { value: 'inactive_members', label: 'Inactive Members' },
];

const emptyForm = { name: '', trigger: 'payment_due', audience: 'all_members', channel: 'whatsapp', message_body: '', days_before: 3, is_active: false };

function readLocalAutomations() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function writeLocalAutomations(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function Automations() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const remote = await base44.entities.NotificationAutomation.list();
      setAutomations(remote.length ? remote : readLocalAutomations());
    } catch (e) {
      console.warn('Using local automation fallback:', e.message);
      setAutomations(readLocalAutomations());
    }
    setLoading(false);
  };

  const save = async () => {
    if (!form.name.trim() || !form.message_body.trim()) {
      toast({ title: 'Missing details', description: 'Automation name and message template are required.', variant: 'destructive' });
      return;
    }

    const payload = { ...form, days_before: Number(form.days_before) || 0, id: `local-${Date.now()}`, createdAt: new Date().toISOString() };

    try {
      await base44.entities.NotificationAutomation.create(payload);
      toast({ title: 'Automation created', description: 'Automation saved to backend.' });
    } catch (e) {
      const next = [payload, ...readLocalAutomations()];
      writeLocalAutomations(next);
      toast({ title: 'Automation saved locally', description: 'Backend automation route is not connected yet, so this rule is saved in browser storage.' });
    }

    setShowAdd(false);
    setForm(emptyForm);
    load();
  };

  const toggleActive = async (item) => {
    const nextItem = { ...item, is_active: !item.is_active };
    const local = readLocalAutomations().map((a) => a.id === item.id ? nextItem : a);
    writeLocalAutomations(local);
    setAutomations((prev) => prev.map((a) => a.id === item.id ? nextItem : a));
    if (!String(item.id).startsWith('local-')) {
      await base44.entities.NotificationAutomation.update(item.id, { is_active: !item.is_active }).catch(() => null);
    }
    toast({ title: item.is_active ? 'Automation paused' : 'Automation activated' });
  };

  const del = async (id) => {
    if (!confirm('Delete automation?')) return;
    writeLocalAutomations(readLocalAutomations().filter((a) => a.id !== id));
    setAutomations((prev) => prev.filter((a) => a.id !== id));
    if (!String(id).startsWith('local-')) await base44.entities.NotificationAutomation.delete(id).catch(() => null);
    toast({ title: 'Automation deleted' });
  };

  if (loading) return <div className="space-y-6"><PageHeader title="Automations" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Notification Automations" description="Auto-send reminders and messages to members" actionLabel="Create Automation" actionIcon={Plus} onAction={() => setShowAdd(true)} />

      <div className="glass-card rounded-xl p-4 flex items-start gap-3" style={{ borderColor: NEON_BORDER }}>
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: NEON_GREEN }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: NEON_GREEN }}>Delivery Requires WhatsApp / Email Integration</p>
          <p className="text-xs text-muted-foreground mt-0.5">Automations can be configured here. Actual delivery starts after WhatsApp Cloud API or Email SMTP is connected.</p>
        </div>
      </div>

      {automations.length === 0 ? (
        <EmptyState icon={Bot} title="No automations yet" description="Create automated messages to keep members engaged" actionLabel="Create Automation" onAction={() => setShowAdd(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {automations.map((a, i) => {
            const triggerLabel = TRIGGERS.find(t => t.value === a.trigger)?.label || a.trigger;
            const channelLabel = CHANNELS.find(c => c.value === a.channel)?.label || a.channel;
            const audienceLabel = AUDIENCES.find(aud => aud.value === a.audience)?.label || a.audience;
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-sm">{a.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: NEON_GREEN }}>{triggerLabel}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={Boolean(a.is_active)} onCheckedChange={() => toggleActive(a)} />
                    <button onClick={() => del(a.id)} className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Channel:</span><span className="text-foreground">{channelLabel}</span></div>
                  <div className="flex justify-between"><span>Audience:</span><span className="text-foreground">{audienceLabel}</span></div>
                  <div className="flex justify-between"><span>Trigger days:</span><span className="text-foreground">{a.days_before || 0} days before</span></div>
                  <div className="flex justify-between"><span>Status:</span><span className={a.is_active ? 'text-green-400' : 'text-muted-foreground'}>{a.is_active ? 'Active' : 'Paused'}</span></div>
                </div>
                {a.message_body && <div className="mt-3 pt-3 border-t border-border"><p className="text-xs text-muted-foreground line-clamp-2">{a.message_body}</p></div>}
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">Create Automation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-secondary border-border" placeholder="e.g. 3-day payment reminder" /></div>
            <div><Label className="text-sm text-muted-foreground">Trigger</Label><Select value={form.trigger} onValueChange={v => setForm({...form, trigger: v})}><SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger><SelectContent className="bg-card border-border">{TRIGGERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-sm text-muted-foreground">Audience</Label><Select value={form.audience} onValueChange={v => setForm({...form, audience: v})}><SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger><SelectContent className="bg-card border-border">{AUDIENCES.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-sm text-muted-foreground">Channel</Label><Select value={form.channel} onValueChange={v => setForm({...form, channel: v})}><SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger><SelectContent className="bg-card border-border">{CHANNELS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-sm text-muted-foreground">Days Before Trigger</Label><Input type="number" value={form.days_before} onChange={e => setForm({...form, days_before: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Message Template *</Label><Textarea value={form.message_body} onChange={e => setForm({...form, message_body: e.target.value})} className="bg-secondary border-border" rows={3} placeholder="Hi {name}, your membership expires on {date}..." /></div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary"><Switch checked={form.is_active} onCheckedChange={v => setForm({...form, is_active: v})} /><Label className="text-sm cursor-pointer">Activate immediately</Label></div>
            <Button onClick={save} className="w-full font-semibold" style={{ background: NEON_GREEN, color: '#000' }}>Create Automation</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
