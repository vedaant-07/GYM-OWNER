import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmptyState({ icon: Icon = Inbox, title = 'No data yet', description = 'Get started by adding your first item.', actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(212,255,0,0.05)' }}>
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-display font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4 font-semibold" style={{ background: '#D4FF00', color: '#000' }}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}