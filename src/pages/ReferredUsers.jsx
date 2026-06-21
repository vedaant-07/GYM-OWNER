import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Zap, Plus, Eye, MessageSquare, Phone, Send, UserCheck, Download } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { TrendingUp, DollarSign, Clock, AlertCircle } from 'lucide-react';

export default function ReferredUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({ user_name: '', phone: '', email: '', referral_source: '', referred_by: '', subscription_plan: '', conversion_status: 'pending', follow_up_status: 'none', notes: '', city: '' });
  const { toast } = useToast();

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const data = await base44.entities.SE7ENFITReferredUser.list();
      setUsers(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      if (showDetail) {
        await base44.entities.SE7ENFITReferredUser.update(showDetail.id, form);
        toast({ title: 'Referred user updated' });
      } else {
        await base44.entities.SE7ENFITReferredUser.create({ ...form, joined_date: new Date().toISOString().split('T')[0], gym_linked_date: new Date().toISOString().split('T')[0] });
        toast({ title: 'Referred user added' });
      }
      setShowAdd(false);
      setShowDetail(null);
      resetForm();
      loadUsers();
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const resetForm = () => setForm({ user_name: '', phone: '', email: '', referral_source: '', referred_by: '', subscription_plan: '', conversion_status: 'pending', follow_up_status: 'none', notes: '', city: '' });

  const markConverted = async (user) => {
    await base44.entities.SE7ENFITReferredUser.update(user.id, { conversion_status: 'converted', membership_status: 'active' });
    toast({ title: 'Marked as converted!' });
    loadUsers();
  };

  const converted = users.filter(u => u.conversion_status === 'converted');
  const pending = users.filter(u => u.conversion_status === 'pending');
  const totalRevenue = users.reduce((s, u) => s + (u.lifetime_value || 0), 0);
  const followUpsDue = users.filter(u => u.follow_up_status === 'scheduled' || u.follow_up_status === 'overdue');

  const filtered = users.filter(u => {
    const matchSearch = u.user_name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search);
    const matchStatus = statusFilter === 'all' || u.conversion_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    { key: 'user_name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'referral_source', label: 'Source' },
    { key: 'referred_by', label: 'Referred By' },
    { key: 'conversion_status', label: 'Conversion', render: (val) => <StatusBadge status={val} /> },
    { key: 'membership_status', label: 'Membership', render: (val) => <StatusBadge status={val || 'none'} /> },
    { key: 'payment_status', label: 'Payment', render: (val) => <StatusBadge status={val || 'none'} /> },
    { key: 'follow_up_status', label: 'Follow-up', render: (val) => <StatusBadge status={val || 'none'} /> },
    { key: 'actions', label: '', render: (_, row) => (
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" className="text-xs" onClick={(e) => { e.stopPropagation(); setShowDetail(row); setForm({ user_name: row.user_name, phone: row.phone, email: row.email || '', referral_source: row.referral_source || '', referred_by: row.referred_by || '', subscription_plan: row.subscription_plan || '', conversion_status: row.conversion_status || 'pending', follow_up_status: row.follow_up_status || 'none', notes: row.notes || '', city: row.city || '' }); }}>
          <Eye className="w-3 h-3" />
        </Button>
        {row.conversion_status !== 'converted' && (
          <Button size="sm" variant="ghost" className="text-xs text-green-400" onClick={(e) => { e.stopPropagation(); markConverted(row); }}>
            <UserCheck className="w-3 h-3" />
          </Button>
        )}
      </div>
    )}
  ];

  if (loading) return <div className="space-y-6"><PageHeader title="SE7EN FIT Referred Users" /><SkeletonCard count={8} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="SE7EN FIT Referred Users" description="Users who came through the SE7EN FIT app" actionLabel="Add Referred User" actionIcon={Plus} onAction={() => { setShowDetail(null); resetForm(); setShowAdd(true); }} />

      {/* Analytics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Referred" value={users.length} icon={Zap} />
        <StatCard title="Converted" value={converted.length} icon={UserCheck} subtitle={users.length > 0 ? `${Math.round((converted.length / users.length) * 100)}% conversion` : '0%'} />
        <StatCard title="Revenue from Referrals" value={`₹${totalRevenue.toLocaleString()}`} icon={DollarSign} />
        <StatCard title="Pending Follow-ups" value={followUpsDue.length} icon={Clock} />
      </div>

      <SearchFilterBar
        searchValue={search} onSearchChange={setSearch} placeholder="Search referred users..."
        filters={[{
          key: 'conversion', value: statusFilter, onChange: setStatusFilter, placeholder: 'Conversion',
          options: [{ value: 'pending', label: 'Pending' }, { value: 'converted', label: 'Converted' }, { value: 'lost', label: 'Lost' }]
        }]}
      />

      <DataTable columns={columns} data={filtered} emptyTitle="No referred users yet" emptyDescription="SE7EN FIT referred users will appear here" emptyIcon={Zap} />

      {/* Add / Detail Dialog */}
      <Dialog open={showAdd || !!showDetail} onOpenChange={() => { setShowAdd(false); setShowDetail(null); }}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{showDetail ? 'Referred User Details' : 'Add Referred User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Name *</Label><Input value={form.user_name} onChange={(e) => setForm({...form, user_name: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">Phone *</Label><Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="bg-secondary border-border" /></div>
            </div>
            <div><Label className="text-sm text-muted-foreground">Email</Label><Input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Referral Source</Label><Input value={form.referral_source} onChange={(e) => setForm({...form, referral_source: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">Referred By</Label><Input value={form.referred_by} onChange={(e) => setForm({...form, referred_by: e.target.value})} className="bg-secondary border-border" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-muted-foreground">Conversion Status</Label>
                <Select value={form.conversion_status} onValueChange={(v) => setForm({...form, conversion_status: v})}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="pending">Pending</SelectItem><SelectItem value="converted">Converted</SelectItem><SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Follow-up Status</Label>
                <Select value={form.follow_up_status} onValueChange={(v) => setForm({...form, follow_up_status: v})}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="none">None</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Plan</Label><Input value={form.subscription_plan} onChange={(e) => setForm({...form, subscription_plan: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">City</Label><Input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} className="bg-secondary border-border" /></div>
            </div>
            <div><Label className="text-sm text-muted-foreground">Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="bg-secondary border-border" /></div>

            {showDetail && (
              <div className="glass-card rounded-lg p-3 space-y-2 text-sm">
                <p><span className="text-muted-foreground">Joined:</span> {showDetail.joined_date || '—'}</p>
                <p><span className="text-muted-foreground">Linked:</span> {showDetail.gym_linked_date || '—'}</p>
                <p><span className="text-muted-foreground">Last Attendance:</span> {showDetail.last_attendance || '—'}</p>
                <p><span className="text-muted-foreground">Lifetime Value:</span> ₹{showDetail.lifetime_value || 0}</p>
                <p><span className="text-muted-foreground">Offers Received:</span> {showDetail.offers_received || 0}</p>
              </div>
            )}

            {/* Security note: Gym owner can only manage their own referred users */}
            <Button onClick={handleSave} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>
              {showDetail ? 'Update' : 'Add Referred User'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}