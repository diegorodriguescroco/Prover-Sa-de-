import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Attendant from './pages/Attendant';
import Admin from './pages/Admin';
import Users from './pages/Users';

function Guard({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/registrar'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registrar" element={<Guard role="attendant"><Attendant /></Guard>} />
          <Route path="/admin"     element={<Guard role="admin"><Admin /></Guard>} />
          <Route path="/usuarios"  element={<Guard role="admin"><Users /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
