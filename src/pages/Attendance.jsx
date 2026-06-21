import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ClipboardCheck, Plus, QrCode } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SearchFilterBar from '@/components/ui/SearchFilterBar';
import DataTable from '@/components/ui/DataTable';
import SkeletonCard from '@/components/ui/SkeletonCard';
import StatCard from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Users, TrendingUp, Calendar } from 'lucide-react';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ member_name: '', member_id: '', check_in: '', check_out: '' });
  const { toast } = useToast();

  useEffect(() => { loadRecords(); }, []);

  const loadRecords = async () => {
    try {
      const data = await base44.entities.AttendanceRecord.list('-created_date', 50);
      setRecords(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleCheckIn = async () => {
    try {
      const now = new Date();
      await base44.entities.AttendanceRecord.create({
        member_name: form.member_name,
        member_id: form.member_id || 'manual',
        date: now.toISOString().split('T')[0],
        check_in: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        type: 'manual'
      });
      toast({ title: 'Check-in recorded' });
      setShowAdd(false);
      setForm({ member_name: '', member_id: '', check_in: '', check_out: '' });
      loadRecords();
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleCheckOut = async (record) => {
    const now = new Date();
    await base44.entities.AttendanceRecord.update(record.id, {
      check_out: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    });
    toast({ title: 'Check-out recorded' });
    loadRecords();
  };

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = records.filter(r => r.date === today);
  const checkedIn = todayRecords.filter(r => r.check_in && !r.check_out);

  const filtered = records.filter(r => r.member_name?.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { key: 'member_name', label: 'Member' },
    { key: 'date', label: 'Date' },
    { key: 'check_in', label: 'Check In' },
    { key: 'check_out', label: 'Check Out', render: (val) => val || '—' },
    { key: 'type', label: 'Type', render: (val) => <span className="capitalize text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(212,255,0,0.1)', color: '#D4FF00' }}>{val}</span> },
    { key: 'actions', label: '', render: (_, row) => (
      !row.check_out && <Button size="sm" variant="ghost" className="text-xs" style={{ color: '#D4FF00' }} onClick={(e) => { e.stopPropagation(); handleCheckOut(row); }}>Check Out</Button>
    )}
  ];

  if (loading) return <div className="space-y-6"><PageHeader title="Attendance" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Track member check-ins and check-outs" actionLabel="Manual Check-in" actionIcon={Plus} onAction={() => setShowAdd(true)}>
        <Button variant="outline" className="border-border text-muted-foreground" disabled>
          <QrCode className="w-4 h-4 mr-2" /> QR Scan (Coming Soon)
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Today Check-ins" value={todayRecords.length} icon={ClipboardCheck} />
        <StatCard title="Currently In Gym" value={checkedIn.length} icon={Users} />
        <StatCard title="Total Records" value={records.length} icon={Calendar} />
        <StatCard title="Avg Daily" value={records.length > 0 ? Math.round(records.length / 7) : 0} icon={TrendingUp} />
      </div>

      <SearchFilterBar searchValue={search} onSearchChange={setSearch} placeholder="Search members..." />
      <DataTable columns={columns} data={filtered} emptyTitle="No attendance records" emptyDescription="Start recording attendance" emptyIcon={ClipboardCheck} />

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Manual Check-in</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Member Name *</Label><Input value={form.member_name} onChange={(e) => setForm({...form, member_name: e.target.value})} className="bg-secondary border-border" placeholder="Enter member name" /></div>
            <Button onClick={handleCheckIn} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>Record Check-in</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}