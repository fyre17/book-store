import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(null);

export const CheckoutProvider = ({ children }) => {
  const [pending, setPending] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bsp_pending") || "null"); }
    catch { return null; }
  });
  useEffect(() => {
    if (pending) localStorage.setItem("bsp_pending", JSON.stringify(pending));
    else localStorage.removeItem("bsp_pending");
  }, [pending]);
  return <Ctx.Provider value={{ pending, setPending }}>{children}</Ctx.Provider>;
};

export const useCheckout = () => useContext(Ctx);

// Wishlist + Recently Viewed (localStorage)
const readLS = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || d); } catch { return JSON.parse(d); } };
export const getWishlist = () => readLS("bsp_wishlist", "[]");
export const toggleWishlist = (id) => {
  const w = getWishlist();
  const next = w.includes(id) ? w.filter((x) => x !== id) : [...w, id];
  localStorage.setItem("bsp_wishlist", JSON.stringify(next));
  return next;
};
export const isWished = (id) => getWishlist().includes(id);

export const pushRecent = (id) => {
  const r = readLS("bsp_recent", "[]").filter((x) => x !== id);
  r.unshift(id);
  localStorage.setItem("bsp_recent", JSON.stringify(r.slice(0, 12)));
};
export const getRecent = () => readLS("bsp_recent", "[]");
