import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Wrench, Plus, Trash2, AlertTriangle } from 'lucide-react';
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
import { motion } from 'framer-motion';
import { CheckCircle, Settings } from 'lucide-react';

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', quantity: 1, status: 'working', notes: '' });
  const { toast } = useToast();

  useEffect(() => { loadEquipment(); }, []);

  const loadEquipment = async () => {
    try { setEquipment(await base44.entities.Equipment.list()); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      await base44.entities.Equipment.create({ ...form, quantity: Number(form.quantity), purchase_date: new Date().toISOString().split('T')[0] });
      toast({ title: 'Equipment added' });
      setShowAdd(false); setForm({ name: '', category: '', quantity: 1, status: 'working', notes: '' });
      loadEquipment();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this equipment?')) return;
    await base44.entities.Equipment.delete(id);
    toast({ title: 'Equipment removed' });
    loadEquipment();
  };

  const working = equipment.filter(e => e.status === 'working');
  const issues = equipment.filter(e => e.status === 'needs_repair' || e.status === 'out_of_order');

  const filtered = equipment.filter(e => {
    const matchSearch = e.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="space-y-6"><PageHeader title="Equipment" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Equipment" description="Track gym equipment and maintenance" actionLabel="Add Equipment" actionIcon={Plus} onAction={() => setShowAdd(true)} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Equipment" value={equipment.length} icon={Wrench} />
        <StatCard title="Working" value={working.length} icon={CheckCircle} />
        <StatCard title="Issues" value={issues.length} icon={AlertTriangle} />
        <StatCard title="Total Items" value={equipment.reduce((s, e) => s + (e.quantity || 1), 0)} icon={Settings} />
      </div>

      <SearchFilterBar searchValue={search} onSearchChange={setSearch} placeholder="Search equipment..."
        filters={[{ key: 'status', value: statusFilter, onChange: setStatusFilter, placeholder: 'Status',
          options: [{ value: 'working', label: 'Working' }, { value: 'needs_repair', label: 'Needs Repair' }, { value: 'out_of_order', label: 'Out of Order' }, { value: 'retired', label: 'Retired' }] }]} />

      {equipment.length === 0 ? (
        <EmptyState icon={Wrench} title="No equipment yet" description="Add your gym equipment" actionLabel="Add Equipment" onAction={() => setShowAdd(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(eq => (
            <motion.div key={eq.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card glass-card-hover rounded-xl p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{eq.name}</h3>
                  {eq.category && <p className="text-xs text-muted-foreground">{eq.category}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={eq.status} />
                  <Button size="sm" variant="ghost" className="text-red-400" onClick={() => handleDelete(eq.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
              <div className="mt-3 pt-2 flex gap-4 text-xs text-muted-foreground" style={{ borderTop: '1px solid #1a1a1a' }}>
                <span>Qty: {eq.quantity || 1}</span>
                {eq.last_maintenance && <span>Last: {eq.last_maintenance}</span>}
                {eq.next_maintenance && <span>Next: {eq.next_maintenance}</span>}
              </div>
              {eq.notes && <p className="text-xs text-muted-foreground mt-2">{eq.notes}</p>}
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">Add Equipment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Name *</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Category</Label><Input value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="bg-secondary border-border" placeholder="e.g. Cardio, Weights, Machines" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} className="bg-secondary border-border" /></div>
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="working">Working</SelectItem><SelectItem value="needs_repair">Needs Repair</SelectItem>
                    <SelectItem value="out_of_order">Out of Order</SelectItem><SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-sm text-muted-foreground">Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="bg-secondary border-border" /></div>
            <Button onClick={handleSave} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>Add Equipment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}