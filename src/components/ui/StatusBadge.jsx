import React from 'react';

const STATUS_STYLES = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  paid: 'bg-green-500/10 text-green-400 border-green-500/20',
  converted: 'bg-green-500/10 text-green-400 border-green-500/20',
  completed: 'bg-green-500/10 text-green-400 border-green-500/20',
  resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
  working: 'bg-green-500/10 text-green-400 border-green-500/20',
  fulfilled: 'bg-green-500/10 text-green-400 border-green-500/20',
  premium: 'bg-green-500/10 text-green-400 border-green-500/20',
  sent: 'bg-green-500/10 text-green-400 border-green-500/20',
  delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
  opened: 'bg-green-500/10 text-green-400 border-green-500/20',
  inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  expired: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  retired: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  none: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  dismissed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  queued: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  due: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  scheduled: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  upcoming: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  trial: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  frozen: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  paused: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  lost: 'bg-red-500/10 text-red-400 border-red-500/20',
  out_of_order: 'bg-red-500/10 text-red-400 border-red-500/20',
  refunded: 'bg-red-500/10 text-red-400 border-red-500/20',
  needs_repair: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  new: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  contacted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  trial_booked: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  trial_completed: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  hot: 'bg-red-500/10 text-red-400 border-red-500/20',
  warm: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  cold: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  partial: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  const label = (status || 'unknown').replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${style}`}>
      {label}
    </span>
  );
}
