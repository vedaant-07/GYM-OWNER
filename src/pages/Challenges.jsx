import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Trophy, Plus, Edit, Trash2, Medal, Coins } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Users, Gift } from 'lucide-react';

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', start_date: '', end_date: '', reward_coins: 0, type: '', status: 'upcoming' });
  const [rewardForm, setRewardForm] = useState({ name: '', description: '', coins_required: '', stock: '' });
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [c, r] = await Promise.all([
        base44.entities.Challenge.list(),
        base44.entities.Reward.list()
      ]);
      setChallenges(c); setRewards(r);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSaveChallenge = async () => {
    try {
      await base44.entities.Challenge.create({ ...form, reward_coins: Number(form.reward_coins) });
      toast({ title: 'Challenge created' });
      setShowAdd(false); setForm({ title: '', description: '', start_date: '', end_date: '', reward_coins: 0, type: '', status: 'upcoming' });
      loadData();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const handleSaveReward = async () => {
    try {
      await base44.entities.Reward.create({ ...rewardForm, coins_required: Number(rewardForm.coins_required), stock: Number(rewardForm.stock) });
      toast({ title: 'Reward created' });
      setShowReward(false); setRewardForm({ name: '', description: '', coins_required: '', stock: '' });
      loadData();
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  };

  const active = challenges.filter(c => c.status === 'active');

  if (loading) return <div className="space-y-6"><PageHeader title="Challenges & Rewards" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Challenges & Rewards" description="Engage members with fitness challenges" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Challenges" value={challenges.length} icon={Trophy} />
        <StatCard title="Active" value={active.length} icon={Medal} />
        <StatCard title="Rewards Available" value={rewards.length} icon={Gift} />
        <StatCard title="Total Coins" value={challenges.reduce((s, c) => s + (c.reward_coins || 0), 0)} icon={Coins} />
      </div>

      <Tabs defaultValue="challenges">
        <TabsList className="bg-secondary border-border">
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowAdd(true)} className="font-semibold" style={{ background: '#D4FF00', color: '#000' }}><Plus className="w-4 h-4 mr-2" /> Create Challenge</Button>
          </div>
          {challenges.length === 0 ? (
            <EmptyState icon={Trophy} title="No challenges yet" description="Create fitness challenges for your members" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map(c => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card glass-card-hover rounded-xl p-5">
                  <div className="flex justify-between mb-2"><StatusBadge status={c.status} /><span className="text-xs" style={{ color: '#D4FF00' }}>🪙 {c.reward_coins}</span></div>
                  <h3 className="font-display font-bold text-lg">{c.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground mt-3">
                    <span>{c.start_date || '—'}</span><span>→</span><span>{c.end_date || '—'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{c.participant_count || 0} participants</p>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rewards" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setShowReward(true)} className="font-semibold" style={{ background: '#D4FF00', color: '#000' }}><Plus className="w-4 h-4 mr-2" /> Add Reward</Button>
          </div>
          {rewards.length === 0 ? (
            <EmptyState icon={Gift} title="No rewards yet" description="Add rewards members can redeem" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map(r => (
                <div key={r.id} className="glass-card rounded-xl p-5">
                  <h3 className="font-display font-semibold">{r.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                  <div className="flex justify-between mt-3">
                    <span className="text-sm font-bold" style={{ color: '#D4FF00' }}>🪙 {r.coins_required}</span>
                    <span className="text-xs text-muted-foreground">Stock: {r.stock}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">Create Challenge</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Title *</Label><Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Description</Label><Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Start Date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({...form, start_date: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">End Date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({...form, end_date: e.target.value})} className="bg-secondary border-border" /></div>
            </div>
            <div><Label className="text-sm text-muted-foreground">Reward Coins</Label><Input type="number" value={form.reward_coins} onChange={(e) => setForm({...form, reward_coins: e.target.value})} className="bg-secondary border-border" /></div>
            <Button onClick={handleSaveChallenge} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>Create Challenge</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReward} onOpenChange={setShowReward}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="font-display">Add Reward</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Name *</Label><Input value={rewardForm.name} onChange={(e) => setRewardForm({...rewardForm, name: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Description</Label><Textarea value={rewardForm.description} onChange={(e) => setRewardForm({...rewardForm, description: e.target.value})} className="bg-secondary border-border" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Coins Required *</Label><Input type="number" value={rewardForm.coins_required} onChange={(e) => setRewardForm({...rewardForm, coins_required: e.target.value})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">Stock</Label><Input type="number" value={rewardForm.stock} onChange={(e) => setRewardForm({...rewardForm, stock: e.target.value})} className="bg-secondary border-border" /></div>
            </div>
            <Button onClick={handleSaveReward} className="w-full font-semibold" style={{ background: '#D4FF00', color: '#000' }}>Add Reward</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}