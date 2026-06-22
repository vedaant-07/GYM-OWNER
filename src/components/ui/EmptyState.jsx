import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NEON_GREEN = '#20c55d';

export default function EmptyState({ icon: Icon = Inbox, title = 'No data yet', description = 'Get started by adding your first item.', actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(32,197,93,0.08)' }}>
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-display font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4 font-semibold hover:opacity-90" style={{ background: NEON_GREEN, color: '#000' }}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
