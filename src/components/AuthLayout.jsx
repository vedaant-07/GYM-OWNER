import React from "react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#050505' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm" style={{ background: '#D4FF00', color: '#000' }}>
              S7
            </div>
            <span className="font-display font-bold text-2xl" style={{ color: '#D4FF00' }}>
              SE7EN FIT
            </span>
          </div>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3" style={{ background: 'rgba(212,255,0,0.1)' }}>
            <Icon className="w-6 h-6" style={{ color: '#D4FF00' }} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="glass-card rounded-2xl p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
        <p className="text-center text-[10px] text-muted-foreground mt-8 tracking-wider uppercase">
          Gym Owner Portal
        </p>
      </div>
    </div>
  );
}