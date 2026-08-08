import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { BookOpen, Lock } from "lucide-react";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post("/admin/login", { email, password });
      localStorage.setItem("bsp_token", res.data.token);
      toast.success("Welcome back");
      nav("/admin/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen warm-gradient grid place-items-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-border p-8 md:p-10 bg-card">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-primary text-primary-foreground grid place-items-center"><BookOpen className="w-5 h-5" /></span>
          <span className="font-serif text-xl font-semibold">BookStore Pro</span>
        </Link>
        <p className="mt-8 text-xs uppercase tracking-[0.2em] font-bold text-primary">Admin</p>
        <h1 className="mt-2 font-serif text-3xl font-bold">Sign in.</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter your admin credentials to continue.</p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="admin-email"
              autoComplete="username"
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Password</label>
            <div className="mt-2 relative">
              <input required type={showPw ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)} data-testid="admin-password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 pr-20 outline-none focus:ring-2 focus:ring-primary/40" />
              <button type="button" onClick={() => setShowPw((v) => !v)} data-testid="show-pw"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded hover:bg-secondary text-muted-foreground">
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button disabled={busy} data-testid="admin-signin"
            className="w-full rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:scale-[1.02] transition-transform disabled:opacity-60">
            <Lock className="inline w-4 h-4 mr-2" /> {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
