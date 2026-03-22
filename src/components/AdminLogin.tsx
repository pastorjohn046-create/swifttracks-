import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, db, signInWithEmailAndPassword, doc, getDoc } from '../firebase';
import { UserProfile } from '../types';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Verify if this user has admin role in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const profile = userDoc.data() as UserProfile;

      if (profile?.role === 'admin' || user.email === 'pastorjohn046@gmail.com') {
        localStorage.setItem('admin_session', 'true');
        navigate('/admin');
      } else {
        await auth.signOut();
        setError('Access Denied: You do not have administrative privileges.');
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is disabled in Firebase Console. Please enable it to continue.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid Admin Email or Password. Please try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-modern w-full max-w-md p-6 sm:p-10 bg-white flex flex-col gap-6 sm:gap-8 shadow-2xl shadow-primary/5"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-rose-50 p-4 rounded-2xl text-rose-600">
            <Shield className="w-10 h-10" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black tracking-tight text-text">Admin Portal</h2>
            <p className="text-sm font-medium text-muted">Restricted access for authorized personnel only</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span className="text-xs font-bold text-rose-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-muted uppercase tracking-widest">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pastorjohn046@gmail.com"
                className="input-modern pl-12"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-muted uppercase tracking-widest">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-modern pl-12"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-4 text-lg mt-4"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
            Authenticate Access
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs font-medium text-muted mb-2">First time here?</p>
          <button 
            onClick={() => navigate('/login')}
            className="text-xs font-black uppercase tracking-widest text-primary hover:underline"
          >
            Create your Admin Account
          </button>
        </div>

        <div className="pt-6 border-t border-border text-center">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest leading-relaxed">
            Unauthorized access attempts are logged and monitored. <br/>
            SwiftTrack Consignment Systems Security Protocol v4.2
          </p>
        </div>
      </motion.div>
    </div>
  );
}
