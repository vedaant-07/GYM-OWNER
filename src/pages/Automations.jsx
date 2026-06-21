import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, Plus, Power, Trash2, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
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

const TRIGGERS = [
  { value: 'payment_due', label: '💰 Payment Due' },
  { value: 'membership_expiry', label: '⏰ Membership Expiry' },
  { value: 'trial_followup', label: '📞 Trial Follow-up' },
  { value: 'missed_attendance', label: '🚨 Missed Attendance' },
  { value: 'workout_missed', label: '🏋️ Workout Missed' },
  { value: 'diet_compliance', label: '🥗 Diet Compliance' },
  { value: 'birthday', label: '🎂 Birthday / Anniversary' },
  { value: 'offer_campaign', label: '🎯 Offer Campaign' },
  { value: 'referred_followup', label: '⚡ Referred User Follow-up' },
];

const CHANNELS = [
  { value: 'whatsapp', label: '💬 WhatsApp only' },
  { value: 'email', label: '📧 Email only' },
  { value: 'both', label: '💬📧 Both WhatsApp + Email' },
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

export default function Automations() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', trigger: 'payment_due', audience: 'all_members', channel: 'whatsapp', message_body: '', days_before: 3, is_active: false });
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setAutomations(await base44.entities.NotificationAutomation.list()); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const save = async () => {
    try {
      await base44.entities.NotificationAutomation.create({ ...form, days_before: Number(form.days_before) });
      toast({ title: 'Automation created' });
      setShowAdd(false);
      setForm({ name: '', trigger: 'payment_due', audience: 'all_members', channel: 'whatsapp', message_body: '', days_before: 3, is_active: false });
      load();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const toggleActive = async (a) => {
    await base44.entities.NotificationAutomation.update(a.id, { is_active: !a.is_active });
    toast({ title: a.is_active ? 'Automation paused' : 'Automation activated' });
    load();
  };

  const del = async (id) => {
    if (!confirm('Delete automation?')) return;
    await base44.entities.NotificationAutomation.delete(id);
    toast({ title: 'Deleted' }); load();
  };

  if (loading) return <div className="space-y-6"><PageHeader title="Automations" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Notification Automations" description="Auto-send reminders and messages to members" actionLabel="Create Automation" actionIcon={Plus} onAction={() => setShowAdd(true)} />

      <div className="glass-card rounded-xl p-4 flex items-start gap-3" style={{ borderColor: 'rgba(250,204,21,0.3)' }}>
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#FACC15' }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: '#FACC15' }}>Delivery Requires WhatsApp / Email Integration</p>
          <p className="text-xs text-muted-foreground mt-0.5">Automations are configured here. Actual message delivery requires WhatsApp Cloud API or Email SMTP to be connected first.</p>
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
              <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-sm">{a.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{triggerLabel}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={a.is_active} onCheckedChange={() => toggleActive(a)} />
                    <button onClick={() => del(a.id)} className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Channel:</span><span className="text-foreground">{channelLabel}</span></div>
                  <div className="flex justify-between"><span>Audience:</span><span className="text-foreground">{audienceLabel}</span></div>
                  {a.days_before && <div className="flex justify-between"><span>Trigger days:</span><span className="text-foreground">{a.days_before} days before</span></div>}
                  <div className="flex justify-between"><span>Status:</span><span className={a.is_active ? 'text-green-400' : 'text-muted-foreground'}>{a.is_active ? 'Active' : 'Paused'}</span></div>
                  {a.last_run && <div className="flex justify-between"><span>Last run:</span><span className="text-foreground">{a.last_run}</span></div>}
                </div>

                {a.message_body && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground line-clamp-2">{a.message_body}</p>
                  </div>
                )}
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
            <div>
              <Label className="text-sm text-muted-foreground">Trigger</Label>
              <Select value={form.trigger} onValueChange={v => setForm({...form, trigger: v})}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">{TRIGGERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Audience</Label>
              <Select value={form.audience} onValueChange={v => setForm({...form, audience: v})}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">{AUDIENCES.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Channel</Label>
              <Select value={form.channel} onValueChange={v => setForm({...form, channel: v})}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">{CHANNELS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm text-muted-foreground">Days Before Trigger</Label><Input type="number" value={form.days_before} onChange={e => setForm({...form, days_before: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Message Template</Label><Textarea value={form.message_body} onChange={e => setForm({...form, message_body: e.target.value})} className="bg-secondary border-border" rows={3} placeholder="Hi {name}, your membership expires on {date}..." /></div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
              <Switch checked={form.is_active} onCheckedChange={v => setForm({...form, is_active: v})} />
              <Label className="text-sm cursor-pointer">Activate immediately</Label>
            </div>
            <Button onClick={save} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>Create Automation</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}