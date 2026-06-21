import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart3, Download } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, DollarSign, TrendingUp, Target, Zap, Megaphone } from 'lucide-react';

const CHART_COLORS = ['#D4FF00', '#22C55E', '#FACC15', '#EF4444', '#3B82F6'];
const tooltipStyle = { background: '#111', border: '1px solid #242424', borderRadius: 8, color: '#fff' };

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [members, payments, leads, attendance, referred, campaigns] = await Promise.all([
        base44.entities.GymMember.list().catch(() => []),
        base44.entities.Payment.list().catch(() => []),
        base44.entities.Lead.list().catch(() => []),
        base44.entities.AttendanceRecord.list().catch(() => []),
        base44.entities.SE7ENFITReferredUser.list().catch(() => []),
        base44.entities.Campaign.list().catch(() => [])
      ]);
      setData({ members, payments, leads, attendance, referred, campaigns });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return <div className="space-y-6"><PageHeader title="Reports" /><SkeletonCard count={6} /></div>;

  const totalRevenue = (data.payments || []).filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
  const convertedLeads = (data.leads || []).filter(l => l.status === 'converted');

  const ChartCard = ({ title, children }) => (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-sm font-display font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Business analytics and insights">
        <Button variant="outline" className="border-border text-muted-foreground" disabled>
          <Download className="w-4 h-4 mr-2" /> Export (Coming Soon)
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard title="Total Members" value={(data.members || []).length} icon={Users} />
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={DollarSign} />
        <StatCard title="Lead Conversion" value={data.leads?.length > 0 ? `${Math.round((convertedLeads.length / data.leads.length) * 100)}%` : '0%'} icon={TrendingUp} />
        <StatCard title="Total Leads" value={(data.leads || []).length} icon={Target} />
        <StatCard title="Referred Users" value={(data.referred || []).length} icon={Zap} />
        <StatCard title="Campaigns" value={(data.campaigns || []).length} icon={Megaphone} />
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="bg-secondary border-border flex-wrap">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-4">
          <ChartCard title="Revenue Overview">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center"><p className="text-2xl font-display font-bold" style={{ color: '#D4FF00' }}>₹{totalRevenue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total</p></div>
              <div className="text-center"><p className="text-2xl font-display font-bold">{(data.payments || []).filter(p => p.status === 'paid').length}</p><p className="text-xs text-muted-foreground">Paid</p></div>
              <div className="text-center"><p className="text-2xl font-display font-bold text-red-400">{(data.payments || []).filter(p => p.status === 'due' || p.status === 'overdue').length}</p><p className="text-xs text-muted-foreground">Due</p></div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[{ label: 'Paid', value: totalRevenue }, { label: 'Due', value: (data.payments || []).filter(p => p.status !== 'paid').reduce((s, p) => s + (p.amount || 0), 0) }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" /><XAxis dataKey="label" stroke="#666" fontSize={11} /><YAxis stroke="#666" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} /><Bar dataKey="value" fill="#D4FF00" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <ChartCard title="Member Status Distribution">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={[
                  { name: 'Active', value: (data.members || []).filter(m => m.status === 'active').length },
                  { name: 'Inactive', value: (data.members || []).filter(m => m.status === 'inactive').length },
                  { name: 'Frozen', value: (data.members || []).filter(m => m.status === 'frozen').length },
                  { name: 'Expired', value: (data.members || []).filter(m => m.status === 'expired').length },
                ].filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                  label={({ name, value }) => `${name}: ${value}`} fontSize={11}>
                  {[0,1,2,3].map(i => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <ChartCard title="Attendance Summary">
            <div className="text-center mb-4">
              <p className="text-3xl font-display font-bold" style={{ color: '#D4FF00' }}>{(data.attendance || []).length}</p>
              <p className="text-sm text-muted-foreground">Total Check-ins Recorded</p>
            </div>
          </ChartCard>
        </TabsContent>

        <TabsContent value="leads" className="mt-4">
          <ChartCard title="Lead Pipeline">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={['new','contacted','trial_booked','trial_completed','converted','lost'].map(s => ({
                stage: s.replace('_', ' '),
                count: (data.leads || []).filter(l => l.status === s).length
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" /><XAxis dataKey="stage" stroke="#666" fontSize={10} /><YAxis stroke="#666" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" fill="#D4FF00" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="referrals" className="mt-4">
          <ChartCard title="SE7EN FIT Referral Performance">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center"><p className="text-2xl font-display font-bold" style={{ color: '#D4FF00' }}>{(data.referred || []).length}</p><p className="text-xs text-muted-foreground">Total Referred</p></div>
              <div className="text-center"><p className="text-2xl font-display font-bold text-green-400">{(data.referred || []).filter(r => r.conversion_status === 'converted').length}</p><p className="text-xs text-muted-foreground">Converted</p></div>
              <div className="text-center"><p className="text-2xl font-display font-bold text-yellow-400">{(data.referred || []).filter(r => r.conversion_status === 'pending').length}</p><p className="text-xs text-muted-foreground">Pending</p></div>
            </div>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}