import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Se7enFit3DLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShow(false);
            setTimeout(() => onComplete?.(), 500);
          }, 400);
          return 100;
        }
        return prev + Math.random() * 8 + 2;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: '#050505' }}
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
              style={{
                background: 'radial-gradient(circle, rgba(212,255,0,0.3) 0%, transparent 70%)',
                animation: 'pulse-glow 3s ease-in-out infinite'
              }}
            />
          </div>

          {/* 3D Dumbbell */}
          <div className="relative mb-12" style={{ perspective: '800px' }}>
            <div
              className="relative"
              style={{ animation: 'dumbbell-spin 3s linear infinite', transformStyle: 'preserve-3d' }}
            >
              {/* Dumbbell shape */}
              <div className="flex items-center gap-0">
                {/* Left weight */}
                <div className="relative">
                  <div className="w-8 h-20 rounded-lg" style={{ background: 'linear-gradient(135deg, #D4FF00 0%, #a3cc00 100%)', boxShadow: '0 0 30px rgba(212,255,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)' }} />
                  <div className="absolute -top-2 -left-1 w-10 h-24 rounded-lg opacity-60" style={{ background: 'linear-gradient(135deg, #D4FF00 0%, #8ab300 100%)', boxShadow: '0 0 20px rgba(212,255,0,0.3)' }} />
                </div>
                {/* Bar */}
                <div className="w-24 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, #666 0%, #333 50%, #666 100%)', boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }} />
                {/* Right weight */}
                <div className="relative">
                  <div className="w-8 h-20 rounded-lg" style={{ background: 'linear-gradient(135deg, #D4FF00 0%, #a3cc00 100%)', boxShadow: '0 0 30px rgba(212,255,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)' }} />
                  <div className="absolute -top-2 -right-1 w-10 h-24 rounded-lg opacity-60" style={{ background: 'linear-gradient(135deg, #8ab300 0%, #D4FF00 100%)', boxShadow: '0 0 20px rgba(212,255,0,0.3)' }} />
                </div>
              </div>
            </div>
            {/* Floor reflection */}
            <div className="mt-4 w-40 h-3 mx-auto rounded-full opacity-30"
              style={{
                background: 'radial-gradient(ellipse, rgba(212,255,0,0.4) 0%, transparent 70%)',
                filter: 'blur(4px)',
                animation: 'pulse-glow 3s ease-in-out infinite'
              }}
            />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight neon-text-glow" style={{ color: '#D4FF00' }}>
              SE7EN FIT
            </h1>
            <p className="text-sm text-muted-foreground mt-2 tracking-[0.3em] uppercase">
              Gym Command Center
            </p>
          </motion.div>

          {/* Progress bar */}
          <div className="w-64 md:w-80">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: '#1a1a1a' }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #D4FF00 0%, #a3cc00 100%)',
                  boxShadow: '0 0 20px rgba(212,255,0,0.5)',
                  width: `${Math.min(progress, 100)}%`
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center tracking-wide">
              Loading Gym Command Center... {Math.min(Math.round(progress), 100)}%
            </p>
          </div>

          {/* Particle effects */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: '#D4FF00',
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                opacity: 0.3,
                animation: `float-up ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}