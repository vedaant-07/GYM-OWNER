import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Settings, Shield, Bell, CreditCard, HelpCircle, LogOut } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const handleLogout = () => {
    base44.auth.logout('/login');
  };

  const Section = ({ icon: Icon, title, description, children }) => (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg" style={{ background: 'rgba(212,255,0,0.1)' }}>
          <Icon className="w-5 h-5" style={{ color: '#D4FF00' }} />
        </div>
        <div>
          <h3 className="font-display font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account and preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section icon={Settings} title="Account Settings" description="Your profile information">
          <div className="space-y-4">
            <div><Label className="text-sm text-muted-foreground">Full Name</Label><Input value={user?.full_name || ''} readOnly className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Email</Label><Input value={user?.email || ''} readOnly className="bg-secondary border-border" /></div>
            <div><Label className="text-sm text-muted-foreground">Role</Label><Input value={user?.role || 'owner'} readOnly className="bg-secondary border-border" /></div>
          </div>
        </Section>

        <Section icon={Shield} title="Security" description="Password and security settings">
          <div className="space-y-4">
            <div className="glass-card rounded-lg p-4 text-sm text-muted-foreground">
              Password change and 2FA settings are managed through the platform security settings.
            </div>
          </div>
        </Section>

        <Section icon={Bell} title="Notifications" description="Notification preferences">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm">New member alerts</p><p className="text-xs text-muted-foreground">Get notified when a new member joins</p></div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm">Payment reminders</p><p className="text-xs text-muted-foreground">Alerts for pending and overdue payments</p></div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm">SE7EN FIT referral alerts</p><p className="text-xs text-muted-foreground">New referred user notifications</p></div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm">Campaign updates</p><p className="text-xs text-muted-foreground">Campaign performance alerts</p></div>
              <Switch />
            </div>
          </div>
        </Section>

        <Section icon={CreditCard} title="Billing" description="Billing and subscription">
          <div className="glass-card rounded-lg p-4 text-sm text-muted-foreground">
            Billing settings and subscription management will be available after payment gateway integration is complete.
          </div>
        </Section>

        <Section icon={HelpCircle} title="Support" description="Get help">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Need help? Contact SE7EN FIT support.</p>
            <div className="text-sm">
              <p className="text-muted-foreground">Email: <span className="text-foreground">support@se7enfit.com</span></p>
              <p className="text-muted-foreground mt-1">Phone: <span className="text-foreground">+91 XXXX XXXXXX</span></p>
            </div>
          </div>
        </Section>

        <div className="glass-card rounded-xl p-6">
          <h3 className="font-display font-semibold mb-2 text-red-400">Danger Zone</h3>
          <p className="text-xs text-muted-foreground mb-4">Logout from your account</p>
          <Button onClick={handleLogout} variant="destructive" className="w-full">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </div>
    </div>
  );
}