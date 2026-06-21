import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BookOpen, Plus, Search, Edit, Trash2, Filter } from 'lucide-react';
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
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const MUSCLE_GROUPS = ['chest','back','shoulders','arms','legs','core','cardio','full_body'];
const DIFFICULTIES = ['beginner','intermediate','advanced'];
const DIFF_COLORS = { beginner: 'bg-green-500/10 text-green-400', intermediate: 'bg-yellow-500/10 text-yellow-400', advanced: 'bg-red-500/10 text-red-400' };
const MUSCLE_ICONS = { chest: '💪', back: '🏋️', shoulders: '🔝', arms: '💪', legs: '🦵', core: '🎯', cardio: '🏃', full_body: '⚡' };

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editEx, setEditEx] = useState(null);
  const [form, setForm] = useState({ name: '', muscle_group: 'chest', equipment: '', difficulty: 'beginner', instructions: '', default_sets: 3, default_reps: '10-12', calories_per_set: 0 });
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setExercises(await base44.entities.WorkoutExercise.list()); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const save = async () => {
    try {
      const data = { ...form, default_sets: Number(form.default_sets), calories_per_set: Number(form.calories_per_set) };
      if (editEx) { await base44.entities.WorkoutExercise.update(editEx.id, data); toast({ title: 'Exercise updated' }); }
      else { await base44.entities.WorkoutExercise.create(data); toast({ title: 'Exercise added' }); }
      setShowAdd(false); setEditEx(null); reset(); load();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const del = async (id) => {
    if (!confirm('Delete exercise?')) return;
    await base44.entities.WorkoutExercise.delete(id);
    toast({ title: 'Deleted' }); load();
  };

  const reset = () => setForm({ name: '', muscle_group: 'chest', equipment: '', difficulty: 'beginner', instructions: '', default_sets: 3, default_reps: '10-12', calories_per_set: 0 });

  const open = (ex) => { setEditEx(ex); setForm({ name: ex.name, muscle_group: ex.muscle_group || 'chest', equipment: ex.equipment || '', difficulty: ex.difficulty || 'beginner', instructions: ex.instructions || '', default_sets: ex.default_sets || 3, default_reps: ex.default_reps || '10-12', calories_per_set: ex.calories_per_set || 0 }); setShowAdd(true); };

  const filtered = exercises.filter(e => {
    const m = muscleFilter === 'all' || e.muscle_group === muscleFilter;
    const d = diffFilter === 'all' || e.difficulty === diffFilter;
    const s = e.name?.toLowerCase().includes(search.toLowerCase());
    return m && d && s;
  });

  if (loading) return <div className="space-y-6"><PageHeader title="Exercise Library" /><SkeletonCard count={8} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Exercise Library" description={`${exercises.length} exercises`} actionLabel="Add Exercise" actionIcon={Plus} onAction={() => { setEditEx(null); reset(); setShowAdd(true); }} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises..." className="pl-10 bg-secondary border-border" />
        </div>
        <Select value={muscleFilter} onValueChange={setMuscleFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-secondary border-border"><SelectValue placeholder="Muscle" /></SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Muscles</SelectItem>
            {MUSCLE_GROUPS.map(m => <SelectItem key={m} value={m} className="capitalize">{m.replace('_',' ')}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={diffFilter} onValueChange={setDiffFilter}>
          <SelectTrigger className="w-full sm:w-40 bg-secondary border-border"><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Levels</SelectItem>
            {DIFFICULTIES.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No exercises yet" description="Build your exercise library" actionLabel="Add Exercise" onAction={() => setShowAdd(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((ex, i) => (
            <motion.div key={ex.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass-card glass-card-hover rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{MUSCLE_ICONS[ex.muscle_group] || '💪'}</span>
                  <div>
                    <h3 className="font-semibold text-sm leading-tight">{ex.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{ex.muscle_group?.replace('_',' ')}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => open(ex)} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => del(ex.id)} className="p-1.5 rounded hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${DIFF_COLORS[ex.difficulty]}`}>{ex.difficulty}</span>
                {ex.equipment && <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{ex.equipment}</span>}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-center">
                <div><p className="text-xs font-bold">{ex.default_sets || '—'}</p><p className="text-[10px] text-muted-foreground">Sets</p></div>
                <div><p className="text-xs font-bold">{ex.default_reps || '—'}</p><p className="text-[10px] text-muted-foreground">Reps</p></div>
                <div><p className="text-xs font-bold">{ex.calories_per_set || '—'}</p><p className="text-[10px] text-muted-foreground">Cal/set</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={v => { setShowAdd(v); if (!v) { setEditEx(null); reset(); } }}>
        <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editEx ? 'Edit Exercise' : 'Add Exercise'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-muted-foreground">Muscle Group</Label>
                <Select value={form.muscle_group} onValueChange={v => setForm({...form, muscle_group: v})}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">{MUSCLE_GROUPS.map(m => <SelectItem key={m} value={m} className="capitalize">{m.replace('_',' ')}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Difficulty</Label>
                <Select value={form.difficulty} onValueChange={v => setForm({...form, difficulty: v})}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">{DIFFICULTIES.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-sm text-muted-foreground">Equipment</Label><Input value={form.equipment} onChange={e => setForm({...form, equipment: e.target.value})} className="bg-secondary border-border" placeholder="e.g. Barbell, Dumbbell, Bodyweight" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-sm text-muted-foreground">Sets</Label><Input type="number" value={form.default_sets} onChange={e => setForm({...form, default_sets: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">Reps</Label><Input value={form.default_reps} onChange={e => setForm({...form, default_reps: e.target.value})} className="bg-secondary border-border" placeholder="10-12" /></div>
              <div><Label className="text-sm text-muted-foreground">Cal/set</Label><Input type="number" value={form.calories_per_set} onChange={e => setForm({...form, calories_per_set: e.target.value})} className="bg-secondary border-border" /></div>
            </div>
            <div><Label className="text-sm text-muted-foreground">Instructions</Label><Textarea value={form.instructions} onChange={e => setForm({...form, instructions: e.target.value})} className="bg-secondary border-border" rows={3} /></div>
            <Button onClick={save} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>{editEx ? 'Update' : 'Add Exercise'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}