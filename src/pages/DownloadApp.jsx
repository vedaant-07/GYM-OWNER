import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Play, Apple, Download, ArrowRight, ShieldCheck, Dumbbell, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://se7en-fit-api.onrender.com/api').replace(/\/$/, '');

const fallbackLinks = {
  play_store_url: import.meta.env.VITE_APP_PLAY_STORE_URL || '',
  app_store_url: import.meta.env.VITE_APP_STORE_URL || '',
  apk_url: import.meta.env.VITE_APP_APK_URL || '',
};

function StoreButton({ icon: Icon, label, sublabel, href, disabled }) {
  const content = (
    <span className={`inline-flex min-w-[220px] items-center gap-3 rounded-2xl border px-5 py-4 text-left transition ${disabled ? 'border-border bg-muted/20 text-muted-foreground' : 'border-primary/30 bg-primary text-primary-foreground hover:bg-primary/90'}`}>
      <Icon className="h-7 w-7 shrink-0" />
      <span>
        <span className="block text-xs opacity-80">{sublabel}</span>
        <span className="block text-base font-bold">{label}</span>
      </span>
    </span>
  );

  if (disabled) return content;
  return <a href={href} target="_blank" rel="noreferrer" className="no-underline">{content}</a>;
}

export default function DownloadApp() {
  const [links, setLinks] = useState(fallbackLinks);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/public/download-links`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        const item = data.item || data.data || data;
        setLinks({ ...fallbackLinks, ...(item || {}) });
      })
      .catch(() => null);
    return () => { active = false; };
  }, []);

  const availableCount = useMemo(() => Object.values(links).filter(Boolean).length, [links]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(32,197,93,0.16),transparent_40%)]" />
      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-16">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          ← Back to SE7EN FIT
        </Link>

        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_50px_rgba(32,197,93,0.18)]">
          <Smartphone className="h-10 w-10" />
        </div>

        <div className="max-w-3xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-primary">SE7EN FIT Native App</p>
          <h1 className="font-display text-4xl font-black tracking-tight sm:text-6xl">Download the SE7EN FIT app</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            Users can train with AI workouts, food scan, tracking, rewards, challenges, community, and gym referral connection from one shared production account.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <StoreButton icon={Play} label="Google Play" sublabel="Get it on" href={links.play_store_url} disabled={!links.play_store_url} />
          <StoreButton icon={Apple} label="App Store" sublabel="Download on the" href={links.app_store_url} disabled={!links.app_store_url} />
          <StoreButton icon={Download} label="Direct APK" sublabel="Android install" href={links.apk_url} disabled={!links.apk_url} />
        </div>

        {availableCount === 0 && (
          <div className="mt-5 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            Store links are controlled from Super Admin → Settings → Download app links. Add Play Store/App Store/APK URLs after release builds are ready.
          </div>
        )}

        <div className="mt-12 grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          <Card><CardContent className="p-6"><Sparkles className="mb-4 h-7 w-7 text-primary" /><h3 className="font-bold">AI Fitness</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">AI trainer, food scan, workout generation, progress insight and diet guidance.</p></CardContent></Card>
          <Card><CardContent className="p-6"><Dumbbell className="mb-4 h-7 w-7 text-primary" /><h3 className="font-bold">Gym Connected</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Referral codes connect users to a gym owner dashboard for members, ads and rewards.</p></CardContent></Card>
          <Card><CardContent className="p-6"><ShieldCheck className="mb-4 h-7 w-7 text-primary" /><h3 className="font-bold">Shared Backend</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">App, website and admin dashboard use the same Render backend and Supabase database.</p></CardContent></Card>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/register"><Button size="lg">Register Your Gym <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          <Link to="/login"><Button size="lg" variant="outline">Gym Owner Login</Button></Link>
        </div>
      </main>
    </div>
  );
}
