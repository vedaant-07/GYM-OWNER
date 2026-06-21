import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, LogOut, User, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

export default function Topbar({ onMenuClick }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleLogout = () => {
    base44.auth.logout('/login');
  };

  return (
    <header
      className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-6"
      style={{ background: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #1a1a1a' }}
    >
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-muted-foreground hover:text-foreground p-2">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center relative">
          <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search anything..."
            className="pl-10 pr-4 py-2 text-sm rounded-lg border-0 w-72 focus:outline-none focus:ring-1"
            style={{ background: '#111', color: '#fff', focusRing: '#D4FF00' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: '#D4FF00' }} />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors outline-none">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#D4FF00', color: '#000' }}>
              {user?.full_name?.charAt(0) || 'O'}
            </div>
            <span className="hidden md:block text-sm font-medium text-foreground">{user?.full_name || 'Gym Owner'}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
            <DropdownMenuItem asChild>
              <Link to="/gym-profile" className="flex items-center gap-2 cursor-pointer">
                <User className="w-4 h-4" /> Gym Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                <User className="w-4 h-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-400 cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}