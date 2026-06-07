import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Menu, X, PawPrint, ShieldCheck, MapPin, Search, User, LogOut } from "lucide-react";

const navItems = [
  { to: "/lost-pets", label: "Lost Pets" },
  { to: "/found-pets", label: "Found Pets" },
  { to: "/search", label: "Search" },
  { to: "/map", label: "Map" },
  { to: "/about", label: "About" },
  { to: "/support", label: "Support" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[var(--gpr-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" data-testid="brand-link" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-md bg-[var(--gpr-primary)] flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-display font-extrabold text-[15px] text-[var(--gpr-primary)]">Global Pet Registry</div>
              <div className="text-[10px] uppercase tracking-widest text-[var(--gpr-muted)]">Recovery Network</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(n => (
              <NavLink key={n.to} to={n.to} data-testid={`nav-${n.label.toLowerCase().replace(/\s/g,'-')}`}
                className={({isActive}) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-[var(--gpr-secondary)] text-[var(--gpr-primary)]' : 'text-[var(--gpr-muted)] hover:text-[var(--gpr-text)] hover:bg-[var(--gpr-secondary)]/60'}`}>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <Link to="/report-lost" data-testid="header-report-lost" className="gpr-btn-alert text-sm py-2 px-4">Report Lost Pet</Link>
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} data-testid="header-dashboard" className="gpr-btn-secondary text-sm py-2 px-4">{user.role === 'admin' ? 'Admin' : 'Dashboard'}</Link>
                <button onClick={async () => { await logout(); nav('/'); }} data-testid="header-logout" className="text-[var(--gpr-muted)] hover:text-[var(--gpr-text)] p-2"><LogOut className="w-4 h-4"/></button>
              </>
            ) : (
              <Link to="/login" data-testid="header-login" className="gpr-btn-secondary text-sm py-2 px-4">Sign in</Link>
            )}
          </div>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)} data-testid="mobile-menu-toggle" aria-label="Menu">
            {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-[var(--gpr-border)] bg-white">
            <div className="px-4 py-3 flex flex-col gap-1">
              {navItems.map(n => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-[var(--gpr-text)]">{n.label}</Link>
              ))}
              <div className="border-t border-[var(--gpr-border)] pt-2 mt-2 flex flex-col gap-2">
                <Link to="/report-lost" onClick={() => setOpen(false)} className="gpr-btn-alert text-center text-sm">Report Lost Pet</Link>
                {user ? (
                  <>
                    <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setOpen(false)} className="gpr-btn-secondary text-center text-sm">{user.role === 'admin' ? 'Admin' : 'Dashboard'}</Link>
                    <button onClick={async () => { await logout(); setOpen(false); nav('/'); }} className="gpr-btn-secondary text-sm">Sign out</button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setOpen(false)} className="gpr-btn-secondary text-center text-sm">Sign in</Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--gpr-border)] mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-md bg-[var(--gpr-primary)] flex items-center justify-center"><PawPrint className="w-4 h-4 text-white"/></div>
                <span className="font-display font-extrabold text-[var(--gpr-primary)]">Global Pet Registry</span>
              </div>
              <p className="text-sm text-[var(--gpr-muted)] max-w-sm leading-relaxed">The modern pet registry &amp; recovery network. Trusted by owners, veterinarians and rescues to reunite missing pets faster.</p>
            </div>
            <div className="md:col-span-7 grid grid-cols-3 gap-8 text-sm">
              <ul className="space-y-2.5">
                <li className="gpr-eyebrow mb-1">Platform</li>
                <li><Link to="/register-pet" className="text-[var(--gpr-text)] hover:text-[var(--gpr-primary)]">Register a pet</Link></li>
                <li><Link to="/lost-pets" className="text-[var(--gpr-text)] hover:text-[var(--gpr-primary)]">Lost pets</Link></li>
                <li><Link to="/found-pets" className="text-[var(--gpr-text)] hover:text-[var(--gpr-primary)]">Found pets</Link></li>
                <li><Link to="/map" className="text-[var(--gpr-text)] hover:text-[var(--gpr-primary)]">Recovery map</Link></li>
              </ul>
              <ul className="space-y-2.5">
                <li className="gpr-eyebrow mb-1">For professionals</li>
                <li><Link to="/vet-register" className="text-[var(--gpr-text)] hover:text-[var(--gpr-primary)]">Veterinary practices</Link></li>
                <li><Link to="/rescue-register" className="text-[var(--gpr-text)] hover:text-[var(--gpr-primary)]">Rescue organisations</Link></li>
                <li><Link to="/subscribe" className="text-[var(--gpr-text)] hover:text-[var(--gpr-primary)]">Premium</Link></li>
                <li><Link to="/donate" className="text-[var(--gpr-text)] hover:text-[var(--gpr-primary)]">Donate</Link></li>
              </ul>
              <ul className="space-y-2.5">
                <li className="gpr-eyebrow mb-1">Company</li>
                <li><Link to="/about" className="text-[var(--gpr-text)] hover:text-[var(--gpr-primary)]">About</Link></li>
                <li><Link to="/support" className="text-[var(--gpr-text)] hover:text-[var(--gpr-primary)]">Support</Link></li>
                <li><Link to="/privacy" className="text-[var(--gpr-text)] hover:text-[var(--gpr-primary)]">Privacy</Link></li>
                <li><Link to="/terms" className="text-[var(--gpr-text)] hover:text-[var(--gpr-primary)]">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[var(--gpr-border)] mt-12 pt-6 text-xs text-[var(--gpr-muted)] flex flex-wrap justify-between gap-2">
            <span>© {new Date().getFullYear()} Global Pet Registry. All rights reserved.</span>
            <span>The Modern Pet Registry &amp; Recovery Network</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
