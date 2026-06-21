import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dumbbell, Plus, Edit, Trash2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import SkeletonCard from '@/components/ui/SkeletonCard';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Staff() {
  const [trainers, setTrainers] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState('trainer');
  const [trainerForm, setTrainerForm] = useState({ name: '', phone: '', email: '', specialization: '', experience_years: '', schedule: '', status: 'active' });
  const [staffForm, setStaffForm] = useState({ name: '', phone: '', email: '', role: 'other', status: 'active' });
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [t, s] = await Promise.all([base44.entities.Trainer.list(), base44.entities.StaffMember.list()]);
      setTrainers(t); setStaff(s);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSaveTrainer = async () => {
    try {
      await base44.entities.Trainer.create({ ...trainerForm, experience_years: Number(trainerForm.experience_years) || 0 });
      toast({ title: 'Trainer added' });
      setShowAdd(false); setTrainerForm({ name: '', phone: '', email: '', specialization: '', experience_years: '', schedule: '', status: 'active' });
      loadData();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const handleSaveStaff = async () => {
    try {
      await base44.entities.StaffMember.create(staffForm);
      toast({ title: 'Staff member added' });
      setShowAdd(false); setStaffForm({ name: '', phone: '', email: '', role: 'other', status: 'active' });
      loadData();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Delete this person?')) return;
    if (type === 'trainer') await base44.entities.Trainer.delete(id);
    else await base44.entities.StaffMember.delete(id);
    toast({ title: 'Removed' });
    loadData();
  };

  if (loading) return <div className="space-y-6"><PageHeader title="Trainers & Staff" /><SkeletonCard count={4} /></div>;

  const PersonCard = ({ person, type }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card glass-card-hover rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'rgba(212,255,0,0.1)', color: '#D4FF00' }}>
            {person.name?.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold">{person.name}</h3>
            <p className="text-xs text-muted-foreground">{person.phone}</p>
            {type === 'trainer' && person.specialization && <p className="text-xs mt-0.5" style={{ color: '#D4FF00' }}>{person.specialization}</p>}
            {type === 'staff' && <p className="text-xs capitalize mt-0.5 text-muted-foreground">{person.role?.replace('_', ' ')}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={person.status} />
          <Button size="sm" variant="ghost" className="text-red-400" onClick={() => handleDelete(type, person.id)}><Trash2 className="w-3 h-3" /></Button>
        </div>
      </div>
      {type === 'trainer' && (
        <div className="mt-3 pt-3 flex gap-4 text-xs text-muted-foreground" style={{ borderTop: '1px solid #1a1a1a' }}>
          <span>{person.experience_years || 0} yrs exp</span>
          <span>{person.assigned_members_count || 0} members</span>
          <span className="text-muted-foreground italic">Salary placeholder</span>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Trainers & Staff" description="Manage your team" />

      <Tabs defaultValue="trainers">
        <TabsList className="bg-secondary border-border">
          <TabsTrigger value="trainers">Trainers ({trainers.length})</TabsTrigger>
          <TabsTrigger value="staff">Staff ({staff.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="trainers" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setAddType('trainer'); setShowAdd(true); }} className="font-semibold" style={{ background: '#D4FF00', color: '#000' }}><Plus className="w-4 h-4 mr-2" /> Add Trainer</Button>
          </div>
          {trainers.length === 0 ? <EmptyState icon={Dumbbell} title="No trainers yet" /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{trainers.map(t => <PersonCard key={t.id} person={t} type="trainer" />)}</div>
          )}
        </TabsContent>

        <TabsContent value="staff" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setAddType('staff'); setShowAdd(true); }} className="font-semibold" style={{ background: '#D4FF00', color: '#000' }}><Plus className="w-4 h-4 mr-2" /> Add Staff</Button>
          </div>
          {staff.length === 0 ? <EmptyState icon={Users} title="No staff yet" /> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{staff.map(s => <PersonCard key={s.id} person={s} type="staff" />)}</div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">{addType === 'trainer' ? 'Add Trainer' : 'Add Staff'}</DialogTitle></DialogHeader>
          {addType === 'trainer' ? (
            <div className="space-y-4">
              <div><Label className="text-sm text-muted-foreground">Name *</Label><Input value={trainerForm.name} onChange={(e) => setTrainerForm({...trainerForm, name: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">Phone *</Label><Input value={trainerForm.phone} onChange={(e) => setTrainerForm({...trainerForm, phone: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">Email</Label><Input value={trainerForm.email} onChange={(e) => setTrainerForm({...trainerForm, email: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">Specialization</Label><Input value={trainerForm.specialization} onChange={(e) => setTrainerForm({...trainerForm, specialization: e.target.value})} className="bg-secondary border-border" placeholder="e.g. Strength, Cardio, Yoga" /></div>
              <div><Label className="text-sm text-muted-foreground">Experience (years)</Label><Input type="number" value={trainerForm.experience_years} onChange={(e) => setTrainerForm({...trainerForm, experience_years: e.target.value})} className="bg-secondary border-border" /></div>
              <Button onClick={handleSaveTrainer} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>Add Trainer</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div><Label className="text-sm text-muted-foreground">Name *</Label><Input value={staffForm.name} onChange={(e) => setStaffForm({...staffForm, name: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">Phone</Label><Input value={staffForm.phone} onChange={(e) => setStaffForm({...staffForm, phone: e.target.value})} className="bg-secondary border-border" /></div>
              <div>
                <Label className="text-sm text-muted-foreground">Role</Label>
                <Select value={staffForm.role} onValueChange={(v) => setStaffForm({...staffForm, role: v})}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="receptionist">Receptionist</SelectItem><SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="cleaner">Cleaner</SelectItem><SelectItem value="trainer">Trainer</SelectItem><SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveStaff} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>Add Staff</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}