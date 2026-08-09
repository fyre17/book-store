import { useEffect, useState } from "react";
import { api, mediaUrl } from "@/lib/api";
import { toast } from "sonner";
import { Search, ExternalLink } from "lucide-react";

const STATUS = ["all", "pending", "completed", "delivered", "cancelled"];
const badge = { pending: "bg-accent/20 text-accent-foreground", completed: "bg-primary/10 text-primary", delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", cancelled: "bg-destructive/10 text-destructive" };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [detail, setDetail] = useState(null);

  const load = () => api.get("/admin/orders", { params: { q, status } }).then((r) => setOrders(r.data));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, status]);

  const setStatusOf = async (id, s) => {
    const fd = new FormData(); fd.append("status", s);
    await api.put(`/admin/orders/${id}/status`, fd);
    toast.success("Status updated"); load();
    if (detail?.id === id) setDetail({ ...detail, status: s });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Orders</p>
        <h1 className="mt-2 font-serif text-4xl font-bold">Orders.</h1>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, txn..." data-testid="orders-search"
            className="w-full rounded-full border border-border bg-background pl-9 pr-4 py-2 text-sm" />
        </div>
        <div className="flex gap-2">
          {STATUS.map((s) => (
            <button key={s} onClick={() => setStatus(s)} data-testid={`status-${s}`}
              className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${status === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border border-border bg-card p-4" data-testid={`m-order-${o.id}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</p>
                <p className="mt-0.5 font-semibold truncate">{o.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{o.whatsapp}</p>
              </div>
              <span className={`shrink-0 text-[10px] uppercase tracking-widest rounded-full px-2.5 py-1 ${badge[o.status] || "bg-secondary"}`}>{o.status}</span>
            </div>
            <div className="mt-3 text-sm">
              <p className="truncate"><span className="text-muted-foreground text-xs">Item:</span> {o.item_title} × {o.quantity}</p>
              <p className="mt-1"><span className="text-muted-foreground text-xs">Total:</span> <span className="font-mono font-semibold tabular-nums">₹{o.total}</span></p>
              <p className="mt-1 text-xs text-muted-foreground">{o.created_at?.slice(0, 10)}</p>
            </div>
            <button onClick={() => setDetail(o)} className="mt-3 w-full min-h-[40px] inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg border border-border hover:bg-secondary" data-testid={`m-view-${o.id}`}>
              View details
            </button>
          </div>
        ))}
        {orders.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No orders yet.</p>}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-[0.15em] text-muted-foreground bg-secondary/40">
            <th className="p-4">Order</th><th className="p-4 hidden md:table-cell">Customer</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4"></th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-secondary/40 transition-colors">
                <td className="p-4">
                  <p className="font-mono text-xs">#{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">{o.item_title} · x{o.quantity}</p>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <p className="font-semibold">{o.full_name}</p>
                  <p className="text-xs text-muted-foreground">{o.whatsapp}</p>
                </td>
                <td className="p-4 font-mono tabular-nums">₹{o.total}</td>
                <td className="p-4"><span className={`text-xs rounded-full px-3 py-1 ${badge[o.status] || "bg-secondary"}`}>{o.status}</span></td>
                <td className="p-4"><button onClick={() => setDetail(o)} className="text-xs link-underline" data-testid={`view-${o.id}`}>View</button></td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan="5" className="p-10 text-center text-muted-foreground">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 bg-foreground/40 grid place-items-center p-4" onClick={() => setDetail(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl bg-card rounded-3xl border border-border p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Order #{detail.id.slice(0, 8)}</p>
                <h2 className="mt-1 font-serif text-2xl">{detail.item_title}</h2>
              </div>
              <span className={`text-xs rounded-full px-3 py-1 ${badge[detail.status] || "bg-secondary"}`}>{detail.status}</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <Field label="Name" v={detail.full_name} /><Field label="WhatsApp" v={detail.whatsapp} />
              <Field label="Email" v={detail.email} /><Field label="Alt mobile" v={detail.alt_mobile} />
              <Field label="City" v={detail.city} /><Field label="State" v={detail.state} />
              <Field label="Country" v={detail.country} /><Field label="PIN" v={detail.pincode} />
              <div className="sm:col-span-2"><Field label="Address" v={detail.address} /></div>
              <Field label="Txn ID" v={detail.transaction_id} /><Field label="Total" v={`₹${detail.total}`} />
              <Field label="Placed at" v={detail.created_at?.slice(0, 19).replace("T", " ")} />
              <Field label="Device" v={detail.device?.slice(0, 40)} />
            </div>

            {detail.screenshot_url && (
              <div>
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Payment screenshot</p>
                <a href={mediaUrl(detail.screenshot_url)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block">
                  <img src={mediaUrl(detail.screenshot_url)} alt="screenshot" className="max-h-64 rounded-lg border border-border" />
                  <span className="mt-2 inline-flex items-center gap-1 text-xs link-underline">Open full <ExternalLink className="w-3 h-3" /></span>
                </a>
              </div>
            )}

            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">Update status</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["pending", "completed", "delivered", "cancelled"].map((s) => (
                  <button key={s} onClick={() => setStatusOf(detail.id, s)} className={`text-xs rounded-full px-3 py-1.5 border ${detail.status === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`} data-testid={`set-${s}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
const Field = ({ label, v }) => (<div><p className="text-xs uppercase tracking-[0.15em] font-bold text-muted-foreground">{label}</p><p className="mt-1 break-words">{v || "—"}</p></div>);
