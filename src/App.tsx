import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './api';
import { UserProfile } from './types';
import Layout from './components/Layout';
import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import About from './components/About';
import ReviewsPage from './components/ReviewsPage';
import AdminLogin from './components/AdminLogin';
import Tracking from './components/Tracking';
import SplashScreen from './components/SplashScreen';
import SupportButton from './components/SupportButton';
import { Loader2 } from 'lucide-react';

const AdminPanel = React.lazy(() => import('./components/AdminPanel'));

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 text-red-900 min-h-screen flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-black mb-4 heading-display">SYSTEM FAILURE.</h1>
          <p className="mb-8 text-red-700 font-medium">The application encountered a critical rendering error.</p>
          <pre className="bg-white p-6 border border-red-200 overflow-auto max-h-[40vh] text-[10px] text-left mb-8 font-mono">
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} className="btn-primary">REBOOT INTERFACE</button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A0A0B]" />
      </div>
    );
  }

  const isAdminAuthenticated = () => {
    // Check both server-validated role and the hardcoded fallback for the requested admin
    return profile?.role === 'admin' || profile?.email === 'admin@example.com';
  };

  return (
    <ErrorBoundary>
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
                  ? (
                    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin text-primary" /></div>}>
                      <AdminPanel />
                    </React.Suspense>
                  )
                  : <Navigate to="/admin/login" />
              } 
            />
            {/* Catch-all to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
        <SupportButton />
      </Router>
    </ErrorBoundary>
  );
}
