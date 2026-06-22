import React from 'react';
import { motion } from 'framer-motion';

const NEON_GREEN = '#20c55d';

export default function StatCard({ title, value, icon: Icon, change, changeType, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card glass-card-hover rounded-xl p-5 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium truncate">{title}</p>
          <p className="text-2xl font-display font-bold mt-1 text-foreground">{value}</p>
          {change !== undefined && (
            <p className={`text-xs mt-1 font-medium ${changeType === 'positive' ? 'text-green-400' : changeType === 'negative' ? 'text-red-400' : 'text-muted-foreground'}`}>
              {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : ''} {change}
            </p>
          )}
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-lg ml-3 flex-shrink-0" style={{ background: 'rgba(32,197,93,0.12)' }}>
            <Icon className="w-5 h-5" style={{ color: NEON_GREEN }} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
