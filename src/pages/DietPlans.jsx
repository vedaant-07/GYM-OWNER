import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Salad, Plus, Edit, Trash2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SkeletonCard from '@/components/ui/SkeletonCard';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const GOALS = ['fat_loss','muscle_gain','maintenance','weight_gain','general_health'];
const GOAL_COLORS = { fat_loss: '#EF4444', muscle_gain: '#D4FF00', maintenance: '#22C55E', weight_gain: '#3B82F6', general_health: '#A855F7' };
const GOAL_ICONS = { fat_loss: '🔥', muscle_gain: '💪', maintenance: '⚖️', weight_gain: '📈', general_health: '🥗' };

export default function DietPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState({ name: '', goal: 'general_health', calories_target: '', protein_g: '', carbs_g: '', fat_g: '', notes: '', trainer_name: '', is_template: false });
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setPlans(await base44.entities.DietPlan.list()); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const save = async () => {
    try {
      const data = { ...form, calories_target: Number(form.calories_target) || 0, protein_g: Number(form.protein_g) || 0, carbs_g: Number(form.carbs_g) || 0, fat_g: Number(form.fat_g) || 0 };
      if (editPlan) { await base44.entities.DietPlan.update(editPlan.id, data); toast({ title: 'Diet plan updated' }); }
      else { await base44.entities.DietPlan.create(data); toast({ title: 'Diet plan created' }); }
      setShowAdd(false); setEditPlan(null); load();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const del = async (id) => {
    if (!confirm('Delete this diet plan?')) return;
    await base44.entities.DietPlan.delete(id);
    toast({ title: 'Deleted' }); load();
  };

  const templates = plans.filter(p => p.is_template);
  const allPlans = plans.filter(p => !p.is_template);

  const PlanCard = ({ plan }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card glass-card-hover rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{GOAL_ICONS[plan.goal] || '🥗'}</span>
          <div>
            <h3 className="font-display font-semibold text-sm">{plan.name}</h3>
            <p className="text-xs text-muted-foreground capitalize">{plan.goal?.replace(/_/g,' ')}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => { setEditPlan(plan); setForm({ name: plan.name, goal: plan.goal || 'general_health', calories_target: plan.calories_target || '', protein_g: plan.protein_g || '', carbs_g: plan.carbs_g || '', fat_g: plan.fat_g || '', notes: plan.notes || '', trainer_name: plan.trainer_name || '', is_template: plan.is_template || false }); setShowAdd(true); }} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"><Edit className="w-3.5 h-3.5" /></button>
          <button onClick={() => del(plan.id)} className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center pt-3 border-t border-border">
        <div>
          <p className="text-sm font-bold" style={{ color: GOAL_COLORS[plan.goal] }}>{plan.calories_target || '—'}</p>
          <p className="text-[10px] text-muted-foreground">kcal</p>
        </div>
        <div>
          <p className="text-sm font-bold text-blue-400">{plan.protein_g || '—'}g</p>
          <p className="text-[10px] text-muted-foreground">Protein</p>
        </div>
        <div>
          <p className="text-sm font-bold text-yellow-400">{plan.carbs_g || '—'}g</p>
          <p className="text-[10px] text-muted-foreground">Carbs</p>
        </div>
        <div>
          <p className="text-sm font-bold text-red-400">{plan.fat_g || '—'}g</p>
          <p className="text-[10px] text-muted-foreground">Fat</p>
        </div>
      </div>

      {plan.notes && <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{plan.notes}</p>}
    </motion.div>
  );

  if (loading) return <div className="space-y-6"><PageHeader title="Diet Plans" /><SkeletonCard count={6} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Diet Plan Builder" description="Create and manage nutrition plans" actionLabel="Create Diet Plan" actionIcon={Plus} onAction={() => { setEditPlan(null); setForm({ name: '', goal: 'general_health', calories_target: '', protein_g: '', carbs_g: '', fat_g: '', notes: '', trainer_name: '', is_template: false }); setShowAdd(true); }} />

      <Tabs defaultValue="plans">
        <TabsList className="bg-secondary border-border">
          <TabsTrigger value="plans">All Plans ({allPlans.length})</TabsTrigger>
          <TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="plans" className="mt-4">
          {allPlans.length === 0 ? <EmptyState icon={Salad} title="No diet plans" description="Create your first nutrition plan" actionLabel="Create Plan" onAction={() => setShowAdd(true)} /> :
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{allPlans.map(p => <PlanCard key={p.id} plan={p} />)}</div>}
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
          {templates.length === 0 ? <EmptyState icon={Salad} title="No templates yet" /> :
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{templates.map(p => <PlanCard key={p.id} plan={p} />)}</div>}
        </TabsContent>
      </Tabs>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editPlan ? 'Edit Diet Plan' : 'Create Diet Plan'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Plan Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-secondary border-border" /></div>
            <div>
              <Label className="text-sm text-muted-foreground">Goal</Label>
              <Select value={form.goal} onValueChange={v => setForm({...form, goal: v})}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">{GOALS.map(g => <SelectItem key={g} value={g}>{GOAL_ICONS[g]} {g.replace(/_/g,' ')}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm text-muted-foreground">Daily Calories Target</Label><Input type="number" value={form.calories_target} onChange={e => setForm({...form, calories_target: e.target.value})} className="bg-secondary border-border" placeholder="e.g. 2000" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-sm text-muted-foreground">Protein (g)</Label><Input type="number" value={form.protein_g} onChange={e => setForm({...form, protein_g: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">Carbs (g)</Label><Input type="number" value={form.carbs_g} onChange={e => setForm({...form, carbs_g: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">Fat (g)</Label><Input type="number" value={form.fat_g} onChange={e => setForm({...form, fat_g: e.target.value})} className="bg-secondary border-border" /></div>
            </div>
            <div><Label className="text-sm text-muted-foreground">Trainer / Nutritionist</Label><Input value={form.trainer_name} onChange={e => setForm({...form, trainer_name: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Notes / Meal Guide</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="bg-secondary border-border" rows={3} placeholder="Breakfast: Oats + Egg whites..." /></div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
              <input type="checkbox" id="diet_template" checked={form.is_template} onChange={e => setForm({...form, is_template: e.target.checked})} className="w-4 h-4 accent-primary" />
              <Label htmlFor="diet_template" className="text-sm cursor-pointer">Save as reusable template</Label>
            </div>
            <Button onClick={save} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>{editPlan ? 'Update Plan' : 'Create Diet Plan'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}