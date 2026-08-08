import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BookOpen, LayoutDashboard, Library, GraduationCap, ShoppingBag, Users, Settings, LogOut, Moon, Sun } from "lucide-react";
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
  const [me, setMe] = useState(null);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    api.get("/admin/me").then((r) => setMe(r.data)).catch(() => { nav("/admin/login"); });
  }, [nav]);

  if (!me) return <div className="min-h-screen grid place-items-center">Loading...</div>;

  const logout = () => { localStorage.removeItem("bsp_token"); nav("/admin/login"); };

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden lg:flex flex-col w-64 border-r border-border p-4">
        <div className="flex items-center gap-2 p-2">
          <span className="w-9 h-9 rounded-xl bg-primary text-primary-foreground grid place-items-center"><BookOpen className="w-5 h-5" /></span>
          <span className="font-serif text-lg font-semibold">BookStore Pro</span>
        </div>
        <nav className="mt-8 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to} to={n.to} data-testid={`admin-nav-${n.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`
              }>
              <n.icon className="w-4 h-4" /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-border pt-4 space-y-2">
          <button onClick={toggle} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-secondary" data-testid="admin-theme">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} {theme === "dark" ? "Light" : "Dark"} mode
          </button>
          <div className="px-3 py-2 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">{me.name}</p>
            <p className="truncate">{me.email}</p>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-secondary" data-testid="admin-logout">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="lg:hidden glass-nav sticky top-0 z-40 h-14 flex items-center px-4 border-b border-border">
          <p className="font-serif text-lg font-semibold">Admin</p>
          <button onClick={logout} className="ml-auto text-xs text-muted-foreground">Sign out</button>
        </header>
        <div className="p-6 md:p-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
