import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import SkeletonCard from '@/components/ui/SkeletonCard';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ class_name: '', trainer_name: '', day_of_week: 'monday', start_time: '', end_time: '', capacity: '' });
  const { toast } = useToast();

  useEffect(() => { loadClasses(); }, []);

  const loadClasses = async () => {
    try { setClasses(await base44.entities.ClassSchedule.list()); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      await base44.entities.ClassSchedule.create({ ...form, capacity: Number(form.capacity) || 0 });
      toast({ title: 'Class added' });
      setShowAdd(false); setForm({ class_name: '', trainer_name: '', day_of_week: 'monday', start_time: '', end_time: '', capacity: '' });
      loadClasses();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this class?')) return;
    await base44.entities.ClassSchedule.delete(id);
    toast({ title: 'Class removed' });
    loadClasses();
  };

  if (loading) return <div className="space-y-6"><PageHeader title="Class Schedule" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Class Schedule" description="Manage group classes and sessions" actionLabel="Add Class" actionIcon={Plus} onAction={() => setShowAdd(true)} />

      {classes.length === 0 ? (
        <EmptyState icon={Calendar} title="No classes scheduled" description="Create your first class" actionLabel="Add Class" onAction={() => setShowAdd(true)} />
      ) : (
        <div className="space-y-6">
          {DAYS.map(day => {
            const dayClasses = classes.filter(c => c.day_of_week === day);
            if (dayClasses.length === 0) return null;
            return (
              <div key={day}>
                <h3 className="text-sm font-display font-semibold capitalize mb-3" style={{ color: '#D4FF00' }}>{day}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dayClasses.map(c => (
                    <div key={c.id} className="glass-card glass-card-hover rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{c.class_name}</h4>
                          <p className="text-xs text-muted-foreground">{c.start_time} - {c.end_time}</p>
                          {c.trainer_name && <p className="text-xs mt-1" style={{ color: '#D4FF00' }}>🏋️ {c.trainer_name}</p>}
                        </div>
                        <Button size="sm" variant="ghost" className="text-red-400" onClick={() => handleDelete(c.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 text-xs text-muted-foreground" style={{ borderTop: '1px solid #1a1a1a' }}>
                        <span>{c.booked_count || 0}/{c.capacity || '∞'} booked</span>
                        <StatusBadge status={c.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">Add Class</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Class Name *</Label><Input value={form.class_name} onChange={(e) => setForm({...form, class_name: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Trainer</Label><Input value={form.trainer_name} onChange={(e) => setForm({...form, trainer_name: e.target.value})} className="bg-secondary border-border" /></div>
            <div>
              <Label className="text-sm text-muted-foreground">Day</Label>
              <Select value={form.day_of_week} onValueChange={(v) => setForm({...form, day_of_week: v})}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {DAYS.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Start Time</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({...form, start_time: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">End Time</Label><Input type="time" value={form.end_time} onChange={(e) => setForm({...form, end_time: e.target.value})} className="bg-secondary border-border" /></div>
            </div>
            <div><Label className="text-sm text-muted-foreground">Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({...form, capacity: e.target.value})} className="bg-secondary border-border" /></div>
            <Button onClick={handleSave} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>Add Class</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}