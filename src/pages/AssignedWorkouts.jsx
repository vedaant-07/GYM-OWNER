import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ClipboardCheck, Plus, Edit, Trash2 } from 'lucide-react';
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
import { Users, TrendingUp, CheckCircle, Pause } from 'lucide-react';

export default function AssignedWorkouts() {
  const [assigned, setAssigned] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ member_name: '', plan_name: '', trainer_name: '', start_date: '', end_date: '', status: 'active', notes: '' });
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [a, p] = await Promise.all([
        base44.entities.AssignedWorkoutPlan.list('-created_date', 50),
        base44.entities.WorkoutPlan.list()
      ]);
      setAssigned(a); setPlans(p);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const save = async () => {
    try {
      await base44.entities.AssignedWorkoutPlan.create(form);
      toast({ title: 'Workout plan assigned' });
      setShowAdd(false); setForm({ member_name: '', plan_name: '', trainer_name: '', start_date: '', end_date: '', status: 'active', notes: '' });
      load();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const del = async (id) => {
    if (!confirm('Remove this assignment?')) return;
    await base44.entities.AssignedWorkoutPlan.delete(id);
    toast({ title: 'Removed' }); load();
  };

  const active = assigned.filter(a => a.status === 'active');
  const completed = assigned.filter(a => a.status === 'completed');

  const columns = [
    { key: 'member_name', label: 'Member' },
    { key: 'plan_name', label: 'Plan' },
    { key: 'trainer_name', label: 'Trainer', render: v => v || '—' },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'completion_percent', label: 'Progress', render: v => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${v || 0}%`, background: '#D4FF00' }} />
        </div>
        <span className="text-xs">{v || 0}%</span>
      </div>
    )},
    { key: 'start_date', label: 'Start' },
    { key: 'end_date', label: 'End' },
    { key: 'actions', label: '', render: (_, row) => (
      <button onClick={e => { e.stopPropagation(); del(row.id); }} className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
    )}
  ];

  if (loading) return <div className="space-y-6"><PageHeader title="Assigned Workout Plans" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Assigned Workout Plans" description="Manage member workout assignments" actionLabel="Assign Plan" actionIcon={Plus} onAction={() => setShowAdd(true)} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Assigned" value={assigned.length} icon={ClipboardCheck} />
        <StatCard title="Active" value={active.length} icon={Users} />
        <StatCard title="Completed" value={completed.length} icon={CheckCircle} />
        <StatCard title="Avg Progress" value={`${assigned.length > 0 ? Math.round(assigned.reduce((s, a) => s + (a.completion_percent || 0), 0) / assigned.length) : 0}%`} icon={TrendingUp} />
      </div>

      <DataTable columns={columns} data={assigned} emptyTitle="No assigned plans" emptyDescription="Assign workout plans to members" emptyIcon={ClipboardCheck} />

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">Assign Workout Plan</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Member Name *</Label><Input value={form.member_name} onChange={e => setForm({...form, member_name: e.target.value})} className="bg-secondary border-border" /></div>
            <div>
              <Label className="text-sm text-muted-foreground">Workout Plan *</Label>
              <Select value={form.plan_name} onValueChange={v => setForm({...form, plan_name: v})}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {plans.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                  <SelectItem value="custom">Custom Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.plan_name === 'custom' && <div><Input value={form.plan_name_custom || ''} onChange={e => setForm({...form, plan_name: e.target.value})} placeholder="Enter plan name" className="bg-secondary border-border" /></div>}
            <div><Label className="text-sm text-muted-foreground">Trainer</Label><Input value={form.trainer_name} onChange={e => setForm({...form, trainer_name: e.target.value})} className="bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Start Date</Label><Input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">End Date</Label><Input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="bg-secondary border-border" /></div>
            </div>
            <Button onClick={save} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>Assign Plan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}