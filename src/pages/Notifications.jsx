import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, Check, CheckCheck } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SkeletonCard from '@/components/ui/SkeletonCard';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';

const TYPE_STYLES = {
  info: 'border-l-blue-500 bg-blue-500/5',
  warning: 'border-l-yellow-500 bg-yellow-500/5',
  success: 'border-l-green-500 bg-green-500/5',
  error: 'border-l-red-500 bg-red-500/5',
};

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { setNotifs(await base44.entities.OwnerNotification.list('-created_date', 50)); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const markRead = async (id) => {
    await base44.entities.OwnerNotification.update(id, { is_read: true });
    load();
  };

  const markAllRead = async () => {
    const unread = notifs.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.OwnerNotification.update(n.id, { is_read: true })));
    toast({ title: 'All marked as read' });
    load();
  };

  const unread = notifs.filter(n => !n.is_read);

  if (loading) return <div className="space-y-6"><PageHeader title="Notifications" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description={`${unread.length} unread`}>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" className="border-border text-sm" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4 mr-1.5" /> Mark all read
          </Button>
        )}
      </PageHeader>

      {notifs.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifs.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className={`glass-card rounded-xl p-4 border-l-4 transition-all ${TYPE_STYLES[n.type] || TYPE_STYLES.info} ${!n.is_read ? 'opacity-100' : 'opacity-60'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{n.title}</h4>
                    {!n.is_read && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#D4FF00' }} />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">{n.created_date ? new Date(n.created_date).toLocaleString() : ''}</p>
                </div>
                {!n.is_read && (
                  <Button size="sm" variant="ghost" className="text-xs flex-shrink-0" onClick={() => markRead(n.id)}>
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}