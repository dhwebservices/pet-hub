import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Menu, X, PawPrint } from "lucide-react";

const navItems = [
  { to: "/lost-pets", label: "Lost pets" },
  { to: "/found-pets", label: "Found pets" },
  { to: "/search", label: "Search" },
  { to: "/map", label: "Map" },
  { to: "/about", label: "About" },
  { to: "/support", label: "Contact" },
];

function Brandmark() {
  return (
    <Link to="/" data-testid="brand-link" className="flex items-center gap-3 group">
      <span aria-hidden="true" className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[var(--npw-primary)] text-white shadow-sm">
        <PawPrint className="w-6 h-6" strokeWidth={2.4}/>
      </span>
      <span className="leading-tight">
        <span className="block font-bold text-[19px] text-[var(--npw-text)] tracking-tight">National Pet Watch</span>
        <span className="block text-[12px] text-[var(--npw-muted)] -mt-0.5">The UK's Pet Registry &amp; Recovery Network</span>
      </span>
    </Link>
  );
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-[var(--npw-border)] sticky top-0 z-40 backdrop-blur">
        <div className="max-w-[1240px] mx-auto px-4 lg:px-6">
          <div className="py-4 flex items-center justify-between gap-6">
            <Brandmark/>
            <nav aria-label="Service navigation" className="hidden lg:flex items-center gap-1">
              {navItems.map(n => (
                <NavLink key={n.to} to={n.to} data-testid={`nav-${n.label.toLowerCase().replace(/\s/g,'-')}`}
                  className={({isActive}) => `px-3.5 py-2 text-[15px] font-semibold rounded-full transition ${isActive ? 'bg-[var(--npw-canvas)] text-[var(--npw-text)]' : 'text-[var(--npw-muted)] hover:text-[var(--npw-text)] hover:bg-[var(--npw-canvas)]/70'}`}>
                  {n.label}
                </NavLink>
              ))}
            </nav>
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  <Link to={user.role==='administrator'?'/admin':'/dashboard'} data-testid="header-dashboard" className="text-[15px] font-semibold text-[var(--npw-text)] hover:opacity-80">{user.role==='administrator'?'Admin':'My dashboard'}</Link>
                  <button onClick={async()=>{await logout(); nav('/');}} data-testid="header-logout" className="text-[14px] text-[var(--npw-muted)] hover:text-[var(--npw-text)]">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/login" data-testid="header-login" className="text-[15px] font-semibold text-[var(--npw-text)] hover:opacity-80">Sign in</Link>
                  <Link to="/report-lost" data-testid="header-report-lost" className="npw-btn-action !py-2 !px-5 text-[14px]">
                    <span className="relative flex w-1.5 h-1.5"><span className="absolute inset-0 rounded-full bg-white/60 animate-ping"/><span className="relative w-1.5 h-1.5 rounded-full bg-white"/></span>
                    Report a lost pet
                  </Link>
                </>
              )}
            </div>
            <button className="lg:hidden p-2 rounded-full hover:bg-[var(--npw-canvas)]" onClick={()=>setOpen(!open)} data-testid="mobile-menu-toggle" aria-label="Menu">
              {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
            </button>
          </div>
          {open && (
            <nav className="lg:hidden pb-4 flex flex-col gap-1">
              {navItems.map(n => (
                <Link key={n.to} to={n.to} onClick={()=>setOpen(false)} className="px-3 py-2.5 rounded-xl text-[15px] font-semibold text-[var(--npw-text)] hover:bg-[var(--npw-canvas)]">{n.label}</Link>
              ))}
              <div className="border-t border-[var(--npw-border)] my-2"/>
              {user ? (
                <>
                  <Link to={user.role==='administrator'?'/admin':'/dashboard'} onClick={()=>setOpen(false)} className="px-3 py-2.5 rounded-xl text-[15px] font-semibold text-[var(--npw-text)]">{user.role==='administrator'?'Admin':'My dashboard'}</Link>
                  <button onClick={async()=>{await logout(); setOpen(false); nav('/');}} className="px-3 py-2.5 rounded-xl text-left text-[15px] text-[var(--npw-muted)]">Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={()=>setOpen(false)} className="px-3 py-2.5 rounded-xl text-[15px] font-semibold text-[var(--npw-text)]">Sign in</Link>
                  <Link to="/report-lost" onClick={()=>setOpen(false)} className="npw-btn-action justify-center mt-2">Report a lost pet</Link>
                </>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Beta service notice — small cream pill */}
      <div className="max-w-[1240px] mx-auto px-4 lg:px-6 pt-5">
        <div className="npw-phase inline-flex">
          <span className="npw-tag-beta">Beta</span>
          <span>A new community service. <Link to="/support" className="npw-link">Tell us how to improve it</Link>.</span>
        </div>
      </div>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 bg-[var(--npw-canvas)] border-t border-[var(--npw-border)]">
        <div className="max-w-[1240px] mx-auto px-4 lg:px-6 py-14">
          <div className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-4">
              <Brandmark/>
              <p className="text-[15px] text-[var(--npw-muted)] leading-relaxed max-w-sm mt-5">A community-run UK service that helps reunite families with lost pets through verified local alerts. Free to use.</p>
            </div>
            <nav aria-label="Service" className="md:col-span-3">
              <h3 className="text-[15px] font-bold mb-4">Use the service</h3>
              <ul className="space-y-2.5 text-[15px]">
                <li><Link className="text-[var(--npw-text)] hover:text-[var(--npw-primary)] underline decoration-1 underline-offset-4" to="/report-lost">Report a lost pet</Link></li>
                <li><Link className="text-[var(--npw-text)] hover:text-[var(--npw-primary)] underline decoration-1 underline-offset-4" to="/report-found">Report a found pet</Link></li>
                <li><Link className="text-[var(--npw-text)] hover:text-[var(--npw-primary)] underline decoration-1 underline-offset-4" to="/register-pet">Register a pet</Link></li>
                <li><Link className="text-[var(--npw-text)] hover:text-[var(--npw-primary)] underline decoration-1 underline-offset-4" to="/map">Lost &amp; found map</Link></li>
              </ul>
            </nav>
            <nav aria-label="Get involved" className="md:col-span-3">
              <h3 className="text-[15px] font-bold mb-4">Get involved</h3>
              <ul className="space-y-2.5 text-[15px]">
                <li><Link className="text-[var(--npw-text)] hover:text-[var(--npw-primary)] underline decoration-1 underline-offset-4" to="/vet-register">For veterinary practices</Link></li>
                <li><Link className="text-[var(--npw-text)] hover:text-[var(--npw-primary)] underline decoration-1 underline-offset-4" to="/rescue-register">For rescue organisations</Link></li>
                <li><Link className="text-[var(--npw-text)] hover:text-[var(--npw-primary)] underline decoration-1 underline-offset-4" to="/donate">Support National Pet Watch</Link></li>
              </ul>
            </nav>
            <nav aria-label="About" className="md:col-span-2">
              <h3 className="text-[15px] font-bold mb-4">About</h3>
              <ul className="space-y-2.5 text-[15px]">
                <li><Link className="text-[var(--npw-text)] hover:text-[var(--npw-primary)] underline decoration-1 underline-offset-4" to="/about">About us</Link></li>
                <li><Link className="text-[var(--npw-text)] hover:text-[var(--npw-primary)] underline decoration-1 underline-offset-4" to="/support">Contact</Link></li>
                <li><Link className="text-[var(--npw-text)] hover:text-[var(--npw-primary)] underline decoration-1 underline-offset-4" to="/privacy">Privacy</Link></li>
                <li><Link className="text-[var(--npw-text)] hover:text-[var(--npw-primary)] underline decoration-1 underline-offset-4" to="/terms">Terms</Link></li>
              </ul>
            </nav>
          </div>
          <div className="mt-10 pt-6 border-t border-[var(--npw-border)] flex flex-wrap items-center justify-between gap-3 text-[13px] text-[var(--npw-muted)]">
            <span>© {new Date().getFullYear()} National Pet Watch · A community service, not a government body</span>
            <span>Accessibility · Free to use</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
