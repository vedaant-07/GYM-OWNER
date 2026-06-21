import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Target, Plus, Eye } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SearchFilterBar from '@/components/ui/SearchFilterBar';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Users, TrendingUp, Phone, Flame } from 'lucide-react';

const PIPELINE_STAGES = ['new', 'contacted', 'trial_booked', 'trial_completed', 'converted', 'lost'];
const STAGE_LABELS = { new: 'New', contacted: 'Contacted', trial_booked: 'Trial Booked', trial_completed: 'Trial Done', converted: 'Converted', lost: 'Lost' };

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', status: 'new', source: 'walk_in', interest_level: 'warm', next_action: '', notes: '' });
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState('pipeline');

  useEffect(() => { loadLeads(); }, []);

  const loadLeads = async () => {
    try { setLeads(await base44.entities.Lead.list()); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      if (editLead) {
        await base44.entities.Lead.update(editLead.id, form);
        toast({ title: 'Lead updated' });
      } else {
        await base44.entities.Lead.create(form);
        toast({ title: 'Lead added' });
      }
      setShowAdd(false); setEditLead(null);
      setForm({ name: '', phone: '', email: '', status: 'new', source: 'walk_in', interest_level: 'warm', next_action: '', notes: '' });
      loadLeads();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const moveStage = async (lead, newStatus) => {
    await base44.entities.Lead.update(lead.id, { status: newStatus });
    loadLeads();
  };

  const converted = leads.filter(l => l.status === 'converted');
  const hot = leads.filter(l => l.interest_level === 'hot');
  const filtered = leads.filter(l => {
    const matchSearch = l.name?.toLowerCase().includes(search.toLowerCase()) || l.phone?.includes(search);
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openEdit = (lead) => {
    setEditLead(lead);
    setForm({ name: lead.name, phone: lead.phone, email: lead.email || '', status: lead.status || 'new', source: lead.source || 'walk_in', interest_level: lead.interest_level || 'warm', next_action: lead.next_action || '', notes: lead.notes || '' });
    setShowAdd(true);
  };

  if (loading) return <div className="space-y-6"><PageHeader title="Leads & CRM" /><SkeletonCard count={6} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Leads & CRM" description="Manage your sales pipeline" actionLabel="Add Lead" actionIcon={Plus} onAction={() => { setEditLead(null); setForm({ name: '', phone: '', email: '', status: 'new', source: 'walk_in', interest_level: 'warm', next_action: '', notes: '' }); setShowAdd(true); }}>
        <div className="flex gap-1 glass-card rounded-lg p-1">
          <Button size="sm" variant={viewMode === 'pipeline' ? 'default' : 'ghost'} onClick={() => setViewMode('pipeline')} className={viewMode === 'pipeline' ? 'text-black text-xs' : 'text-xs text-muted-foreground'} style={viewMode === 'pipeline' ? { background: '#D4FF00' } : {}}>Pipeline</Button>
          <Button size="sm" variant={viewMode === 'list' ? 'default' : 'ghost'} onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'text-black text-xs' : 'text-xs text-muted-foreground'} style={viewMode === 'list' ? { background: '#D4FF00' } : {}}>List</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Leads" value={leads.length} icon={Target} />
        <StatCard title="Converted" value={converted.length} icon={TrendingUp} subtitle={leads.length > 0 ? `${Math.round((converted.length / leads.length) * 100)}%` : '0%'} />
        <StatCard title="Hot Leads" value={hot.length} icon={Flame} />
        <StatCard title="Pipeline" value={leads.filter(l => !['converted', 'lost'].includes(l.status)).length} icon={Users} />
      </div>

      {viewMode === 'pipeline' ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map(stage => {
            const stageLeads = leads.filter(l => l.status === stage);
            return (
              <div key={stage} className="min-w-[250px] flex-shrink-0">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-semibold">{STAGE_LABELS[stage]}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,255,0,0.1)', color: '#D4FF00' }}>{stageLeads.length}</span>
                </div>
                <div className="space-y-2">
                  {stageLeads.map(lead => (
                    <div key={lead.id} className="glass-card glass-card-hover rounded-xl p-3 cursor-pointer" onClick={() => openEdit(lead)}>
                      <p className="text-sm font-medium">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.phone}</p>
                      <div className="flex items-center justify-between mt-2">
                        <StatusBadge status={lead.interest_level} />
                        <p className="text-[10px] text-muted-foreground">{lead.source?.replace('_', ' ')}</p>
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="glass-card rounded-xl p-4 text-center text-xs text-muted-foreground">No leads</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <SearchFilterBar searchValue={search} onSearchChange={setSearch} placeholder="Search leads..."
            filters={[{ key: 'status', value: statusFilter, onChange: setStatusFilter, placeholder: 'Status',
              options: PIPELINE_STAGES.map(s => ({ value: s, label: STAGE_LABELS[s] })) }]} />
          <div className="space-y-2">
            {filtered.map(lead => (
              <div key={lead.id} className="glass-card glass-card-hover rounded-xl p-4 flex items-center justify-between cursor-pointer" onClick={() => openEdit(lead)}>
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.phone} · {lead.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={lead.status} />
                  <StatusBadge status={lead.interest_level} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">{editLead ? 'Edit Lead' : 'Add Lead'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Name *</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Phone *</Label><Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Email</Label><Input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {PIPELINE_STAGES.map(s => <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Interest</Label>
                <Select value={form.interest_level} onValueChange={(v) => setForm({...form, interest_level: v})}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="hot">Hot 🔥</SelectItem><SelectItem value="warm">Warm</SelectItem><SelectItem value="cold">Cold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Source</Label>
              <Select value={form.source} onValueChange={(v) => setForm({...form, source: v})}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="walk_in">Walk-in</SelectItem><SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="se7en_fit">SE7EN FIT</SelectItem><SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="website">Website</SelectItem><SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm text-muted-foreground">Next Action</Label><Input value={form.next_action} onChange={(e) => setForm({...form, next_action: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="bg-secondary border-border" /></div>
            <Button onClick={handleSave} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>{editLead ? 'Update Lead' : 'Add Lead'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}