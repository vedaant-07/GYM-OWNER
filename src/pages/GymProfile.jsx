import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Building2, Save } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SkeletonCard from '@/components/ui/SkeletonCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

export default function GymProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const { toast } = useToast();

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const profiles = await base44.entities.GymProfile.list();
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setForm(profiles[0]);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile) {
        await base44.entities.GymProfile.update(profile.id, form);
      } else {
        await base44.entities.GymProfile.create(form);
      }
      toast({ title: 'Profile saved!' });
      loadProfile();
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
    setSaving(false);
  };

  if (loading) return <div className="space-y-6"><PageHeader title="Gym Profile" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Gym Profile" description="Manage your gym's information" actionLabel="Save Changes" actionIcon={Save} onAction={handleSave} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 space-y-5">
          <h3 className="font-display font-semibold text-lg">Basic Information</h3>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Gym Name</Label><Input value={form.gym_name || ''} onChange={(e) => setForm({...form, gym_name: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Owner Name</Label><Input value={form.owner_name || ''} onChange={(e) => setForm({...form, owner_name: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Email</Label><Input value={form.email || ''} onChange={(e) => setForm({...form, email: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Phone</Label><Input value={form.phone || ''} onChange={(e) => setForm({...form, phone: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Description</Label><Textarea value={form.description || ''} onChange={(e) => setForm({...form, description: e.target.value})} className="bg-secondary border-border" /></div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-5">
          <h3 className="font-display font-semibold text-lg">Location & Hours</h3>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Address</Label><Input value={form.address || ''} onChange={(e) => setForm({...form, address: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">City</Label><Input value={form.city || ''} onChange={(e) => setForm({...form, city: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Opening Hours</Label><Input value={form.opening_hours || ''} onChange={(e) => setForm({...form, opening_hours: e.target.value})} className="bg-secondary border-border" placeholder="e.g. 5 AM - 11 PM" /></div>
            <div><Label className="text-sm text-muted-foreground">GST Number</Label><Input value={form.gst_number || ''} onChange={(e) => setForm({...form, gst_number: e.target.value})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Google Maps Link</Label><Input value={form.google_maps_link || ''} onChange={(e) => setForm({...form, google_maps_link: e.target.value})} className="bg-secondary border-border" placeholder="Paste link" /></div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-5">
          <h3 className="font-display font-semibold text-lg">Operations</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Capacity</Label><Input type="number" value={form.gym_capacity || ''} onChange={(e) => setForm({...form, gym_capacity: Number(e.target.value)})} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">Trainers</Label><Input type="number" value={form.trainer_count || ''} onChange={(e) => setForm({...form, trainer_count: Number(e.target.value)})} className="bg-secondary border-border" /></div>
            </div>
            <div><Label className="text-sm text-muted-foreground">Staff Count</Label><Input type="number" value={form.staff_count || ''} onChange={(e) => setForm({...form, staff_count: Number(e.target.value)})} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Bank/Payout Details</Label><Input value={form.bank_details || ''} onChange={(e) => setForm({...form, bank_details: e.target.value})} className="bg-secondary border-border" placeholder="Account details (placeholder)" /></div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-5">
          <h3 className="font-display font-semibold text-lg">SE7EN FIT Partnership</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Partnership Status</Label>
              <Select value={form.partnership_status || 'pending'} onValueChange={(v) => setForm({...form, partnership_status: v})}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="pending">Pending</SelectItem><SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem><SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {profile && (
              <div className="glass-card rounded-lg p-4 space-y-2 text-sm">
                <p className="text-muted-foreground">Current status: <StatusBadge status={profile.partnership_status || 'pending'} /></p>
                <p className="text-muted-foreground">Photos placeholder — upload feature coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}