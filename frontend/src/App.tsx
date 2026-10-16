import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import PersonalizePage from "./pages/PersonalizePage";
import POCTestPage from "./pages/POCTestPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Authentication & Login */}
        <Route path="/admin_login" element={<AdminLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Dedicated Admin Dashboard */}
        <Route path="/admin_dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/stories" element={<AdminDashboardPage initialTab="stories" />} />
        <Route path="/admin/orders" element={<AdminDashboardPage initialTab="orders" />} />
        <Route path="/admin/previews" element={<AdminDashboardPage initialTab="previews" />} />
        <Route path="/admin/page_editor" element={<AdminDashboardPage initialTab="page_editor" />} />
        <Route path="/admin/settings" element={<AdminDashboardPage initialTab="settings" />} />

        {/* Customer storefront with header & footer layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="personalize/:slug" element={<PersonalizePage />} />
          <Route path="poc" element={<POCTestPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
