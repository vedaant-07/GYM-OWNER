import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Plus, Search, Download } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SearchFilterBar from '@/components/ui/SearchFilterBar';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', gender: '', membership_plan: '', status: 'active', source: 'walk_in', notes: '' });
  const { toast } = useToast();

  useEffect(() => { loadMembers(); }, []);

  const loadMembers = async () => {
    try {
      const data = await base44.entities.GymMember.list();
      setMembers(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      if (selectedMember) {
        await base44.entities.GymMember.update(selectedMember.id, form);
        toast({ title: 'Member updated' });
      } else {
        await base44.entities.GymMember.create({ ...form, join_date: new Date().toISOString().split('T')[0] });
        toast({ title: 'Member added' });
      }
      setShowAdd(false);
      setSelectedMember(null);
      setForm({ name: '', phone: '', email: '', gender: '', membership_plan: '', status: 'active', source: 'walk_in', notes: '' });
      loadMembers();
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this member?')) return;
    await base44.entities.GymMember.delete(id);
    toast({ title: 'Member removed' });
    loadMembers();
  };

  const openEdit = (member) => {
    setSelectedMember(member);
    setForm({ name: member.name, phone: member.phone, email: member.email || '', gender: member.gender || '', membership_plan: member.membership_plan || '', status: member.status || 'active', source: member.source || 'walk_in', notes: member.notes || '' });
    setShowAdd(true);
  };

  const filtered = members.filter(m => {
    const matchSearch = m.name?.toLowerCase().includes(search.toLowerCase()) || m.phone?.includes(search) || m.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'membership_plan', label: 'Plan' },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'payment_status', label: 'Payment', render: (val) => <StatusBadge status={val || 'none'} /> },
    { key: 'join_date', label: 'Joined' },
    { key: 'last_visit', label: 'Last Visit' },
    { key: 'actions', label: '', render: (_, row) => (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="text-xs">Edit</Button>
        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} className="text-xs text-red-400">Delete</Button>
      </div>
    )}
  ];

  if (loading) return <div className="space-y-6"><PageHeader title="Members" /><SkeletonCard count={8} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Members" description={`${members.length} total members`} actionLabel="Add Member" actionIcon={Plus} onAction={() => { setSelectedMember(null); setForm({ name: '', phone: '', email: '', gender: '', membership_plan: '', status: 'active', source: 'walk_in', notes: '' }); setShowAdd(true); }} />

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search members..."
        filters={[{
          key: 'status', value: statusFilter, onChange: setStatusFilter, placeholder: 'Status',
          options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'frozen', label: 'Frozen' }, { value: 'expired', label: 'Expired' }]
        }]}
      />

      <DataTable columns={columns} data={filtered} onRowClick={openEdit} emptyTitle="No members yet" emptyDescription="Add your first gym member" emptyIcon={Users} />

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{selectedMember ? 'Edit Member' : 'Add Member'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Name *</Label><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Phone *</Label><Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Email</Label><Input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-muted-foreground">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({...form, status: v})}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="frozen">Frozen</SelectItem><SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Source</Label>
                <Select value={form.source} onValueChange={(v) => setForm({...form, source: v})}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="walk_in">Walk-in</SelectItem><SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="se7en_fit">SE7EN FIT</SelectItem><SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-sm text-muted-foreground">Plan</Label><Input value={form.membership_plan} onChange={(e) => setForm({...form, membership_plan: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="bg-secondary border-border" /></div>
            <Button onClick={handleSave} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>{selectedMember ? 'Update Member' : 'Add Member'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}