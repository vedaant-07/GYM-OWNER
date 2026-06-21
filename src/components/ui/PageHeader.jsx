import React from 'react';
import { Button } from '@/components/ui/button';

export default function PageHeader({ title, description, actionLabel, actionIcon: ActionIcon, onAction, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {actionLabel && onAction && (
          <Button onClick={onAction} className="font-semibold" style={{ background: '#D4FF00', color: '#000' }}>
            {ActionIcon && <ActionIcon className="w-4 h-4 mr-2" />}
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}