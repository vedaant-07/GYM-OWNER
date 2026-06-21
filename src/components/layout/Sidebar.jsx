import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, ClipboardCheck, Target,
  CreditCard, Crown, Megaphone, Trophy, Dumbbell, Calendar,
  Wrench, Star, Share2, BarChart3, Building2, Settings,
  ChevronDown, ChevronRight, X, Zap
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' }
    ]
  },
  {
    title: 'Members',
    items: [
      { label: 'All Members', icon: Users, path: '/members' },
    ]
  },
  {
    title: 'SE7EN FIT Referrals',
    items: [
      { label: 'Referred Users', icon: Zap, path: '/referred-users' },
    ]
  },
  {
    title: 'Attendance',
    items: [
      { label: 'Attendance', icon: ClipboardCheck, path: '/attendance' },
    ]
  },
  {
    title: 'Leads & CRM',
    items: [
      { label: 'Leads', icon: Target, path: '/leads' },
    ]
  },
  {
    title: 'Payments',
    items: [
      { label: 'Payments & Earnings', icon: CreditCard, path: '/payments' },
    ]
  },
  {
    title: 'Plans',
    items: [
      { label: 'Membership Plans', icon: Crown, path: '/plans' },
    ]
  },
  {
    title: 'Marketing',
    items: [
      { label: 'Campaigns', icon: Megaphone, path: '/campaigns' },
    ]
  },
  {
    title: 'Engagement',
    items: [
      { label: 'Challenges & Rewards', icon: Trophy, path: '/challenges' },
    ]
  },
  {
    title: 'Staff',
    items: [
      { label: 'Trainers & Staff', icon: Dumbbell, path: '/staff' },
    ]
  },
  {
    title: 'Classes',
    items: [
      { label: 'Class Schedule', icon: Calendar, path: '/classes' },
    ]
  },
  {
    title: 'Facility',
    items: [
      { label: 'Equipment', icon: Wrench, path: '/equipment' },
    ]
  },
  {
    title: 'Feedback',
    items: [
      { label: 'Reviews', icon: Star, path: '/reviews' },
    ]
  },
  {
    title: 'Referrals',
    items: [
      { label: 'Referral Program', icon: Share2, path: '/referrals' },
    ]
  },
  {
    title: 'Insights',
    items: [
      { label: 'Reports', icon: BarChart3, path: '/reports' },
    ]
  },
  {
    title: 'Manage',
    items: [
      { label: 'Gym Profile', icon: Building2, path: '/gym-profile' },
      { label: 'Settings', icon: Settings, path: '/settings' },
    ]
  }
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: '#0a0a0a', borderRight: '1px solid #1a1a1a' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 flex-shrink-0" style={{ borderBottom: '1px solid #1a1a1a' }}>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm" style={{ background: '#D4FF00', color: '#000' }}>
              S7
            </div>
            <span className="font-display font-bold text-lg tracking-tight" style={{ color: '#D4FF00' }}>
              SE7EN FIT
            </span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-3">
              <p className="px-3 mb-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                {section.title}
              </p>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-black'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }`}
                    style={isActive ? { background: '#D4FF00', color: '#000' } : {}}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderTop: '1px solid #1a1a1a' }}>
          <p className="text-[10px] text-muted-foreground text-center">
            SE7EN FIT © 2026
          </p>
        </div>
      </aside>
    </>
  );
}