import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Heart, Moon, Sun, Menu, X, BookOpen, Search } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { api } from "@/lib/api";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/books", label: "Books" },
  { to: "/courses", label: "Courses" },
  { to: "/contact", label: "Contact" },
];

export default function PublicLayout() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState({});
  const { pathname } = useLocation();

  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    api.get("/settings/public").then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
            <span className="w-9 h-9 rounded-xl bg-primary text-primary-foreground grid place-items-center">
              <BookOpen className="w-5 h-5" />
            </span>
            <span className="font-serif text-xl font-semibold tracking-tight">{settings.site_name || "BookStore Pro"}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`nav-${n.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `text-sm link-underline ${isActive ? "text-primary" : "text-foreground/80 hover:text-foreground"}`
                }
                end
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/wishlist"
              className="p-2 rounded-full hover:bg-secondary transition-colors duration-200"
              data-testid="nav-wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>
            <button
              onClick={toggle}
              className="p-2 rounded-full hover:bg-secondary transition-colors duration-200"
              data-testid="theme-toggle"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              className="md:hidden p-2 rounded-full hover:bg-secondary"
              onClick={() => setOpen((o) => !o)}
              data-testid="mobile-menu-toggle"
              aria-label="Open menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-border">
            <div className="px-4 py-3 flex flex-col gap-1 bg-background">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm ${isActive ? "bg-secondary text-primary" : "hover:bg-secondary"}`
                  }
                  end
                >
                  {n.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="border-t border-border mt-24 bg-secondary/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-primary text-primary-foreground grid place-items-center">
                <BookOpen className="w-5 h-5" />
              </span>
              <span className="font-serif text-xl font-semibold">{settings.site_name || "BookStore Pro"}</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              {settings.footer || "Books & courses curated for makers, thinkers, and slow readers."}
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Explore</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/books" className="link-underline">Books</Link></li>
              <li><Link to="/courses" className="link-underline">Courses</Link></li>
              <li><Link to="/wishlist" className="link-underline">Wishlist</Link></li>
              <li><Link to="/contact" className="link-underline">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>{settings.email}</li>
              <li>{settings.phone}</li>
              <li>{settings.address}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Follow</h4>
            <ul className="mt-4 space-y-2 text-sm">
              {settings.telegram && <li><a href={settings.telegram} className="link-underline">Telegram</a></li>}
              {settings.instagram && <li><a href={settings.instagram} className="link-underline">Instagram</a></li>}
              {settings.facebook && <li><a href={settings.facebook} className="link-underline">Facebook</a></li>}
              {settings.youtube && <li><a href={settings.youtube} className="link-underline">YouTube</a></li>}
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} {settings.site_name || "BookStore Pro"}. All rights reserved.</p>
            <Link to="/admin/login" className="link-underline" data-testid="footer-admin-link">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
