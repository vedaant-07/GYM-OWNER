import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Building2, Save } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import SkeletonCard from '@/components/ui/SkeletonCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const emptyForm = {
  gym_name: '',
  owner_name: '',
  email: '',
  mobile: '',
  address: '',
  city: '',
  description: '',
  opening_hours_text: '',
  onboarding_completed: true,
};

function toForm(profile = {}) {
  const openingHours = profile.opening_hours;
  return {
    ...emptyForm,
    ...profile,
    mobile: profile.mobile || profile.phone || '',
    opening_hours_text: typeof openingHours === 'string'
      ? openingHours
      : openingHours?.label || openingHours?.text || '',
  };
}

function toApiPayload(form = {}) {
  return {
    gym_name: form.gym_name || '',
    owner_name: form.owner_name || '',
    email: form.email || '',
    mobile: form.mobile || form.phone || '',
    address: form.address || '',
    city: form.city || '',
    description: form.description || '',
    opening_hours: form.opening_hours_text ? { label: form.opening_hours_text } : null,
    onboarding_completed: true,
  };
}

export default function GymProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profiles = await base44.entities.GymProfile.list();
      const nextProfile = profiles[0] || null;
      setProfile(nextProfile);
      setForm(toForm(nextProfile || {}));
    } catch (e) {
      console.error(e);
      toast({ title: 'Profile load failed', description: e.message || 'Please try again.', variant: 'destructive' });
    }
    setLoading(false);
  };

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = toApiPayload(form);
      if (profile) {
        await base44.entities.GymProfile.update(profile.id, payload);
      } else {
        await base44.entities.GymProfile.create(payload);
      }
      toast({ title: 'Profile saved!', description: 'Your gym profile is now updated.' });
      loadProfile();
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'Failed to save profile.', variant: 'destructive' });
    }
    setSaving(false);
  };

  if (loading) return <div className="space-y-6"><PageHeader title="Gym Profile" /><SkeletonCard count={4} /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Gym Profile" description="Manage your gym's information" actionLabel={saving ? 'Saving...' : 'Save Changes'} actionIcon={Save} onAction={handleSave} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 space-y-5">
          <h3 className="font-display font-semibold text-lg">Basic Information</h3>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Gym Name</Label><Input value={form.gym_name || ''} onChange={(e) => update('gym_name', e.target.value)} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Owner Name</Label><Input value={form.owner_name || ''} onChange={(e) => update('owner_name', e.target.value)} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Email</Label><Input value={form.email || ''} onChange={(e) => update('email', e.target.value)} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Phone</Label><Input value={form.mobile || ''} onChange={(e) => update('mobile', e.target.value)} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Description</Label><Textarea value={form.description || ''} onChange={(e) => update('description', e.target.value)} className="bg-secondary border-border" /></div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-5">
          <h3 className="font-display font-semibold text-lg">Location & Hours</h3>
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Address</Label><Input value={form.address || ''} onChange={(e) => update('address', e.target.value)} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">City</Label><Input value={form.city || ''} onChange={(e) => update('city', e.target.value)} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Opening Hours</Label><Input value={form.opening_hours_text || ''} onChange={(e) => update('opening_hours_text', e.target.value)} className="bg-secondary border-border" placeholder="e.g. 5 AM - 11 PM" /></div>
            <div><Label className="text-sm text-muted-foreground">GST Number</Label><Input value={form.gst_number || ''} onChange={(e) => update('gst_number', e.target.value)} className="bg-secondary border-border" placeholder="Coming soon - not saved yet" /></div>
            <div><Label className="text-sm text-muted-foreground">Google Maps Link</Label><Input value={form.google_maps_link || ''} onChange={(e) => update('google_maps_link', e.target.value)} className="bg-secondary border-border" placeholder="Coming soon - not saved yet" /></div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-5">
          <h3 className="font-display font-semibold text-lg">Operations</h3>
          <p className="text-sm text-muted-foreground">These fields are visible for planning and will be connected after the next backend model expansion.</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-sm text-muted-foreground">Capacity</Label><Input type="number" value={form.gym_capacity || ''} onChange={(e) => update('gym_capacity', e.target.value)} className="bg-secondary border-border" /></div>
              <div><Label className="text-sm text-muted-foreground">Trainers</Label><Input type="number" value={form.trainer_count || ''} onChange={(e) => update('trainer_count', e.target.value)} className="bg-secondary border-border" /></div>
            </div>
            <div><Label className="text-sm text-muted-foreground">Staff Count</Label><Input type="number" value={form.staff_count || ''} onChange={(e) => update('staff_count', e.target.value)} className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Bank/Payout Details</Label><Input value={form.bank_details || ''} onChange={(e) => update('bank_details', e.target.value)} className="bg-secondary border-border" placeholder="Coming soon - not saved yet" /></div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-5">
          <h3 className="font-display font-semibold text-lg">SE7EN FIT Partnership</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Partnership Status</Label>
              <Select value={form.partnership_status || 'pending'} onValueChange={(v) => update('partnership_status', v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="pending">Pending</SelectItem><SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem><SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">Status saving will be connected in the next backend profile expansion.</p>
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
