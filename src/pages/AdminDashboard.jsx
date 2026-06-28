import { useEffect } from 'react'
import { ShieldCheck, ExternalLink } from 'lucide-react'

const ADMIN_DASHBOARD_URL = import.meta.env.VITE_ADMIN_DASHBOARD_URL || 'https://se7enfit-admin.onrender.com/admin'

function openAdminDashboard() {
  if (!ADMIN_DASHBOARD_URL) return
  window.location.assign(ADMIN_DASHBOARD_URL)
}

export default function AdminDashboard() {
  useEffect(() => {
    openAdminDashboard()
  }, [])

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-primary/20 bg-card p-8 shadow-2xl">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-black">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-primary">SE7EN FIT ADMIN</p>
        <h1 className="mb-3 text-3xl font-black text-foreground">Opening admin dashboard</h1>
        <p className="mb-6 text-sm leading-6 text-muted-foreground">
          This gym-owner website is connected to the central SE7EN FIT admin dashboard for support,
          user management, roles, notifications, and app control.
        </p>

        <button
          type="button"
          onClick={openAdminDashboard}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-black text-black transition hover:opacity-90"
        >
          Open Admin Dashboard
          <ExternalLink className="h-4 w-4" />
        </button>

        <p className="mt-4 break-all text-xs text-muted-foreground">{ADMIN_DASHBOARD_URL}</p>
      </div>
    </div>
  )
}
