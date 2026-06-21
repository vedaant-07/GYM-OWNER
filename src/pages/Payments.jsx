import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CreditCard, Plus, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SearchFilterBar from '@/components/ui/SearchFilterBar';
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
import { DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ member_name: '', member_id: '', amount: '', status: 'due', method: 'cash', plan_name: '', notes: '' });
  const { toast } = useToast();

  useEffect(() => { loadPayments(); }, []);

  const loadPayments = async () => {
    try { setPayments(await base44.entities.Payment.list('-created_date', 50)); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      await base44.entities.Payment.create({
        ...form,
        amount: Number(form.amount),
        payment_date: form.status === 'paid' ? new Date().toISOString().split('T')[0] : undefined,
        due_date: new Date().toISOString().split('T')[0]
      });
      toast({ title: 'Payment recorded' });
      setShowAdd(false);
      setForm({ member_name: '', member_id: '', amount: '', status: 'due', method: 'cash', plan_name: '', notes: '' });
      loadPayments();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const paid = payments.filter(p => p.status === 'paid');
  const due = payments.filter(p => p.status === 'due' || p.status === 'overdue');
  const totalRevenue = paid.reduce((s, p) => s + (p.amount || 0), 0);
  const totalDue = due.reduce((s, p) => s + (p.amount || 0), 0);

  const filtered = payments.filter(p => {
    const matchSearch = p.member_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    { key: 'member_name', label: 'Member' },
    { key: 'amount', label: 'Amount', render: (val) => `₹${(val || 0).toLocaleString()}` },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'method', label: 'Method', render: (val) => <span className="capitalize">{val?.replace('_', ' ')}</span> },
    { key: 'plan_name', label: 'Plan' },
    { key: 'payment_date', label: 'Paid On' },
    { key: 'due_date', label: 'Due Date' },
  ];

  if (loading) return <div className="space-y-6"><PageHeader title="Payments & Earnings" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Payments & Earnings" description="Track revenue and manage payments" actionLabel="Record Payment" actionIcon={Plus} onAction={() => setShowAdd(true)} />

      {/* Payment gateway notice */}
      <div className="glass-card rounded-xl p-4 flex items-center gap-3" style={{ borderColor: 'rgba(250,204,21,0.3)' }}>
        <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#FACC15' }} />
        <div>
          <p className="text-sm font-medium" style={{ color: '#FACC15' }}>Payment Gateway Setup Pending</p>
          <p className="text-xs text-muted-foreground">Razorpay integration is not yet configured. Online payment collection will be available once set up.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={DollarSign} />
        <StatCard title="Payments Received" value={paid.length} icon={TrendingUp} />
        <StatCard title="Amount Due" value={`₹${totalDue.toLocaleString()}`} icon={Clock} />
        <StatCard title="Overdue" value={payments.filter(p => p.status === 'overdue').length} icon={AlertCircle} />
      </div>

      <SearchFilterBar searchValue={search} onSearchChange={setSearch} placeholder="Search payments..."
        filters={[{ key: 'status', value: statusFilter, onChange: setStatusFilter, placeholder: 'Status',
          options: [{ value: 'paid', label: 'Paid' }, { value: 'due', label: 'Due' }, { value: 'overdue', label: 'Overdue' }, { value: 'failed', label: 'Failed' }, { value: 'refunded', label: 'Refunded' }] }]} />

      <DataTable columns={columns} data={filtered} emptyTitle="No payments yet" emptyDescription="Record your first payment" emptyIcon={CreditCard} />

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">Record Payment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Member Name *</Label><Input value={form.member_name} onChange={(e) => setForm({...form, member_name: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Amount *</Label><Input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="paid">Paid</SelectItem><SelectItem value="due">Due</SelectItem><SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Method</Label>
                <Select value={form.method} onValueChange={(v) => setForm({...form, method: v})}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="cash">Cash</SelectItem><SelectItem value="upi">UPI</SelectItem><SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem><SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-sm text-muted-foreground">Plan</Label><Input value={form.plan_name} onChange={(e) => setForm({...form, plan_name: e.target.value})} className="bg-secondary border-border" /></div>
            <Button onClick={handleSave} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>Record Payment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}