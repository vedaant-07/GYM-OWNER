import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Brain, ScanLine, Dumbbell, LayoutDashboard, Zap, Trophy, Heart,
  Users, ClipboardCheck, CreditCard, Megaphone, BarChart3, MessageSquare,
  ChevronRight, ArrowRight, Star, CheckCircle, X
} from 'lucide-react';

/* ─── BRAND COLORS ─── */
const ACCENT = '#20c55d';
const ACCENT_DIM = 'rgba(32,197,93,0.15)';
const ACCENT_GLOW = 'rgba(32,197,93,0.35)';

/* ─── GRAIN OVERLAY ─── */
const Grain = () => (
  <div
    className="pointer-events-none fixed inset-0 z-[1] opacity-[0.035]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '128px',
    }}
  />
);

/* ─── CSS 3D DUMBBELL ─── */
const CssDumbbell = ({ style = {} }) => (
  <div style={{ perspective: '600px', ...style }}>
    <div style={{
      width: 120, height: 40, position: 'relative',
      animation: 'dumbbellSpin 8s linear infinite',
      transformStyle: 'preserve-3d',
    }}>
      {/* Bar */}
      <div style={{
        position: 'absolute', top: '50%', left: '18%', right: '18%',
        height: 8, marginTop: -4,
        background: 'linear-gradient(90deg, #1a1a1a, #2a2a2a, #1a1a1a)',
        borderRadius: 4,
        boxShadow: `0 0 10px ${ACCENT_GLOW}`,
      }} />
      {/* Left plate outer */}
      <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 22, height: 40, background: 'linear-gradient(180deg, #1e1e1e, #111)', borderRadius: 4, boxShadow: `0 0 14px ${ACCENT_GLOW}, inset 0 0 6px rgba(32,197,93,0.1)`, border: `1px solid ${ACCENT}30` }} />
      {/* Right plate outer */}
      <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 22, height: 40, background: 'linear-gradient(180deg, #1e1e1e, #111)', borderRadius: 4, boxShadow: `0 0 14px ${ACCENT_GLOW}, inset 0 0 6px rgba(32,197,93,0.1)`, border: `1px solid ${ACCENT}30` }} />
      {/* Left plate inner */}
      <div style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', width: 14, height: 30, background: '#161616', borderRadius: 3, border: `1px solid ${ACCENT}20` }} />
      {/* Right plate inner */}
      <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', width: 14, height: 30, background: '#161616', borderRadius: 3, border: `1px solid ${ACCENT}20` }} />
    </div>
  </div>
);

/* ─── INTRO SCREEN ─── */
function IntroScreen({ onDone }) {
  const [phase, setPhase] = useState(0);
  // phase 0 = scan line, 1 = text reveal, 2 = glow settle, 3 = exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1500);
    const t3 = setTimeout(() => setPhase(3), 3000);
    const t4 = setTimeout(() => onDone(), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onDone]);

  const letters = ['S', 'E', '7', 'E', 'N'];

  return (
    <AnimatePresence>
      {phase < 3 && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          style={{ background: '#050505' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <Grain />

          {/* Moving light beam */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: '200%', opacity: [0, 0.4, 0] }}
              transition={{ duration: 1.2, delay: 0.2, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: 0, bottom: 0, width: '30%',
                background: `linear-gradient(90deg, transparent, ${ACCENT_GLOW}, transparent)`,
              }}
            />
          </div>

          {/* Radial glow */}
          <motion.div
            animate={{ opacity: phase >= 2 ? 0.6 : 0, scale: phase >= 2 ? 1 : 0.5 }}
            transition={{ duration: 1.2 }}
            style={{
              position: 'absolute', width: 600, height: 600, borderRadius: '50%',
              background: `radial-gradient(circle, ${ACCENT_GLOW} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          {/* SE7EN letters */}
          <div className="relative flex items-end justify-center gap-1 sm:gap-2">
            {letters.map((l, i) => (
              <motion.span
                key={i}
                initial={{ y: 60, opacity: 0, filter: 'blur(20px)' }}
                animate={phase >= 1 ? {
                  y: 0,
                  opacity: 1,
                  filter: phase >= 2 ? 'blur(0px)' : 'blur(2px)',
                } : {}}
                transition={{
                  delay: i * 0.08,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  fontSize: 'clamp(80px, 18vw, 200px)',
                  fontWeight: 900,
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                  color: l === '7' ? ACCENT : '#ffffff',
                  textShadow: phase >= 2
                    ? l === '7'
                      ? `0 0 40px ${ACCENT}, 0 0 80px ${ACCENT}80`
                      : `0 0 30px rgba(255,255,255,0.2)`
                    : 'none',
                  display: 'inline-block',
                  userSelect: 'none',
                }}
              >
                {l}
              </motion.span>
            ))}
          </div>

          {/* FIT tagline */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.5em' }}
            animate={phase >= 2 ? { opacity: 1, letterSpacing: '0.3em' } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              position: 'absolute', bottom: '30%',
              fontSize: 14, fontWeight: 600, color: ACCENT,
              letterSpacing: '0.3em', textTransform: 'uppercase',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            FITNESS ECOSYSTEM
          </motion.p>

          {/* Skip button */}
          <button
            onClick={onDone}
            style={{
              position: 'absolute', bottom: 32, right: 32,
              color: '#555', fontSize: 12, cursor: 'pointer',
              background: 'none', border: 'none', letterSpacing: '0.1em',
              textTransform: 'uppercase', fontFamily: "'Inter', sans-serif",
            }}
          >
            Skip →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── NAV ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      style={{
        position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 50, display: 'flex', alignItems: 'center', gap: 32,
        padding: '10px 24px', borderRadius: 100,
        background: scrolled ? 'rgba(5,5,5,0.92)' : 'rgba(17,17,17,0.6)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${scrolled ? '#333' : '#222'}`,
        transition: 'background 0.3s, border 0.3s',
        minWidth: 280,
      }}
    >
      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 16, color: ACCENT, letterSpacing: '-0.01em' }}>
        SE7EN FIT
      </span>
      <div style={{ display: 'flex', gap: 24, flex: 1, justifyContent: 'center' }}>
        {['For Users', 'Gym Owners', 'Pricing'].map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(' ','-')}`}
            style={{ fontSize: 13, color: '#aaa', textDecoration: 'none', fontFamily: "'Inter', sans-serif", fontWeight: 500, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = '#aaa'}
          >{l}</a>
        ))}
      </div>
      <Link to="/login">
        <div style={{ fontSize: 13, fontWeight: 600, color: '#000', background: ACCENT, padding: '7px 16px', borderRadius: 100, fontFamily: "'Inter', sans-serif", textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Owner Portal →
        </div>
      </Link>
    </motion.nav>
  );
}

/* ─── FLOATING FEATURE CARD ─── */
function FloatingCard({ icon: Icon, label, delay = 0, x = 0, y = 0, floatY = 10 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'absolute', left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
        animation: `floatCard${Math.abs(x)} ${3 + delay}s ease-in-out infinite alternate`,
      }}
    >
      <motion.div
        animate={{ y: [0, -floatY, 0] }}
        transition={{ duration: 3 + delay * 0.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
          borderRadius: 12, background: 'rgba(17,17,17,0.9)',
          border: `1px solid #2a2a2a`, backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          cursor: 'default', userSelect: 'none', whiteSpace: 'nowrap',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        whileHover={{
          borderColor: ACCENT + '50',
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${ACCENT_DIM}`,
        }}
      >
        <Icon size={14} style={{ color: ACCENT, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#e5e5e5', fontFamily: "'Inter', sans-serif" }}>{label}</span>
      </motion.div>
    </motion.div>
  );
}

/* ─── HERO SECTION ─── */
function HeroSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const floatingCards = [
    { icon: Brain, label: 'AI Trainer', x: -320, y: -60, delay: 0.4 },
    { icon: ScanLine, label: 'Food Scan', x: 300, y: -80, delay: 0.5 },
    { icon: Dumbbell, label: 'Workout Plans', x: -280, y: 80, delay: 0.6 },
    { icon: LayoutDashboard, label: 'Owner Dashboard', x: 290, y: 70, delay: 0.7 },
    { icon: Zap, label: 'SE7EN Referrals', x: -150, y: 140, delay: 0.8 },
    { icon: Trophy, label: 'Challenges', x: 160, y: 140, delay: 0.9 },
    { icon: Heart, label: 'Health Sync', x: 0, y: 165, delay: 1.0 },
  ];

  return (
    <div ref={ref} style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505' }}>

      {/* Radial glow behind */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 60% 40% at 50% 60%, ${ACCENT}12 0%, transparent 70%)`,
      }} />

      {/* Grid lines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      }} />

      {/* Dumbbell silhouettes */}
      <div style={{ position: 'absolute', left: '5%', top: '20%', opacity: 0.06, transform: 'rotate(-20deg) scale(1.5)' }}>
        <CssDumbbell />
      </div>
      <div style={{ position: 'absolute', right: '5%', bottom: '20%', opacity: 0.06, transform: 'rotate(15deg) scale(1.2)' }}>
        <CssDumbbell />
      </div>

      <motion.div style={{ y, opacity, position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', width: '100%' }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, border: `1px solid ${ACCENT}40`, background: `${ACCENT}10`, marginBottom: 32 }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT, display: 'block', boxShadow: `0 0 8px ${ACCENT}` }} />
          <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600, letterSpacing: '0.08em', fontFamily: "'Inter', sans-serif" }}>INDIA'S PREMIUM FITNESS ECOSYSTEM</span>
        </motion.div>

        {/* BIG SE7EN background text */}
        <div style={{ position: 'relative', marginBottom: 24 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(100px, 22vw, 280px)',
              fontWeight: 900,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '-0.04em',
              lineHeight: 0.85,
              background: `linear-gradient(180deg, #ffffff 0%, #ffffff60 60%, transparent 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          >
            SE7EN
          </motion.div>

          {/* Floating cards around the big text */}
          <div style={{ position: 'absolute', inset: 0 }} className="hidden lg:block">
            {floatingCards.map((c, i) => <FloatingCard key={i} {...c} />)}
          </div>
        </div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{
            fontSize: 'clamp(18px, 3vw, 36px)', fontWeight: 700, color: '#ffffff',
            fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em',
            maxWidth: 640, margin: '0 auto 16px', lineHeight: 1.2,
          }}
        >
          India's Smart Fitness &{' '}
          <span style={{ color: ACCENT }}>Gym Management</span> Ecosystem
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7 }}
          style={{
            fontSize: 'clamp(14px, 1.6vw, 18px)', color: '#888', maxWidth: 560,
            margin: '0 auto 40px', lineHeight: 1.7,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          SE7EN FIT connects users, gym owners, workouts, nutrition, referrals, rewards, and AI-powered fitness tools in one premium platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <a href="#for-users">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${ACCENT}60` }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '14px 28px', borderRadius: 100,
                background: ACCENT, color: '#000',
                fontWeight: 700, fontSize: 15, cursor: 'pointer', border: 'none',
                fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              Start Your Fitness Journey <ArrowRight size={16} />
            </motion.button>
          </a>
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.04, borderColor: ACCENT, color: ACCENT }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '14px 28px', borderRadius: 100,
                background: 'transparent', color: '#ccc',
                fontWeight: 600, fontSize: 15, cursor: 'pointer',
                border: '1px solid #333', fontFamily: "'Inter', sans-serif",
                display: 'flex', alignItems: 'center', gap: 8, transition: 'border-color 0.2s, color 0.2s',
              }}
            >
              <LayoutDashboard size={16} /> Gym Owner Portal
            </motion.button>
          </Link>
        </motion.div>

        {/* Mobile floating cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="flex lg:hidden flex-wrap justify-center gap-2 mt-10"
        >
          {[{icon: Brain, label:'AI Trainer'},{icon:Dumbbell, label:'Workouts'},{icon:Trophy, label:'Challenges'},{icon:Zap, label:'Referrals'},{icon:Heart, label:'Health Sync'}].map((c,i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
              borderRadius: 10, background: '#111', border: '1px solid #222',
            }}>
              <c.icon size={13} style={{ color: ACCENT }} />
              <span style={{ fontSize: 12, color: '#ccc', fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{c.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 200,
        background: 'linear-gradient(to bottom, transparent, #050505)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

/* ─── SECTION: FOR USERS ─── */
function ForUsersSection() {
  const features = [
    { icon: Brain, title: 'AI Trainer', desc: 'Personalized workout recommendations powered by AI based on your goals and body type.' },
    { icon: ScanLine, title: 'Food Scan', desc: 'Scan any food item and instantly get calories, macros, and nutrition insights.' },
    { icon: Dumbbell, title: 'Workout Guides', desc: 'Hundreds of guided workout plans for fat loss, muscle gain, strength and endurance.' },
    { icon: BarChart3, title: 'Progress Tracking', desc: 'Visual progress charts, body stats, and weekly reports to keep you motivated.' },
    { icon: Trophy, title: 'Challenges', desc: 'Join gym challenges, compete with members, and win rewards and recognition.' },
    { icon: Star, title: 'Rewards', desc: 'Earn SE7EN Coins for workouts, referrals, and streaks. Redeem for gym perks.' },
    { icon: Users, title: 'My Gym', desc: 'Connect with your gym, view schedules, book classes, and message your trainer.' },
    { icon: CreditCard, title: 'Subscriptions', desc: 'Manage your gym membership, payment history, and renewal — all in one place.' },
  ];

  return (
    <section id="for-users" style={{ padding: '100px 24px', background: '#050505' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 100, border: `1px solid ${ACCENT}40`, background: `${ACCENT}10`, marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600, letterSpacing: '0.08em', fontFamily: "'Inter', sans-serif" }}>FOR MEMBERS & USERS</span>
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: '#fff', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
            Your complete<br /><span style={{ color: ACCENT }}>fitness companion</span>
          </h2>
          <p style={{ color: '#777', fontSize: 16, maxWidth: 480, margin: '0 auto', fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
            Everything you need to train smarter, eat better, and achieve your fitness goals.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              whileHover={{ y: -4, borderColor: ACCENT + '40', boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${ACCENT}10` }}
              style={{
                padding: 24, borderRadius: 16, background: '#0d0d0d',
                border: '1px solid #1e1e1e', cursor: 'default',
                transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: ACCENT_DIM, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: `1px solid ${ACCENT}30` }}>
                <f.icon size={18} style={{ color: ACCENT }} />
              </div>
              <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: 8, fontFamily: "'Space Grotesk', sans-serif", fontSize: 16 }}>{f.title}</h3>
              <p style={{ color: '#666', fontSize: 13, lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── SECTION: FOR GYM OWNERS ─── */
function ForOwnersSection() {
  const features = [
    { icon: Users, title: 'Member Management', desc: 'Full CRM — add, track, filter, and manage every gym member from one dashboard.' },
    { icon: Dumbbell, title: 'Workout Assignment', desc: 'Build custom workout plans and assign them to members in seconds.' },
    { icon: Heart, title: 'Diet Assignment', desc: 'Create nutrition plans with macros and assign to individual members or groups.' },
    { icon: ClipboardCheck, title: 'Attendance', desc: 'Mark daily attendance manually or via QR. Track trends and absent members.' },
    { icon: CreditCard, title: 'Payments & Plans', desc: 'Track dues, record payments, manage membership plans, and view revenue.' },
    { icon: Zap, title: 'SE7EN FIT Referrals', desc: 'Track users referred to your gym by SE7EN FIT. Manage conversion pipeline.' },
    { icon: MessageSquare, title: 'WhatsApp & Email', desc: 'Send bulk or individual messages. Automated reminders for dues and renewals.' },
    { icon: Megaphone, title: 'Offers & Campaigns', desc: 'Create announcements and promotional offers targeted to specific audiences.' },
    { icon: BarChart3, title: 'Reports & Analytics', desc: 'Revenue, attendance, member growth, and campaign performance reports.' },
  ];

  return (
    <section id="gym-owners" style={{ padding: '100px 24px', background: '#030303' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 100, border: `1px solid ${ACCENT}40`, background: `${ACCENT}10`, marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: ACCENT, fontWeight: 600, letterSpacing: '0.08em', fontFamily: "'Inter', sans-serif" }}>FOR GYM OWNERS</span>
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: '#fff', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
            Run your gym<br /><span style={{ color: ACCENT }}>like a pro</span>
          </h2>
          <p style={{ color: '#777', fontSize: 16, maxWidth: 480, margin: '0 auto', fontFamily: "'Inter', sans-serif", lineHeight: 1.7 }}>
            The complete gym management command center. Built for serious gym owners.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              whileHover={{ borderColor: ACCENT + '50', boxShadow: `0 0 24px ${ACCENT}08` }}
              style={{
                padding: '20px 24px', borderRadius: 14, background: '#0a0a0a',
                border: '1px solid #1a1a1a', display: 'flex', gap: 16, alignItems: 'flex-start',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: ACCENT_DIM, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${ACCENT}25` }}>
                <f.icon size={16} style={{ color: ACCENT }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: 4, fontFamily: "'Space Grotesk', sans-serif", fontSize: 15 }}>{f.title}</h3>
                <p style={{ color: '#5a5a5a', fontSize: 13, lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{ textAlign: 'center', marginTop: 48 }}
        >
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: `0 0 30px ${ACCENT}60` }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '14px 32px', borderRadius: 100,
                background: ACCENT, color: '#000',
                fontWeight: 700, fontSize: 15, cursor: 'pointer', border: 'none',
                fontFamily: "'Inter', sans-serif", display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              Open Gym Owner Portal <ChevronRight size={16} />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── SECTION: PRICING ─── */
function PricingSection() {
  const plans = [
    { name: 'Trial', price: 'Free', duration: '7 days', features: ['AI Workout Suggestion', 'Basic Attendance', 'Up to 10 members', 'Email Support'], popular: false },
    { name: 'Basic', price: '₹299', duration: '/month', features: ['Up to 100 members', 'Workout Plans', 'Diet Plans', 'Payment Tracking', 'WhatsApp Alerts'], popular: false },
    { name: 'Premium', price: '₹499', duration: '/month', features: ['Unlimited Members', 'AI Trainer Tools', 'SE7EN Referral Module', 'Campaigns & Offers', 'Full Reports', 'Priority Support'], popular: true },
    { name: 'Quarterly', price: '₹2,999', duration: '/quarter', features: ['Everything in Premium', '3-month savings', 'Dedicated Onboarding', 'Custom Branding'], popular: false },
    { name: 'Annual', price: '₹5,999', duration: '/year', features: ['Everything in Premium', 'Best value — 50% off', 'API Access', 'Dedicated Account Manager', 'White-label option'], popular: false },
  ];

  return (
    <section id="pricing" style={{ padding: '100px 24px', background: '#050505' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: '#fff', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
            Simple, <span style={{ color: ACCENT }}>transparent</span> pricing
          </h2>
          <p style={{ color: '#777', fontSize: 16, fontFamily: "'Inter', sans-serif" }}>Start free. Scale as you grow.</p>
        </motion.div>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {plans.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              style={{
                flex: '1 1 190px', maxWidth: 220,
                padding: 24, borderRadius: 20,
                background: p.popular ? `linear-gradient(135deg, ${ACCENT}15, ${ACCENT}05)` : '#0d0d0d',
                border: p.popular ? `1px solid ${ACCENT}60` : '1px solid #1e1e1e',
                position: 'relative',
                boxShadow: p.popular ? `0 0 40px ${ACCENT}15` : 'none',
                transition: 'transform 0.2s',
              }}
            >
              {p.popular && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: ACCENT, color: '#000', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 100, letterSpacing: '0.08em', fontFamily: "'Inter', sans-serif" }}>
                  MOST POPULAR
                </div>
              )}
              <p style={{ fontSize: 13, color: '#888', fontFamily: "'Inter', sans-serif", marginBottom: 8, fontWeight: 500 }}>{p.name}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: p.popular ? ACCENT : '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>{p.price}</span>
                <span style={{ fontSize: 13, color: '#555', fontFamily: "'Inter', sans-serif" }}>{p.duration}</span>
              </div>
              <div style={{ height: 1, background: '#1e1e1e', margin: '16px 0' }} />
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.features.map((f, j) => (
                  <li key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <CheckCircle size={13} style={{ color: ACCENT, marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#777', fontFamily: "'Inter', sans-serif", lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%', marginTop: 20, padding: '10px', borderRadius: 100,
                    background: p.popular ? ACCENT : 'transparent',
                    color: p.popular ? '#000' : '#888',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    border: p.popular ? 'none' : '1px solid #2a2a2a',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'background 0.2s',
                  }}
                >
                  Get Started
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer style={{ padding: '60px 24px 40px', background: '#030303', borderTop: '1px solid #111' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, marginBottom: 48 }}>
          <div>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 22, color: ACCENT, letterSpacing: '-0.01em', marginBottom: 8 }}>SE7EN FIT</p>
            <p style={{ color: '#555', fontSize: 13, maxWidth: 260, lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>India's premium fitness & gym management ecosystem. Built for the future of fitness.</p>
          </div>
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            {[
              { title: 'Product', links: ['For Users', 'Gym Owners', 'Pricing', 'Features'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
              { title: 'Support', links: ['Help Center', 'Contact', 'Status'] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontWeight: 700, color: '#ccc', fontSize: 13, marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>{col.title}</p>
                {col.links.map(l => (
                  <p key={l} style={{ color: '#555', fontSize: 12, marginBottom: 8, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#aaa'}
                    onMouseLeave={e => e.target.style.color = '#555'}
                  >{l}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, paddingTop: 24, borderTop: '1px solid #111' }}>
          <p style={{ color: '#333', fontSize: 12, fontFamily: "'Inter', sans-serif" }}>© 2026 SE7EN FIT. All rights reserved.</p>
          <p style={{ color: '#333', fontSize: 12, fontFamily: "'Inter', sans-serif" }}>Built for serious gym owners & fitness enthusiasts.</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── MAIN EXPORT ─── */
export default function LandingPage() {
  const [introShown, setIntroShown] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('se7en-intro-shown');
    if (seen) { setIntroDone(true); setIntroShown(true); }
    else { sessionStorage.setItem('se7en-intro-shown', '1'); }
  }, []);

  const handleIntroDone = () => {
    setIntroDone(true);
    setIntroShown(true);
  };

  return (
    <>
      <style>{`
        @keyframes dumbbellSpin {
          0% { transform: rotateY(0deg) rotateX(10deg); }
          100% { transform: rotateY(360deg) rotateX(10deg); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
      `}</style>

      <Grain />

      <AnimatePresence>
        {!introShown && <IntroScreen key="intro" onDone={handleIntroDone} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introDone ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{ background: '#050505', minHeight: '100vh', overflowX: 'hidden' }}
      >
        <Navbar />
        <HeroSection />
        <ForUsersSection />
        <ForOwnersSection />
        <PricingSection />
        <Footer />
      </motion.div>
    </>
  );
}