import { useEffect, useState } from "react";
import { api, mediaUrl } from "@/lib/api";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

const empty = { title: "", author: "", category: "", description: "", image: "", price: 0, offer_price: null, rating: 4.5, stock: 100, featured: false, visible: true };

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/books", { params: { q, visible_only: false } }).then((r) => setBooks(r.data));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q]);

  const startNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (b) => { setEditing(b.id); setForm({ ...empty, ...b }); setOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: Number(form.price), offer_price: form.offer_price ? Number(form.offer_price) : null,
        rating: Number(form.rating), stock: Number(form.stock) };
      if (editing) await api.put(`/admin/books/${editing}`, payload);
      else await api.post("/admin/books", payload);
      toast.success("Saved"); setOpen(false); load();
    } catch (err) { toast.error(err?.response?.data?.detail || "Save failed"); }
  };

  const del = async (id) => {
    if (!confirm("Delete this book?")) return;
    await api.delete(`/admin/books/${id}`); load(); toast.success("Deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Catalog</p>
          <h1 className="mt-2 font-serif text-4xl font-bold">Books.</h1>
        </div>
        <button onClick={startNew} data-testid="add-book" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" /> Add book
        </button>
      </div>

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search books..." data-testid="admin-books-search"
        className="w-full max-w-md rounded-lg border border-border bg-background px-4 py-2.5 text-sm min-h-[44px]" />

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {books.map((b) => (
          <div key={b.id} className="rounded-2xl border border-border bg-card p-4 flex gap-3" data-testid={`m-book-${b.id}`}>
            <img src={mediaUrl(b.image)} alt={b.title} className="w-16 h-20 rounded object-cover border border-border shrink-0 bg-secondary" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{b.title}</p>
              <p className="text-xs text-muted-foreground truncate">{b.author} · {b.category}</p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="font-mono font-semibold tabular-nums">₹{b.offer_price || b.price}</span>
                <span className="text-muted-foreground">Stock: <span className="tabular-nums">{b.stock}</span></span>
                {!b.visible && <span className="text-[10px] uppercase tracking-widest bg-secondary px-2 py-0.5 rounded-full">Hidden</span>}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => startEdit(b)} data-testid={`m-edit-book-${b.id}`}
                  className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg border border-border hover:bg-secondary">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => del(b.id)} data-testid={`m-del-book-${b.id}`}
                  className="min-h-[40px] px-3 inline-flex items-center justify-center rounded-lg border border-border text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {books.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No books yet.</p>}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.15em] text-muted-foreground bg-secondary/40">
              <th className="p-4">Book</th><th className="p-4 hidden md:table-cell">Category</th><th className="p-4">Price</th><th className="p-4 hidden md:table-cell">Stock</th><th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {books.map((b) => (
              <tr key={b.id} className="hover:bg-secondary/40 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <img src={mediaUrl(b.image)} alt={b.title} className="w-10 h-12 rounded object-cover border border-border bg-secondary" />
                  <div>
                    <p className="font-semibold">{b.title}</p>
                    <p className="text-xs text-muted-foreground">{b.author}</p>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell text-muted-foreground">{b.category}</td>
                <td className="p-4 font-mono tabular-nums">₹{b.offer_price || b.price}</td>
                <td className="p-4 hidden md:table-cell tabular-nums">{b.stock}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => startEdit(b)} data-testid={`edit-book-${b.id}`} className="p-2 rounded hover:bg-secondary"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => del(b.id)} data-testid={`del-book-${b.id}`} className="p-2 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
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
              <h2 className="font-serif text-2xl">{editing ? "Edit" : "New"} book</h2>
              <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-secondary"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <F label="Title"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inp} data-testid="book-title" /></F>
              <F label="Author"><input required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className={inp} data-testid="book-author" /></F>
              <F label="Category"><input required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inp} data-testid="book-category" /></F>
              <F label="Rating"><input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className={inp} /></F>
              <F label="Price"><input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inp} data-testid="book-price" /></F>
              <F label="Offer price"><input type="number" min="0" value={form.offer_price ?? ""} onChange={(e) => setForm({ ...form, offer_price: e.target.value || null })} className={inp} /></F>
              <F label="Stock"><input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inp} /></F>
            </div>
            <ImageUpload
              label="Book cover"
              folder="products"
              value={form.image}
              onChange={(url) => setForm((s) => ({ ...s, image: url }))}
              testid="book-image"
            />
            <F label="Description">
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inp} resize-none`} />
            </F>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-primary" /> Featured</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} className="accent-primary" /> Visible on store</label>
            </div>
            <button className="w-full rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:scale-[1.02] transition-transform" data-testid="save-book">Save book</button>
          </form>
        </div>
      )}
    </div>
  );
}

const inp = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40";
const F = ({ label, children }) => (
  <label className="block">
    <span className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground">{label}</span>
    <div className="mt-2">{children}</div>
  </label>
);
