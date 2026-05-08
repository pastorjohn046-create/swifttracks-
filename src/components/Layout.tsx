import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { UserProfile } from '../types';
import { Globe, LogOut, User as UserIcon, Shield, Search, Info, Package, Plane, Truck, Bus, Star, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  user: any | null;
  profile: UserProfile | null;
}

export default function Layout({ children, user, profile }: LayoutProps) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await api.auth.logout();
    localStorage.removeItem('admin_session');
    window.location.href = '/';
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
      </div>

      <header className="border-b border-border sticky top-0 bg-white/80 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            <Logo size={32} className="text-primary group-hover:rotate-90 transition-transform duration-700" />
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tighter text-primary leading-none heading-display">SWIFTTRACK.</span>
              <span className="text-[10px] font-mono text-muted uppercase tracking-[0.2em] ml-0.5 hidden sm:block">Logistics Excellence</span>
            </div>
          </Link>

          <nav className="flex items-center gap-12">
            <div className="hidden lg:flex items-center gap-8">
              <Link to="/about" className="text-xs font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">About</Link>
              <Link to="/reviews" className="text-xs font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">Reviews</Link>
              <Link to="/track" className="text-xs font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">Track</Link>
            </div>
            
            <div className="h-6 w-[1px] bg-border hidden lg:block"></div>

            <div className="hidden lg:flex items-center gap-6">
              {user ? (
                <>
                  <Link to="/dashboard" className="text-xs font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest">Dashboard</Link>
                  <button onClick={handleLogout} className="btn-primary !py-2 !px-6 !text-[10px]">LOGOUT</button>
                </>
              ) : (
                <Link to="/login" className="btn-primary !py-2 !px-8 !text-[10px]">GET STARTED</Link>
              )}
            </div>

            <button className="lg:hidden p-2 text-primary" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-border shadow-2xl p-8 z-40"
            >
              <div className="flex flex-col gap-6">
                <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
                <Link to="/reviews" onClick={() => setIsMobileMenuOpen(false)}>Client Reviews</Link>
                <Link to="/track" onClick={() => setIsMobileMenuOpen(false)}>Track Shipment</Link>
                {user ? (
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary w-full text-center">GET STARTED</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <Logo size={28} className="text-primary" />
            <span className="font-black text-2xl tracking-tighter heading-display">SWIFTTRACK.</span>
          </div>
          <p className="text-xs font-mono text-muted uppercase tracking-widest">
            &copy; {new Date().getFullYear()} SwiftTrack Consignment Systems.
          </p>
          <div className="flex gap-8">
            <span className="text-xs font-mono text-muted uppercase tracking-widest">ISO 9001:2015</span>
            <span className="text-xs font-mono text-muted uppercase tracking-widest">TAPA CERTIFIED</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
