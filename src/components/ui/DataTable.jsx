import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmptyState from './EmptyState';

export default function DataTable({ columns, data, onRowClick, emptyTitle, emptyDescription, emptyIcon }) {
  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} icon={emptyIcon} />;
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {columns.map((col) => (
                <TableHead key={col.key} className="text-xs uppercase tracking-wider text-muted-foreground font-medium whitespace-nowrap">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow
                key={row.id || idx}
                className="border-border hover:bg-white/5 cursor-pointer transition-colors"
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className="text-sm whitespace-nowrap">
                    {col.render ? col.render(row[col.key], row) : row[col.key] || '—'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}