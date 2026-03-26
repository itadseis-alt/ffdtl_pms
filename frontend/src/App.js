import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";
import MainLayout from "./components/MainLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import MembersPage from "./pages/MembersPage";
import MemberDetailPage from "./pages/MemberDetailPage";
import MemberFormPage from "./pages/MemberFormPage";
import UsersPage from "./pages/UsersPage";
import BackupPage from "./pages/BackupPage";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, token } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-900"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

const PublicRoute = ({ children }) => {
  const { user, loading, token } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-900"></div>
      </div>
    );
  }

  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/members"
        element={
          <ProtectedRoute>
            <MembersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/members/new"
        element={
          <ProtectedRoute allowedRoles={['admin', 'rh']}>
            <MemberFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/members/:id"
        element={
          <ProtectedRoute>
            <MemberDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/members/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['admin', 'rh']}>
            <MemberFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/backup"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <BackupPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
