import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BookOpen, LayoutDashboard, Library, GraduationCap, ShoppingBag, Users, Settings, LogOut, Moon, Sun, Menu, X, ExternalLink } from "lucide-react";
import { useTheme } from "@/lib/theme";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/books", label: "Books", icon: Library },
  { to: "/admin/courses", label: "Courses", icon: GraduationCap },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [me, setMe] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    api.get("/admin/me").then((r) => setMe(r.data)).catch(() => { nav("/admin/login"); });
  }, [nav]);

  useEffect(() => { setDrawer(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawer]);

  if (!me) return <div className="min-h-screen grid place-items-center">Loading...</div>;

  const logout = () => { localStorage.removeItem("bsp_token"); nav("/admin/login"); };

  const NavContent = ({ compact = false }) => (
    <>
      <div className="flex items-center gap-2 px-2">
        <span className="w-9 h-9 rounded-xl bg-primary text-primary-foreground grid place-items-center">
          <BookOpen className="w-5 h-5" />
        </span>
        <span className="font-serif text-lg font-semibold">BookStore Pro</span>
      </div>
      <nav className={`${compact ? "mt-6" : "mt-8"} space-y-1`}>
        {NAV.map((n) => (
          <NavLink
            key={n.to} to={n.to} data-testid={`admin-nav-${n.label.toLowerCase()}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg text-sm min-h-[44px] transition-colors duration-200 ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`
            }>
            <n.icon className="w-4 h-4" /> {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-6 border-t border-border pt-4 space-y-1">
        <button onClick={toggle} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm min-h-[44px] hover:bg-secondary" data-testid="admin-theme">
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} {theme === "dark" ? "Light" : "Dark"} mode
        </button>
        <a href="/" target="_blank" rel="noreferrer" className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm min-h-[44px] hover:bg-secondary">
          <ExternalLink className="w-4 h-4" /> View storefront
        </a>
        <div className="px-3 py-2 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground truncate">{me.name}</p>
          <p className="truncate">{me.email}</p>
        </div>
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm min-h-[44px] hover:bg-secondary" data-testid="admin-logout">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border p-4 shrink-0">
        <NavContent />
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85%] bg-background border-r border-border p-4 overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="flex justify-end">
              <button onClick={() => setDrawer(false)} className="p-2 rounded-full hover:bg-secondary" data-testid="admin-drawer-close" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavContent compact />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden glass-nav sticky top-0 z-40 h-14 flex items-center gap-3 px-4 border-b border-border">
          <button onClick={() => setDrawer(true)} className="p-2 -ml-2 rounded-full hover:bg-secondary min-w-[44px] min-h-[44px] grid place-items-center" data-testid="admin-drawer-open" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground grid place-items-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="font-serif text-base font-semibold truncate">
              {NAV.find((n) => pathname.startsWith(n.to))?.label || "Admin"}
            </span>
          </div>
          <button onClick={toggle} className="ml-auto p-2 rounded-full hover:bg-secondary min-w-[44px] min-h-[44px] grid place-items-center" aria-label="Theme">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        <div className="p-4 sm:p-6 lg:p-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
