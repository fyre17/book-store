import { useEffect, useState } from "react";
import { api, mediaUrl, BACKEND_URL } from "@/lib/api";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X, Upload } from "lucide-react";

const empty = { title: "", description: "", image: "", duration: "", language: "English", price: 0, offer_price: null, featured: false, visible: true };

export default function AdminCourses() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/courses", { params: { visible_only: false } }).then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const p = { ...form, price: Number(form.price), offer_price: form.offer_price ? Number(form.offer_price) : null };
      if (editing) await api.put(`/admin/courses/${editing}`, p);
      else await api.post("/admin/courses", p);
      toast.success("Saved"); setOpen(false); load();
    } catch (err) { toast.error(err?.response?.data?.detail || "Save failed"); }
  };

  const del = async (id) => { if (!confirm("Delete?")) return; await api.delete(`/admin/courses/${id}`); load(); toast.success("Deleted"); };
  const start = (c) => { setEditing(c?.id || null); setForm(c ? { ...empty, ...c } : empty); setOpen(true); };
  const uploadImage = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const fd = new FormData(); fd.append("file", f);
    const res = await api.post("/upload", fd);
    setForm((s) => ({ ...s, image: `${BACKEND_URL}${res.data.url}` }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Catalog</p>
          <h1 className="mt-2 font-serif text-4xl font-bold">Courses.</h1>
        </div>
        <button onClick={() => start(null)} data-testid="add-course" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" /> Add course
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-[0.15em] text-muted-foreground bg-secondary/40">
            <th className="p-4">Course</th><th className="p-4 hidden md:table-cell">Duration</th><th className="p-4">Price</th><th className="p-4">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-secondary/40 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <img src={mediaUrl(c.image)} alt={c.title} className="w-12 h-9 rounded object-cover border border-border" />
                  <div>
                    <p className="font-semibold">{c.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{c.description}</p>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell text-muted-foreground">{c.duration}</td>
                <td className="p-4 font-mono tabular-nums">₹{c.offer_price || c.price}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => start(c)} className="p-2 rounded hover:bg-secondary" data-testid={`edit-course-${c.id}`}><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => del(c.id)} className="p-2 rounded hover:bg-destructive/10 text-destructive" data-testid={`del-course-${c.id}`}><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-foreground/40 grid place-items-center p-4" onClick={() => setOpen(false)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl bg-card rounded-3xl border border-border p-6 md:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl">{editing ? "Edit" : "New"} course</h2>
              <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-secondary"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="Title"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inp} data-testid="course-title" /></F>
              <F label="Duration"><input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="6 weeks" className={inp} /></F>
              <F label="Language"><input value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className={inp} /></F>
              <F label="Price"><input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inp} data-testid="course-price" /></F>
              <F label="Offer price"><input type="number" min="0" value={form.offer_price ?? ""} onChange={(e) => setForm({ ...form, offer_price: e.target.value || null })} className={inp} /></F>
              <F label="Image URL">
                <div className="flex gap-2">
                  <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inp} />
                  <label className="rounded-lg border border-border px-3 py-2 hover:bg-secondary cursor-pointer"><Upload className="w-4 h-4" /><input type="file" accept="image/*" className="hidden" onChange={uploadImage} /></label>
                </div>
              </F>
            </div>
            <F label="Description"><textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inp} resize-none`} /></F>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-primary" /> Featured</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} className="accent-primary" /> Visible</label>
            </div>
            <button className="w-full rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:scale-[1.02] transition-transform" data-testid="save-course">Save course</button>
          </form>
        </div>
      )}
    </div>
  );
}

const inp = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40";
const F = ({ label, children }) => (<label className="block"><span className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">{label}</span><div className="mt-2">{children}</div></label>);
