import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Star, Plus, Check } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SearchFilterBar from '@/components/ui/SearchFilterBar';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import SkeletonCard from '@/components/ui/SkeletonCard';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { MessageSquare, AlertCircle, ThumbsUp } from 'lucide-react';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ member_name: '', rating: 5, review_text: '', type: 'review' });
  const { toast } = useToast();

  useEffect(() => { loadReviews(); }, []);

  const loadReviews = async () => {
    try { setReviews(await base44.entities.Review.list('-created_date')); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      await base44.entities.Review.create({ ...form, rating: Number(form.rating) });
      toast({ title: 'Review added' });
      setShowAdd(false); setForm({ member_name: '', rating: 5, review_text: '', type: 'review' });
      loadReviews();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const markResolved = async (id) => {
    await base44.entities.Review.update(id, { status: 'resolved' });
    toast({ title: 'Marked resolved' });
    loadReviews();
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : '—';
  const complaints = reviews.filter(r => r.type === 'complaint');
  const pending = reviews.filter(r => r.status === 'pending');

  const filtered = reviews.filter(r => r.member_name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="space-y-6"><PageHeader title="Reviews & Feedback" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews & Feedback" description="Monitor member satisfaction" actionLabel="Add Review" actionIcon={Plus} onAction={() => setShowAdd(true)} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Average Rating" value={`${avgRating} ⭐`} icon={Star} />
        <StatCard title="Total Reviews" value={reviews.length} icon={MessageSquare} />
        <StatCard title="Complaints" value={complaints.length} icon={AlertCircle} />
        <StatCard title="Pending" value={pending.length} icon={ThumbsUp} />
      </div>

      <SearchFilterBar searchValue={search} onSearchChange={setSearch} placeholder="Search reviews..." />

      {reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" description="Collect feedback from your members" />
      ) : (
        <div className="space-y-3">
          {filtered.map(review => (
            <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card glass-card-hover rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold">{review.member_name}</p>
                    <StatusBadge status={review.type} />
                    <StatusBadge status={review.status} />
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4" fill={s <= review.rating ? '#D4FF00' : 'transparent'} stroke={s <= review.rating ? '#D4FF00' : '#666'} />)}
                  </div>
                  <p className="text-sm text-muted-foreground">{review.review_text}</p>
                  {review.response && <p className="text-sm mt-2 pl-3" style={{ borderLeft: '2px solid #D4FF00' }}>{review.response}</p>}
                </div>
                {review.status === 'pending' && (
                  <Button size="sm" variant="ghost" className="text-green-400" onClick={() => markResolved(review.id)}>
                    <Check className="w-4 h-4 mr-1" /> Resolve
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">Add Review</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Member Name *</Label><Input value={form.member_name} onChange={(e) => setForm({...form, member_name: e.target.value})} className="bg-secondary border-border" /></div>
            <div>
              <Label className="text-sm text-muted-foreground">Rating</Label>
              <div className="flex gap-1 mt-1">
                {[1,2,3,4,5].map(s => <button key={s} onClick={() => setForm({...form, rating: s})}><Star className="w-6 h-6" fill={s <= form.rating ? '#D4FF00' : 'transparent'} stroke={s <= form.rating ? '#D4FF00' : '#666'} /></button>)}
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({...form, type: v})}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="review">Review</SelectItem><SelectItem value="complaint">Complaint</SelectItem><SelectItem value="feedback">Feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-sm text-muted-foreground">Review Text</Label><Textarea value={form.review_text} onChange={(e) => setForm({...form, review_text: e.target.value})} className="bg-secondary border-border" /></div>
            <Button onClick={handleSave} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>Add Review</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}