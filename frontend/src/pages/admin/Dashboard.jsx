import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { BookOpen, GraduationCap, ShoppingBag, TrendingUp } from "lucide-react";

const Stat = ({ label, value, icon: Icon, prefix = "" }) => (
  <div className="rounded-2xl border border-border p-6 bg-card">
    <div className="flex items-start justify-between">
      <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">{label}</p>
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <p className="mt-4 font-mono text-4xl font-light tabular-nums">{prefix}{value}</p>
  </div>
);

export default function Dashboard() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/admin/dashboard").then((r) => setD(r.data)); }, []);
  if (!d) return <p>Loading...</p>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Overview</p>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl font-bold">Dashboard.</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat label="Today's Orders" value={d.today_orders} icon={TrendingUp} />
        <Stat label="Total Orders" value={d.total_orders} icon={ShoppingBag} />
        <Stat label="Revenue" value={d.revenue.toLocaleString()} prefix="₹" icon={TrendingUp} />
        <Stat label="Books Sold" value={d.books_sold} icon={BookOpen} />
        <Stat label="Courses Sold" value={d.courses_sold} icon={GraduationCap} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border p-6 bg-card">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Monthly Revenue</p>
          <div className="mt-6 h-64">
            {d.monthly.length === 0 ? <p className="text-sm text-muted-foreground">No sales yet.</p> :
            <ResponsiveContainer>
              <LineChart data={d.monthly}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>}
          </div>
        </div>

        <div className="rounded-2xl border border-border p-6 bg-card">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Books vs Courses (units)</p>
          <div className="mt-6 h-64">
            {d.monthly.length === 0 ? <p className="text-sm text-muted-foreground">No sales yet.</p> :
            <ResponsiveContainer>
              <BarChart data={d.monthly}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="books" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="courses" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Latest customers</p>
        </div>
        <div className="divide-y divide-border">
          {d.latest_customers.length === 0 && <p className="p-6 text-sm text-muted-foreground">No customers yet.</p>}
          {d.latest_customers.map((c, i) => (
            <div key={i} className="p-4 md:p-6 flex flex-wrap gap-4 items-center hover:bg-secondary/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary/10 grid place-items-center font-semibold text-primary">{c.name?.[0] || "?"}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.whatsapp} · {c.city || "—"}</p>
              </div>
              <p className="text-xs text-muted-foreground font-mono">{c.created_at?.slice(0, 10)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
