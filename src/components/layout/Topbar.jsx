import React, { useState, useEffect } from 'react';
import { Menu, Bell, LogOut, User, ChevronDown, Sun, Moon, Settings } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/lib/ThemeContext';

export default function Topbar({ onMenuClick }) {
  const [user, setUser] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleLogout = () => {
    base44.auth.logout('/login');
  };

  // Build breadcrumb from path
  const crumbs = location.pathname.split('/').filter(b => b && b !== 'dashboard');

  return (
    <header
      className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 lg:px-5 gap-4"
      style={{
        background: 'hsl(var(--background))',
        borderBottom: '1px solid hsl(var(--border))',
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">SE7EN FIT</span>
          {crumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              <span className="text-muted-foreground">/</span>
              <span className="capitalize text-foreground font-medium">{crumb.replace(/-/g, ' ')}</span>
            </React.Fragment>
          ))}
          {crumbs.length === 0 && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium">Dashboard</span>
            </>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: '#20c55d' }}
          />
        </Link>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors outline-none">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: '#D4FF00', color: '#000' }}
            >
              {user?.full_name?.charAt(0)?.toUpperCase() || 'O'}
            </div>
            <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
              {user?.full_name || 'Gym Owner'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden md:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/gym-profile" className="flex items-center gap-2 cursor-pointer">
                <User className="w-4 h-4" /> Gym Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings className="w-4 h-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}