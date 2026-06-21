import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Zap, ClipboardCheck, Target, CreditCard,
  Crown, Megaphone, Trophy, Dumbbell, Calendar, Wrench, Star, Share2,
  BarChart3, Building2, Settings, ChevronDown, X, Bell, Salad,
  MessageSquare, Mail, Bot, FlaskConical, BookOpen, Shield
} from 'lucide-react';

const NAV_GROUPS = [
  {
    id: 'command', label: 'Command Center', items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { label: 'Notifications', icon: Bell, path: '/notifications' },
    ]
  },
  {
    id: 'members', label: 'Members', items: [
      { label: 'All Members', icon: Users, path: '/members' },
    ]
  },
  {
    id: 'referrals', label: 'SE7EN FIT Referrals', accent: true, items: [
      { label: 'Referred Users', icon: Zap, path: '/referred-users' },
    ]
  },
  {
    id: 'workout', label: 'Workout Management', items: [
      { label: 'Exercise Library', icon: BookOpen, path: '/exercises' },
      { label: 'Workout Builder', icon: Dumbbell, path: '/workout-plans' },
      { label: 'Assigned Plans', icon: ClipboardCheck, path: '/assigned-workouts' },
    ]
  },
  {
    id: 'diet', label: 'Diet & Nutrition', items: [
      { label: 'Diet Builder', icon: Salad, path: '/diet-plans' },
      { label: 'Assigned Diets', icon: FlaskConical, path: '/assigned-diets' },
    ]
  },
  {
    id: 'attendance', label: 'Attendance', items: [
      { label: 'Attendance', icon: ClipboardCheck, path: '/attendance' },
    ]
  },
  {
    id: 'crm', label: 'Leads & CRM', items: [
      { label: 'Leads', icon: Target, path: '/leads' },
    ]
  },
  {
    id: 'payments', label: 'Payments & Plans', items: [
      { label: 'Payments', icon: CreditCard, path: '/payments' },
      { label: 'Membership Plans', icon: Crown, path: '/plans' },
    ]
  },
  {
    id: 'comms', label: 'Communications', items: [
      { label: 'Campaigns', icon: Megaphone, path: '/campaigns' },
      { label: 'WhatsApp', icon: MessageSquare, path: '/whatsapp' },
      { label: 'Email', icon: Mail, path: '/email-notifications' },
      { label: 'Automations', icon: Bot, path: '/automations' },
    ]
  },
  {
    id: 'engagement', label: 'Challenges & Rewards', items: [
      { label: 'Challenges', icon: Trophy, path: '/challenges' },
    ]
  },
  {
    id: 'staff', label: 'Staff & Trainers', items: [
      { label: 'Trainers & Staff', icon: Shield, path: '/staff' },
    ]
  },
  {
    id: 'classes', label: 'Classes & Schedule', items: [
      { label: 'Class Schedule', icon: Calendar, path: '/classes' },
    ]
  },
  {
    id: 'facility', label: 'Facility', items: [
      { label: 'Equipment', icon: Wrench, path: '/equipment' },
      { label: 'Reviews', icon: Star, path: '/reviews' },
    ]
  },
  {
    id: 'referral-prog', label: 'Referral Program', items: [
      { label: 'Referrals', icon: Share2, path: '/referrals' },
    ]
  },
  {
    id: 'reports', label: 'Reports', items: [
      { label: 'Reports', icon: BarChart3, path: '/reports' },
    ]
  },
  {
    id: 'manage', label: 'Manage', items: [
      { label: 'Gym Profile', icon: Building2, path: '/gym-profile' },
      { label: 'Settings', icon: Settings, path: '/settings' },
    ]
  }
];

function NavGroup({ group, collapsed, onClose }) {
  const location = useLocation();
  const hasActive = group.items.some(item => location.pathname === item.path);
  const [open, setOpen] = useState(hasActive || group.id === 'command');

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors hover:bg-sidebar-accent group"
      >
        <span className={`text-[10px] uppercase tracking-[0.15em] font-bold transition-colors ${
          group.accent ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
        }`}>
          {group.label}
        </span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pl-1 pr-1 pb-1 space-y-0.5 mt-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                    }`}
                    style={isActive ? { background: '#20c55d', color: '#000' } : {}}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-black' : ''}`} />
                    <span className="truncate text-[13px]">{item.label}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black flex-shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'hsl(var(--sidebar-background))',
          borderRight: '1px solid hsl(var(--sidebar-border))'
        }}
      >
        {/* Logo bar */}
        <div
          className="flex items-center justify-between px-4 h-16 flex-shrink-0"
          style={{ borderBottom: '1px solid hsl(var(--sidebar-border))' }}
        >
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
              style={{ background: '#20c55d', color: '#000' }}
            >
              S7
            </div>
            <div>
              <p className="font-display font-bold text-sm leading-tight"             style={{ color: '#20c55d' }}>SE7EN FIT</p>
              <p className="text-[9px] text-muted-foreground leading-tight tracking-wider uppercase">Command Center</p>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_GROUPS.map((group) => (
            <NavGroup key={group.id} group={group} onClose={onClose} />
          ))}
        </nav>

        {/* Footer */}
        <div
          className="px-4 py-3 flex-shrink-0"
          style={{ borderTop: '1px solid hsl(var(--sidebar-border))' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: '#20c55d', color: '#000' }}
            >
              G
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">Gym Owner</p>
              <p className="text-[10px] text-muted-foreground">Active Partner</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}