import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';

const STEPS = ['Owner Info', 'Gym Details', 'Operations', 'Partnership'];
const NEON_GREEN = '#20c55d';
const NEON_GREEN_SOFT = 'rgba(32,197,93,0.16)';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [form, setForm] = useState({
    owner_name: '', gym_name: '', address: '', city: '', phone: '', email: '',
    gst_number: '', opening_hours: '', amenities: [], description: '',
    gym_capacity: '', trainer_count: '', staff_count: '', bank_details: '',
    partnership_status: 'pending'
  });

  const ownerDefaults = useMemo(() => ({
    owner_name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  }), [user?.name, user?.email, user?.phone]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      owner_name: prev.owner_name || ownerDefaults.owner_name,
      email: prev.email || ownerDefaults.email,
      phone: prev.phone || ownerDefaults.phone,
    }));
  }, [ownerDefaults]);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const validateStep = () => {
    if (step === 0 && (!form.owner_name || !form.email || !form.phone)) return 'Please complete owner name, email and phone number.';
    if (step === 1 && (!form.gym_name || !form.address || !form.city)) return 'Please complete gym name, address and city.';
    return '';
  };

  const nextStep = () => {
    const message = validateStep();
    if (message) {
      toast({ title: 'Missing details', description: message, variant: 'destructive' });
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleSubmit = async () => {
    const message = validateStep();
    if (message) {
      toast({ title: 'Missing details', description: message, variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await base44.entities.GymProfile.create({
        owner_name: form.owner_name,
        gym_name: form.gym_name,
        email: form.email,
        mobile: form.phone,
        address: form.address,
        city: form.city,
        description: form.description,
        amenities: form.amenities,
        opening_hours: form.opening_hours ? { label: form.opening_hours } : null,
        onboarding_completed: true,
      });
      toast({ title: 'Welcome aboard!', description: 'Your gym profile has been created.' });
      navigate('/dashboard', { replace: true });
    } catch (e) {
      toast({ title: 'Error', description: e.message || 'Failed to save profile. Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, name, type = 'text', placeholder, required }) => (
    <div className="space-y-1.5">
      <Label className="text-sm text-muted-foreground">{label}{required && <span className="text-red-400 ml-1">*</span>}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={(e) => update(name, e.target.value)}
        className="bg-secondary border-border text-foreground focus-visible:ring-primary"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#050505' }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold neon-glow" style={{ background: NEON_GREEN, color: '#000' }}>S7</div>
            <span className="font-display font-bold text-2xl neon-text-glow" style={{ color: NEON_GREEN }}>SE7EN FIT</span>
          </div>
          <p className="text-muted-foreground text-sm">Set up your gym in minutes</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i <= step ? 'text-black neon-glow' : 'text-muted-foreground'
              }`} style={i <= step ? { background: NEON_GREEN } : { background: '#1a1a1a' }}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className="w-8 h-0.5" style={{ background: i < step ? NEON_GREEN : '#1a1a1a' }} />}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-display font-bold mb-1">{STEPS[step]}</h2>
          <p className="text-sm text-muted-foreground mb-5">
            {step === 0 && 'Your owner details are prefilled from your login account'}
            {step === 1 && 'Add your gym details'}
            {step === 2 && 'Operational setup'}
            {step === 3 && 'SE7EN FIT partnership'}
          </p>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              {step === 0 && (
                <>
                  <Field label="Owner Name" name="owner_name" placeholder="Your full name" required />
                  <Field label="Email" name="email" type="email" placeholder="owner@gym.com" required />
                  <Field label="Phone Number" name="phone" placeholder="+91 9876543210" required />
                </>
              )}
              {step === 1 && (
                <>
                  <Field label="Gym Name" name="gym_name" placeholder="Your gym name" required />
                  <Field label="Address" name="address" placeholder="Full gym address" required />
                  <Field label="City" name="city" placeholder="City" required />
                  <Field label="GST Number" name="gst_number" placeholder="Optional - not saved yet" />
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">Description</Label>
                    <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Tell members about your gym" className="bg-secondary border-border text-foreground focus-visible:ring-primary" />
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <Field label="Opening Hours" name="opening_hours" placeholder="e.g. 5 AM - 11 PM" />
                  <Field label="Gym Capacity" name="gym_capacity" type="number" placeholder="Max members" />
                  <Field label="Trainer Count" name="trainer_count" type="number" placeholder="Number of trainers" />
                  <Field label="Staff Count" name="staff_count" type="number" placeholder="Number of staff" />
                  <Field label="Bank/Payout Details" name="bank_details" placeholder="Account details (optional)" />
                </>
              )}
              {step === 3 && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">SE7EN FIT Partnership Status</Label>
                    <Select value={form.partnership_status} onValueChange={(v) => update('partnership_status', v)}>
                      <SelectTrigger className="bg-secondary border-border focus:ring-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active Partner</SelectItem>
                        <SelectItem value="premium">Premium Partner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-xl p-4 mt-4" style={{ background: NEON_GREEN_SOFT, border: `1px solid ${NEON_GREEN}33` }}>
                    <p className="text-sm text-muted-foreground">
                      By completing onboarding, you agree to the SE7EN FIT Gym Owner terms and data access policies. You'll only have access to your own gym data and members.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-6 pt-4" style={{ borderTop: '1px solid #1a1a1a' }}>
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="text-muted-foreground">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={nextStep} className="font-semibold hover:opacity-90" style={{ background: NEON_GREEN, color: '#000' }}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={saving} className="font-semibold hover:opacity-90" style={{ background: NEON_GREEN, color: '#000' }}>
                {saving ? 'Setting up...' : 'Launch Gym Portal'} <Check className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
