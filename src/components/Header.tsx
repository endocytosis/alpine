import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Mountain, Menu, X, User, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeMode } from '@/contexts/ThemeContext';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const { dark, toggle } = useThemeMode();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dashboardPath =
    profile?.role === 'admin' ? '/dashboard/admin' :
    profile?.role === 'host' ? '/dashboard/host' :
    '/dashboard/guest';

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 transition-opacity duration-sharp hover:opacity-70">
          <Mountain className="h-5 w-5 text-ink" strokeWidth={1.5} />
          <span className="font-display text-lg tracking-tight text-ink">Alpine</span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/properties" className="poet-btn-ghost text-body-sm">Explore</Link>

          <button
            onClick={toggle}
            className="poet-btn-ghost !px-2.5"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun className="h-4 w-4" strokeWidth={1.5} /> : <Moon className="h-4 w-4" strokeWidth={1.5} />}
          </button>

          {user ? (
            <div className="relative ml-1">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 border border-line px-3 py-1.5 text-body-sm font-medium text-ink transition-colors duration-sharp hover:border-line-strong"
              >
                <span>{profile?.full_name?.split(' ')[0] || 'Account'}</span>
                <div className="flex h-6 w-6 items-center justify-center bg-ink text-canvas">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-6 w-6 object-cover" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                </div>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 z-50 mt-1 w-56 animate-fade-in border border-line bg-surface p-1">
                    <div className="border-b border-line px-3 py-2 mb-1">
                      <p className="text-body-sm font-medium text-ink">{profile?.full_name}</p>
                      <p className="text-overline text-ink-subtle">{profile?.email}</p>
                    </div>
                    <button
                      onClick={() => { setDropdownOpen(false); navigate(dashboardPath); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-body-sm text-ink-muted transition-colors duration-fast hover:bg-surface-alt hover:text-ink"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => { setDropdownOpen(false); signOut(); navigate('/'); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-body-sm text-danger transition-colors duration-fast hover:bg-danger/5"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="poet-btn-ghost text-body-sm">Sign In</Link>
              <Link to="/signup" className="poet-btn-primary ml-1 !py-2 !px-4 !text-overline uppercase tracking-wider">
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={toggle}
            className="p-2 text-ink hover:bg-surface-alt transition-colors duration-fast"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun className="h-5 w-5" strokeWidth={1.5} /> : <Moon className="h-5 w-5" strokeWidth={1.5} />}
          </button>
          <button className="p-2 text-ink hover:bg-surface-alt transition-colors duration-fast" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="animate-fade-in border-t border-line bg-surface p-4 md:hidden">
          <div className="flex flex-col gap-1">
            <Link to="/properties" className="poet-btn-ghost justify-start" onClick={() => setMobileOpen(false)}>Explore</Link>
            {user ? (
              <>
                <Link to={dashboardPath} className="poet-btn-ghost justify-start" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <button onClick={() => { signOut(); setMobileOpen(false); navigate('/'); }} className="poet-btn-ghost justify-start text-danger">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="poet-btn-ghost justify-start" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link to="/signup" className="poet-btn-primary mt-2" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
