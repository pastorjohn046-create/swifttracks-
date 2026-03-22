import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc } from './firebase';
import { UserProfile } from './types';
import Layout from './components/Layout';
import Home from './components/Home';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import About from './components/About';
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
    const unsubscribe = onAuthStateChanged(auth, async (user: any) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Create profile if not exists (e.g. first login)
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            name: user.displayName || user.email?.split('@')[0] || 'User',
            role: user.email === 'pastorjohn046@gmail.com' ? 'admin' : 'user',
            customerID: 'CUST-' + Math.floor(100000 + Math.random() * 900000),
            createdAt: new Date().toISOString(),
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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

  return (
    <Router>
      <SplashScreen />
      <Layout user={user} profile={profile}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/track" element={<Tracking profile={profile} />} />
          <Route path="/about" element={<About />} />
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
