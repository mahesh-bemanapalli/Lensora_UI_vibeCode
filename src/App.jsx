import { Navigate, Route, Routes } from "react-router-dom";
import { PhotographerPage } from "./pages/PhotographerPage";
import { LoginPage } from "./pages/LoginPage";
import { BookingsPage } from "./pages/BookingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PortfolioManagerPage } from "./pages/PortfolioManagerPage";
import { GearManagerPage } from "./pages/GearManagerPage";
import { PackagesManagerPage } from "./pages/PackagesManagerPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/mahesh" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/portfolio"
        element={
          <ProtectedRoute>
            <PortfolioManagerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/gear"
        element={
          <ProtectedRoute>
            <GearManagerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/packages"
        element={
          <ProtectedRoute>
            <PackagesManagerPage />
          </ProtectedRoute>
        }
      />
      <Route path="/:slug" element={<PhotographerPage />} />
    </Routes>
  );
}
