import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { UserProfile } from '../types';
import { Globe, LogOut, User as UserIcon, Shield, Search, Info, Package, Plane, Truck, Bus } from 'lucide-react';
import { motion } from 'motion/react';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  user: any | null;
  profile: UserProfile | null;
}

export default function Layout({ children, user, profile }: LayoutProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('admin_session');
    navigate('/');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg text-text overflow-x-hidden relative">
      {/* Global Background Animations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0 opacity-20">
        <motion.div
          initial={{ x: '-20vw', y: '20vh', opacity: 0 }}
          animate={{ x: '120vw', y: '25vh', opacity: [0, 0.3, 0.3, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute text-primary/10"
        >
          <Plane className="w-24 h-24 rotate-12" />
        </motion.div>
        <motion.div
          initial={{ x: '120vw', y: '60vh', opacity: 0 }}
          animate={{ x: '-20vw', y: '65vh', opacity: [0, 0.2, 0.2, 0] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear", delay: 15 }}
          className="absolute text-secondary/10"
        >
          <Bus className="w-20 h-20" />
        </motion.div>
        <motion.div
          initial={{ x: '-20vw', y: '85vh', opacity: 0 }}
          animate={{ x: '120vw', y: '80vh', opacity: [0, 0.25, 0.25, 0] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear", delay: 30 }}
          className="absolute text-accent/10"
        >
          <Truck className="w-16 h-16" />
        </motion.div>
      </div>

      <header className="border-b border-border px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-3 group">
            <div className="text-primary group-hover:scale-110 transition-transform">
              <Logo size={24} className="sm:w-8 sm:h-8" />
            </div>
            <div className="flex flex-col -gap-1">
              <span className="font-black text-base sm:text-2xl tracking-tighter text-text leading-none">SWIFTTRACK</span>
              <span className="text-[8px] sm:text-[10px] font-bold text-muted uppercase tracking-[0.2em] ml-0.5 hidden sm:block">Consignment Systems</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1.5 sm:gap-6">
            <Link to="/track" className="text-[10px] sm:text-sm font-semibold text-muted hover:text-primary transition-colors flex items-center gap-1 sm:gap-1.5">
              <Search className="w-3.5 h-3.5 sm:w-4 h-4" />
              <span className="hidden xs:inline">Track</span>
            </Link>
            
            <div className="h-3 sm:h-4 w-px bg-border mx-0.5 sm:mx-2"></div>

            {localStorage.getItem('admin_session') === 'true' && !user && (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link to="/admin" className="text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1 sm:gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="btn-secondary py-1.5 px-3 sm:py-2 sm:px-4 text-xs sm:text-sm"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link to="/dashboard" className="text-xs sm:text-sm font-semibold text-muted hover:text-primary transition-colors flex items-center gap-1 sm:gap-1.5">
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                {(profile?.role === 'admin' || localStorage.getItem('admin_session') === 'true') && (
                  <Link to="/admin" className="text-xs sm:text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1 sm:gap-1.5">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="btn-secondary py-1.5 px-3 sm:py-2 sm:px-4 text-xs sm:text-sm"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              !localStorage.getItem('admin_session') && (
                <Link to="/login" className="btn-primary py-1.5 px-4 sm:py-2 sm:px-6 text-xs sm:text-sm">
                  Get Started
                </Link>
              )
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl">
        {children}
      </main>


      <footer className="border-t border-border bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Logo size={20} className="text-primary" />
            <span className="font-bold text-lg tracking-tight">SwiftTrack</span>
          </div>
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} SwiftTrack Consignment Systems. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm font-medium text-muted">
            <Link to="/about" className="hover:text-primary">About</Link>
            <Link to="/track" className="hover:text-primary">Tracking</Link>
            <a href="#" className="hover:text-primary">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
