import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle,
  ClipboardCheck,
  CreditCard,
  Dumbbell,
  Gift,
  Heart,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Salad,
  ScanLine,
  Shield,
  Smartphone,
  Star,
  Trophy,
  Users,
  Video,
} from 'lucide-react';

const ACCENT = '#20c55d';
const ACCENT_DIM = 'rgba(32,197,93,0.13)';
const BG = '#050505';
const CARD = '#0d0d0d';
const BORDER = '#1e1e1e';

const NAV_ITEMS = [
  { label: 'For Users', href: '#for-users' },
  { label: 'Gym Owners', href: '#gym-owners' },
  { label: 'App Features', href: '#app-features' },
  { label: 'AI Tools', href: '#ai-tools' },
  { label: 'Pricing', href: '#pricing' },
];

function Grain() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.035]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px',
      }}
    />
  );
}

function IntroScreen({ onDone }) {
  const [phase, setPhase] = useState(0);
  const letters = ['S', 'E', '7', 'E', 'N'];

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }

    const t1 = setTimeout(() => setPhase(1), 1200);
    const t2 = setTimeout(() => setPhase(2), 2350);
    const t3 = setTimeout(onDone, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: BG }}
      animate={phase === 2 ? { opacity: 0 } : { opacity: 1 }}
      transition={phase === 2 ? { duration: 0.55, ease: [0.4, 0, 0.2, 1] } : {}}
    >
      <Grain />
      <motion.div
        initial={{ opacity: 0, scale: 0.3 }}
        animate={phase >= 1 ? { opacity: 0.5, scale: 1 } : {}}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          width: 'min(700px, 90vw)',
          height: 'min(700px, 90vw)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${ACCENT}30 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ x: '-110%' }}
        animate={{ x: '220%' }}
        transition={{ duration: 1.05, delay: 1.15, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `linear-gradient(105deg, transparent 30%, ${ACCENT}25 50%, transparent 70%)`,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', lineHeight: 1 }}>
        {letters.map((letter, index) => (
          <motion.span
            key={`${letter}-${index}`}
            initial={{ y: '-120vh', opacity: 0, filter: 'blur(8px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ delay: index * 0.09, duration: 0.72, ease: [0.22, 1.2, 0.36, 1] }}
            style={{
              fontSize: 'clamp(64px, 16vw, 180px)',
              fontWeight: 950,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '-0.045em',
              color: letter === '7' ? ACCENT : '#fff',
              textShadow: phase >= 1
                ? letter === '7'
                  ? `0 0 50px ${ACCENT}, 0 0 100px ${ACCENT}60`
                  : '0 0 30px rgba(255,255,255,0.15)'
                : 'none',
              display: 'inline-block',
              userSelect: 'none',
              transition: 'text-shadow 0.6s ease',
            }}
          >
            {letter}
          </motion.span>
        ))}
        <span style={{ display: 'inline-block', width: 'clamp(10px, 2.5vw, 36px)' }} />
        <motion.span
          initial={{ y: '-120vh', opacity: 0, filter: 'blur(8px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{ delay: 0.55, duration: 0.72, ease: [0.22, 1.2, 0.36, 1] }}
          style={{
            fontSize: 'clamp(64px, 16vw, 180px)',
            fontWeight: 950,
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: '-0.045em',
            color: ACCENT,
            textShadow: phase >= 1 ? `0 0 50px ${ACCENT}, 0 0 100px ${ACCENT}60` : 'none',
            display: 'inline-block',
            userSelect: 'none',
            transition: 'text-shadow 0.6s ease',
          }}
        >
          FIT
        </motion.span>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.65, delay: 0.2 }}
        style={{
          marginTop: 'clamp(12px, 2vw, 24px)',
          fontSize: 'clamp(10px, 1.4vw, 14px)',
          fontWeight: 750,
          color: ACCENT,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          fontFamily: "'Inter', sans-serif",
          userSelect: 'none',
        }}
      >
        INDIA'S PREMIUM FITNESS ECOSYSTEM
      </motion.p>

      <button
        onClick={onDone}
        style={{
          position: 'absolute',
          bottom: 28,
          right: 28,
          color: '#555',
          fontSize: 11,
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontFamily: "'Inter', sans-serif",
          padding: '6px 10px',
        }}
      >
        Skip →
      </button>
    </motion.div>
  );
}

function Navbar() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 18,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: '10px 18px',
        borderRadius: 999,
        background: 'rgba(10,10,10,0.82)',
        border: '1px solid #242424',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 18px 60px rgba(0,0,0,0.45)',
        width: 'min(92vw, 880px)',
        whiteSpace: 'nowrap',
      }}
    >
      <a href="#home" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
        <span style={{ width: 32, height: 32, borderRadius: 10, background: ACCENT, color: '#000', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 13 }}>S7</span>
        <span style={{ color: ACCENT, fontWeight: 900, fontSize: 15, fontFamily: "'Space Grotesk', sans-serif" }}>SE7EN FIT</span>
      </a>

      <div className="landing-nav-links" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{ color: '#a7a7a7', textDecoration: 'none', fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#a7a7a7'; }}
          >
            {item.label}
          </a>
        ))}
      </div>

      <Link to="/login" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: '#000', background: ACCENT, padding: '9px 17px', borderRadius: 999, fontSize: 13, fontWeight: 800, fontFamily: "'Inter', sans-serif" }}>
          Gym Management Tool <ArrowRight size={14} />
        </span>
      </Link>
    </nav>
  );
}

function Pill({ children }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, border: `1px solid ${ACCENT}40`, background: ACCENT_DIM, color: ACCENT, fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
      {children}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, borderColor: `${ACCENT}55`, boxShadow: `0 24px 48px rgba(0,0,0,0.35), 0 0 22px ${ACCENT}12` }}
      style={{ padding: 24, borderRadius: 18, background: CARD, border: `1px solid ${BORDER}`, transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s' }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 12, background: ACCENT_DIM, border: `1px solid ${ACCENT}30`, display: 'grid', placeItems: 'center', marginBottom: 16 }}>
        <Icon size={19} color={ACCENT} />
      </div>
      <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 800, marginBottom: 9, fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h3>
      <p style={{ color: '#777', fontSize: 13.5, lineHeight: 1.65, fontFamily: "'Inter', sans-serif" }}>{desc}</p>
    </motion.div>
  );
}

function SectionHeader({ eyebrow, title, highlight, desc }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 54 }}>
      <Pill>{eyebrow}</Pill>
      <h2 style={{ marginTop: 18, color: '#fff', fontSize: 'clamp(30px, 5vw, 54px)', lineHeight: 1.05, letterSpacing: '-0.035em', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif" }}>
        {title}<br /><span style={{ color: ACCENT }}>{highlight}</span>
      </h2>
      <p style={{ color: '#777', fontSize: 16, maxWidth: 660, margin: '18px auto 0', lineHeight: 1.75, fontFamily: "'Inter', sans-serif" }}>{desc}</p>
    </div>
  );
}

function HeroSection() {
  return (
    <section id="home" style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '140px 24px 80px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${ACCENT}14 0%, transparent 70%)` }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '100%', maxWidth: 1120 }}>
        <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ color: '#fff', fontSize: 'clamp(68px, 15vw, 170px)', lineHeight: 0.95, letterSpacing: '-0.06em', fontWeight: 950, fontFamily: "'Space Grotesk', sans-serif" }}>
          SE<span style={{ color: ACCENT }}>7</span>EN <span style={{ color: ACCENT }}>FIT</span>
        </motion.h1>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7 }} style={{ marginTop: 40, color: '#d8d8d8', fontSize: 'clamp(24px, 3.2vw, 42px)', lineHeight: 1.2, fontWeight: 850, fontFamily: "'Space Grotesk', sans-serif" }}>
          India’s Smart Fitness App + Gym Management Ecosystem
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }} style={{ color: '#7a7a7a', fontSize: 17, maxWidth: 750, margin: '22px auto 42px', lineHeight: 1.8, fontFamily: "'Inter', sans-serif" }}>
          SE7EN FIT brings AI workouts, food scan, nutrition, tracking, challenges, rewards, subscriptions, referrals, and gym-owner management into one premium platform.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.65 }} style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <a href="#app-features" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '15px 30px', borderRadius: 999, background: ACCENT, color: '#000', border: 'none', fontSize: 15, fontWeight: 850, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 9 }}>
              Explore App Features <ArrowRight size={16} />
            </button>
          </a>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '15px 30px', borderRadius: 999, background: 'transparent', color: '#d8d8d8', border: '1px solid #333', fontSize: 15, fontWeight: 750, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 9 }}>
              <LayoutDashboard size={16} /> Open Gym Management Tool
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function AppFeaturesSection() {
  const features = [
    { icon: Brain, title: 'AI Trainer', desc: 'Personalized AI workout guidance for fat loss, muscle gain, stamina, home workouts and gym workouts.' },
    { icon: Video, title: 'Workout Video Guides', desc: 'Exercise library with form tips, mistakes, target muscles, thumbnails and future CDN video support.' },
    { icon: ScanLine, title: 'Food Scan', desc: 'Camera-based food scan UI to estimate calories, protein, carbs and fat with safe fallback states.' },
    { icon: Salad, title: 'Nutrition Planner', desc: 'Indian food-friendly calorie and macro tracking for breakfast, lunch, dinner, snacks and water.' },
    { icon: Activity, title: 'Progress Tracking', desc: 'Track steps, calories, water, sleep, weight and workout history with clean progress cards.' },
    { icon: Trophy, title: 'Challenges & Leaderboards', desc: '7-day challenges, gym leaderboards, streaks, badges and rewards to increase engagement.' },
    { icon: Gift, title: 'Rewards & Referrals', desc: 'SE7EN coins, gym rewards, referral bonuses, coupons and achievement badges.' },
    { icon: CreditCard, title: 'Subscriptions', desc: 'Free trial, monthly, quarterly and annual subscription-ready UI for premium app features.' },
  ];
  return (
    <section id="app-features" style={{ padding: '110px 24px', background: BG }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <SectionHeader eyebrow="App Features" title="Everything your fitness app" highlight="offers in one place" desc="This is the main SE7EN FIT website. Users can understand the mobile app, premium AI features, tracking tools, workouts, diet, rewards and gym connection before downloading or joining." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
        </div>
      </div>
    </section>
  );
}

function ForUsersSection() {
  const features = [
    { icon: Smartphone, title: 'User Mobile App', desc: 'Dark neon mobile app dashboard with Today’s Fitness, AI Daily Tip, workouts, nutrition and tracking.' },
    { icon: Dumbbell, title: 'Workout Plans', desc: 'Guided workout plans for beginners, fat loss, strength, muscle gain and gym routines.' },
    { icon: Heart, title: 'Health Tracking', desc: 'Manual tracking now, Google Health Connect and Apple Health-ready architecture later.' },
    { icon: Star, title: 'Premium Experience', desc: 'Clean Gen-Z UI, subscription cards, progress insights and premium AI trainer unlocks.' },
  ];
  return (
    <section id="for-users" style={{ padding: '110px 24px', background: '#030303' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <SectionHeader eyebrow="For Users" title="Train smarter with" highlight="AI fitness tools" desc="SE7EN FIT helps members follow workouts, scan meals, track progress, join challenges, earn rewards and connect with their gym." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
        </div>
      </div>
    </section>
  );
}

function ForOwnersSection() {
  const features = [
    { icon: LayoutDashboard, title: 'Owner Dashboard', desc: 'Monthly revenue, total members, new leads, today check-ins, pending payments and live business stats.' },
    { icon: Users, title: 'Member Management', desc: 'Add, search, update and track active, expired and pending members from one dashboard.' },
    { icon: ClipboardCheck, title: 'Attendance', desc: 'Daily check-ins, manual attendance, member attendance history and attendance trends.' },
    { icon: CreditCard, title: 'Payments & Plans', desc: 'Track dues, paid payments, revenue, membership plans and renewal status.' },
    { icon: Megaphone, title: 'Campaigns & Announcements', desc: 'Create gym offers, promotional campaigns and member announcements.' },
    { icon: MessageSquare, title: 'WhatsApp & Email', desc: 'Communication-ready architecture for reminders, campaign messages and updates.' },
    { icon: Shield, title: 'Gym Profile & Staff', desc: 'Manage public gym profile, staff, classes, equipment, reviews and referrals.' },
    { icon: BarChart3, title: 'Reports', desc: 'Revenue reports, attendance reports, member growth, conversion and gym performance analytics.' },
  ];
  return (
    <section id="gym-owners" style={{ padding: '110px 24px', background: BG }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <SectionHeader eyebrow="For Gym Owners" title="Run your gym" highlight="like a pro" desc="The gym management tool gives owners one command center for members, attendance, payments, leads, equipment, communication, campaigns and reports." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {features.map((feature) => <FeatureCard key={feature.title} {...feature} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '15px 32px', borderRadius: 999, background: ACCENT, color: '#000', border: 'none', fontWeight: 850, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 9 }}>
              Access Gym Management Tool <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function AIToolsSection() {
  const tools = [
    'AI workout generator', 'AI trainer chat', 'Food scan nutrition estimate', 'Daily AI fitness tip', 'Meal recommendations', 'Progress insights', 'Challenge generator', 'Smart gym recommendations'
  ];
  return (
    <section id="ai-tools" style={{ padding: '110px 24px', background: '#030303' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <SectionHeader eyebrow="AI Tools" title="AI-powered fitness" highlight="built for India" desc="SE7EN FIT is designed around practical AI tools that help users train, eat, track and stay consistent while helping gym owners improve retention." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14 }}>
          {tools.map((tool) => (
            <div key={tool} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '17px 18px', background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 }}>
              <CheckCircle size={18} color={ACCENT} />
              <span style={{ color: '#d7d7d7', fontWeight: 700, fontSize: 14 }}>{tool}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    { name: 'Free Trial', price: '7 days', features: ['Limited access', 'Basic workout tools', 'Basic tracking'] },
    { name: 'Basic', price: '₹299/mo', features: ['Workout plans', 'Nutrition tracking', 'Progress cards'] },
    { name: 'Premium', price: '₹499/mo', features: ['All AI features', 'Food scan', 'Challenges', 'Rewards'], popular: true },
    { name: 'Annual', price: '₹5,999/yr', features: ['Best value', 'Full premium access', 'Priority support'] },
  ];
  return (
    <section id="pricing" style={{ padding: '110px 24px', background: BG }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <SectionHeader eyebrow="Pricing" title="Simple pricing" highlight="for users and gyms" desc="Show your product pricing clearly: user subscriptions for premium AI features and owner plans for the gym management portal." />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{ padding: 24, borderRadius: 20, background: plan.popular ? `linear-gradient(135deg, ${ACCENT}18, ${ACCENT}06)` : CARD, border: plan.popular ? `1px solid ${ACCENT}66` : `1px solid ${BORDER}` }}>
              {plan.popular && <Pill>Most Popular</Pill>}
              <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 850, marginTop: plan.popular ? 18 : 0 }}>{plan.name}</h3>
              <p style={{ color: ACCENT, fontSize: 30, fontWeight: 900, margin: '10px 0 18px' }}>{plan.price}</p>
              <div style={{ display: 'grid', gap: 10 }}>
                {plan.features.map((feature) => (
                  <div key={feature} style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#777', fontSize: 13 }}>
                    <CheckCircle size={14} color={ACCENT} /> {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: '64px 24px 42px', background: '#030303', borderTop: '1px solid #111' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ color: ACCENT, fontSize: 24, fontWeight: 900 }}>SE7EN FIT</h3>
          <p style={{ color: '#666', maxWidth: 420, lineHeight: 1.7, marginTop: 10 }}>India’s smart fitness and gym management ecosystem for users, gym owners, workouts, nutrition, AI tools, rewards and subscriptions.</p>
        </div>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <button style={{ padding: '13px 24px', borderRadius: 999, background: ACCENT, color: '#000', border: 'none', fontWeight: 850, cursor: 'pointer' }}>Open Gym Management Tool</button>
        </Link>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const shouldShowIntro = !sessionStorage.getItem('se7en-intro-shown');
  const [showIntro, setShowIntro] = useState(shouldShowIntro);
  const [mainVisible, setMainVisible] = useState(!shouldShowIntro);

  const handleIntroDone = () => {
    sessionStorage.setItem('se7en-intro-shown', '1');
    setShowIntro(false);
    setMainVisible(true);
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${BG}; }
        @media (max-width: 820px) {
          .landing-nav-links { display: none !important; }
        }
      `}</style>
      {showIntro && <IntroScreen onDone={handleIntroDone} />}
      <div style={{ background: BG, minHeight: '100vh', overflowX: 'hidden', color: '#fff', opacity: mainVisible ? 1 : 0, transition: 'opacity 0.65s ease' }}>
        <Grain />
        <Navbar />
        <HeroSection />
        <ForUsersSection />
        <ForOwnersSection />
        <AppFeaturesSection />
        <AIToolsSection />
        <PricingSection />
        <Footer />
      </div>
    </>
  );
}