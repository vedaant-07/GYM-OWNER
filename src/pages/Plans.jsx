import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Crown, Plus, Edit, Trash2 } from 'lucide-react';
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
import { motion } from 'framer-motion';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [form, setForm] = useState({ name: '', duration_months: '', price: '', features: '', discount_percent: 0, renewal_rules: '', status: 'active' });
  const { toast } = useToast();

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    try { setPlans(await base44.entities.MembershipPlan.list()); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      const data = { ...form, duration_months: Number(form.duration_months), price: Number(form.price), discount_percent: Number(form.discount_percent), features: form.features.split(',').map(f => f.trim()).filter(Boolean) };
      if (editPlan) {
        await base44.entities.MembershipPlan.update(editPlan.id, data);
        toast({ title: 'Plan updated' });
      } else {
        await base44.entities.MembershipPlan.create(data);
        toast({ title: 'Plan created' });
      }
      setShowAdd(false); setEditPlan(null);
      setForm({ name: '', duration_months: '', price: '', features: '', discount_percent: 0, renewal_rules: '', status: 'active' });
      loadPlans();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this plan?')) return;
    await base44.entities.MembershipPlan.delete(id);
    toast({ title: 'Plan deleted' });
    loadPlans();
  };

  const openEdit = (plan) => {
    setEditPlan(plan);
    setForm({ name: plan.name, duration_months: plan.duration_months, price: plan.price, features: (plan.features || []).join(', '), discount_percent: plan.discount_percent || 0, renewal_rules: plan.renewal_rules || '', status: plan.status || 'active' });
    setShowAdd(true);
  };

  if (loading) return <div className="space-y-6"><PageHeader title="Membership Plans" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Membership Plans" description="Create and manage membership plans" actionLabel="Create Plan" actionIcon={Plus} onAction={() => { setEditPlan(null); setForm({ name: '', duration_months: '', price: '', features: '', discount_percent: 0, renewal_rules: '', status: 'active' }); setShowAdd(true); }} />

      {plans.length === 0 ? (
        <EmptyState icon={Crown} title="No plans yet" description="Create your first membership plan" actionLabel="Create Plan" onAction={() => setShowAdd(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card glass-card-hover rounded-xl p-5 relative">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-bold text-lg">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">{plan.duration_months} month{plan.duration_months > 1 ? 's' : ''}</p>
                </div>
                <StatusBadge status={plan.status} />
              </div>
              <p className="text-3xl font-display font-bold mb-3" style={{ color: '#D4FF00' }}>₹{plan.price?.toLocaleString()}</p>
              {plan.discount_percent > 0 && <p className="text-xs text-green-400 mb-3">{plan.discount_percent}% discount</p>}
              {plan.features?.length > 0 && (
                <ul className="space-y-1 mb-4">
                  {plan.features.map((f, i) => <li key={i} className="text-xs text-muted-foreground flex items-center gap-2"><span style={{ color: '#D4FF00' }}>✓</span> {f}</li>)}
                </ul>
              )}
              <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid #1a1a1a' }}>
                <Button size="sm" variant="ghost" className="text-xs flex-1" onClick={() => openEdit(plan)}><Edit className="w-3 h-3 mr-1" /> Edit</Button>
                <Button size="sm" variant="ghost" className="text-xs text-red-400" onClick={() => handleDelete(plan.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">{editPlan ? 'Edit Plan' : 'Create Plan'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Plan Name *</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Duration (months) *</Label><Input type="number" value={form.duration_months} onChange={(e) => setForm({...form, duration_months: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">Price (₹) *</Label><Input type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="bg-secondary border-border" /></div>
            </div>
            <div><Label className="text-sm text-muted-foreground">Features (comma separated)</Label><Textarea value={form.features} onChange={(e) => setForm({...form, features: e.target.value})} className="bg-secondary border-border" placeholder="AC, Cardio, Personal Training..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Discount %</Label><Input type="number" value={form.discount_percent} onChange={(e) => setForm({...form, discount_percent: e.target.value})} className="bg-secondary border-border" /></div>
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-sm text-muted-foreground">Renewal Rules</Label><Textarea value={form.renewal_rules} onChange={(e) => setForm({...form, renewal_rules: e.target.value})} className="bg-secondary border-border" /></div>
            <Button onClick={handleSave} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>{editPlan ? 'Update Plan' : 'Create Plan'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}