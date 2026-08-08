import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getWishlist } from "@/lib/cart";
import BookCard from "@/components/BookCard";

export default function Wishlist() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const ids = getWishlist();
    if (!ids.length) return setItems([]);
    Promise.all(ids.map((id) => api.get(`/books/${id}`).then((r) => r.data).catch(() => null)))
      .then((res) => setItems(res.filter(Boolean)));
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-14">
      <p className="text-xs uppercase tracking-[0.2em] font-bold text-primary">Saved for later</p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl font-bold">Wishlist.</h1>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-16 text-center">
          <p className="font-serif text-2xl">No books saved yet.</p>
          <p className="text-muted-foreground mt-2">Tap the heart on any book to save it here.</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      )}
    </section>
  );
}
