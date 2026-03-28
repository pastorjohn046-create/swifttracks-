import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './api';
import { UserProfile } from './types';
import Layout from './components/Layout';
import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import About from './components/About';
import ReviewsPage from './components/ReviewsPage';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import Tracking from './components/Tracking';
import SplashScreen from './components/SplashScreen';
import SupportButton from './components/SupportButton';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await api.auth.me();
        setUser(currentUser);
        setProfile(currentUser);
      } catch (err) {
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isAdminAuthenticated = () => {
    return localStorage.getItem('admin_session') === 'true' || profile?.role === 'admin';
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setUser(null);
    setProfile(null);
    localStorage.removeItem('admin_session');
  };

  return (
    <Router>
      <SplashScreen />
      <Layout user={user} profile={profile}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/track" element={<Tracking profile={profile} />} />
          <Route path="/about" element={<About />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/dashboard" element={user ? <Dashboard profile={profile} /> : <Navigate to="/login" />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin" 
            element={
              isAdminAuthenticated() 
                ? <AdminPanel /> 
                : <Navigate to="/admin/login" />
            } 
          />
        </Routes>
      </Layout>
      <SupportButton />
    </Router>
  );
}
