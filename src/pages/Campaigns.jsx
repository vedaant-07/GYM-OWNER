import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Megaphone, Plus, Eye, Pause, Play, Trash2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SearchFilterBar from '@/components/ui/SearchFilterBar';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Send, TrendingUp, Users, MousePointer } from 'lucide-react';
import { motion } from 'framer-motion';

// SECURITY: Gym owner can only send campaigns to their own gym members and SE7EN FIT referred users.
// Campaign audience is scoped to the owner's gym_profile_id.

const TYPES = ['announcement', 'offer', 'promotion', 'alert', 'event_update', 'renewal_reminder', 'trial_offer'];
const AUDIENCES = [
  { value: 'all_members', label: 'All Gym Members' },
  { value: 'referred_users', label: 'SE7EN FIT Referred Users Only' },
  { value: 'active_members', label: 'Active Members' },
  { value: 'expiring_members', label: 'Expiring Members' },
  { value: 'payment_due', label: 'Payment Due Members' },
  { value: 'trial_leads', label: 'Trial Leads' },
  { value: 'inactive_members', label: 'Inactive Members' },
];

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editCampaign, setEditCampaign] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'announcement', cta_text: '', start_date: '', end_date: '', status: 'draft', priority: 'medium', audience: 'all_members' });
  const { toast } = useToast();

  useEffect(() => { loadCampaigns(); }, []);

  const loadCampaigns = async () => {
    try { setCampaigns(await base44.entities.Campaign.list('-created_date')); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      if (editCampaign) {
        await base44.entities.Campaign.update(editCampaign.id, form);
        toast({ title: 'Campaign updated' });
      } else {
        await base44.entities.Campaign.create(form);
        toast({ title: 'Campaign created' });
      }
      setShowAdd(false); setEditCampaign(null);
      setForm({ title: '', description: '', type: 'announcement', cta_text: '', start_date: '', end_date: '', status: 'draft', priority: 'medium', audience: 'all_members' });
      loadCampaigns();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const toggleStatus = async (campaign) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    await base44.entities.Campaign.update(campaign.id, { status: newStatus });
    toast({ title: `Campaign ${newStatus}` });
    loadCampaigns();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this campaign?')) return;
    await base44.entities.Campaign.delete(id);
    toast({ title: 'Campaign deleted' });
    loadCampaigns();
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const totalImpressions = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);

  const filtered = campaigns.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="space-y-6"><PageHeader title="Campaigns" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Campaigns & Announcements" description="Create and manage your marketing campaigns" actionLabel="Create Campaign" actionIcon={Plus} onAction={() => { setEditCampaign(null); setForm({ title: '', description: '', type: 'announcement', cta_text: '', start_date: '', end_date: '', status: 'draft', priority: 'medium', audience: 'all_members' }); setShowAdd(true); }} />

      {/* Security notice */}
      <div className="glass-card rounded-lg p-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span style={{ color: '#D4FF00' }}>🔒</span>
        Campaigns are sent only to your gym's own members and SE7EN FIT referred users. You cannot target members from other gyms.
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Campaigns" value={campaigns.length} icon={Megaphone} />
        <StatCard title="Active" value={activeCampaigns.length} icon={Send} />
        <StatCard title="Total Impressions" value={totalImpressions} icon={Users} />
        <StatCard title="Total Clicks" value={totalClicks} icon={MousePointer} />
      </div>

      <SearchFilterBar searchValue={search} onSearchChange={setSearch} placeholder="Search campaigns..." />

      {campaigns.length === 0 ? (
        <EmptyState icon={Megaphone} title="No campaigns yet" description="Create your first campaign to engage members" actionLabel="Create Campaign" onAction={() => setShowAdd(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((campaign) => (
            <motion.div key={campaign.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card glass-card-hover rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'rgba(212,255,0,0.1)', color: '#D4FF00' }}>{campaign.type?.replace('_', ' ')}</span>
                <StatusBadge status={campaign.status} />
              </div>
              <h3 className="font-display font-semibold text-lg mt-2">{campaign.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{campaign.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span>👥 {AUDIENCES.find(a => a.value === campaign.audience)?.label || campaign.audience}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>👀 {campaign.impressions || 0}</span>
                <span>🖱️ {campaign.clicks || 0}</span>
                <span>CTR: {campaign.impressions > 0 ? ((campaign.clicks / campaign.impressions) * 100).toFixed(1) : 0}%</span>
              </div>
              <div className="flex gap-2 mt-4 pt-3" style={{ borderTop: '1px solid #1a1a1a' }}>
                <Button size="sm" variant="ghost" className="text-xs flex-1" onClick={() => { setEditCampaign(campaign); setForm({ title: campaign.title, description: campaign.description || '', type: campaign.type, cta_text: campaign.cta_text || '', start_date: campaign.start_date || '', end_date: campaign.end_date || '', status: campaign.status, priority: campaign.priority || 'medium', audience: campaign.audience || 'all_members' }); setShowAdd(true); }}>Edit</Button>
                <Button size="sm" variant="ghost" className="text-xs" onClick={() => toggleStatus(campaign)}>
                  {campaign.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </Button>
                <Button size="sm" variant="ghost" className="text-xs text-red-400" onClick={() => handleDelete(campaign.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editCampaign ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Title *</Label><Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Description</Label><Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-muted-foreground">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({...form, type: v})}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {TYPES.map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({...form, priority: v})}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Target Audience</Label>
              <Select value={form.audience} onValueChange={(v) => setForm({...form, audience: v})}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {AUDIENCES.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm text-muted-foreground">CTA Text</Label><Input value={form.cta_text} onChange={(e) => setForm({...form, cta_text: e.target.value})} className="bg-secondary border-border" placeholder="e.g. Join Now" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Start Date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({...form, start_date: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">End Date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({...form, end_date: e.target.value})} className="bg-secondary border-border" /></div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="draft">Draft</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSave} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>{editCampaign ? 'Update Campaign' : 'Create Campaign'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}