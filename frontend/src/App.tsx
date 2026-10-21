import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import PersonalizePage from "./pages/PersonalizePage";
import POCTestPage from "./pages/POCTestPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import StoryBooksPage from "./pages/StoryBooksPage";
import AboutPage from "./pages/AboutPage";
import FootStepsPage from "./pages/FootStepsPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import CollectionsPage from "./pages/CollectionsPage";
import JournalPage from "./pages/JournalPage";

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
        <Route path="/admin/feedback" element={<AdminDashboardPage initialTab="feedback" />} />
        <Route path="/admin/feedbacks" element={<AdminDashboardPage initialTab="feedback" />} />
        <Route path="/admin/settings" element={<AdminDashboardPage initialTab="settings" />} />

        {/* Customer storefront with header & footer layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="storybooks" element={<StoryBooksPage />} />
          <Route path="stories" element={<StoryBooksPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="footsteps" element={<FootStepsPage />} />
          <Route path="foot-steps" element={<FootStepsPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="journal" element={<JournalPage />} />
          <Route path="personalize/:slug" element={<PersonalizePage />} />
          <Route path="poc" element={<POCTestPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
