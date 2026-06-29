import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import SkeletonCard from '@/components/ui/SkeletonCard';
import {
  Bell,
  Building2,
  CalendarCheck,
  CreditCard,
  Download,
  Dumbbell,
  Gift,
  IndianRupee,
  MessageSquare,
  QrCode,
  Settings,
  Share2,
  Star,
  Target,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
} from 'lucide-react';
import { motion } from 'framer-motion';

const NEON_GREEN = '#20c55d';
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const todayIso = () => new Date().toISOString().split('T')[0];

const safeList = async (entity) => {
  try { return await entity.list(); } catch { return []; }
};

const getStatus = (row, fallback = 'active') => String(row?.status || fallback).toLowerCase();
const firstLetter = (value = 'S') => String(value || 'S').trim().slice(0, 1).toUpperCase();

function BigMetric({ icon: Icon, label, value, sub, tone = 'text-primary', to }) {
  const content = (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="group h-full rounded-[26px] border border-border bg-[#101010] p-5 transition-all hover:border-primary/40 hover:bg-primary/5">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
        <Icon className="h-7 w-7" style={{ color: NEON_GREEN }} />
      </div>
      <p className={`font-display text-4xl font-black tracking-tight ${tone}`}>{value}</p>
      <p className="mt-2 text-base font-semibold text-foreground">{label}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </motion.div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}

function FeatureTile({ icon: Icon, label, to, sub }) {
  return (
    <Link to={to} className="group flex min-h-[118px] flex-col items-center justify-center gap-3 rounded-[24px] border border-border bg-[#101010] p-3 text-center transition-all hover:-translate-y-1 hover:border-primary/45 hover:bg-primary/10">
      <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 group-hover:shadow-[0_0_22px_rgba(32,197,93,0.18)]">
        <Icon className="h-6 w-6" style={{ color: NEON_GREEN }} />
      </div>
      <div>
        <p className="text-sm font-black leading-tight text-foreground group-hover:text-primary">{label}</p>
        {sub && <p className="mt-1 text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </Link>
  );
}

function MemberRow({ member }) {
  const name = member.name || member.full_name || member.email || 'Gym Member';
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-white/[0.025] p-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-black text-primary">{firstLetter(name)}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{member.email || member.phone || member.membership_type || 'Active member'}</p>
      </div>
      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${getStatus(member) === 'active' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>{member.status || 'active'}</span>
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ members: [], referred: [], payments: [], leads: [], attendance: [], campaigns: [], equipment: [], reviews: [], workouts: [], diets: [], whatsapp: [], emails: [], profiles: [] });

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    const [members, referred, payments, leads, attendance, campaigns, equipment, reviews, workouts, diets, whatsapp, emails, profiles] = await Promise.all([
      safeList(base44.entities.GymMember),
      safeList(base44.entities.SE7ENFITReferredUser),
      safeList(base44.entities.Payment),
      safeList(base44.entities.Lead),
      safeList(base44.entities.AttendanceRecord),
      safeList(base44.entities.Campaign),
      safeList(base44.entities.Equipment),
      safeList(base44.entities.Review),
      safeList(base44.entities.AssignedWorkoutPlan),
      safeList(base44.entities.AssignedDietPlan),
      safeList(base44.entities.WhatsAppMessage),
      safeList(base44.entities.EmailMessage),
      safeList(base44.entities.GymProfile),
    ]);
    setData({ members, referred, payments, leads, attendance, campaigns, equipment, reviews, workouts, diets, whatsapp, emails, profiles });
    setLoading(false);
  };

  const stats = useMemo(() => {
    const activeMembers = data.members.filter((m) => getStatus(m) === 'active');
    const pendingMembers = data.members.filter((m) => getStatus(m, '') === 'pending');
    const today = todayIso();
    const todayAttendance = data.attendance.filter((a) => a.date === today || String(a.created_date || '').startsWith(today));
    const paidRevenue = data.payments.filter((p) => getStatus(p, '') === 'paid').reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const duePayments = data.payments.filter((p) => ['due', 'overdue', 'pending'].includes(getStatus(p, '')));
    const newLeads = data.leads.filter((l) => getStatus(l, 'new') === 'new');
    const convertedLeads = data.leads.filter((l) => getStatus(l, '') === 'converted');
    const avgRating = data.reviews.length ? (data.reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / data.reviews.length).toFixed(1) : '—';
    return {
      activeMembers: activeMembers.length,
      totalMembers: data.members.length,
      pendingMembers: pendingMembers.length,
      todayAttendance: todayAttendance.length,
      revenue: paidRevenue,
      duePayments: duePayments.length,
      newLeads: newLeads.length,
      leadConversion: data.leads.length ? Math.round((convertedLeads.length / data.leads.length) * 100) : 0,
      activeCampaigns: data.campaigns.filter((c) => getStatus(c) === 'active').length,
      equipmentIssues: data.equipment.filter((e) => ['needs_repair', 'out_of_order'].includes(getStatus(e, ''))).length,
      avgRating,
      activeWorkouts: data.workouts.filter((w) => getStatus(w) === 'active').length,
      activeDiets: data.diets.filter((d) => getStatus(d) === 'active').length,
    };
  }, [data]);

  const gym = data.profiles[0] || {};
  const recentMembers = data.members.slice(0, 5);

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
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-[32px] border border-primary/30 bg-gradient-to-br from-primary via-[#20c55d] to-[#0f8f45] p-6 text-black shadow-[0_0_45px_rgba(32,197,93,0.18)]">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-black/70">Monthly Revenue</p>
            <h1 className="mt-2 font-display text-5xl font-black tracking-tight sm:text-6xl">{money(stats.revenue)}</h1>
            <p className="mt-3 text-base font-semibold text-black/70">{stats.activeMembers} active members • {stats.pendingMembers} pending approvals</p>
          </div>
          <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/20">
            <IndianRupee className="h-12 w-12" />
          </div>
        </div>
        <div className="relative mt-7 h-3 rounded-full bg-black/15">
          <div className="h-3 rounded-full bg-white" style={{ width: `${Math.min(100, Math.max(10, stats.activeMembers * 8))}%` }} />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <BigMetric icon={Users} label="Total Members" value={stats.totalMembers} sub={`${stats.activeMembers} active`} to="/members" />
        <BigMetric icon={UserPlus} label="New Leads" value={stats.newLeads} sub={`${stats.leadConversion}% conversion`} to="/leads" tone="text-yellow-400" />
        <BigMetric icon={CalendarCheck} label="Today Check-ins" value={stats.todayAttendance} sub={todayIso()} to="/attendance" tone="text-emerald-400" />
        <BigMetric icon={Bell} label="Pending Approval" value={stats.pendingMembers} sub="Review members" to="/members" tone="text-orange-400" />
        <BigMetric icon={CreditCard} label="Pending Payments" value={stats.duePayments} sub="Due / overdue" to="/payments" tone="text-red-400" />
        <BigMetric icon={Share2} label="SE7EN FIT Referred" value={data.referred.length} sub="Referral users" to="/referred-users" tone="text-purple-400" />
        <BigMetric icon={Wrench} label="Equipment Issues" value={stats.equipmentIssues} sub="Needs attention" to="/equipment" tone="text-cyan-400" />
        <BigMetric icon={Star} label="Avg Rating" value={stats.avgRating} sub={`${data.reviews.length} reviews`} to="/reviews" tone="text-yellow-300" />
      </div>

      <section className="rounded-[28px] border border-border bg-[#101010] p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">More Features</p>
            <h2 className="text-2xl font-display font-black">Gym Owner Control Center</h2>
          </div>
          <p className="text-sm text-muted-foreground">All main functions from the dashboard screens.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <FeatureTile icon={Building2} label="Gym Profile" to="/gym-profile" sub="Edit details" />
          <FeatureTile icon={Dumbbell} label="Equipment" to="/equipment" sub="Tools" />
          <FeatureTile icon={CalendarCheck} label="Attendance" to="/attendance" sub="QR / logs" />
          <FeatureTile icon={Trophy} label="Challenges" to="/challenges" sub="Engage" />
          <FeatureTile icon={Gift} label="Rewards" to="/plans" sub="Offers" />
          <FeatureTile icon={Share2} label="Referrals" to="/referrals" sub="Code" />
          <FeatureTile icon={Star} label="Reviews" to="/reviews" sub="Ratings" />
          <FeatureTile icon={Bell} label="Announcements" to="/notifications" sub="Broadcast" />
          <FeatureTile icon={Target} label="Leads" to="/leads" sub="Follow-up" />
          <FeatureTile icon={CreditCard} label="Earnings" to="/payments" sub="Payouts" />
          <FeatureTile icon={MessageSquare} label="Messages" to="/whatsapp" sub="WhatsApp" />
          <FeatureTile icon={Settings} label="Settings" to="/settings" sub="Account" />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-[28px] border border-primary/25 bg-primary/10 p-5 lg:col-span-1">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Referral Code</p>
          <p className="mt-3 font-mono text-3xl font-black tracking-widest text-primary">{gym.referral_code || 'SE7ENF-GYM'}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Share this code with members so their signup links to your gym.</p>
          <div className="mt-5 flex gap-2">
            <Link to="/referrals" className="rounded-xl bg-primary px-4 py-2 text-sm font-black text-black">View Referrals</Link>
            <Link to="/reports" className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-foreground"><Download className="mr-1 inline h-4 w-4" /> Export</Link>
          </div>
        </section>

        <section className="rounded-[28px] border border-border bg-[#101010] p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Recent Members</p>
              <h2 className="text-2xl font-display font-black">Latest joined users</h2>
            </div>
            <Link to="/members" className="text-sm font-black text-primary">See all</Link>
          </div>
          <div className="space-y-3">
            {recentMembers.length > 0 ? recentMembers.map((member) => <MemberRow key={member.id || member.email || member.phone} member={member} />) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No members yet. Add members or share your referral code.</div>
            )}
          </div>
        </section>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <BigMetric icon={Dumbbell} label="Active Workouts" value={stats.activeWorkouts} to="/assigned-workouts" />
        <BigMetric icon={Users} label="Active Diets" value={stats.activeDiets} to="/assigned-diets" />
        <BigMetric icon={Target} label="Campaigns" value={stats.activeCampaigns} to="/campaigns" />
        <BigMetric icon={QrCode} label="Quick Check-in" value="QR" sub="Open attendance" to="/attendance" />
      </section>
    </div>
  );
}
