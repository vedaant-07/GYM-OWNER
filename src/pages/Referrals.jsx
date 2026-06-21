import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Share2, Plus, Trash2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import SkeletonCard from '@/components/ui/SkeletonCard';
import StatCard from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Users, TrendingUp, Gift } from 'lucide-react';

export default function Referrals() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ referral_code: '', referred_by_name: '', referred_member_name: '', incentive_type: '', incentive_value: '' });
  const { toast } = useToast();

  useEffect(() => { loadReferrals(); }, []);

  const loadReferrals = async () => {
    try { setReferrals(await base44.entities.Referral.list()); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      await base44.entities.Referral.create({ ...form, incentive_value: Number(form.incentive_value) || 0 });
      toast({ title: 'Referral added' });
      setShowAdd(false); setForm({ referral_code: '', referred_by_name: '', referred_member_name: '', incentive_type: '', incentive_value: '' });
      loadReferrals();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const converted = referrals.filter(r => r.status === 'converted');

  const columns = [
    { key: 'referral_code', label: 'Code' },
    { key: 'referred_by_name', label: 'Referred By' },
    { key: 'referred_member_name', label: 'New Member' },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'incentive_type', label: 'Incentive' },
    { key: 'incentive_value', label: 'Value', render: (val) => val ? `₹${val}` : '—' },
  ];

  if (loading) return <div className="space-y-6"><PageHeader title="Referral Program" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Referral Program" description="Manage member referrals and incentives" actionLabel="Add Referral" actionIcon={Plus} onAction={() => setShowAdd(true)} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Referrals" value={referrals.length} icon={Share2} />
        <StatCard title="Converted" value={converted.length} icon={TrendingUp} />
        <StatCard title="Conversion Rate" value={referrals.length > 0 ? `${Math.round((converted.length / referrals.length) * 100)}%` : '0%'} icon={Users} />
        <StatCard title="Total Incentives" value={`₹${referrals.reduce((s, r) => s + (r.incentive_value || 0), 0).toLocaleString()}`} icon={Gift} />
      </div>

      <DataTable columns={columns} data={referrals} emptyTitle="No referrals yet" emptyIcon={Share2} />

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">Add Referral</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Referral Code *</Label><Input value={form.referral_code} onChange={(e) => setForm({...form, referral_code: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Referred By</Label><Input value={form.referred_by_name} onChange={(e) => setForm({...form, referred_by_name: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">New Member</Label><Input value={form.referred_member_name} onChange={(e) => setForm({...form, referred_member_name: e.target.value})} className="bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Incentive Type</Label><Input value={form.incentive_type} onChange={(e) => setForm({...form, incentive_type: e.target.value})} className="bg-secondary border-border" placeholder="e.g. Discount, Free Month" /></div>
              <div><Label className="text-sm text-muted-foreground">Value (₹)</Label><Input type="number" value={form.incentive_value} onChange={(e) => setForm({...form, incentive_value: e.target.value})} className="bg-secondary border-border" /></div>
            </div>
            <Button onClick={handleSave} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>Add Referral</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}