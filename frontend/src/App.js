import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";
import { ThemeProvider } from "@/lib/theme";
import { CheckoutProvider } from "@/lib/cart";
import Home from "@/pages/Home";
import Books from "@/pages/Books";
import BookDetail from "@/pages/BookDetail";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import Contact from "@/pages/Contact";
import Checkout from "@/pages/Checkout";
import Payment from "@/pages/Payment";
import Wishlist from "@/pages/Wishlist";
import PublicLayout from "@/components/PublicLayout";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import AdminBooks from "@/pages/admin/AdminBooks";
import AdminCourses from "@/pages/admin/AdminCourses";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminSettings from "@/pages/admin/AdminSettings";

function App() {
  return (
    <ThemeProvider>
      <CheckoutProvider>
        <div className="App">
          <BrowserRouter>
            <Toaster position="bottom-right" richColors />
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<Books />} />
                <Route path="/books/:id" element={<BookDetail />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment" element={<Payment />} />
              </Route>

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="books" element={<AdminBooks />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </div>
      </CheckoutProvider>
    </ThemeProvider>
  );
}

export default App;
