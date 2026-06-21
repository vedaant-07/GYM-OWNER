import React from 'react';

export default function SkeletonCard({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
          <div className="flex justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-3 w-20 rounded" style={{ background: '#242424' }} />
              <div className="h-7 w-16 rounded" style={{ background: '#242424' }} />
              <div className="h-3 w-24 rounded" style={{ background: '#242424' }} />
            </div>
            <div className="w-10 h-10 rounded-lg" style={{ background: '#242424' }} />
          </div>
        </div>
      ))}
    </div>
  );
}