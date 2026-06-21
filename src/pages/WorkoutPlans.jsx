import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dumbbell, Plus, Edit, Trash2, Copy, Users } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SkeletonCard from '@/components/ui/SkeletonCard';
import EmptyState from '@/components/ui/EmptyState';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const GOALS = ['fat_loss','muscle_gain','strength','endurance','general_fitness'];
const LEVELS = ['beginner','intermediate','advanced'];
const GOAL_COLORS = { fat_loss: '#EF4444', muscle_gain: '#D4FF00', strength: '#3B82F6', endurance: '#F97316', general_fitness: '#22C55E' };
const GOAL_ICONS = { fat_loss: '🔥', muscle_gain: '💪', strength: '⚡', endurance: '🏃', general_fitness: '🎯' };

export default function WorkoutPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState({ name: '', goal: 'general_fitness', level: 'beginner', duration_weeks: 4, days_per_week: 5, description: '', trainer_name: '', is_template: false });
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setPlans(await base44.entities.WorkoutPlan.list()); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const save = async () => {
    try {
      const data = { ...form, duration_weeks: Number(form.duration_weeks), days_per_week: Number(form.days_per_week) };
      if (editPlan) { await base44.entities.WorkoutPlan.update(editPlan.id, data); toast({ title: 'Plan updated' }); }
      else { await base44.entities.WorkoutPlan.create(data); toast({ title: 'Plan created' }); }
      setShowAdd(false); setEditPlan(null); load();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const del = async (id) => {
    if (!confirm('Delete this plan?')) return;
    await base44.entities.WorkoutPlan.delete(id);
    toast({ title: 'Plan deleted' }); load();
  };

  const templates = plans.filter(p => p.is_template);
  const allPlans = plans.filter(p => !p.is_template);

  const PlanCard = ({ plan }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card glass-card-hover rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{GOAL_ICONS[plan.goal] || '🏋️'}</span>
          <div>
            <h3 className="font-display font-semibold">{plan.name}</h3>
            <p className="text-xs text-muted-foreground capitalize">{plan.goal?.replace(/_/g,' ')} · {plan.level}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => { setEditPlan(plan); setForm({ name: plan.name, goal: plan.goal || 'general_fitness', level: plan.level || 'beginner', duration_weeks: plan.duration_weeks || 4, days_per_week: plan.days_per_week || 5, description: plan.description || '', trainer_name: plan.trainer_name || '', is_template: plan.is_template || false }); setShowAdd(true); }} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"><Edit className="w-3.5 h-3.5" /></button>
          <button onClick={() => del(plan.id)} className="p-1.5 rounded hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div
        className="h-1 rounded-full mb-3"
        style={{ background: `${GOAL_COLORS[plan.goal]}20` }}
      >
        <div className="h-full rounded-full w-1/2" style={{ background: GOAL_COLORS[plan.goal] }} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-border">
        <div><p className="text-sm font-bold">{plan.duration_weeks || '—'}</p><p className="text-[10px] text-muted-foreground">Weeks</p></div>
        <div><p className="text-sm font-bold">{plan.days_per_week || '—'}</p><p className="text-[10px] text-muted-foreground">Days/wk</p></div>
        <div><p className="text-sm font-bold truncate text-[11px]">{plan.trainer_name || 'Any'}</p><p className="text-[10px] text-muted-foreground">Trainer</p></div>
      </div>
    </motion.div>
  );

  if (loading) return <div className="space-y-6"><PageHeader title="Workout Plans" /><SkeletonCard count={6} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Workout Plan Builder" description="Create and manage workout plans" actionLabel="Create Plan" actionIcon={Plus} onAction={() => { setEditPlan(null); setForm({ name: '', goal: 'general_fitness', level: 'beginner', duration_weeks: 4, days_per_week: 5, description: '', trainer_name: '', is_template: false }); setShowAdd(true); }} />

      <Tabs defaultValue="plans">
        <TabsList className="bg-secondary border-border">
          <TabsTrigger value="plans">All Plans ({allPlans.length})</TabsTrigger>
          <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="plans" className="mt-4">
          {allPlans.length === 0 ? <EmptyState icon={Dumbbell} title="No workout plans" description="Create your first workout plan" actionLabel="Create Plan" onAction={() => setShowAdd(true)} /> :
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{allPlans.map(p => <PlanCard key={p.id} plan={p} />)}</div>}
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
          {templates.length === 0 ? <EmptyState icon={Copy} title="No templates" description="Save a plan as template to reuse" /> :
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{templates.map(p => <PlanCard key={p.id} plan={p} />)}</div>}
        </TabsContent>
      </Tabs>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editPlan ? 'Edit Plan' : 'Create Workout Plan'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Plan Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-muted-foreground">Goal</Label>
                <Select value={form.goal} onValueChange={v => setForm({...form, goal: v})}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">{GOALS.map(g => <SelectItem key={g} value={g}>{GOAL_ICONS[g]} {g.replace(/_/g,' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Level</Label>
                <Select value={form.level} onValueChange={v => setForm({...form, level: v})}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">{LEVELS.map(l => <SelectItem key={l} value={l} className="capitalize">{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Duration (weeks)</Label><Input type="number" value={form.duration_weeks} onChange={e => setForm({...form, duration_weeks: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">Days per week</Label><Input type="number" value={form.days_per_week} onChange={e => setForm({...form, days_per_week: e.target.value})} className="bg-secondary border-border" /></div>
            </div>
            <div><Label className="text-sm text-muted-foreground">Trainer</Label><Input value={form.trainer_name} onChange={e => setForm({...form, trainer_name: e.target.value})} className="bg-secondary border-border" placeholder="Trainer name" /></div>
            <div><Label className="text-sm text-muted-foreground">Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-secondary border-border" /></div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
              <input type="checkbox" id="is_template" checked={form.is_template} onChange={e => setForm({...form, is_template: e.target.checked})} className="w-4 h-4 accent-primary" />
              <Label htmlFor="is_template" className="text-sm cursor-pointer">Save as reusable template</Label>
            </div>
            <Button onClick={save} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>{editPlan ? 'Update Plan' : 'Create Plan'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}