import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Salad, Plus, Trash2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Users, TrendingUp, CheckCircle } from 'lucide-react';

export default function AssignedDiets() {
  const [assigned, setAssigned] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ member_name: '', plan_name: '', calories_target: '', protein_g: '', start_date: '', end_date: '', trainer_name: '', status: 'active' });
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [a, d] = await Promise.all([base44.entities.AssignedDietPlan.list('-created_date', 50), base44.entities.DietPlan.list()]);
      setAssigned(a); setDietPlans(d);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const save = async () => {
    try {
      await base44.entities.AssignedDietPlan.create({ ...form, calories_target: Number(form.calories_target) || 0, protein_g: Number(form.protein_g) || 0 });
      toast({ title: 'Diet plan assigned' });
      setShowAdd(false); setForm({ member_name: '', plan_name: '', calories_target: '', protein_g: '', start_date: '', end_date: '', trainer_name: '', status: 'active' });
      load();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const del = async (id) => {
    if (!confirm('Remove assignment?')) return;
    await base44.entities.AssignedDietPlan.delete(id);
    toast({ title: 'Removed' }); load();
  };

  const active = assigned.filter(a => a.status === 'active');
  const avgCompliance = assigned.length > 0 ? Math.round(assigned.reduce((s, a) => s + (a.compliance_percent || 0), 0) / assigned.length) : 0;

  const columns = [
    { key: 'member_name', label: 'Member' },
    { key: 'plan_name', label: 'Plan' },
    { key: 'calories_target', label: 'Calories', render: v => v ? `${v} kcal` : '—' },
    { key: 'protein_g', label: 'Protein', render: v => v ? `${v}g` : '—' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'compliance_percent', label: 'Compliance', render: v => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${v || 0}%`, background: '#22C55E' }} />
        </div>
        <span className="text-xs">{v || 0}%</span>
      </div>
    )},
    { key: 'start_date', label: 'Start' },
    { key: 'actions', label: '', render: (_, row) => (
      <button onClick={e => { e.stopPropagation(); del(row.id); }} className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
    )}
  ];

  if (loading) return <div className="space-y-6"><PageHeader title="Assigned Diet Plans" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Assigned Diet Plans" description="Track member nutrition assignments" actionLabel="Assign Diet Plan" actionIcon={Plus} onAction={() => setShowAdd(true)} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Assigned" value={assigned.length} icon={Salad} />
        <StatCard title="Active" value={active.length} icon={Users} />
        <StatCard title="Avg Compliance" value={`${avgCompliance}%`} icon={TrendingUp} />
        <StatCard title="Completed" value={assigned.filter(a => a.status === 'completed').length} icon={CheckCircle} />
      </div>

      <DataTable columns={columns} data={assigned} emptyTitle="No diet plans assigned" emptyDescription="Assign diet plans to members" emptyIcon={Salad} />

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">Assign Diet Plan</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Member Name *</Label><Input value={form.member_name} onChange={e => setForm({...form, member_name: e.target.value})} className="bg-secondary border-border" /></div>
            <div>
              <Label className="text-sm text-muted-foreground">Diet Plan</Label>
              <Select value={form.plan_name} onValueChange={v => setForm({...form, plan_name: v})}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {dietPlans.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                  <SelectItem value="custom">Custom Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Calories Target</Label><Input type="number" value={form.calories_target} onChange={e => setForm({...form, calories_target: e.target.value})} className="bg-secondary border-border" placeholder="kcal" /></div>
              <div><Label className="text-sm text-muted-foreground">Protein (g)</Label><Input type="number" value={form.protein_g} onChange={e => setForm({...form, protein_g: e.target.value})} className="bg-secondary border-border" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="bg-secondary border-border" /></div>
            </div>
            <Button onClick={save} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>Assign Diet Plan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}