import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import StatCard from '@/components/ui/StatCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import {
  Users, UserCheck, UserPlus, ClipboardCheck, DollarSign, AlertCircle,
  Clock, Zap, TrendingUp, Megaphone, Wrench, Star, Plus, Target,
  Gift, Send, Download, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const CHART_COLORS = ['#D4FF00', '#22C55E', '#FACC15', '#EF4444', '#3B82F6', '#A855F7'];

const mockRevenue = [
  { month: 'Jan', revenue: 45000 }, { month: 'Feb', revenue: 52000 }, { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 }, { month: 'May', revenue: 55000 }, { month: 'Jun', revenue: 67000 }
];

const mockAttendance = [
  { day: 'Mon', count: 45 }, { day: 'Tue', count: 52 }, { day: 'Wed', count: 49 },
  { day: 'Thu', count: 38 }, { day: 'Fri', count: 55 }, { day: 'Sat', count: 62 }, { day: 'Sun', count: 30 }
];

const mockPlanSplit = [
  { name: 'Monthly', value: 40 }, { name: 'Quarterly', value: 25 },
  { name: 'Half-Yearly', value: 20 }, { name: 'Annual', value: 15 }
];

const ChartCard = ({ title, children }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
    <h3 className="text-sm font-display font-semibold text-foreground mb-4">{title}</h3>
    {children}
  </motion.div>
);

const QuickAction = ({ icon: Icon, label, to }) => (
  <Link to={to} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors group">
    <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all group-hover:neon-glow" style={{ background: 'rgba(212,255,0,0.1)' }}>
      <Icon className="w-5 h-5" style={{ color: '#D4FF00' }} />
    </div>
    <span className="text-xs text-muted-foreground group-hover:text-foreground text-center">{label}</span>
  </Link>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [members, referred, payments, leads, attendance, campaigns, equipment, reviews] = await Promise.all([
        base44.entities.GymMember.list().catch(() => []),
        base44.entities.SE7ENFITReferredUser.list().catch(() => []),
        base44.entities.Payment.list().catch(() => []),
        base44.entities.Lead.list().catch(() => []),
        base44.entities.AttendanceRecord.list().catch(() => []),
        base44.entities.Campaign.list().catch(() => []),
        base44.entities.Equipment.list().catch(() => []),
        base44.entities.Review.list().catch(() => [])
      ]);

      const activeMembers = members.filter(m => m.status === 'active');
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendance.filter(a => a.date === today);
      const duePayments = payments.filter(p => p.status === 'due' || p.status === 'overdue');
      const totalRevenue = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0);
      const expiringMembers = members.filter(m => {
        if (!m.renewal_date) return false;
        const renewal = new Date(m.renewal_date);
        const week = new Date(); week.setDate(week.getDate() + 7);
        return renewal <= week && renewal >= new Date();
      });
      const convertedLeads = leads.filter(l => l.status === 'converted');
      const activeCampaigns = campaigns.filter(c => c.status === 'active');
      const eqIssues = equipment.filter(e => e.status === 'needs_repair' || e.status === 'out_of_order');
      const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : '—';
      const thisMonth = new Date().getMonth();
      const newThisMonth = members.filter(m => m.join_date && new Date(m.join_date).getMonth() === thisMonth);

      setStats({
        totalMembers: members.length,
        activeMembers: activeMembers.length,
        newThisMonth: newThisMonth.length,
        todayAttendance: todayAttendance.length,
        revenue: totalRevenue,
        duePayments: duePayments.length,
        expiringMemberships: expiringMembers.length,
        referredUsers: referred.length,
        leadConversion: leads.length > 0 ? Math.round((convertedLeads.length / leads.length) * 100) : 0,
        activeCampaigns: activeCampaigns.length,
        eqIssues: eqIssues.length,
        avgRating
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-display font-bold">Dashboard</h1></div>
        <SkeletonCard count={8} />
        <SkeletonCard count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your gym command center</p>
        </div>
        <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard title="Total Members" value={stats.totalMembers} icon={Users} />
        <StatCard title="Active Members" value={stats.activeMembers} icon={UserCheck} change={`${stats.newThisMonth} new`} changeType="positive" />
        <StatCard title="New This Month" value={stats.newThisMonth} icon={UserPlus} />
        <StatCard title="Today Attendance" value={stats.todayAttendance} icon={ClipboardCheck} />
        <StatCard title="Monthly Revenue" value={`₹${stats.revenue?.toLocaleString()}`} icon={DollarSign} />
        <StatCard title="Pending Payments" value={stats.duePayments} icon={AlertCircle} />
        <StatCard title="Expiring Soon" value={stats.expiringMemberships} icon={Clock} />
        <StatCard title="SE7EN FIT Referred" value={stats.referredUsers} icon={Zap} />
        <StatCard title="Lead Conversion" value={`${stats.leadConversion}%`} icon={TrendingUp} />
        <StatCard title="Active Campaigns" value={stats.activeCampaigns} icon={Megaphone} />
        <StatCard title="Equipment Issues" value={stats.eqIssues} icon={Wrench} />
        <StatCard title="Avg Rating" value={stats.avgRating} icon={Star} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Revenue Trend">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockRevenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4FF00" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#D4FF00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="month" stroke="#666" fontSize={11} />
              <YAxis stroke="#666" fontSize={11} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #242424', borderRadius: 8, color: '#fff' }} />
              <Area type="monotone" dataKey="revenue" stroke="#D4FF00" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weekly Attendance">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockAttendance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="day" stroke="#666" fontSize={11} />
              <YAxis stroke="#666" fontSize={11} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #242424', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="count" fill="#D4FF00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Membership Plan Split">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={mockPlanSplit} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} fontSize={11}>
                  {mockPlanSplit.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111', border: '1px solid #242424', borderRadius: 8, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Member Growth">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mockRevenue.map((m, i) => ({ ...m, members: 50 + i * 12 }))}>
              <defs>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="month" stroke="#666" fontSize={11} />
              <YAxis stroke="#666" fontSize={11} />
              <Tooltip contentStyle={{ background: '#111', border: '1px solid #242424', borderRadius: 8, color: '#fff' }} />
              <Area type="monotone" dataKey="members" stroke="#22C55E" fill="url(#memGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Quick Actions */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-sm font-display font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          <QuickAction icon={UserPlus} label="Add Member" to="/members" />
          <QuickAction icon={Target} label="Add Lead" to="/leads" />
          <QuickAction icon={ClipboardCheck} label="Attendance" to="/attendance" />
          <QuickAction icon={Megaphone} label="Campaign" to="/campaigns" />
          <QuickAction icon={Send} label="Announce" to="/campaigns" />
          <QuickAction icon={Zap} label="Referred" to="/referred-users" />
          <QuickAction icon={Wrench} label="Equipment" to="/equipment" />
          <QuickAction icon={Download} label="Reports" to="/reports" />
        </div>
      </div>
    </div>
  );
}