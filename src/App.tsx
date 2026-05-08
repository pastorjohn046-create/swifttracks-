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
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import Tracking from './components/Tracking';
import SplashScreen from './components/SplashScreen';
import SupportButton from './components/SupportButton';
import { Loader2 } from 'lucide-react';

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
        <div className="p-8 bg-red-50 text-red-900 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <pre className="bg-white p-4 border border-red-200 overflow-auto max-h-[50vh]">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  console.log('App rendering...');
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
    return profile?.role === 'admin';
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setUser(null);
    setProfile(null);
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
                ? <AdminPanel /> 
                : <Navigate to="/admin/login" />
            } 
          />
        </Routes>
      </Layout>
      <SupportButton />
    </Router>
    </ErrorBoundary>
  );
}
