import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DsaTracker from "./pages/DsaTracker";
import ProtectedRoute from "./components/ProtectedRoute";
import CodeEditor from "./pages/CodeEditor";
import Notes from "./pages/Notes";
import AppLayout from "./components/AppLayout";

/**
 * Root route guard — shows spinner while session check is in-flight,
 * then routes authenticated users to /dashboard, others to Login.
 * This replaces the old localStorage check that caused infinite refresh loops.
 */
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#0d0a2e",
      }}>
        <div style={{
          width: 36, height: 36,
          border: "3px solid rgba(124,58,237,0.25)",
          borderTop: "3px solid #7c3aed",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : <Login />;
};

function App() {
  const { user, loading } = useAuth();

  return (
    <AppLayout>
      <Routes>
        {/* Root: verified server-side, no infinite loops */}
        <Route path="/" element={<RootRedirect />} />

        <Route path="/signup" element={<Signup />} />

        <Route path="/dsa-tracker" element={
          <ProtectedRoute><DsaTracker /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/notes" element={
          <ProtectedRoute><Notes /></ProtectedRoute>
        } />
        <Route path="/editor/:id" element={
          <ProtectedRoute><CodeEditor /></ProtectedRoute>
        } />

        {/* 404 — use loading-aware guard */}
        <Route path="*" element={
          loading ? null : (user ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />)
        } />
      </Routes>
    </AppLayout>
  );
}

export default App;