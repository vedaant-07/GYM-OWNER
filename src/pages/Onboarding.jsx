import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Building2, User, MapPin, Phone, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = ['Owner Info', 'Gym Details', 'Operations', 'Partnership'];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState({
    owner_name: '', gym_name: '', address: '', city: '', phone: '', email: '',
    gst_number: '', opening_hours: '', amenities: [], description: '',
    gym_capacity: '', trainer_count: '', staff_count: '', bank_details: '',
    partnership_status: 'pending'
  });

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await base44.entities.GymProfile.create({
        ...form,
        gym_capacity: Number(form.gym_capacity) || 0,
        trainer_count: Number(form.trainer_count) || 0,
        staff_count: Number(form.staff_count) || 0,
        amenities: form.amenities,
        onboarding_completed: true
      });
      toast({ title: 'Welcome aboard!', description: 'Your gym profile has been created.' });
      navigate('/');
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save profile. Please try again.', variant: 'destructive' });
    }
    setSaving(false);
  };

  const Field = ({ label, name, type = 'text', placeholder, required }) => (
    <div className="space-y-1.5">
      <Label className="text-sm text-muted-foreground">{label}{required && <span className="text-red-400 ml-1">*</span>}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={(e) => update(name, e.target.value)}
        className="bg-secondary border-border text-foreground"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#050505' }}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold" style={{ background: '#D4FF00', color: '#000' }}>S7</div>
            <span className="font-display font-bold text-2xl" style={{ color: '#D4FF00' }}>SE7EN FIT</span>
          </div>
          <p className="text-muted-foreground text-sm">Set up your gym in minutes</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i <= step ? 'text-black' : 'text-muted-foreground'
              }`} style={i <= step ? { background: '#D4FF00' } : { background: '#1a1a1a' }}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className="w-8 h-0.5" style={{ background: i < step ? '#D4FF00' : '#1a1a1a' }} />}
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-display font-bold mb-1">{STEPS[step]}</h2>
          <p className="text-sm text-muted-foreground mb-5">
            {step === 0 && 'Tell us about yourself'}
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
                  <Field label="GST Number" name="gst_number" placeholder="Optional" />
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">Description</Label>
                    <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Tell members about your gym" className="bg-secondary border-border text-foreground" />
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
                      <SelectTrigger className="bg-secondary border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active Partner</SelectItem>
                        <SelectItem value="premium">Premium Partner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="glass-card rounded-xl p-4 mt-4">
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
              <Button onClick={() => setStep(s => s + 1)} className="font-semibold" style={{ background: '#D4FF00', color: '#000' }}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={saving} className="font-semibold" style={{ background: '#D4FF00', color: '#000' }}>
                {saving ? 'Setting up...' : 'Launch Gym Portal'} <Check className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}