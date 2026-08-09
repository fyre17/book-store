import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bsp_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const mediaUrl = (path) => {
  if (!path) return PLACEHOLDER;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads/")) return `${BACKEND_URL}${path}`; // legacy — kept for old orders
  if (path.startsWith("/api/")) return `${BACKEND_URL}${path}`;
  return path;
};

// Inline SVG placeholder (warm/serif book icon) — never a broken image icon.
export const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>
      <rect width='400' height='500' fill='#F6F4EE'/>
      <rect x='120' y='120' width='160' height='220' rx='8' fill='#E8E4D9' stroke='#D95D39' stroke-width='2'/>
      <path d='M160 200 h80 M160 230 h80 M160 260 h60' stroke='#8A9A86' stroke-width='4' stroke-linecap='round'/>
      <text x='200' y='400' text-anchor='middle' font-family='Georgia, serif' font-size='16' font-style='italic' fill='#5C5C5C'>Cover coming soon</text>
    </svg>`
  );
