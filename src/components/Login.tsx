import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, doc, setDoc } from '../firebase';
import { UserProfile } from '../types';
import { Mail, Lock, User, ArrowRight, Chrome, Shield } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          name: name || user.email?.split('@')[0] || 'User',
          role: user.email === 'pastorjohn046@gmail.com' ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
        };
        
        await setDoc(doc(db, 'users', user.uid), profile);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="card-brutal p-6 sm:p-10 bg-white">
        <h2 className="text-6xl font-black tracking-tighter uppercase mb-2 leading-none">
          {isLogin ? 'Login' : 'Join Us'}
        </h2>
        <p className="text-xs opacity-40 mb-10 uppercase tracking-[0.3em] font-mono">
          {isLogin ? 'Access your dashboard' : 'Start your journey'}
        </p>

        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 mb-8 text-xs font-black uppercase tracking-tight">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 border-2 border-green-500 text-green-700 px-4 py-3 mb-8 text-xs font-black uppercase tracking-tight">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-black tracking-widest opacity-50">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-2 border-line p-4 pl-12 focus:outline-none focus:bg-accent/10 font-bold transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-black tracking-widest opacity-50">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-line p-4 pl-12 focus:outline-none focus:bg-accent/10 font-bold transition-colors"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase font-black tracking-widest opacity-50">Password</label>
              {isLogin && (
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] uppercase font-black tracking-widest text-accent hover:underline"
                >
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-line p-4 pl-12 focus:outline-none focus:bg-accent/10 font-bold transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary bg-ink text-bg p-5 text-lg mt-4"
          >
            {loading ? 'Processing...' : isLogin ? 'Login Now' : 'Create Account'}
            {!loading && <ArrowRight className="w-6 h-6" />}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-line opacity-20"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
            <span className="bg-white px-4 opacity-50">Or continue with</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full border-2 border-line p-5 font-black uppercase tracking-tighter flex items-center justify-center gap-3 hover:bg-accent transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
        >
          <Chrome className="w-6 h-6" />
          Google Account
        </button>

        <p className="text-center mt-10 text-xs font-bold uppercase tracking-tight">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-accent bg-ink px-2 py-1 hover:bg-accent hover:text-ink transition-colors"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>

        <div className="mt-8 pt-8 border-t-2 border-line/10 text-center">
          <Link 
            to="/admin/login" 
            className="text-[10px] uppercase font-black tracking-widest text-muted hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Shield className="w-3 h-3" />
            Authorized Personnel Only
          </Link>
        </div>
      </div>
    </div>
  );
}
