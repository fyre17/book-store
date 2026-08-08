import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Download } from "lucide-react";
import { toast } from "sonner";

export default function AdminCustomers() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => { api.get("/admin/customers").then((r) => setRows(r.data)); }, []);

  const filtered = rows.filter((c) =>
    !q || [c.name, c.whatsapp, c.email, c.city].some((v) => (v || "").toLowerCase().includes(q.toLowerCase())));

  const exportCSV = () => {
    const headers = ["Name", "WhatsApp", "Email", "City", "State", "Orders", "Spent", "Last Order"];
    const rowsData = filtered.map((c) => [c.name, c.whatsapp, c.email, c.city, c.state, c.orders, c.spent, c.last_order]);
    const csv = [headers, ...rowsData].map((r) => r.map((v) => `"${String(v || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    toast.success("CSV downloaded");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">People</p>
          <h1 className="mt-2 font-serif text-4xl font-bold">Customers.</h1>
        </div>
        <button onClick={exportCSV} data-testid="export-csv" className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." data-testid="cust-search"
        className="w-full max-w-md rounded-lg border border-border bg-background px-4 py-2 text-sm" />

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-[0.15em] text-muted-foreground bg-secondary/40">
            <th className="p-4">Name</th><th className="p-4">WhatsApp</th><th className="p-4 hidden md:table-cell">City</th><th className="p-4">Orders</th><th className="p-4">Spent</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c, i) => (
              <tr key={i} className="hover:bg-secondary/40 transition-colors">
                <td className="p-4"><p className="font-semibold">{c.name}</p><p className="text-xs text-muted-foreground">{c.email}</p></td>
                <td className="p-4 font-mono text-xs">{c.whatsapp}</td>
                <td className="p-4 hidden md:table-cell text-muted-foreground">{c.city}, {c.state}</td>
                <td className="p-4 tabular-nums">{c.orders}</td>
                <td className="p-4 font-mono tabular-nums">₹{c.spent}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan="5" className="p-10 text-center text-muted-foreground">No customers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
